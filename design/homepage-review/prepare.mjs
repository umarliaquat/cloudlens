import fs from 'node:fs';
import path from 'node:path';
const root='design/homepage-review';
const services={ec2:'Amazon-EC2',rds:'Amazon-RDS',s3:'Amazon-Simple-Storage-Service',vpc:'Amazon-Virtual-Private-Cloud',cloudfront:'Amazon-CloudFront'};
const aws=Object.fromEntries(Object.entries(services).map(([k,v])=>[k,fs.readFileSync(`${root}/assets/Arch_${v}_48.svg`,'utf8')]));
const tabler={};
for(const name of ['Cloud','Search','ChevronDown','ChevronRight','ArrowRight','ArrowUpRight','Calendar','Download','Bell','Help','Settings','CircleCheck','InfoCircle','ArrowDownRight','Filter','ExternalLink','Dots','Clock','ShieldCheck','Wallet','Bulb','ChartLine','LayoutDashboard']){
 const source=fs.readFileSync(`node_modules/@tabler/icons-react/dist/esm/icons/Icon${name}.mjs`,'utf8');
 const nodes=JSON.parse(source.match(/const __iconNode = (.*);/)[1]);
 tabler[name]=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${nodes.map(([tag,attrs])=>`<${tag} ${Object.entries(attrs).filter(([k])=>k!=='key').map(([k,v])=>`${k}="${v}"`).join(' ')}/>`).join('')}</svg>`;
}
const tokens=JSON.parse(fs.readFileSync('design/theme-study.tokens.json','utf8')).colors;
const prefix=`const AWS=${JSON.stringify(aws)}; const ICONS=${JSON.stringify(tabler)}; const COLORS=${JSON.stringify(tokens)};\n`;
fs.writeFileSync(`${root}/build.figma.js`,prefix+fs.readFileSync(`${root}/layout.figma.js`,'utf8'));
console.log('Prepared official AWS service SVGs, Tabler outline SVGs and locked palette.');
