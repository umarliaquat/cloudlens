import fs from 'node:fs/promises';
const sources = [
 ['vantage-report','https://docs.vantage.sh/cost_reports/'],
 ['vantage-anomalies','https://docs.vantage.sh/anomaly_detection/'],
 ['doit-detail','https://help.doit.com/docs/governance/cloud-anomalies/investigate-anomalies'],
 ['doit-review','https://help.doit.com/docs/governance/cloud-anomalies/review-and-classify-anomalies'],
 ['cloudzero-explorer','https://docs.cloudzero.com/docs/explorer'],
 ['cloudzero-insights','https://docs.cloudzero.com/docs/insights'],
 ['cloudzero-optimize','https://docs.cloudzero.com/docs/optimize'],
 ['datadog-recs','https://docs.datadoghq.com/cloud_cost_management/recommendations/'],
 ['datadog-custom','https://docs.datadoghq.com/cloud_cost_management/recommendations/custom_recommendations/'],
 ['nops-recs','https://www.nops.io/blog/new-ai-powered-inform-cost-savings-recommendations/'],
 ['cloudhealth-partner','https://help.cloudhealthtech.com/partners/reporting'],
 ['flexera-lifecycle','https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/recommendation-lifecycle'],
 ['aws-anomalies','https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad-view-anomalies.html'],
 ['aws-investigate','https://aws.amazon.com/blogs/aws-cloud-financial-management/introducing-ai-powered-cost-investigations-for-cost-anomalies/'],
 ['aws-walkthrough','https://aws.amazon.com/blogs/aws-cloud-financial-management/new-aws-cost-explorer-users-can-now-automatically-detect-cost-anomalies/'],
 ['datadog-blog','https://www.datadoghq.com/blog/cloud-cost-recommendations/'],
 ['flexera-access','https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/recommendation-lifecycle/access-recommendations'],
 ['flexera-status','https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/recommendation-lifecycle/manage-recommendation-statuses'],
];
await fs.mkdir('research/flows/raw',{recursive:true});
const results = await Promise.all(sources.map(async ([id,url])=>{
 try {
  const res=await fetch(url); const html=await res.text();
  await fs.writeFile(`research/flows/raw/${id}.html`,html);
  const images=[];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
   const tag=match[0]; const attr=n=>tag.match(new RegExp(`(?:^|\\s)${n}=["']([^"']*)["']`,'i'))?.[1];
   const src=attr('src')||attr('data-src'); if(!src||src.startsWith('data:'))continue;
   images.push({alt:attr('alt')||'',url:new URL(src.replaceAll('&amp;','&'),url).href});
  }
  for(const m of html.matchAll(/<source\b[^>]*srcset=["']([^"']+)["'][^>]*>/gi)){const src=m[1].split(',')[0].split(' ')[0].replaceAll('&amp;','&');if(/cloud_cost|recommendation/i.test(src))images.push({alt:'Published product screenshot',url:new URL(src,url).href});}
  const links=[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m=>({url:new URL(m[1].replaceAll('&amp;','&'),url).href,text:m[2].replace(/<[^>]+>/g,'').trim()})).filter(x=>/review|anomal|insight|lifecycle/i.test(x.text));
  return {id,url,status:res.status,images:[...new Map(images.map(x=>[x.url,x])).values()],links};
 }catch(e){return {id,url,error:String(e)};}
}));
await fs.writeFile('research/flows/source-inventory.json',JSON.stringify(results,null,2));
for(const r of results)console.log(JSON.stringify({id:r.id,status:r.status,error:r.error,images:r.images?.filter(x=>!(/logo|icon|avatar|badge|footer|social/i.test(x.alt))).slice(0,35),links:r.links?.filter(x=>/review/i.test(x.text)).slice(0,5)}));
