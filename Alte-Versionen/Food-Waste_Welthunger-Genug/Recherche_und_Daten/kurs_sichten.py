from pathlib import Path
from pypdf import PdfReader
import json
root=Path(__file__).parent
course=root/'2026 WS (public)'
out=root/'Projekt_Welthunger'/'build'
out.mkdir(parents=True,exist_ok=True)
texts=[]; inventory=[]
for p in sorted(course.rglob('*')):
    if p.is_file():
        inventory.append({'path':str(p.relative_to(course)),'bytes':p.stat().st_size})
        if p.suffix=='.pdf':
            r=PdfReader(p)
            texts.append('\nFILE '+str(p.relative_to(course))+'\n'+'\n'.join('PAGE '+str(i+1)+'\n'+(page.extract_text() or '') for i,page in enumerate(r.pages)))
        elif p.suffix in ('.js','.html') and 'libs' not in p.parts:
            texts.append('\nFILE '+str(p.relative_to(course))+'\n'+p.read_text(encoding='utf8',errors='replace'))
(out/'kurs_materialien_komplett.txt').write_text('\n'.join(texts),encoding='utf8')
(out/'kurs_inventar.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf8')
print('Gesichtet',len(inventory),'Dateien;',len(texts),'PDF/Quelltext-Dateien extrahiert')
for p in root.rglob('*All_Data*'):
    print(p.name,p.stat().st_size)
