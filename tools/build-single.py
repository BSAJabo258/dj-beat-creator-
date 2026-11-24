#!/usr/bin/env python3
"""Bundle the app into one self-contained HTML file: dist/DJ_Beat_Creator.html.

Open the result straight from your computer or phone; no server needed.
Fonts and the MP3 encoder still load from the internet when it's available."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')

def inline_css(m):
    return '<style>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '\n</style>'

def inline_js(m):
    code = (root / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script>\n' + code + '\n</script>'

# version: a content hash of the app's own files (deterministic, so CI can check the build is current)
import hashlib
h = hashlib.sha1()
for f in ['index.html', 'sw.js'] + sorted(str(p.relative_to(root)) for p in list((root / 'js').glob('*.js')) + list((root / 'css').glob('*.css'))):
    h.update(f.encode()); h.update((root / f).read_bytes())
version = h.hexdigest()[:10]
notes = ''
nf = root / 'tools' / 'release-notes.txt'
if nf.exists():
    notes = nf.read_text(encoding='utf-8').strip().splitlines()[0][:160] if nf.read_text(encoding='utf-8').strip() else ''
import json as _json
(root / 'version.json').write_text(_json.dumps({'v': version, 'notes': notes}) + '\n', encoding='utf-8')
html = html.replace('</head>', '<script>window.BC16_VERSION="' + version + '"</script>\n</head>', 1)
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', inline_css, html)
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
# narrated course: embed the recorded voice clips (audio/narration.json → data URIs) so the single file works offline
import json, base64
nj = root / 'audio' / 'narration.json'
if nj.exists():
    m = json.loads(nj.read_text())
    data = {k: 'data:audio/mpeg;base64,' + base64.b64encode((root / v).read_bytes()).decode() for k, v in m.items() if (root / v).exists()}
    html = html.replace('</body>', '<script type="application/json" id="narrData">' + json.dumps(data, separators=(',', ':')) + '</script>\n</body>', 1)
out = root / 'dist' / 'DJ_Beat_Creator.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(f'Version {version}');print(f'Wrote {out.relative_to(root)} ({out.stat().st_size / 1e6:.1f} MB)')
