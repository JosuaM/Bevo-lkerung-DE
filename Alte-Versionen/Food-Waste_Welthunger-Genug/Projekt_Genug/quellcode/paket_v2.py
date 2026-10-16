from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import shutil,re,json
from urllib.parse import urlsplit
P=Path(__file__).resolve().parent.parent
archive=P/'archiv/version1'
if not (archive/'Genug_Projektpaket.zip').exists():shutil.copy2(P/'Genug_Projektpaket.zip',archive/'Genug_Projektpaket.zip')
for file in (P/'abgabe/Bilder').glob('*'):
 if file.is_file() and not file.name.startswith('Website_v2_'):shutil.move(str(file),str(archive/'abgabe/Bilder'/file.name))
files=['pruefen_v2.cjs','unabhaengig_pruefen_v2.py','dokumentieren_v2.py','paket_v2.py','qa_server.py','qa_export.html','mobile_pruefen_v2.html']
for name in files:shutil.copy2(P/'build'/name,P/'quellcode'/name)
(P/'quellcode/README.md').write_text('''# Quellen Version 2

Die eigentliche Website-Quelle liegt direkt in `website`, die Auswertung in `auswertung.py` im Projektstamm. Dieser Ordner enthält Kopien der Prüf- und Dokumentationsskripte. Ausführen aus `build`, wie in der Dokumentation beschrieben; dort stimmen die relativen Projektpfade. Keine Drittbibliothek für Website, Datenpipeline oder Modellprüfung erforderlich. `qa_server.py` ist ausschließlich für den lokalen Bildexport-Test; die normale Website hat keine Datenabrufe. Frühere Animatic-/Präsentationsquellen liegen im Archiv Version 1.
''',encoding='utf-8')
# Alle lokalen src/href-Abhängigkeiten des Startdokuments einschließlich Cache-Versionen existieren.
index=(P/'website/index.html').read_text(encoding='utf-8')
for link in re.findall(r'(?:src|href)="([^"]+)"',index):
 if not link.startswith(('http:','https:','#')):assert (P/'website'/urlsplit(link).path).is_file(),link
for file in (P/'website').glob('*.js'):
 assert not re.search(r'\bfetch\s*\(|\bimport\s*\(|\bXMLHttpRequest\b',file.read_text(encoding='utf-8')),file
with ZipFile(P/'Genug_Website.zip','w',ZIP_DEFLATED,compresslevel=9) as z:
 for file in sorted((P/'website').rglob('*')):
  if file.is_file():z.write(file,file.relative_to(P))
with ZipFile(P/'Genug_Projektpaket.zip','w',ZIP_DEFLATED,compresslevel=6) as z:
 for folder in ['website','originaldaten','recherche','abgabe','quellcode']:
  for file in sorted((P/folder).rglob('*')):
   if file.is_file():z.write(file,file.relative_to(P))
 for name in ['README.md','auswertung.py']:z.write(P/name,name)
 for name in files:z.write(P/'build'/name,'build/'+name)
for name in ['Genug_Website.zip','Genug_Projektpaket.zip']:
 with ZipFile(P/name) as z:assert z.testzip() is None;print(name,len(z.namelist()),(P/name).stat().st_size)
print('Lokale Abhängigkeiten und ZIP-Integrität bestanden; Archiv und Laufzeitbibliotheken nicht im aktuellen Paket.')
