(() => {
  'use strict';
  const $=s=>document.querySelector(s), layout=window.FIELD_LAYOUT, art=window.FIELD_SPRITES;
  const WIDTH=layout.width, HEIGHT=layout.height, SAVE='noah-field-v4';
  const state={...layout.spawn,wood:0,stone:0,food:0};
  try { const saved=JSON.parse(localStorage.getItem(SAVE)||'{}');for(const key of Object.keys(state))if(Number.isFinite(saved[key]))state[key]=saved[key]; } catch {}
  let active=true, destination=null, working=0, pending=null, lookUntil=0, manualUntil=0, previous=0, facing='',direction=1;
  const camera={x:0,y:0,scale:1,zoom:1}, keys=new Set(), resources=[], parts={}, obstacles=[], images=[],placements=[];
  const viewBounds={left:0,top:-55,right:WIDTH,bottom:HEIGHT};
  const removedPlants=new Set(['grass','thorn','berries','fern','reeds','sprout','clover','leaves','seed-grass','daisies','flowers','bluebells','mushrooms','pebbles','twigs','branch','nest','coffee-cup']);
  const clearingClutter=new Set([...layout.ground.map(p=>p[0]),...layout.patches.map(p=>p[0]),'bluebells','seed-grass','branch','nest','burrow','coffee-cup']);
  const water=window.FIELD_WATER,waterMask=Uint8Array.from(atob(water.mask),c=>c.charCodeAt(0));
  const riverTiles=[water.tile];
  const campNames=new Set(layout.camp.map(item=>item[0]));
  const boundary=[[400,550],[950,300],[1630,270],[2380,380],[2800,700],[2900,1330],[2740,1810],[2150,2070],[1320,2100],[690,1850],[320,1200]];
  function inside(x,y,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;}return hit;}
  function inWater(x,y,allowBridge=true){
    for(const tile of riverTiles){const u=(x-tile.left)/tile.width,v=(y-tile.top)/tile.height;if(u<0||u>=1||v<0||v>=1)continue;if(allowBridge&&inside(u,v,water.bridge))continue;if(waterMask[Math.floor(v*water.rows)*water.cols+Math.floor(u*water.cols)])return true;}return false;
  }
  function nearWater(x,y,radius=7,allowBridge=true){return [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius]].some(([dx,dy])=>inWater(x+dx,y+dy,allowBridge));}
  function fitsBank(name,x,y,width){const height=width*art[name].height/art[name].width;for(let py=y-height-8;py<=y+8;py+=12)for(let px=x-width/2-8;px<=x+width/2+8;px+=12)if(inWater(px,py,false))return false;return true;}
  function fullBox(x,y,width,height,pad=5){return{l:x-width/2-pad,r:x+width/2+pad,t:y-height-pad,b:y+pad};}
  function trunkBox(x,y){return{l:x-22,r:x+22,t:y-43,b:y+12};}
  function intersects(a,b){return a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;}
  function fitsPlacement(name,x,y,width,options){
    if(!fitsBank(name,x,y,width))return false;
    const tree=(options.className||'').includes('tree'),box=fullBox(x,y,width,width*art[name].height/art[name].width);
    for(const p of placements){if(p.floor)continue;const bothTrees=tree&&p.tree,other=bothTrees?trunkBox(p.x,p.y):fullBox(p.x,p.y,p.width,p.height),own=bothTrees?trunkBox(x,y):box;if(intersects(own,other))return false;}
    return true;
  }
  function bankPosition(name,x,y,width,options){if(fitsPlacement(name,x,y,width,options))return{x,y};for(let radius=24;radius<=480;radius+=24)for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0],[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]){const nx=x+dx*radius,ny=y+dy*radius;if(nx>70&&nx<WIDTH-70&&ny>220&&ny<HEIGHT-30&&fitsPlacement(name,nx,ny,width,options))return{x:nx,y:ny};}return null;}
  function walkable(x,y){return inside(x,y,boundary)&&!nearWater(x,y)&&!obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+6);}
  const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(state));}catch{}};
  function makeImage(name){const image=new Image();image.src=art[name].src;image.alt='';image.draggable=false;images.push(image);return image;}
  function place(name,x,y,width,options={}){
    if(removedPlants.has(name))return null;
    if(clearingClutter.has(name)&&Math.hypot((x-1630)/650,(y-1170)/550)<1)return null;
    if(!options.floor){const bank=bankPosition(name,x,y,width,options);if(!bank)return null;({x,y}=bank);}
    const image=makeImage(name),height=width*art[name].height/art[name].width;
    image.className='scenery '+(options.className||'');image.style.cssText=`left:${x-width/2}px;top:${y-height}px;width:${width}px;height:${height}px;z-index:${options.floor?0:Math.round(y)};animation-delay:${-(x%13)/3}s`;
    $('#objects').append(image);
    placements.push({name,x,y,width,height,image,floor:!!options.floor,tree:(options.className||'').includes('tree'),camp:campNames.has(name)});
    if(name==='ruin')image.style.scale='-1 1';
    if(options.solid)obstacles.push({x,y:y-8,r:options.solid});
    if(options.resource){
      const node={image,x:x+22,y:y+12,type:options.resource,available:true,amount:options.tree?4:1};
      resources.push(node);image.classList.add('resource');image.alt=options.resource;
      image.addEventListener('pointerdown',event=>event.stopPropagation());
      image.onclick=event=>{event.stopPropagation();if(node.available)setDestination(node.x,node.y,node);};
    }
    return image;
  }
  // Ground is blank white. Every visible world mark below is a cropped generated bitmap.
  for(const tile of riverTiles)place('stream',tile.left+tile.width/2,tile.top+tile.height,tile.width,{floor:true});
  for(const [name,x,y,width] of layout.camp)place(name,x,y,width,{className:name==='fire'?'fire':'',solid:name==='tent'?96:name==='workbench'?25:0});
  for(const group of layout.groves)for(const [name,x,y,size] of group.trees){const height=size*2.1,width=height*art[name].width/art[name].height;place(name,x,y,width,{className:'tree',resource:'wood',tree:true,solid:16});}
  for(const [name,x,y,width] of layout.patches)place(name,x,y,width,{className:'plant',resource:['berries','mushrooms'].includes(name)?'food':null});
  for(const [name,x,y,width] of layout.ground)place(name,x,y,width,{resource:['rock','ore'].includes(name)?'stone':['log','logs','twigs','hollow-log'].includes(name)?'wood':null,solid:name==='ore'?15:0});
  // Understory grows along the wooded edges, leaving the camp clearing open.
  const undergrowth=['grass-tall'];
  let groveIndex=0;
  for(const group of layout.groves)for(const [,x,y,size] of group.trees){const i=groveIndex++;place(undergrowth[0],x+size*.46,y+14,20+i%3*3,{className:'plant'});if(i%2===0)place('grass-tall',x-size*.4,y+25,22,{className:'plant'});}
  for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length],count=Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/78);for(let j=0;j<count;j++){const t=j/count,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;place(j%3===0?'thorn':j%3===1?'flowers':'grass-tall',x,y,34+(j%3)*8,{className:'plant',solid:j%3===0?12:0});}}
  for(const [name,x,y,width] of layout.details)place(name,x,y,width,{className:['bluebells','seed-grass'].includes(name)?'plant':'',solid:['fence','trough','snag'].includes(name)?15:0});
  for(const [name,x,y,width] of layout.wildlife){
    const body=place(name,x,y,width,{className:'animal animal-'+name});
    if(name==='bird'&&body){const holder=document.createElement('div');holder.className='scenery bird-rig';holder.style.cssText=body.style.cssText;body.replaceWith(holder);body.style.cssText='display:block;width:100%;height:100%';body.className='bird-body';holder.append(body);const wing=makeImage('bird-wing');wing.className='bird-wing';holder.append(wing);}
  }
  for(const [name,sprite] of [['leg-left','leg-left'],['leg-right','leg-right'],['arm-left','arm-left'],['arm-right','arm-right'],['torso','torso-front'],['head','head-front']]){const image=makeImage(sprite);image.className='part '+name;$('#puppet').append(image);parts[name]=image;}
  for(const name of ['head-back','head-side','torso-back','torso-side','arm-profile','leg-profile'])makeImage(name);
  function orient(view,sign=direction){
    if(view===facing&&sign===direction)return;facing=view;direction=sign;const side=view==='side';
    parts.head.src=art['head-'+view].src;parts.torso.src=art['torso-'+view].src;
    for(const limb of ['arm-left','arm-right','leg-left','leg-right'])parts[limb].src=art[(limb.startsWith('arm')?'arm-':'leg-')+(side?'profile':view)].src;
    $('#puppet').classList.toggle('left',side&&sign<0);$('#puppet').dataset.view=view;
  }
  function selectDestination(){
    const candidates=resources.filter(node=>node.available&&walkable(node.x,node.y));
    candidates.sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y));
    const node=candidates[Math.floor(Math.random()*Math.min(4,candidates.length))];if(node)setDestination(node.x,node.y,node,false);
  }
  function setDestination(x,y,node=null,manual=true){if(!walkable(x,y))return false;destination={x,y,node,path:findPath(x,y)};if(!destination.path.length){destination=null;return false;}working=0;pending=null;if(manual){manualUntil=performance.now()+15000;lookUntil=0;}return true;}
  // Navigation samples the generated river's alpha mask; these are physics cells, never rendered tiles.
  const STEP=20,COLS=Math.ceil(WIDTH/STEP),ROWS=Math.ceil(HEIGHT/STEP),navCache=new Uint8Array(COLS*ROWS),edgeCache=new Map();
  function cellPoint(cell){return{x:(cell%COLS+.5)*STEP,y:(Math.floor(cell/COLS)+.5)*STEP};}
  function cellFree(cell){if(cell<0||cell>=COLS*ROWS)return false;if(!navCache[cell]){const p=cellPoint(cell);navCache[cell]=walkable(p.x,p.y)?1:2;}return navCache[cell]===1;}
  function segmentFree(a,b){const count=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/4);for(let i=0;i<=count;i++){const t=count?i/count:0;if(!walkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;}
  function edgeFree(a,b){const key=Math.min(a,b)*COLS*ROWS+Math.max(a,b);if(!edgeCache.has(key))edgeCache.set(key,segmentFree(cellPoint(a),cellPoint(b)));return edgeCache.get(key);}
  function nearestCell(x,y){const gx=Math.floor(x/STEP),gy=Math.floor(y/STEP);let result=-1,best=Infinity;for(let radius=0;radius<5;radius++){for(let oy=-radius;oy<=radius;oy++)for(let ox=-radius;ox<=radius;ox++){const xx=gx+ox,yy=gy+oy;if(xx<0||xx>=COLS||yy<0||yy>=ROWS)continue;const cell=yy*COLS+xx;if(cellFree(cell)){const p=cellPoint(cell),d=Math.hypot(p.x-x,p.y-y);if(d<best&&segmentFree({x,y},p)){best=d;result=cell;}}}if(result!==-1)return result;}return -1;}
  function findPath(x,y){
    const start=nearestCell(state.x,state.y),goal=nearestCell(x,y);if(start<0||goal<0)return[];
    const scores=new Float64Array(COLS*ROWS).fill(Infinity),parent=new Int32Array(COLS*ROWS).fill(-1),closed=new Uint8Array(COLS*ROWS),open=[];
    const heuristic=cell=>{const a=cellPoint(cell),b=cellPoint(goal);return Math.hypot(a.x-b.x,a.y-b.y)/STEP;};
    function push(item){open.push(item);let i=open.length-1;while(i>0){const p=(i-1)>>1;if(open[p].f<=item.f)break;open[i]=open[p];i=p;}open[i]=item;}
    function pop(){const first=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(last.f<=open[c].f)break;open[i]=open[c];i=c;}open[i]=last;}return first;}
    scores[start]=0;push({cell:start,f:heuristic(start)});
    while(open.length){const current=pop().cell;if(closed[current])continue;if(current===goal){const path=[{x,y}];let n=goal;while(n!==start){path.push(cellPoint(n));n=parent[n];}path.push(cellPoint(start));return path.reverse();}closed[current]=1;const cx=current%COLS,cy=Math.floor(current/COLS);for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){const nx=cx+ox,ny=cy+oy,next=ny*COLS+nx;if(nx<0||nx>=COLS||ny<0||ny>=ROWS||!cellFree(next)||closed[next])continue;if(ox&&oy&&(!cellFree(cy*COLS+nx)||!cellFree(ny*COLS+cx)))continue;if(!edgeFree(current,next))continue;const score=scores[current]+(ox&&oy?Math.SQRT2:1);if(score<scores[next]){scores[next]=score;parent[next]=current;push({cell:next,f:score+heuristic(next)});}}}return[];
  }
  function fitScale(){return Math.min(innerWidth/(viewBounds.right-viewBounds.left),innerHeight/(viewBounds.bottom-viewBounds.top));}
  function viewScale(){return fitScale();}
  function sizeViewport(){camera.scale=viewScale();const viewport=$('#viewport');viewport.style.width=Math.min(innerWidth,(viewBounds.right-viewBounds.left)*camera.scale)+'px';viewport.style.height=Math.min(innerHeight,(viewBounds.bottom-viewBounds.top)*camera.scale)+'px';}
  function renderCamera(){sizeViewport();const s=camera.scale;camera.x=-viewBounds.left*s;camera.y=-viewBounds.top*s;$('#world').style.transform=`translate(${camera.x}px,${camera.y}px) scale(${s})`;}
  function renderPlayer(){const player=$('#player');player.style.left=state.x+'px';player.style.top=state.y+'px';player.style.zIndex=Math.round(state.y);}
  function move(dx,dy,dt){
    const length=Math.hypot(dx,dy);let x=state.x+dx/length*90*dt,y=state.y+dy/length*90*dt;
    if(walkable(x,y)){state.x=x;state.y=y;}else if(walkable(x,state.y)){state.x=x;}else if(walkable(state.x,y)){state.y=y;}
    orient(Math.abs(dy)>Math.abs(dx)*1.15?(dy<0?'back':'front'):'side',dx<0?-1:1);
  }
  function finishGather(){
    if(!pending||!pending.available)return;state[pending.type]++;pending.amount--;pending.image.classList.remove('hit');void pending.image.offsetWidth;pending.image.classList.add('hit');
    if(pending.amount<=0){pending.available=false;pending.image.classList.add('spent');const node=pending;setTimeout(()=>{node.available=true;node.amount=node.image.classList.contains('tree')?4:1;node.image.classList.remove('spent');},35000);}
    pending=null;save();
  }
  function frame(now){
    const dt=Math.min(.04,(now-previous)/1000||0);previous=now;
    if(active){
      let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
      if(dx||dy){destination=null;working=0;pending=null;manualUntil=now+2200;lookUntil=0;}
      if(working&&now>=working){working=0;finishGather();manualUntil=now+400;}
      if(!working&&!dx&&!dy){
        if(!destination&&now>manualUntil)selectDestination();
        if(destination){while(destination.path.length>1&&Math.hypot(destination.path[0].x-state.x,destination.path[0].y-state.y)<6)destination.path.shift();const point=destination.path[0],distance=Math.hypot(point.x-state.x,point.y-state.y);if(distance>5){dx=(point.x-state.x)/distance;dy=(point.y-state.y)/distance;}else{if(destination.node&&destination.node.available){pending=destination.node;working=now+1400;}destination=null;manualUntil=now+650;}}
      }
      const moving=!!(dx||dy);if(moving)move(dx,dy,dt);
      $('#player').classList.toggle('walking',moving);$('#puppet').classList.toggle('walking',moving);$('#puppet').classList.toggle('working',!!working);renderPlayer();
    }
    requestAnimationFrame(frame);
  }
  $('#leave').addEventListener('click',save);
  let drag=null;const viewport=$('#viewport');
  viewport.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('.resource'))return;drag={x:event.clientX,y:event.clientY,cx:camera.x,cy:camera.y,moved:false};viewport.setPointerCapture(event.pointerId);});
  viewport.addEventListener('pointermove',event=>{if(drag&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;});
  viewport.addEventListener('pointerup',event=>{if(!drag)return;if(!drag.moved){const box=viewport.getBoundingClientRect();setDestination((event.clientX-box.left-camera.x)/camera.scale,(event.clientY-box.top-camera.y)/camera.scale);}drag=null;});
  viewport.addEventListener('pointercancel',()=>drag=null);
  addEventListener('keydown',event=>{if(active&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(event.key.toLowerCase())){event.preventDefault();keys.add(event.key.toLowerCase());}});
  addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));addEventListener('blur',()=>keys.clear());addEventListener('beforeunload',save);addEventListener('resize',renderCamera);
  // Used to capture real game poses and review joint placement in the browser.
  function audit(){const overlaps=[];for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++){const p=placements[i],q=placements[j];if(p.floor||q.floor)continue;const bothTrees=p.tree&&q.tree,a=bothTrees?trunkBox(p.x,p.y):fullBox(p.x,p.y,p.width,p.height),b=bothTrees?trunkBox(q.x,q.y):fullBox(q.x,q.y,q.width,q.height);if(intersects(a,b))overlaps.push([p.name,q.name]);}return{objects:placements.length,riverPieces:placements.filter(p=>p.floor).length,riverOverlaps:placements.filter(p=>!p.floor&&!fitsBank(p.name,p.x,p.y,p.width)).map(p=>p.name),objectOverlaps:overlaps};}
  window.fieldReview={pose(view,walk=false){active=false;keys.clear();orient(view==='left'?'side':view,view==='left'?-1:1);$('#player').classList.toggle('walking',walk);$('#puppet').classList.toggle('walking',walk);$('#puppet').classList.remove('working');renderPlayer();renderCamera();},start(){active=true;},debug:()=>({active,camera:{...camera},viewBounds,destination:destination?JSON.parse(JSON.stringify({...destination,node:undefined})):null,keys:[...keys],working}),audit,state,parts,resources,placements,walkable,inWater,findPath,setDestination,ready:Promise.all(images.map(i=>i.decode().catch(()=>{})))};
  if(!walkable(state.x,state.y))Object.assign(state,layout.spawn);
  orient('front');renderPlayer();renderCamera();requestAnimationFrame(frame);
})();
