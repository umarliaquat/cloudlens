await figma.loadAllPagesAsync();
const page=figma.root.children.find(p=>p.name.toLowerCase()==='research');
if(!page)throw new Error('Research page is missing');
await figma.setCurrentPageAsync(page);
for(const style of ['Regular','Medium','SemiBold'])await figma.loadFontAsync({family:'Geist',style});
const variables=Object.fromEntries((await figma.variables.getLocalVariablesAsync('COLOR')).map(v=>[v.name,v]));
const palette={'color-bg-canvas':'FAFAF9','color-bg-surface':'FFFFFF','color-bg-subtle':'F4F4F2','color-border-default':'E6E6E2','color-text-primary':'20201E','color-text-secondary':'62625C','color-text-muted':'72726B','color-accent-default':'D0440C','color-accent-subtle':'FFF0E8','color-status-info-bg':'EEF4FC','color-status-info-fg':'315F9D'};
function paint(key){const h=palette[key];const p={type:'SOLID',color:{r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}};return variables[key]?figma.variables.setBoundVariableForPaint(p,'color',variables[key]):p;}
function frame(parent,name,width,dir='VERTICAL',gap=20,padding=0,bg=null){const f=figma.createFrame();parent.appendChild(f);f.name=name;f.resize(width,10);f.layoutMode=dir;f.itemSpacing=gap;f.paddingTop=f.paddingBottom=f.paddingLeft=f.paddingRight=padding;f.fills=bg?[paint(bg)]:[];f.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';f.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';f.clipsContent=false;return f;}
function text(p,value,size=20,weight='Regular',color='color-text-primary',width=null,url=null){const t=figma.createText();p.appendChild(t);t.name=value.slice(0,80);t.fontName={family:'Geist',style:weight};t.fontSize=size;t.lineHeight={unit:'PERCENT',value:145};t.fills=[paint(color)];t.resize(width||p.width-p.paddingLeft-p.paddingRight,1);t.textAutoResize='HEIGHT';t.characters=value;if(url)t.hyperlink={type:'URL',value:url};return t;}
function border(f){f.cornerRadius=12;f.strokes=[paint('color-border-default')];f.strokeWeight=1;f.strokesIncludedInLayout=false;}
const prior=page.children.find(n=>n.name==='CloudLens / Competitor workflow atlas / 26 Oct 2026');
if(prior)throw new Error('Workflow atlas already exists; inspect rather than duplicate');
const section=figma.createSection();page.appendChild(section);section.name='CloudLens / Competitor workflow atlas / 26 Oct 2026';section.x=1700;section.y=0;
const boards=[];const imageNodes=[];
for(let i=0;i<flows.length;i++){
 const flow=flows[i];const board=frame(section,`${String(i+1).padStart(2,'0')} / ${flow.title}`,2160,'VERTICAL',28,48,'color-bg-canvas');board.x=(i%2)*2256;board.y=1500+Math.floor(i/2)*2900;
 text(board,`WORKFLOW ${String(i+1).padStart(2,'0')}  /  ${flow.role.toUpperCase()}`,16,'Medium','color-accent-default');
 text(board,flow.title,36,'SemiBold');text(board,flow.goal,23,'Regular','color-text-secondary');
 const scope=frame(board,'Evidence scope and version note',2064,'VERTICAL',0,18,'color-status-info-bg');scope.cornerRadius=8;text(scope,flow.scope,18,'Medium','color-status-info-fg');
 const route=frame(board,'Task path / Branches',2064,'VERTICAL',8,20,'color-accent-subtle');route.cornerRadius=8;text(route,'TASK PATH',14,'Medium','color-accent-default');text(route,flow.route,22,'Medium');
 for(let offset=0;offset<flow.steps.length;offset+=3){const row=frame(board,`Steps ${offset+1}–${Math.min(offset+3,flow.steps.length)}`,2064,'HORIZONTAL',24);for(const step of flow.steps.slice(offset,offset+3)){
  const asset=assets.find(a=>a.id===step.asset);if(!asset||asset.error)throw new Error('Missing source '+step.asset);
  const card=frame(row,step.title,672,'VERTICAL',16,24,'color-bg-surface');border(card);
  text(card,step.title,24,'SemiBold');
  const imageWell=frame(card,'Source screenshot / Uncropped',624,'HORIZONTAL',0,0,'color-bg-subtle');imageWell.primaryAxisSizingMode='FIXED';imageWell.counterAxisSizingMode='FIXED';imageWell.resize(624,400);imageWell.cornerRadius=6;imageWell.primaryAxisAlignItems='CENTER';imageWell.counterAxisAlignItems='CENTER';
  const image=figma.createRectangle();imageWell.appendChild(image);image.name=asset.id;const scale=Math.min(624/asset.size[0],400/asset.size[1]);image.resize(asset.size[0]*scale,asset.size[1]*scale);image.fills=[paint('color-bg-surface')];imageNodes.push({asset:asset.id,nodeId:image.id,importPath:asset.importPath});
  text(card,flow.id==='flexera'?'VENDOR DIAGRAM • NOT A UI SCREENSHOT':'VENDOR-PUBLISHED SCREEN • NOT A LIVE SESSION',12,'Medium','color-text-muted');
  text(card,step.description,20,'Regular','color-text-secondary');text(card,step.next,18,'Medium');
  text(card,'View source ↗',16,'Medium','color-accent-default',null,asset.source);text(card,'Open original image ↗',15,'Regular','color-text-muted',null,asset.url);
 }}
 const takeaway=frame(board,'Findings / Application to CloudLens',2064,'HORIZONTAL',24);
 for(const [label,value] of [['ADOPT',flow.adopt],['AVOID',flow.avoid],['EVIDENCE GAP',flow.gap]]){const card=frame(takeaway,label,672,'VERTICAL',10,24,'color-bg-surface');border(card);text(card,label,14,'Medium','color-accent-default');text(card,value,20,'Regular','color-text-secondary');}
 text(board,'Reading guide: numbered screens map a documented task. They do not prove that one account completed every step. Source examples and dates are preserved.',16,'Regular','color-text-muted');
 boards.push({id:flow.id,nodeId:board.id,name:flow.title,count:flow.steps.length});
}
const index=frame(section,'00 / Start here / Workflow atlas index',2160,'VERTICAL',24,48,'color-bg-canvas');index.x=0;index.y=0;
text(index,'CLOUDLENS / COMPETITOR WORKFLOW RESEARCH / 26 OCT 2026',16,'Medium','color-accent-default');text(index,'How the products move users from information to action.',40,'SemiBold');
text(index,'6 illustrated workflow studies • 39 screenshot panels + 1 vendor diagram • 8 competitors represented',24,'Medium');
const note=frame(index,'Evidence standard',2064,'VERTICAL',10,20,'color-status-info-bg');note.cornerRadius=8;text(note,'Public-screen workflow maps, not authenticated hands-on testing.',22,'SemiBold','color-status-info-fg');text(note,'Every screen links to its official source and original image. Branches, historical releases and missing screens are marked. CloudHealth and Flexera are partial evidence sets, not complete captured flows.',20,'Regular','color-status-info-fg');
for(const item of boards){const flow=flows.find(f=>f.id===item.id);const row=frame(index,flow.id,2064,'HORIZONTAL',24,16,'color-bg-surface');border(row);const name=text(row,flow.title,22,'Medium','color-text-primary',1050);name.hyperlink={type:'NODE',value:item.nodeId};text(row,`${item.count} panels  •  ${['cloudhealth','flexera'].includes(item.id)?'PARTIAL COVERAGE':'DOCUMENTED TASK MAP'}`,18,'Medium','color-accent-default',930);}
text(index,'Use the numbered flow frames below. Each ends with a specific pattern to adopt, a trap to avoid and the evidence still missing.',20,'Regular','color-text-secondary');
text(index,'What this research changes: preserve investigation context; support explanations with data; distinguish approval, implementation and measurement; make ownership and history visible.',22,'Medium');
figma.currentPage.selection=[index];figma.viewport.scrollAndZoomIntoView([index]);
return {section:section.id,index:index.id,boards,imageNodes};
