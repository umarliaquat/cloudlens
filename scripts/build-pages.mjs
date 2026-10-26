import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = path.join(root, ".pages-build");
const repository = (
  process.env.GITHUB_REPOSITORY || "umarliaquat/cloudlens"
).split("/")[1];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || `/${repository}`;
if (!/^\/[A-Za-z0-9._-]+$/.test(basePath))
  throw Error("Expected a single repository base path");
// Delete only this build's dedicated staging directory, never a user-supplied path.
if (path.dirname(stage) !== root || path.basename(stage) !== ".pages-build")
  throw Error("Unsafe staging path");
await fs.rm(stage, { recursive: true, force: true });
await fs.mkdir(stage, { recursive: true });
for (const name of ["src", "public"])
  await fs.cp(path.join(root, name), path.join(stage, name), {
    recursive: true,
  });
await fs.mkdir(path.join(stage, "design"), { recursive: true });
await fs.copyFile(
  path.join(root, "design/theme-study.tokens.json"),
  path.join(stage, "design/theme-study.tokens.json"),
);
for (const name of [
  "tsconfig.json",
  "package.json",
  "package-lock.json",
  "next-env.d.ts",
])
  await fs.copyFile(path.join(root, name), path.join(stage, name));
await fs.symlink(
  path.join(root, "node_modules"),
  path.join(stage, "node_modules"),
  process.platform === "win32" ? "junction" : "dir",
);
await fs.writeFile(
  path.join(stage, "next.config.mjs"),
  `export default {output:'export',trailingSlash:true,basePath:${JSON.stringify(basePath)},poweredByHeader:false,devIndicators:false,images:{unoptimized:true},turbopack:{root:${JSON.stringify(root)}}};\n`,
);
// The source application retains its server API. Pages gets an isolated browser-only demo build.
const api = path.join(stage, "src/app/api");
if (!api.startsWith(stage + path.sep)) throw Error("Unsafe staged API path");
await fs.rm(api, { recursive: true, force: true });
await fs.writeFile(
  path.join(stage, "src/app/page.tsx"),
  `import {Suspense} from 'react';
import {StaticDemo} from '@/components/static-demo';
export default function Page(){return <Suspense fallback={<main className="main-content"><h1>CloudLens</h1><p>Loading simulated cost workspace…</p></main>}><StaticDemo/></Suspense>;}
`,
);
await fs.writeFile(
  path.join(stage, "src/app/[section]/page.tsx"),
  `import Page from '../page';
import {workspacePages} from '@/lib/workspace';
export const dynamicParams=false;
export function generateStaticParams(){return Object.values(workspacePages).filter(p=>p.path!=='/').map(p=>({section:p.path.slice(1)}));}
export default Page;
`,
);
await fs.writeFile(
  path.join(stage, "src/components/static-demo.tsx"),
  `'use client';
import {useMemo} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {CloudLensApp} from './cloudlens-app';
import {clients,provider} from '@/server/providers/mock';
const portfolio=clients.map(c=>provider.getOverview(c.id,'month'));
export function StaticDemo(){
 const query=useSearchParams(),pathname=usePathname();
 const client=clients.some(c=>c.id===query.get('client'))?query.get('client')!:'brightloop';
 const period=query.get('period')==='7d'?'7d':query.get('period')==='30d'?'30d':'month';
 const role=query.get('role')==='consultant'?'consultant':query.get('role')==='executive'?'executive':!query.get('role')&&/\\/(portfolio|users)\\/?$/.test(pathname)?'consultant':'engineer';
 const overview=useMemo(()=>provider.getOverview(client,period),[client,period]);
 return <CloudLensApp initialOverview={overview} clients={clients} initialVariant="a" initialRole={role} portfolioOverviews={portfolio}/>;
}
`,
);
const appFile = path.join(stage, "src/components/cloudlens-app.tsx");
let app = await fs.readFile(appFile, "utf8");
const first = app.indexOf("    const controller = new AbortController();");
const end = app.indexOf("    return () => controller.abort();", first);
if (first < 0 || end < 0)
  throw Error("Demo provider effect changed; update the Pages adapter");
app =
  app.slice(0, first) +
  `    setFetchError('');\n    setOverview(provider.getOverview(clientId,period));\n    setLoading(false);\n` +
  app.slice(end + "    return () => controller.abort();".length);
app = app.replace(
  '"use client";',
  '"use client";\nimport {provider} from "@/server/providers/mock";',
);
await fs.writeFile(appFile, app);
const result = spawnSync(
  process.execPath,
  [path.join(root, "node_modules/next/dist/bin/next"), "build"],
  {
    cwd: stage,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
  },
);
if (result.status !== 0) process.exit(result.status || 1);
await fs.writeFile(path.join(stage, "out/.nojekyll"), "");
console.log(
  `GitHub Pages artifact ready: ${path.join(stage, "out")} (base path ${basePath})`,
);
