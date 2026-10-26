const old=await figma.getNodeByIdAsync('12:3442');
if(page.children.some(n=>n.name==='CloudLens / Homepage / Calm alternative'))throw new Error('Calm alternative already exists; inspect before updating.');
const section=figma.createSection();page.appendChild(section);section.name='CloudLens / Homepage / Calm alternative';section.x=2360;section.y=5000;section.resizeWithoutConstraints(2072,1216);
const screen=at(box(section,'02 / Cost overview / Calm alternative',1440,1080,C.canvas),32,80);screen.clipsContent=true;
const sidebar=old.children.find(n=>n.name==='Sidebar / 240 px').clone();screen.appendChild(sidebar);sidebar.x=0;sidebar.y=0;sidebar.resize(240,1080);sidebar.children.find(n=>n.type==='RECTANGLE'&&n.x===239).resize(1,1080);
for(const n of sidebar.children.filter(n=>n.y>=1370))n.y-=432;
const top=old.children.find(n=>n.name==='Workspace header').clone();screen.appendChild(top);top.x=240;top.y=0;
const x=288,w=1104;
const body=at(box(screen,'Content / 48 px gutters / Auto layout',w,null,null,'VERTICAL',32),x,96);
const head=box(body,'Title, date and account scope',w,56);label(head,'Cost overview',0,0,28,'SemiBold',C.ink);label(head,'Demo data · Costs through Oct 24, 2026 (UTC)',0,41,12);
button(head,'All 4 accounts',640,3,136,false,'Filter');button(head,'October 2026',788,3,160,false,'Calendar');button(head,'Export review',960,3,144,true,'Download');
const summary=stroke(box(body,'Financial snapshot / Four concise metrics',w,128,C.subtle));
const inset=stroke(at(box(summary,'Inset summary body',w,120,C.surface,'HORIZONTAL',0),0,8),C.border,9);
const summaryData=[['Month to date','$31,504','+$1,868 (+6.3%) vs Sep 1–24',C.secondary],['Month-end forecast','$42,095','$5,905 below $48,000 budget',C.green],['Identified savings','$1,066','Monthly estimate · 3 opportunities',C.secondary],['Verified savings','$565','Monthly run rate · 2 changes',C.green]];
for(let i=0;i<summaryData.length;i++){const [title,value,hint,col]=summaryData[i];const cell=box(inset,title,276,120);if(i)rect(cell,0,18,1,84,C.border);label(cell,title,24,17,12);label(cell,value,24,39,30,'SemiBold',C.ink);label(cell,hint,24,88,11,'Regular',col);}
const chart=stroke(box(body,'Spending / One chart with two change contributors',w,416,C.surface));
label(chart,'Spend against plan',24,19,16,'SemiBold',C.ink);label(chart,'Cumulative USD · October 2026',24,46,12);link(chart,'Explore costs →',982,22);
const plot=at(box(chart,'Cumulative spend plot',1056,214),24,84);
const px=44,py=14,pw=970,ph=150;const amounts=[1160,2325,3430,4580,5800,7020,8220,9510,10800,12030,13250,14420,15680,16920,18190,19480,20720,22220,23780,25360,26910,28500,30080,31504];
function pt(day,value){return [px+(day-1)/30*pw,py+ph-value/48000*ph];}
const pts=amounts.map((v,i)=>pt(i+1,v));const d=pts.map(([a,b],i)=>(i?'L':'M')+' '+a+' '+b).join(' ');const end=pt(31,42095);
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1056" height="214" viewBox="0 0 1056 214">`;
for(let i=0;i<=4;i++){const yy=py+ph-i*ph/4;svg+=`<path d="M${px} ${yy}H${px+pw}" fill="none" stroke="#E6E6E2" stroke-dasharray="2 5"/>`;label(plot,i===0?'$0':`$${i*12}k`,0,yy-8,10,'Regular',C.muted);}
svg+=`<path d="${d} L${pts.at(-1)[0]} ${py+ph} L${px} ${py+ph} Z" fill="#D0440C" fill-opacity=".045"/><path d="M${pt(1,48000/31).join(' ')} L${pt(31,48000).join(' ')}" fill="none" stroke="#8C8C84" stroke-width="1.5" stroke-dasharray="3 4"/><path d="${d}" fill="none" stroke="#D0440C" stroke-width="2"/><path d="M${pts.at(-1).join(' ')} L${end.join(' ')}" fill="none" stroke="#D0440C" stroke-width="2" stroke-dasharray="4 4"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="3" fill="#D0440C"/></svg>`;
const graph=figma.createNodeFromSvg(svg);plot.insertChild(0,graph);graph.name='Actual / estimate / budget pace';graph.x=0;graph.y=0;
for(const node of graph.findAll(n=>'strokes'in n||'fills'in n)){for(const prop of ['fills','strokes'])if(prop in node&&Array.isArray(node[prop]))node[prop]=node[prop].map(p=>{if(p.type!=='SOLID')return p;const h=Object.entries(COLORS).find(([k,h])=>{const c=rgb(h);return Math.abs(c.r-p.color.r)<.002&&Math.abs(c.g-p.color.g)<.002&&Math.abs(c.b-p.color.b)<.002;});if(!h||!vars[h[0]])return p;const out=figma.variables.setBoundVariableForPaint(p,'color',vars[h[0]]);return {...out,opacity:p.opacity};});}
for(const day of [1,8,16,24,31])label(plot,'Oct '+day,pt(day,0)[0]-12,181,11,'Regular',C.muted);
label(plot,'$48,000 budget',900,0,10,'Regular',C.muted);label(plot,'$42,095',949,40,11,'Medium',C.orange);
rect(chart,28,294,14,2,C.orange);label(chart,'Actual',50,285,11);path(chart,'Estimate legend','M 119 295 L 133 295',C.orange,1.5,[3,3]);label(chart,'Forecast',141,285,11);path(chart,'Budget legend','M 229 295 L 243 295','chart-baseline',1.5,[3,3]);label(chart,'Budget pace',251,285,11);label(chart,'Oct 25–31 is estimated',949,285,10,'Regular',C.muted);
rule(chart,0,326,w);
const drivers=at(box(chart,'Top changes / Details stay in investigation',w,89,C.canvas,'HORIZONTAL',0),0,327);drivers.bottomLeftRadius=drivers.bottomRightRadius=9;
const driversData=[['ec2','EC2 usage increased','+$1,095','+3,000 instance-hours'],['vpc','NAT processing increased','+$873','+19,400 GB processed']];
for(let i=0;i<2;i++){const [k,title,delta,detail]=driversData[i];const col=box(drivers,title,552,89);if(i)rect(col,0,18,1,53,C.border);aws(col,k,24,29,26);label(col,title,64,20,13,'Medium',C.ink);label(col,detail+' · investigate cause',64,44,11);label(col,delta,438,21,14,'SemiBold',C.ink);icon(col,'ChevronRight',510,35,14);}
const decisions=stroke(box(body,'Next decisions / A short list',w,190,C.surface));
label(decisions,'Ready for your review',24,18,16,'SemiBold',C.ink);link(decisions,'View all recommendations →',907,22);
const decisionData=[['Rightsize 3 production instances','Daniel Chen · Medium risk · Memory evidence needs review','$640 /mo'],['Schedule dev-worker-03 outside office hours','Daniel Chen · Low risk · Confirm out-of-hours batch jobs','$186 /mo']];
for(let i=0;i<2;i++){const [title,detail,amount]=decisionData[i],yy=57+i*65;rule(decisions,24,yy,w-48);label(decisions,title,24,yy+12,14,'Medium',C.ink);label(decisions,detail,24,yy+35,12);label(decisions,amount,826,yy+21,14,'SemiBold',C.ink);button(decisions,'Review',956,yy+14,124,false,'ArrowRight');}
const foot=box(body,'Cost basis and trust details',w,18,null,'HORIZONTAL');foot.primaryAxisAlignItems='SPACE_BETWEEN';text(foot,'USD · Amortized cost · Tax excluded',11,'Regular',C.muted);text(foot,'Savings definitions & measurement →',11,'Medium',C.secondary);
const notes=at(box(section,'Why this version is calmer',464,null,C.surface,'VERTICAL',20,28),1512,80);stroke(notes);text(notes,'HOMEPAGE / CALM ALTERNATIVE',11,'Medium',C.orange);text(notes,'A starting point, not the whole report.',27,'SemiBold',C.ink,408);
for(const [title,copy]of [['Less competing content','One summary band, one chart and one short decision list. No service inventory, separate cost-driver card, outcome ledger or extra metric icons.'],['Keep the useful signal','The same four financial measures remain. Two AWS-icon rows summarize the largest cost changes without displaying the full technical explanation.'],['Reveal detail when needed','Explore costs opens the scoped service breakdown. A change row opens the usage investigation. Review opens evidence and constraints before any approval. Savings definitions opens the measurement method.'],['Space and hierarchy','48 px content gutters, 32 px section gaps and fewer borders. The plot has room to breathe. Two ready decisions are enough for the starting view.'],['Same evidence contract','All values use the same reconciled Brightloop simulation. Oct 1–24 actual is $31,504; prior comparable period is $29,636. The two increases total $1,968; other services offset $100. Causes are not confirmed by billing alone.'],['Distinct savings lifecycles','Identified $1,066/mo is an estimate, not realized. Verified $565/mo is a measured run rate from two changes, observed Oct 11–24 against Sep 27–Oct 10. Neither is cash saved in the selected month.']]){text(notes,title,15,'SemiBold',C.ink,408);text(notes,copy,13,'Regular',C.secondary,408);}
text(notes,'The detailed first version is preserved to the left for comparison. Figma proposal only; application code unchanged.',11,'Regular',C.muted,408);
figma.viewport.scrollAndZoomIntoView([screen]);figma.currentPage.selection=[screen];
return {section:section.id,screen:screen.id,notes:notes.id,bodyHeight:body.height,screenHeight:screen.height};
