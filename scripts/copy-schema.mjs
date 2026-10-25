/** Generate public contracts and required notices from their single source owners. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const publicDir=path.join(root,'public');fs.mkdirSync(publicDir,{recursive:true});
fs.copyFileSync(path.join(root,'docs/dev/spec/LEADERBOARD-SCHEMA.json'),path.join(publicDir,'leaderboard.schema.json'));
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const notices=['Third-party software distributed with Browser Tetris.\n'];
for(const [relative,entry] of Object.entries(lock.packages).sort(([a],[b])=>a<b?-1:1)){
 if(!relative||entry.dev)continue;
 const dir=path.join(root,relative),pkg=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));
 const license=fs.readdirSync(dir).find(name=>/^licen[sc]e(?:\..*)?$/i.test(name));
 if(!license)throw new Error('Missing license text for '+pkg.name);
 notices.push(`${pkg.name} ${pkg.version} (${pkg.license})\n\n${fs.readFileSync(path.join(dir,license),'utf8')}\n`);
}
fs.writeFileSync(path.join(publicDir,'THIRD-PARTY-NOTICES.txt'),notices.join('\n---\n\n'));
