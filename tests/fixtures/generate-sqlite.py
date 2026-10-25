"""Deterministic real SQLite corpus; trusted construction SQL is never imported as code."""
import sqlite3,sys
from contextlib import closing
from pathlib import Path
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
BASE='CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL CHECK(score>=0 AND score<=9007199254740991),timestamp TEXT NOT NULL)'
def write(name,ddl=BASE,version=1):
    path=out/(name+'.sqlite');path.unlink(missing_ok=True)
    with closing(sqlite3.connect(path)) as db:
        db.executescript(ddl+';');db.execute('PRAGMA user_version='+str(version));db.commit()
    return path
write('valid-empty')
write('valid-reformatted','create table high_scores ( id text not null primary key, score integer not null, timestamp text not null )')
write('valid-without-rowid',BASE+' WITHOUT ROWID')
write('version-zero',version=0);write('version-two',version=2)
for name,ddl in {
    'wrong-table':'CREATE TABLE other(id TEXT)',
    'extra-table':BASE+';CREATE TABLE other(id TEXT)',
    'extra-index':BASE+';CREATE INDEX extra_score ON high_scores(score)',
    'extra-unique':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL UNIQUE,timestamp TEXT NOT NULL)',
    'extra-view':BASE+';CREATE VIEW extra_view AS SELECT * FROM high_scores',
    'extra-trigger':BASE+';CREATE TRIGGER extra_trigger AFTER INSERT ON high_scores BEGIN SELECT 1; END',
    'reordered':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,timestamp TEXT NOT NULL,score INTEGER NOT NULL)',
    'extra-column':BASE[:-1]+',extra TEXT)',
    'generated-virtual':BASE[:-1]+",extra TEXT GENERATED ALWAYS AS (id||'x') VIRTUAL)",
    'generated-stored':BASE[:-1]+",extra TEXT GENERATED ALWAYS AS (id||'x') STORED)",
    'score-real':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score REAL NOT NULL,timestamp TEXT NOT NULL)',
    'id-blob':'CREATE TABLE high_scores(id BLOB NOT NULL PRIMARY KEY,score INTEGER NOT NULL,timestamp TEXT NOT NULL)',
    'timestamp-numeric':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL,timestamp NUMERIC NOT NULL)',
    'nullable-id':'CREATE TABLE high_scores(id TEXT PRIMARY KEY,score INTEGER NOT NULL,timestamp TEXT NOT NULL)',
    'nullable-score':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER,timestamp TEXT NOT NULL)',
    'nullable-timestamp':'CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL,timestamp TEXT)',
    'composite-key':'CREATE TABLE high_scores(id TEXT NOT NULL,score INTEGER NOT NULL,timestamp TEXT NOT NULL,PRIMARY KEY(id,score))',
    'wrong-key':'CREATE TABLE high_scores(id TEXT NOT NULL,score INTEGER NOT NULL PRIMARY KEY,timestamp TEXT NOT NULL)',
    'virtual-table':'CREATE VIRTUAL TABLE high_scores USING fts5(id,score,timestamp)',
}.items():write(name,ddl)
valid=(out/'valid-empty.sqlite').read_bytes();(out/'empty-file.sqlite').write_bytes(b'');(out/'not-sqlite.sqlite').write_bytes(b'Encrypted-looking input\0'*16);(out/'truncated.sqlite').write_bytes(valid[:len(valid)//2])
with closing(sqlite3.connect(out/'valid-empty.sqlite')) as db:root=db.execute("SELECT rootpage FROM sqlite_schema WHERE name='high_scores'").fetchone()[0]
page_size=int.from_bytes(valid[16:18],'big');damaged=bytearray(valid);damaged[(root-1)*page_size]=255;(out/'corrupt-btree.sqlite').write_bytes(damaged)
print('Generated schema/identity corpus:',len(list(out.glob('*.sqlite'))))

# Row corpus deliberately omits CHECK text: import validates values independently.
import struct
BARE='CREATE TABLE high_scores(id TEXT NOT NULL PRIMARY KEY,score INTEGER NOT NULL,timestamp TEXT NOT NULL)'
STAMP='2026-01-01T00:00:00.000Z'
def row_file(name,records,ddl=BARE):
    path=write(name,ddl)
    with closing(sqlite3.connect(path)) as db:
        db.executemany('INSERT INTO high_scores VALUES(?,?,?)',records);db.commit()
    return path
row_file('rows-unsorted',[('a',0,STAMP),('Z',0,STAMP),('A',1,STAMP)])
row_file('rows-ten',[(str(i),9007199254740991 if i==9 else i,'0001-01-01T00:00:00.000Z' if i==0 else STAMP) for i in range(10)])
row_file('rows-integer-one',[('integer',1,STAMP)])
for name,record in {
    'unsafe-integer':('unsafe',9007199254740992,STAMP),
    'negative-score':('negative',-1,STAMP),
    'fractional-score':('fractional',1.5,STAMP),
    'text-score':('text','not numeric',STAMP),
    'blob-id':(b'blob',1,STAMP),
    'blob-timestamp':('blob-time',1,STAMP.encode()),
    'invalid-id':('bad id',1,STAMP),
    'unicode-id':('aé',1,STAMP),
    'long-id':('x'*65,1,STAMP),
    'invalid-calendar':('calendar',1,'1900-02-29T00:00:00.000Z'),
    'year-zero':('zero',1,'0000-01-01T00:00:00.000Z'),
    'offset-time':('offset',1,'2026-01-01T00:00:00.000+00:00'),
}.items():row_file(name,[record])
row_file('eleven-rows',[(str(i),i,STAMP) for i in range(11)])
row_file('many-rows',[(str(i),i,STAMP) for i in range(50)])

# Parse the actual small table-leaf record; patch its identified payload only.
def varint(data,pos):
    value=0
    for count in range(8):
        byte=data[pos];pos+=1;value=(value<<7)|(byte&127)
        if byte<128:return value,pos
    return (value<<8)|data[pos],pos+1
def serial_size(value):
    if value==0:return 0
    if 1<=value<=6:return [1,2,3,4,6,8][value-1]
    if value==7:return 8
    if value in (8,9):return 0
    assert value>=12
    return (value-12)//2
def fields(path):
    data=path.read_bytes()
    with closing(sqlite3.connect(path)) as db:root=db.execute("SELECT rootpage FROM sqlite_schema WHERE name='high_scores'").fetchone()[0]
    size=int.from_bytes(data[16:18],'big');size=65536 if size==1 else size
    start=(root-1)*size;header=start+(100 if root==1 else 0);assert data[header]==13
    count=int.from_bytes(data[header+3:header+5],'big');records=[]
    for i in range(count):
        cell=start+int.from_bytes(data[header+8+i*2:header+10+i*2],'big')
        payload,pos=varint(data,cell);_,pos=varint(data,pos);header_start=pos;header_size,pos=varint(data,pos);header_end=header_start+header_size;types=[]
        while pos<header_end:value,pos=varint(data,pos);types.append(value)
        cursor=header_end;record=[]
        for serial in types:record.append((serial,cursor,serial_size(serial)));cursor+=serial_size(serial)
        assert cursor==header_start+payload;records.append(record)
    return data,records
real=row_file('real-fraction',[('real',1.5,STAMP)],BARE.replace('score INTEGER','score REAL'))
with closing(sqlite3.connect(real)) as db:
    db.execute('PRAGMA writable_schema=ON');db.execute("UPDATE sqlite_schema SET sql=replace(sql,'score REAL','score INTEGER') WHERE name='high_scores'");version=db.execute('PRAGMA schema_version').fetchone()[0];db.execute('PRAGMA schema_version='+str(version+1));db.commit()
data,records=fields(real);assert len(records)==1;serial,offset,length=records[0][1];assert serial==7 and length==8 and data[offset:offset+8]==struct.pack('>d',1.5)
patched=bytearray(data);patched[offset:offset+8]=struct.pack('>d',1.0);real_one=out/'real-one.sqlite';real_one.write_bytes(patched)
for path,value in [(real,1.5),(real_one,1.0)]:
    with closing(sqlite3.connect(path)) as db:
        assert db.execute('SELECT typeof(score),score FROM high_scores').fetchall()==[('real',value)]
        assert db.execute('PRAGMA integrity_check').fetchall()==[('ok',)]
        assert db.execute('PRAGMA table_xinfo(high_scores)').fetchall()[1][2]=='INTEGER'

# Duplicate IDs cannot coexist with a valid PK index. Corrupt one table payload,
# prove duplicates by a table scan, then require whole-file integrity rejection.
duplicate=row_file('duplicate-ids',[('a',1,STAMP),('b',2,STAMP)])
data,records=fields(duplicate);patched=bytearray(data);assert len(records)==2
for record in records:
    serial,offset,length=record[0];assert length==1 and serial==15
    if patched[offset]==ord('b'):patched[offset]=ord('a')
duplicate.write_bytes(patched)
with closing(sqlite3.connect(duplicate)) as db:assert db.execute('SELECT id FROM high_scores NOT INDEXED').fetchall()==[('a',),('a',)]
print('Generated complete SQLite corpus:',len(list(out.glob('*.sqlite'))))
