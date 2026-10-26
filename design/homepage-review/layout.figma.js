await figma.loadAllPagesAsync();
const page=figma.root.children.find(p=>p.name==='Design exploration');
await figma.setCurrentPageAsync(page);
for(const style of ['Regular','Medium','SemiBold','Bold'])await figma.loadFontAsync({family:'Geist',style});
await figma.loadFontAsync({family:'Geist Mono',style:'Regular'});
const vars=Object.fromEntries((await figma.variables.getLocalVariablesAsync('COLOR')).map(v=>[v.name,v]));
const textStyles=Object.fromEntries((await figma.getLocalTextStylesAsync()).map(v=>[v.name.split(' / ')[1],v]));
function rgb(h){h=h.replace('#','');return {r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255};}
function paint(k,opacity=1){const p={type:'SOLID',color:rgb(COLORS[k]||k),opacity};return vars[k]?figma.variables.setBoundVariableForPaint(p,'color',vars[k]):p;}
const C={canvas:'color-bg-canvas',surface:'color-bg-surface',subtle:'color-bg-subtle',border:'color-border-default',ink:'color-text-primary',secondary:'color-text-secondary',muted:'color-text-muted',orange:'color-accent-default',tint:'color-accent-subtle',green:'color-status-success-fg',blue:'color-status-info-fg'};
function box(p,name,w,h,bg=null,dir=null,gap=0,pad=0){const n=figma.createFrame();p.appendChild(n);n.name=name;n.resize(w,h||1);n.fills=bg?[paint(bg)]:[];n.clipsContent=false;if(dir){n.layoutMode=dir;n.itemSpacing=gap;n.paddingTop=n.paddingBottom=n.paddingLeft=n.paddingRight=pad;n.primaryAxisSizingMode=h?'FIXED':'AUTO';n.counterAxisSizingMode='FIXED';}return n;}
function at(n,x,y){n.x=x;n.y=y;return n;}
function stroke(n,key=C.border,r=10){n.strokes=[paint(key)];n.strokeWeight=1;n.cornerRadius=r;return n;}
function text(p,value,size=14,weight='Regular',color=C.ink,width=null){const t=figma.createText();p.appendChild(t);t.fontName={family:'Geist',style:weight};t.fontSize=size;t.lineHeight={unit:'PIXELS',value:Math.round(size*1.45)};t.fills=[paint(color)];if(width){t.resize(width,1);t.textAutoResize='HEIGHT';}else t.textAutoResize='WIDTH_AND_HEIGHT';t.characters=value;t.name=value.slice(0,70);return t;}
function label(p,v,x,y,size=13,weight='Regular',color=C.secondary,w){return at(text(p,v,size,weight,color,w),x,y);}
function rect(p,x,y,w,h,color,r=0){const n=figma.createRectangle();p.appendChild(n);n.resize(w,h);n.x=x;n.y=y;n.fills=[paint(color)];n.cornerRadius=r;return n;}
function icon(p,name,x,y,size=16,color=C.secondary){const h=COLORS[color]||color;const n=figma.createNodeFromSvg(ICONS[name].replace('currentColor',h));p.appendChild(n);n.name='Tabler / '+name;n.resize(size,size);n.x=x;n.y=y;return n;}
function aws(p,k,x,y,size=28){const n=figma.createNodeFromSvg(AWS[k]);p.appendChild(n);n.name='AWS official / '+k;n.resize(size,size);n.x=x;n.y=y;return n;}
function rule(p,x,y,w){return rect(p,x,y,w,1,C.border);}
function pill(p,v,color=C.secondary,bg=C.subtle){const n=box(p,v,10,26,bg,'HORIZONTAL',0,0);n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='AUTO';n.paddingLeft=n.paddingRight=9;n.paddingTop=n.paddingBottom=4;n.cornerRadius=5;const t=text(n,v,11,'Medium',color);return n;}
function button(p,v,x,y,w,primary=false,ic=null){const n=at(box(p,v,w,36,primary?C.orange:C.surface,'HORIZONTAL',8,0),x,y);stroke(n,primary?'#BF3B08':C.border,6);n.primaryAxisAlignItems='CENTER';n.counterAxisAlignItems='CENTER';if(primary)n.effects=[{type:'INNER_SHADOW',color:{r:1,g:1,b:1,a:.25},offset:{x:0,y:4},radius:8.3,spread:0,visible:true,blendMode:'NORMAL'},{type:'DROP_SHADOW',color:{r:.34,g:.15,b:.05,a:.10},offset:{x:0,y:1},radius:2,spread:0,visible:true,blendMode:'NORMAL'}];if(ic)icon(n,ic,0,0,16,primary?'color-text-inverse':C.secondary);text(n,v,12,'Medium',primary?'color-text-inverse':C.ink);return n;}
function path(p,name,d,color,width=2,dash=null,fill=null){const n=figma.createVector();p.appendChild(n);n.name=name;n.vectorPaths=[{windingRule:'NONZERO',data:d}];n.fills=fill?[paint(fill,.07)]:[];n.strokes=color?[paint(color)]:[];n.strokeWeight=width;n.strokeCap='ROUND';n.strokeJoin='ROUND';if(dash)n.dashPattern=dash;return n;}
function panel(p,name,x,y,w,h){return stroke(at(box(p,name,w,h,C.surface),x,y));}
function link(p,v,x,y){label(p,v,x,y,12,'Medium',C.orange);}
const existing=page.children.find(n=>n.name==='CloudLens / Homepage redesign / Review 01');
if(existing)throw new Error('Review section already exists. Inspect and update instead of duplicating.');
const section=figma.createSection();page.appendChild(section);section.name='CloudLens / Homepage redesign / Review 01';section.x=0;section.y=5000;section.resizeWithoutConstraints(2128,1740);
const screen=at(box(section,'01 / Client Overview / Engineer / Desktop',1440,1512,C.canvas),32,80);screen.clipsContent=true;
const sidebar=at(box(screen,'Sidebar / 240 px',240,1512,C.surface),0,0);rect(sidebar,239,0,1,1512,C.border);
icon(sidebar,'Cloud',20,25,24,C.orange);label(sidebar,'CloudLens',52,24,19,'SemiBold',C.ink);
const client=stroke(at(box(sidebar,'Client context',208,58,C.canvas),16,76),C.border,6);rect(client,10,14,30,30,'#EEE4DB',6);label(client,'BR',15,21,11,'Medium');label(client,'Brightloop Retail',48,11,13,'Medium',C.ink);label(client,'Client workspace',48,30,11,'Regular',C.muted);icon(client,'ChevronDown',182,21,14);
const search=stroke(at(box(sidebar,'Search',208,34,C.surface),16,146),C.border,6);icon(search,'Search',10,9);label(search,'Search workspace',34,8,12);label(search,'⌘ K',174,9,10,'Regular',C.muted);
label(sidebar,'WORKSPACE',24,207,10,'Medium',C.muted);
const navIds=['2:2322','2:2326','2:2330','2:2334','2:2338','2:2342','2:2346'];
for(let i=0;i<navIds.length;i++){const master=await figma.getNodeByIdAsync(navIds[i]);const instance=master.createInstance();sidebar.appendChild(instance);instance.x=12;instance.y=232+i*40;}
rule(sidebar,16,1370,208);icon(sidebar,'Settings',24,1390);label(sidebar,'Settings',48,1388,13);rect(sidebar,20,1434,32,32,'#EEE4DB',16);label(sidebar,'DC',27,1442,11,'Medium');label(sidebar,'Daniel Chen',64,1432,12,'Medium',C.ink);label(sidebar,'Client engineer',64,1451,11,'Regular',C.muted);icon(sidebar,'ChevronDown',206,1443,14);
const top=at(box(screen,'Workspace header',1200,64,C.surface),240,0);rule(top,0,63,1200);label(top,'Client workspace',32,23,12);icon(top,'Help',943,24,16);label(top,'Help',967,23,12);icon(top,'Bell',1050,24,16);rect(top,1124,16,32,32,'#EEE4DB',16);label(top,'DC',1131,24,11,'Medium');
const x=272,w=1136;
label(screen,'Cost overview',x,86,28,'SemiBold',C.ink);label(screen,'Brightloop Retail  ·  4 AWS accounts',x,128,13);
at(pill(screen,'Simulated AWS data',C.muted,C.subtle),x+256,125);
button(screen,'Oct 1–24, 2026',1044,92,160,false,'Calendar');button(screen,'Export review',1216,92,192,true,'Download');
const scope=at(box(screen,'Reporting scope and data completeness',w,40),x,164);button(scope,'All 4 accounts',0,0,140,false,'Filter');button(scope,'Amortized cost',152,0,151,false,'ChevronDown');label(scope,'USD · Excludes tax',319,10,11);icon(scope,'CircleCheck',806,11,14,C.green);label(scope,'Complete through Oct 24 · UTC',826,9,11,'Regular',C.secondary);
function group(name,gx,title,iconName){const f=panel(screen,name,gx,224,556,150);f.fills=[paint(C.subtle)];icon(f,iconName,16,13,16);label(f,title,40,11,13,'Medium');const body=stroke(at(box(f,'Inset metric body',556,106,C.surface),0,44),C.border,9);return body;}
const spend=group('Financial position',x,'Cloud spend','Wallet');rect(spend,278,0,1,106,C.border);
label(spend,'Month to date',18,12,12);label(spend,'$31,504',18,32,28,'SemiBold',C.ink);label(spend,'+$1,868 (+6.3%) vs Sep 1–24',18,77,11,'Regular','color-status-warning-fg');
label(spend,'Month-end forecast · estimate',296,12,12);label(spend,'$42,095',296,32,28,'SemiBold',C.ink);label(spend,'$5,905 below $48,000 budget',296,77,11,'Regular',C.green);
const save=group('Savings lifecycle',x+580,'Savings · monthly run rate','Bulb');rect(save,278,0,1,106,C.border);label(save,'Identified · estimate',18,12,12);label(save,'$1,066',18,32,28,'SemiBold',C.ink);label(save,'3 opportunities · not yet realized',18,77,11);
label(save,'Verified · measured run rate',296,12,12);label(save,'$565',296,32,28,'SemiBold',C.ink);label(save,'2 changes · measured Oct 11–24',296,77,11,'Regular',C.green);
const chart=panel(screen,'Cumulative spend / Actual, forecast and budget',x,398,688,356);label(chart,'Spend against plan',20,17,15,'SemiBold',C.ink);label(chart,'Cumulative USD · October 2026',20,42,12);button(chart,'Daily',576,17,92,false,'ChevronDown');
const plot=at(box(chart,'Plot / cumulative USD',636,224),30,83);const px=40,py=12,pw=574,ph=172;
for(let i=0;i<=4;i++){const yy=py+ph-i*ph/4;path(plot,'Grid '+i,`M ${px} ${yy} L ${px+pw} ${yy}`,C.border,1,[2,4]);label(plot,i===0?'$0':`$${i*12}k`,0,yy-8,10,'Regular',C.muted);}
const amounts=[1160,2325,3430,4580,5800,7020,8220,9510,10800,12030,13250,14420,15680,16920,18190,19480,20720,22220,23780,25360,26910,28500,30080,31504];
function point(day,value){return [px+(day-1)/30*pw,py+ph-value/48000*ph];}
const pts=amounts.map((v,i)=>point(i+1,v));const actualD=pts.map(([a,b],i)=>(i?'L':'M')+' '+a+' '+b).join(' ');path(plot,'Actual area',actualD+` L ${pts.at(-1)[0]} ${py+ph} L ${px} ${py+ph} Z`,null,0,null,C.orange);path(plot,'Actual cumulative spend',actualD,C.orange,2);
const endpoint=point(31,42095),bp=point(31,48000);path(plot,'Forecast estimate',`M ${pts.at(-1)[0]} ${pts.at(-1)[1]} L ${endpoint[0]} ${endpoint[1]}`,C.orange,2,[4,4]);path(plot,'Monthly budget trajectory',`M ${px} ${py+ph} L ${bp[0]} ${bp[1]}`,'chart-baseline',1.5,[3,4]);
for(const d of [1,8,16,24,31])label(plot,'Oct '+d,point(d,0)[0]-12,195,10,'Regular',C.muted);
rect(plot,pts.at(-1)[0]-3,pts.at(-1)[1]-3,6,6,C.orange,3);label(plot,'$42,095',527,33,11,'Medium',C.orange);label(plot,'$48,000 budget',490,0,10,'Regular',C.muted);
rect(chart,22,316,14,2,C.orange);label(chart,'Actual',43,307,11);path(chart,'Forecast legend','M 112 317 L 126 317',C.orange,1.5,[3,3]);label(chart,'Forecast',133,307,11);path(chart,'Budget legend','M 224 317 L 238 317','chart-baseline',1.5,[3,3]);label(chart,'Budget pace',245,307,11);label(chart,'Oct 25–31 is estimated',518,307,10,'Regular',C.muted);
const change=panel(screen,'What changed / Comparable period drivers',x+712,398,424,356);label(change,'What changed?',20,17,15,'SemiBold',C.ink);label(change,'+$1,868 vs Sep 1–24',20,43,12,'Medium','color-status-warning-fg');
function driver(y,k,title,delta,subtitle,evidence){aws(change,k,20,y,28);label(change,title,60,y-2,13,'Medium',C.ink);label(change,delta,325,y-2,14,'SemiBold',C.ink);label(change,subtitle,60,y+21,11);label(change,evidence,60,y+42,11,'Regular',C.muted,336);}
driver(86,'ec2','EC2 instance usage','+$1,095','Production · Compute team','More billed instance-hours. Deployment cause unconfirmed.');rule(change,20,173,384);
driver(190,'vpc','Network transfer','+$873','Production · Platform team','Higher billed transfer volume. Investigate traffic paths.');
label(change,'Other services offset the increase by $100.',20,285,11);rule(change,0,316,424);link(change,'Investigate cost drivers',20,330);icon(change,'ArrowRight',382,332,14,C.orange);
const services=panel(screen,'AWS service breakdown / reconciled totals',x,778,688,388);label(services,'Where the money goes',20,17,15,'SemiBold',C.ink);label(services,'Oct 1–24 vs Sep 1–24 · All 4 accounts',20,42,12);link(services,'Open Cost Explorer',540,20);
const th=at(box(services,'Column headers',686,32,C.canvas),1,78);label(th,'AWS SERVICE',19,9,10,'Medium',C.muted);label(th,'SHARE',284,9,10,'Medium',C.muted);label(th,'SPEND',437,9,10,'Medium',C.muted);label(th,'CHANGE',553,9,10,'Medium',C.muted);
const serviceData=[['ec2','Amazon EC2',13337,1095],['rds','Amazon RDS',6858,7],['vpc','Amazon VPC',3935,873],['s3','Amazon S3',2592,-5],['cloudfront','Amazon CloudFront',1897,-2],[null,'Other AWS services',2885,-100]];
for(let i=0;i<serviceData.length;i++){const [k,n,v,d]=serviceData[i],y=110+i*39;const r=at(box(services,n,686,39,C.surface),1,y);if(k)aws(r,k,19,8,24);else icon(r,'Dots',22,10,18);label(r,n,55,11,12,'Medium',C.ink);rect(r,283,19,82,3,C.subtle,1);rect(r,283,19,82*v/13337,3,k==='ec2'?C.orange:'chart-baseline',1);label(r,(v/31504*100).toFixed(1)+'%',376,12,10,'Regular',C.muted);label(r,'$'+v.toLocaleString('en-US'),437,11,12,'Medium',C.ink);label(r,(d>0?'+$':'−$')+Math.abs(d).toLocaleString('en-US'),553,11,12,'Medium',d>100?'color-status-warning-fg':C.secondary);icon(r,'ChevronRight',653,13,12);rule(r,19,38,648);r.layoutMode='NONE';}
label(services,'Total',20,358,12,'SemiBold',C.ink);label(services,'100%',376,358,11);label(services,'$31,504',438,356,14,'SemiBold',C.ink);label(services,'+$1,868',554,358,12,'Medium','color-status-warning-fg');
const progress=panel(screen,'Consultancy outcomes / measured changes',x+712,778,424,388);label(progress,'Changes that delivered',20,17,15,'SemiBold',C.ink);label(progress,'2 implemented actions · measurement Oct 11–24',20,42,11);
const out=at(box(progress,'Verified monthly run rate',384,76,'color-status-success-bg'),20,80);out.cornerRadius=6;icon(out,'ShieldCheck',14,17,18,C.green);label(out,'$565 / month',44,10,22,'SemiBold',C.green);label(out,'Verified run rate · not cash saved this month',14,48,11,'Regular',C.green);
label(progress,'Scheduled development shutdown',20,176,12,'Medium',C.ink);label(progress,'Implemented Oct 10 · Compute team',20,197,11);label(progress,'$325/mo',330,177,12,'SemiBold',C.green);rule(progress,20,229,384);
label(progress,'Removed unattached EBS volumes',20,245,12,'Medium',C.ink);label(progress,'Implemented Oct 10 · Platform team',20,266,11);label(progress,'$240/mo',330,246,12,'SemiBold',C.green);
label(progress,'Compared with Sep 27–Oct 10; normalized to 30 days.',20,305,10,'Regular',C.muted);rule(progress,0,339,424);link(progress,'View measurement evidence',20,355);icon(progress,'ArrowRight',382,357,14,C.orange);
const queue=panel(screen,'Decision queue / client engineer',x,1190,w,242);label(queue,'Ready for your team',20,16,15,'SemiBold',C.ink);label(queue,'2 decisions waiting · consultant recommendations require your review',20,42,12);link(queue,'All recommendations',980,19);
const headers=at(box(queue,'Decision columns',w-2,32,C.canvas),1,77);for(const [v,xx]of [['RECOMMENDATION',19],['EST. SAVINGS / MO',512],['OWNER / RISK',685],['NEXT STEP',893]])label(headers,v,xx,9,10,'Medium',C.muted);
function decision(y,title,sub,amount,owner,risk,buttonLabel){const row=at(box(queue,title,w-2,65,C.surface),1,y);aws(row,'ec2',19,19,26);label(row,title,59,10,13,'Medium',C.ink);label(row,sub,59,33,11);label(row,amount,512,22,14,'SemiBold',C.ink);label(row,owner,685,10,12,'Medium',C.ink);label(row,risk,685,33,11);button(row,buttonLabel,893,15,219,false,'ArrowRight');rule(row,19,64,w-40);}
decision(109,'Rightsize 3 production instances','m6i.2xlarge → m6i.xlarge · 14-day utilization review','$640','Daniel Chen','Medium risk · review memory','Review evidence');decision(174,'Schedule dev-worker-03 outside office hours','Development · 1.8% average CPU · confirm batch jobs','$186','Daniel Chen','Low risk · due Oct 28','Review evidence');
label(screen,'Sample scenario · no live AWS connection or automatic infrastructure changes',x,1453,11,'Regular',C.muted);label(screen,'USD · Amortized · Complete days only',1115,1453,10,'Regular',C.muted);
const notes=at(box(section,'Review notes / information and evidence contract',560,null,C.surface,'VERTICAL',20,28),1536,80);stroke(notes);
text(notes,'HOMEPAGE / REVIEW 01',11,'Medium',C.orange);text(notes,'A clearer path from cost to decision.',28,'SemiBold',C.ink,504);text(notes,'Primary view: Daniel, client engineer. Same approved orange / neutral foundation; revised information hierarchy.',14,'Regular',C.secondary,504);
function note(title,body){text(notes,title,16,'SemiBold',C.ink,504);text(notes,body,13,'Regular',C.secondary,504);}
note('01 / One financial scope','MTD: Oct 1–24. Comparison: Sep 1–24. All four Brightloop accounts: production, staging, development and shared. USD, amortized cost, tax excluded. October 25 is excluded as incomplete.');
note('02 / Every number reconciles','Services: $13,337 + $6,858 + $3,935 + $2,592 + $1,897 + $2,885 = $31,504. Prior period $29,636. Net increase $1,868 (+6.3%). EC2 +$1,095 and VPC +$873; all other services net −$100.');
note('03 / Explanations have a boundary','Observed: billed instance-hours and transfer volume increased. The deployment or traffic-path cause is unconfirmed. Investigation opens those billing dimensions; a network flow diagram belongs in the drill-down once flow-log evidence exists.');
note('04 / Savings are separate lifecycles','Identified $1,066/mo = $640 rightsizing + $186 scheduling + $240 EBS review. The first two await client decisions; the EBS review awaits consultant evidence. None is realized yet.');
note('05 / A defined measurement window','Verified $565/mo = $325 scheduling + $240 volume removal. Baseline Sep 27–Oct 10; observation Oct 11–24. Equal 14-day windows, normalized to 30 days. Simulated scenario assumes comparable workload and unchanged rates. This is a run rate, not October cash savings.');
note('06 / Forecast and budget','Oct 25–31 estimate: $10,591, added to $31,504 actual = $42,095. A $48,000 budget leaves $5,905 headroom. Dashed segments indicate forecasts; the budget pace is a reference, not another actual series.');
note('07 / Purposeful routes','Spend / service → scoped Cost Explorer. Driver → comparable-period investigation. Recommendation → evidence, constraints, then decision. Outcome → measurement evidence. Export → client review with the same scope.');
note('08 / What changed visually','Compact client context; four summary metrics in inset bodies; real AWS service vectors; explicit dollar deltas; accountable decisions; no generic AI summary or decorative percentage scores.');
const source=text(notes,'AWS icons: official architecture package, 31 Jul 2026.\nTabler Outline: interface icons.\nAll costs and records: internally consistent simulation, not customer data.',11,'Regular',C.muted,504);source.setRangeHyperlink(0,10,{type:'URL',value:'https://aws.amazon.com/architecture/icons/'});
screen.setPluginData('review-contract','design/homepage-review/scenario.json');
figma.viewport.scrollAndZoomIntoView([screen]);figma.currentPage.selection=[screen];
return {section:section.id,screen:screen.id,notes:notes.id,screenSize:[screen.width,screen.height],serviceTotal:serviceData.reduce((s,r)=>s+r[2],0),delta:serviceData.reduce((s,r)=>s+r[3],0)};
