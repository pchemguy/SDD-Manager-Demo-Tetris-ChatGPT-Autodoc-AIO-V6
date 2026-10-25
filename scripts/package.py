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
members['README.txt']=(f'Browser Tetris {version}\n\nExtract this archive, then serve this directory over HTTP.\nFor example: python -m http.server 8000\nOpen http://localhost:8000 in your browser. No application backend is required.\n\nArrow keys move/descend, Up/X and Z rotate, Space hard drops, C/Shift holds, P/Escape pause.\nEnter starts from ready/game-over. Use the explicit Restart button to abandon a run.\nSee the tagged project release for the capabilities included in this version.\n').encode()
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
