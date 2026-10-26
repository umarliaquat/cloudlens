from PIL import Image, ImageOps
import json
from pathlib import Path
items=json.loads(Path('research/flows/asset-manifest.json').read_text())
Path('research/flows/imports').mkdir(exist_ok=True)
for item in items:
    if item.get('error'): continue
    im=Image.open(item['path']).convert('RGB')
    im=ImageOps.contain(im,(1800,1800))
    target=Path('research/flows/imports')/(item['id']+'.jpg')
    im.save(target,quality=90,optimize=True)
    item['importPath']=str(target)
    item['importSize']=list(im.size)
Path('research/flows/asset-manifest.json').write_text(json.dumps(items,indent=2))
print('Prepared',len(items),'uncropped import copies; original source images retained.')
