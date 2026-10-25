"""Prepare only the selected ZIP and an independent expected-byte inventory."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import zipfile
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'.cache/package-test'
with zipfile.ZipFile(ROOT/'.cache/releases/browser-tetris.zip') as archive:
    names=archive.namelist()
    assert archive.testzip() is None and len(names)==len(set(names))
    assert {'BUILD.json','LICENSE','README.txt','index.html'}<=set(names)
    assert sum(info.file_size for info in archive.infolist())<=64*1024*1024
    for info in archive.infolist():
        name=info.filename
        assert not name.startswith('/') and '..' not in Path(name).parts and '\\' not in name and ':' not in name
        assert not info.is_dir() and (info.external_attr>>16)&0o170000!=0o120000
    metadata=json.loads(archive.read('BUILD.json'))
    assert metadata['version']==json.loads((ROOT/'package.json').read_text())['version']
    assert metadata['source_commit']==subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    expected={'metadata':metadata,'files':{name:hashlib.sha256(archive.read(name)).hexdigest() for name in names}}
    if OUTPUT.exists():
        assert not OUTPUT.is_symlink()
        shutil.rmtree(OUTPUT)
    archive.extractall(OUTPUT)
(ROOT/'.cache/package-test-manifest.json').write_text(json.dumps(expected,sort_keys=True)+'\n')
print('Prepared exact ZIP inventory:',metadata,'files:',len(names))
