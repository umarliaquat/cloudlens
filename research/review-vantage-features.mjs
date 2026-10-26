import fs from 'node:fs/promises';
const features=['virtual-tagging','budgets','unit-costs','canvas','network-flow-reports','cost-reports'];
await fs.mkdir('research/vantage-features/assets',{recursive:true});
const sources=await Promise.all(features.map(async feature=>{
 const url='https://www.vantage.sh/features/'+feature;
 const html=await (await fetch(url)).text();
 const images=[];
 for(const m of html.matchAll(/<img\b[^>]*>/gi)){
  const tag=m[0];const attr=n=>tag.match(new RegExp(`(?:^|\\s)${n}=["']([^"']*)["']`,'i'))?.[1];
  const src=attr('src');if(!src||src.startsWith('data:'))continue;
  const imageUrl=new URL(src.replaceAll('&amp;','&'),url).href;
  if(/logo|customer|case-stud|avatar|badge|icon/i.test(imageUrl))continue;
  images.push({url:imageUrl,alt:attr('alt')||''});
 }
 const unique=[...new Map(images.map(x=>[x.url,x])).values()];
 return {feature,url,images:unique};
}));
await fs.writeFile('research/vantage-features/sources.json',JSON.stringify(sources,null,2));
console.log(JSON.stringify(sources,null,2));
