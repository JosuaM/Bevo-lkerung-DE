from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import struct
ROOT=Path(__file__).resolve().parent.parent
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def do_GET(self):
  if self.path=='/website/qa.html':
   script='''<script>window.addEventListener('genug-export',async event=>{if(event.detail.type!=='png')return;const blob=event.detail.blob;const response=await fetch('/qa/save-image',{method:'POST',headers:{'Content-Type':'image/png'},body:blob});document.getElementById('export-status').textContent=await response.text();});</script>'''
   data=(ROOT/'website/index.html').read_text(encoding='utf-8')+script
   self.send_response(200);self.send_header('Content-Type','text/html;charset=utf-8');self.end_headers();self.wfile.write(data.encode('utf-8'));return
  super().do_GET()
 def do_POST(self):
  if self.path!='/qa/save-image':self.send_error(404);return
  length=int(self.headers.get('Content-Length','0'))
  if not 0<length<10_000_000:self.send_error(413);return
  data=self.rfile.read(length)
  if data[:8]!=b'\x89PNG\r\n\x1a\n':self.send_error(400);return
  width,height=struct.unpack('>II',data[16:24])
  (ROOT/'abgabe/Genug_Gesamtgrafik_2022.png').write_bytes(data)
  self.send_response(200);self.send_header('Content-Type','text/plain;charset=utf-8');self.end_headers();self.wfile.write(f'PNG gespeichert und geprüft: {width} × {height}, {len(data)} Bytes.'.encode('utf-8'))
import sys
ThreadingHTTPServer(('127.0.0.1',int(sys.argv[1]) if len(sys.argv)>1 else 8768),Handler).serve_forever()
