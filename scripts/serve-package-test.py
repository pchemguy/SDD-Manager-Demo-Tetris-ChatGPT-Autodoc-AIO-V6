"""Read-only static acceptance server: exact package at / and /demo/."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit
ROOT=Path(__file__).resolve().parents[1]/'.cache/package-test'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,path):
        parsed=urlsplit(path)
        if parsed.path.startswith('/demo/'):
            path=urlunsplit(('','',parsed.path[len('/demo'):],parsed.query,parsed.fragment))
        return super().translate_path(path)
with ThreadingHTTPServer(('127.0.0.1',4173),partial(Handler,directory=str(ROOT))) as server:
    server.serve_forever()
