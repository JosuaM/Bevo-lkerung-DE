#!/usr/bin/env python3
"""Lokale Projektvorschau mit automatischem Speichern ausschließlich in index.html."""
import json
import os
import re
import secrets
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INDEX = ROOT / 'index.html'
TOKEN = secrets.token_urlsafe(32)
LOCK = threading.Lock()
DEFAULTS_PATTERN = re.compile(r'const DEFAULTS = \{[^\n]*\};')


def validated_settings(value):
    required = {'dot', 'szmin', 'szmax', 'speed', 'colors', 'bgs'}
    if not isinstance(value, dict) or not required <= set(value) <= required | {'sound', 'evsound'}:
        raise ValueError('Ungültige Einstellungen.')
    limits = {'dot': (1, 1000000), 'szmin': (.3, 6), 'szmax': (.5, 14), 'speed': (.5, 2.5)}
    for key, (lo, hi) in limits.items():
        number = value[key]
        if isinstance(number, bool) or not isinstance(number, (int, float)) or not lo <= number <= hi:
            raise ValueError('Ungültiger Wert: ' + key)
    if value['szmin'] > value['szmax']:
        raise ValueError('Punktgrößen stimmen nicht überein.')
    colors, bgs = value['colors'], value['bgs']
    if not isinstance(colors, dict) or set(colors) != {'birth', 'death', 'in', 'out'}:
        raise ValueError('Ungültige Farben.')
    if not isinstance(bgs, list) or len(bgs) != 6:
        raise ValueError('Ungültige Hintergründe.')
    if not all(isinstance(c, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', c) for c in [*colors.values(), *bgs]):
        raise ValueError('Ungültige Farbwerte.')
    return value


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def reply_json(self, code, value):
        body = json.dumps(value).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def valid_host(self):
        return self.headers.get('Host') in {f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}'}

    def do_GET(self):
        if not self.valid_host():
            self.reply_json(403, {'error': 'Ungültiger Host.'})
            return
        if self.path == '/__project_settings__':
            self.reply_json(200, {'project': 'bevoelkerung-de', 'token': TOKEN})
        elif any(part.startswith('.') for part in self.path.split('/') if part):
            self.send_error(404)
        else:
            super().do_GET()

    def do_POST(self):
        origins = {f'http://127.0.0.1:{self.server.server_port}', f'http://localhost:{self.server.server_port}'}
        if (not self.valid_host() or self.path != '/__project_settings__'
                or self.headers.get('Origin') not in origins
                or self.headers.get('X-Project-Token') != TOKEN):
            self.reply_json(403, {'error': 'Kein Projektzugriff.'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 4096:
                raise ValueError('Ungültige Anfragegröße.')
            settings = validated_settings(json.loads(self.rfile.read(length)))
            target = INDEX
            with LOCK:
                source = target.read_text()
                if len(DEFAULTS_PATTERN.findall(source)) != 1:
                    raise ValueError('Projektdatei kann nicht eindeutig aktualisiert werden.')
                updated = DEFAULTS_PATTERN.sub(lambda _: 'const DEFAULTS = ' + json.dumps(settings, separators=(',', ':')) + ';', source)
                temporary = target.with_name('.' + target.stem + '-settings.tmp')
                try:
                    temporary.write_text(updated)
                    os.replace(temporary, target)
                finally:
                    temporary.unlink(missing_ok=True)
            self.reply_json(200, {'saved': True})
        except (ValueError, TypeError, OSError) as error:
            self.reply_json(400, {'error': str(error)})


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    url = f'http://127.0.0.1:{server.server_port}/index.html'
    print('Projekt mit automatischem Speichern: ' + url, flush=True)
    print('Zum Beenden im Terminal Ctrl+C drücken.', flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
