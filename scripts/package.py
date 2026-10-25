"""Build a reproducible static browser distribution; never include repository secrets."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'.cache/releases/browser-tetris.zip'
OUTPUT.parent.mkdir(parents=True,exist_ok=True)
version=json.loads((ROOT/'package.json').read_text())['version']
try:
    source=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True,timeout=5).strip()
    dirty=bool(subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True,timeout=5).strip())
except (subprocess.SubprocessError,FileNotFoundError):
    source='unknown'
    dirty=True
members={}
dist=ROOT/'dist'
assert (dist/'index.html').is_file(),'Build the application before packaging'
for file in sorted(dist.rglob('*')):
    if file.is_dir():
        continue
    assert not file.is_symlink(),'Symlinks are not distributable assets'
    name=file.relative_to(dist).as_posix()
    assert not any(part in {'.git','.agents','node_modules','docs'} for part in file.relative_to(dist).parts)
    assert not name.endswith('.tkn') and not file.name.startswith('.env')
    members[name]=file.read_bytes()
members['LICENSE']=(ROOT/'LICENSE').read_bytes()
members['BUILD.json']=(json.dumps({'version':version,'source_commit':source,'dirty':dirty},sort_keys=True)+'\n').encode()
members['README.txt']=(f"""Browser Tetris {version}

Extract this archive and serve its directory over HTTP(S), including from a subdirectory.
For example: python -m http.server 8000
Open http://localhost:8000 in your browser. All assets, the SQLite worker and WASM are local.
No application backend or account is required.

PLAY
Arrow keys move/descend; Up/X and Z rotate. Space hard drops; C/Shift holds.
B activates a funded penetrator. Four-line clears earn one bonus, up to three.
White penetrators cross occupied cells to the deepest legal non-overlapping landing.
P/Escape or the button pauses. Enter starts from ready/game-over; Restart abandons a run.

SETTINGS
Six controls configure ghost, hard drop, next preview, locking and hold.
URL values override saved cookies independently; changes save only the selected setting.
Dynamic ghost shows only wholly lower-half landings. Hard-drop availability is independent.
Locking choices apply at the next spawn, including hold replacements.

RESULTS AND FILES
The session top ten retains completed games across restart and clears on leaving/reload.
Save offers JSON or SQLite downloads. Restore detects either by content and replaces only
fully validated results. IDs, safe integer scores and canonical UTC timestamps are preserved.
JSON Schema is available as leaderboard.schema.json. JSON limit: 65536 bytes.
SQLite limit: 1048576 bytes, format version PRAGMA user_version=1.
File operations pause play; Cancel and errors preserve results. Downloads are manual.

LICENSES AND SOURCE
See LICENSE and THIRD-PARTY-NOTICES.txt. BUILD.json identifies version and source commit.
Player guides and validation reports are in the tagged source repository:
https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6
""").encode()

with zipfile.ZipFile(OUTPUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for name,data in sorted(members.items()):
        info=zipfile.ZipInfo(name,date_time=(2000,1,1,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        info.external_attr=0o100644<<16
        archive.writestr(info,data)
with zipfile.ZipFile(OUTPUT) as archive:
    assert archive.testzip() is None and len(archive.namelist())==len(members)
digest=hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
OUTPUT.with_suffix('.zip.sha256').write_text(digest+'  '+OUTPUT.name+'\n')
print(json.dumps({'package':str(OUTPUT),'version':version,'source_commit':source,'dirty':dirty,'members':len(members),'sha256':digest}))
