const fs=require('fs');
function edit(file,fn){let s=fs.readFileSync(file,'utf8');fs.writeFileSync(file,fn(s));}
edit('src/components/workspace/analysis-pages.tsx',s=>{
 s=s.replace('import { SpendChart, Sparkline } from "../spend-chart";','import { SpendChart, Sparkline } from "../spend-chart";\nimport {ServiceIcon,EvidenceStrip} from "./research-ui";');
 const start=s.indexOf('export function RecommendationsPage');let before=s.slice(0,start),part=s.slice(start);
 part=part.replace('hint: "Simulated verification"','hint: "Measured run rate · not cash saved this month"').replace('["Open", "Changes requested"].includes(r.status)','r.status === "Open" && r.evidenceReady !== false').replace('hint: "Owned by your engineering team"','hint: "Ready for client engineering review"');
 part=part.replace('      <Section>','      <EvidenceStrip title="An approval is a decision, not a deployment">Consultant evidence → client decision → recorded implementation → a defined measurement window. Estimated and measured savings stay separate.</EvidenceStrip>\n      <Section>');
 part=part.replace('              "Verified",','              "Implemented",\n              "Dismissed",\n              "Verified",');
 part=part.replace('<th className="align-right">Est. savings</th>','<th className="align-right">Monthly run rate</th>');
 part=part.replace('<span className="resource-tile">\n                        <IconCloud />\n                      </span>','<ServiceIcon name={r.type.includes("Storage")?"Amazon S3":"Amazon EC2"}/>');
 part=part.replace('<small className="mono">{r.resource}</small>','<small className="mono">{r.resource}</small><small className="table-subtext">{r.evidenceReady === false ? "Consultant evidence requested" : r.status === "Implemented" ? "Awaiting measurement" : r.status === "Verified" ? "Measurement available" : "Review prerequisites before deciding"}</small>');
 part=part.replace('<small>/month</small>','<small>{r.status === "Verified" ? "Measured" : "Estimated"}</small>');
 return before+part;
});
edit('src/components/workspace/consultant-pages.tsx',s=>{
 s=s.replace('import { money, shortDate }','import { clientAttention } from "@/server/analysis/research-workflows";\nimport { money, shortDate }');
 const a=s.indexOf('  const clients = c.portfolio.map'),b=s.indexOf('  const rows = clients',a);
 s=s.slice(0,a)+`  const clients = c.portfolio.map(o=>({...o,...clientAttention(o),risk:!!o.forecast&&o.forecast>o.budget}));\n`+s.slice(b);
 s=s.replaceAll('b.score - a.score || b.mtd - a.mtd','b.overrun-a.overrun || b.exposure-a.exposure || b.decisions-a.decisions');
 s=s.replace('clients.filter((o) => o.score > 0).length','clients.filter((o) => o.reasons.length > 0).length').replace('Open high-severity events or budget risk','Budget overrun, cost investigations or pending decisions');
 s=s.replace('<th>Attention</th>','<th>Next work</th>');
 const band=s.indexOf('                    <span className={`attention-band');
 if(band>=0){const end=s.indexOf('                  </td>',band);s=s.slice(0,band)+'                    <span>{o.reasons[0] || "No pending work"}</span><small className="table-subtext">{o.exposure>0?`${money(o.exposure)} observed change under review`:"No active cost investigations"}</small>\n'+s.slice(end);}
 s=s.replace('Attention scores are a configurable demo heuristic','Ordered by forecast overrun, observed cost impact, then pending decisions. No composite score.');
 s=s.replace('180 days of cost history · Updated Oct 25, 2026 at 08:00','Simulated billing history · Complete through Oct 24 · Updated Oct 25 at 08:00');
 const ar=s.indexOf('                      {[\n                        "Production",');if(ar>=0){const end=s.indexOf('.map((name, i)',ar);s=s.slice(0,ar)+'                      {[...new Set(c.overview.monthRecords.map(r=>r.account))]\n                        '+s.slice(end);}
 s=s.replace('Executives review. Engineers decide. Consultants guide clients and\n            manage access.','Capabilities and client scope are separate. Executives view reports; engineers decide on changes; consultants advise and manage assigned clients. This is a browser-local preview, not production authorization.');
 return s;
});
