import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');let count=0;
function checkRef(ref,base){if(/^(?:https?:|data:|#|\/\/)/.test(ref))return;const path=resolve(base,ref.split(/[?#]/)[0]);if(!existsSync(path))throw new Error(`Missing file: ${path}`);count++;}
const html=readFileSync(resolve(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g))checkRef(m[1],root);
if(/<style[\s>]/i.test(html))throw new Error('Inline style block found');
for(const file of readdirSync(resolve(root,'assets/css'))){const path=resolve(root,'assets/css',file);for(const m of readFileSync(path,'utf8').matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g))checkRef(m[1],dirname(path));}
for(const file of readdirSync(resolve(root,'assets/js')))if(file.endsWith('.js'))execFileSync(process.execPath,['--check',resolve(root,'assets/js',file)]);
const manifest=JSON.parse(readFileSync(resolve(root,'manifest.webmanifest'),'utf8'));for(const icon of manifest.icons)checkRef(icon.src,root);
console.log(`PASS: JavaScript syntax, manifest and ${count} local resource references.`);
