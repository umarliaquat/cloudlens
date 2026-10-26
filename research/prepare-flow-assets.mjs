import fs from 'node:fs/promises';
const inventory=JSON.parse(await fs.readFile('research/flows/source-inventory.json','utf8'));
const selections={
 'vantage-report':[2,6,8,9,13,15],
 'doit-detail':[1,5,6],
 'doit-review':[1,2,4,5],
 'cloudzero-explorer':[2,3,7],
 'cloudzero-insights':[4,2,3],
 'nops-recs':[2,3,4,5,6],
 'datadog-blog':[7,8,10,11,12,13],
 'aws-walkthrough':[8,9,10,11],
 'aws-investigate':[6,7],
 'cloudhealth-partner':[0,1,2],
};
const files=[];
await fs.mkdir('research/flows/assets',{recursive:true});
for(const [id,indices] of Object.entries(selections)){
 const source=inventory.find(s=>s.id===id);
 for(const index of indices){const im=source.images[index];if(!im)throw new Error(`${id}/${index}`); files.push({...im,source:source.url,id:`${id}-${index}`,path:`research/flows/assets/${id}-${index}.png`});}
}
files.push({id:'flexera-status-diagram',alt:'Recommendation status change flowchart (vendor diagram, not a UI screenshot)',source:'https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/recommendation-lifecycle/access-recommendations',url:'https://docs.flexera.com/flexera-one/assets/images/ccoflowchart-fc9910e0719a1e042ceff9e6e1265f88.png',path:'research/flows/assets/flexera-status-diagram.png'});
const results=await Promise.all(files.map(async im=>{try{const r=await fetch(im.url);if(!r.ok)throw new Error(`${r.status}`);const data=Buffer.from(await r.arrayBuffer());await fs.writeFile(im.path,data);return {...im,bytes:data.length,type:r.headers.get('content-type')};}catch(e){return {...im,error:String(e)};}}));
await fs.writeFile('research/flows/asset-manifest.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.map(({id,alt,bytes,type,error})=>({id,alt,bytes,type,error})),null,2));
