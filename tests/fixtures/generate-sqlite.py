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
