// Lossless PNG slicing only. Artwork is generated; this script never draws art.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets','sprites');fs.mkdirSync(out,{recursive:true});
function decode(file){
 const raw=fs.readFileSync(file);let width,height,depth,type,chunks=[];
 for(let offset=8;offset<raw.length;){const length=raw.readUInt32BE(offset),name=raw.toString('ascii',offset+4,offset+8),data=raw.subarray(offset+8,offset+8+length);if(name==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);depth=data[8];type=data[9]}if(name==='IDAT')chunks.push(data);offset+=length+12}
 if(depth!==8||![2,6].includes(type))throw Error('Unsupported PNG '+file);
 const channels=type===6?4:3,stride=width*channels,packed=zlib.inflateSync(Buffer.concat(chunks)),scan=Buffer.alloc(height*stride),pixels=Buffer.alloc(width*height*4);
 for(let y=0;y<height;y++){const filter=packed[y*(stride+1)];for(let x=0;x<stride;x++){const left=x>=channels?scan[y*stride+x-channels]:0,up=y?scan[(y-1)*stride+x]:0,ul=y&&x>=channels?scan[(y-1)*stride+x-channels]:0;let predict=0;if(filter===1)predict=left;if(filter===2)predict=up;if(filter===3)predict=Math.floor((left+up)/2);if(filter===4){const p=left+up-ul,a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-ul);predict=a<=b&&a<=c?left:b<=c?up:ul}scan[y*stride+x]=(packed[y*(stride+1)+x+1]+predict)&255}}
 for(let i=0;i<width*height;i++){scan.copy(pixels,i*4,i*channels,i*channels+3);pixels[i*4+3]=channels===4?scan[i*4+3]:255}return {width,height,pixels};
}
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function chunk(name,data){const type=Buffer.from(name),crcBytes=Buffer.concat([type,data]);let crc=0xffffffff;for(const value of crcBytes)crc=table[(crc^value)&255]^(crc>>>8);const header=Buffer.alloc(4),footer=Buffer.alloc(4);header.writeUInt32BE(data.length);footer.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([header,type,data,footer])}
function encode(width,height,pixels){const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;const data=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++)pixels.copy(data,y*(width*4+1)+1,y*width*4,(y+1)*width*4);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(data)),chunk('IEND',Buffer.alloc(0))])}
function bounds(image,box){const {width,pixels}=image;let l=box[2],r=box[0],t=box[3],b=box[1];for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){if(pixels[(y*width+x)*4+3]>100){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}}return [Math.max(box[0],l-2),Math.max(box[1],t-2),Math.min(box[2],r+3),Math.min(box[3],b+3)]}
function crop(image,box,name){const [l,t,r,b]=bounds(image,box),width=r-l,height=b-t,pixels=Buffer.alloc(width*height*4);if(width<1||height<1)throw Error('Empty '+name);for(let y=0;y<height;y++)image.pixels.copy(pixels,y*width*4,((y+t)*image.width+l)*4,((y+t)*image.width+r)*4);fs.writeFileSync(path.join(out,name+'.png'),encode(width,height,pixels));return{src:'assets/sprites/'+name+'.png',width,height}}
function splits(image,count,axis){const size=axis==='x'?image.width:image.height,cross=axis==='x'?image.height:image.width,projection=Array(size).fill(0);for(let i=0;i<size;i++)for(let j=0;j<cross;j++){const x=axis==='x'?i:j,y=axis==='x'?j:i;if(image.pixels[(y*image.width+x)*4+3]>100)projection[i]++}const cuts=[0];for(let n=1;n<count;n++){const middle=size*n/count,lo=Math.floor(middle-size/count*.3),hi=Math.ceil(middle+size/count*.3);let best=null,run=null;for(let i=lo;i<=hi;i++){if(projection[i]<3){if(run===null)run=i}else if(run!==null){const candidate={at:(run+i)/2,length:i-run};if(!best||candidate.length>best.length)best=candidate;run=null}}if(run!==null){const c={at:(run+hi)/2,length:hi-run};if(!best||c.length>best.length)best=c}cuts.push(Math.round(best?best.at:middle))}cuts.push(size);return cuts}
const manifest={};
function sheet(file,cols,rows,names,customY,customX){const source=path.join(root,'assets',file+'.png');if(!fs.existsSync(source))return;const img=decode(source),defaultX=splits(img,cols,'x'),ys=customY||splits(img,rows,'y');console.log(file,img.width,img.height,'cuts',defaultX,ys);names.forEach((name,i)=>{const xs=customX?customX[Math.floor(i/cols)]:defaultX;manifest[name]=crop(img,[xs[i%cols],ys[Math.floor(i/cols)],xs[i%cols+1],ys[Math.floor(i/cols)+1]],name)})}
sheet('character-v3',3,4,['head-front','head-back','head-side','torso-front','torso-back','torso-side','arm-left','arm-right','mug','leg-left','leg-right','axe'],[0,425,713,1063,1448]);
sheet('trees-v4',3,2,['tree-round','tree-pine','tree-bare','tree-bent','tree-double','tree-young'],[0,785,1536],[[0,430,725,1024],[0,370,750,1024]]);
sheet('camp-v4',3,2,['tent','workbench','chest','fire','ruin','sign'],[0,524,1024],[[0,655,1137,1536],[0,540,1150,1536]]);
sheet('plants-v4',4,3,['grass','grass-tall','daisies','mushrooms','thorn','berries','fern','reeds','sprout','clover','flowers','leaves']);
sheet('ground-v4',4,2,['rock','pebbles','ore','stump','log','logs','twigs','hollow-log']);
sheet('side-body-v4',3,1,['torso-profile','arm-profile','leg-profile']);
sheet('woodland-v5',3,2,['branch','nest','bluebells','snag','seed-grass','burrow'],[0,467,1024],[[0,660,1010,1536],[0,555,995,1536]]);
sheet('camp-details-v5',3,2,['coffee-tripod','coffee-cup','log-stool','fence','banner','trough'],[0,520,1024],[[0,600,1030,1536],[0,600,1030,1536]]);
sheet('wildlife-v5',3,2,['rabbit','bird','bird-wing','snail','hedgehog','butterfly'],[0,580,1024],[[0,535,1040,1536],[0,535,1040,1536]]);
sheet('character-v6',3,4,['head-front','head-back','head-side','torso-front','torso-back','torso-side','arm-front','arm-back','arm-profile','leg-front','leg-back','leg-profile'],[0,490,775,1090,1448],Array(4).fill([0,365,750,1086]));
const riverFile=fs.existsSync(path.join(root,'assets','river-v5.png'))?'river-v5.png':'stream-v4.png';
if(fs.existsSync(path.join(root,'assets',riverFile))){const img=decode(path.join(root,'assets',riverFile));manifest.stream={src:'assets/'+riverFile,width:img.width,height:img.height};}
if(fs.existsSync(path.join(root,'assets','favicon-n.png'))){
 const original=decode(path.join(root,'assets','favicon-n.png')),box=bounds(original,[0,0,original.width,original.height]),width=box[2]-box[0],height=box[3]-box[1],side=Math.ceil(Math.max(width,height)*1.65),pixels=Buffer.alloc(side*side*4),dx=Math.floor((side-width)/2),dy=Math.floor((side-height)/2);
 for(let y=0;y<height;y++)original.pixels.copy(pixels,((y+dy)*side+dx)*4,((y+box[1])*original.width+box[0])*4,((y+box[1])*original.width+box[2])*4);
 fs.writeFileSync(path.join(root,'favicon.png'),encode(side,side,pixels));
}
fs.writeFileSync(path.join(root,'assets','sprites.json'),JSON.stringify(manifest,null,2)+'\n');
let water=null;
if(fs.existsSync(path.join(root,'assets',riverFile))){
 const source=decode(path.join(root,'assets',riverFile)),step=6,cols=Math.ceil(source.width/step),rows=Math.ceil(source.height/step),mask=Buffer.alloc(cols*rows);
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){let opaque=0;for(let y=gy*step;y<Math.min(source.height,(gy+1)*step);y++)for(let x=gx*step;x<Math.min(source.width,(gx+1)*step);x++)if(source.pixels[(y*source.width+x)*4+3]>170)opaque++;mask[gy*cols+gx]=opaque>=8?1:0;}
 water={cols,rows,mask:mask.toString('base64'),bridge:[[.434,.442],[.490,.387],[.567,.513],[.508,.580]],tile:{left:1450,top:1320,width:source.width,height:source.height}};
}
fs.writeFileSync(path.join(root,'assets','sprites.js'),'window.FIELD_SPRITES = '+JSON.stringify(manifest,null,2)+';\nwindow.FIELD_WATER = '+JSON.stringify(water)+';\n');
console.log('Sliced',Object.keys(manifest).length,'sprites');
