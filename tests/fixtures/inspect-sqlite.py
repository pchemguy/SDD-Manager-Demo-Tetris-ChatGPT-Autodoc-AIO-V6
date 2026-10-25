"""Inspect actual browser-exported bytes with independent Python SQLite."""
import json,sqlite3,sys,tempfile
from pathlib import Path
data=sys.stdin.buffer.read(1048577)
assert len(data)<=1048576 and data.startswith(b'SQLite format 3\x00')
with tempfile.TemporaryDirectory() as temporary:
    path=Path(temporary)/'scores.sqlite';path.write_bytes(data)
    with sqlite3.connect(path.as_uri()+'?mode=ro',uri=True) as db:
        db.execute('PRAGMA query_only=ON');db.execute('PRAGMA trusted_schema=OFF')
        result={'version':db.execute('PRAGMA user_version').fetchone()[0],
                'integrity':db.execute('PRAGMA integrity_check').fetchall(),
                'columns':db.execute('PRAGMA table_xinfo(high_scores)').fetchall(),
                'objects':db.execute('SELECT type,name FROM sqlite_schema ORDER BY type,name').fetchall(),
                'rows':db.execute('SELECT id,score,timestamp FROM high_scores ORDER BY score DESC,timestamp,id COLLATE BINARY').fetchall(),
                'types':db.execute('SELECT DISTINCT typeof(id),typeof(score),typeof(timestamp) FROM high_scores').fetchall()}
print(json.dumps(result))
