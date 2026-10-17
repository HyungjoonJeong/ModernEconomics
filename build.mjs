import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
let html=read('index.template.html').replace('/*__CSS__*/',()=>read('style.css')).replace('/*__DATA__*/',()=>read('data.js').replace(/<\/script/gi,'<\\/script')).replace('/*__APP__*/',()=>read('app.js'));
fs.writeFileSync(path.join(dir,'index.html'),html);
// Dependency-free PNG app icons. A geometric Q remains readable at small sizes.
function crc32(buffer){let c=0xffffffff;for(const b of buffer){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));return Buffer.concat([len,name,data,crc]);}
for(const size of [192,512]){const raw=Buffer.alloc(size*(size*3+1));for(let y=0;y<size;y++){for(let x=0;x<size;x++){const dx=x/size-.5,dy=y/size-.48,r=Math.hypot(dx,dy),tail=dx>.08&&dx<.25&&dy>.1&&dy<.29&&Math.abs(dy-dx-.03)<.035;const color=(r>.145&&r<.225)||tail?[216,237,187]:[24,61,53];for(let k=0;k<3;k++)raw[y*(size*3+1)+1+x*3+k]=color[k];}}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=2;fs.writeFileSync(path.join(dir,`icon-${size}.png`),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));}
console.log('Built standalone index.html and PNG icons.');
