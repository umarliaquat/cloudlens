from PIL import Image, ImageOps, ImageDraw
import json, math
from pathlib import Path
items=json.loads(Path('research/flows/asset-manifest.json').read_text())
valid=[]
for item in items:
    if item.get('error'): continue
    try:
        im=Image.open(item['path']).convert('RGB')
        item['size']=list(im.size)
        valid.append(item)
    except Exception as e: item['reviewError']=str(e)
for start in range(0,len(valid),8):
    group=valid[start:start+8]
    canvas=Image.new('RGB',(1600,400*math.ceil(len(group)/2)), '#e9e9e9')
    draw=ImageDraw.Draw(canvas)
    for i,item in enumerate(group):
        x=(i%2)*800;y=(i//2)*400
        image=Image.open(item['path']).convert('RGB')
        thumb=ImageOps.contain(image,(776,350))
        canvas.paste(thumb,(x+12+(776-thumb.width)//2,y+35+(350-thumb.height)//2))
        draw.text((x+12,y+10),item['id'],fill='#111')
    canvas.save(f'research/flows/review-{start//8+1}.jpg',quality=90)
Path('research/flows/asset-manifest.json').write_text(json.dumps(items,indent=2))
print(json.dumps([{'id':i['id'],'size':i.get('size'),'error':i.get('error') or i.get('reviewError')} for i in items]))
