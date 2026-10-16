"""Nur für Entwicklung/Videoexport. Website selbst funktioniert per Doppelklick."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def do_POST(self):
        size=int(self.headers.get('Content-Length','0'))
        if self.path!='/save-animatic' or not 0<size<50_000_000:
            self.send_error(400);return
        data=self.rfile.read(size)
        if data[4:8]!=b'ftyp':self.send_error(415);return
        (ROOT/'abgabe'/'Genug_Animatic_96s.mp4').write_bytes(data)
        self.send_response(200);self.end_headers();self.wfile.write(b'MP4 saved')
ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
