(function(){
const ex=document.getElementById('qb-angle-overlay');
if(ex){ex.remove();return;}
const video=document.querySelector('video');
if(!video){alert('No video found on this page.');return;}
const rect=video.getBoundingClientRect();
const canvas=document.createElement('canvas');
canvas.id='qb-angle-overlay';
canvas.style.cssText='position:fixed;left:'+rect.left+'px;top:'+rect.top+'px;width:'+rect.width+'px;height:'+rect.height+'px;z-index:9999;cursor:default;';
canvas.width=rect.width;canvas.height=rect.height;
document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const pp=(px,py)=>({x:W*px,y:H*py});
const lines={
  spine:{color:'#FF7700',pts:[pp(0.760,0.30),pp(0.730,0.54)]},
  leg:{color:'#FF00DD',pts:[pp(0.730,0.54),pp(0.765,0.68),pp(0.800,0.83)]},
  arm:{color:'#FFE800',pts:[pp(0.760,0.30),pp(0.825,0.33),pp(0.805,0.39)]},
  balance:{color:'#00FF99',pts:[pp(0.750,0.10),pp(0.750,0.92)]}
};
const DR=9;let hp=null;
function afv(p1,p2){return Math.round(Math.atan2(p2.x-p1.x,p2.y-p1.y)*180/Math.PI);}
function ab(v,a,b){const ax=a.x-v.x,ay=a.y-v.y,bx=b.x-v.x,by=b.y-v.y,dot=ax*bx+ay*by,mag=Math.sqrt((ax*ax+ay*ay)*(bx*bx+by*by));return Math.round(Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI);}
function sg(p1,p2,c,w){ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=c;ctx.lineWidth=w||3;ctx.setLineDash([]);ctx.stroke();}
function ds(p1,p2,c){ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.strokeStyle=c;ctx.lineWidth=1.8;ctx.setLineDash([5,4]);ctx.stroke();ctx.setLineDash([]);}
function dt(pt,c,hv){ctx.beginPath();ctx.arc(pt.x,pt.y,DR,0,Math.PI*2);ctx.fillStyle=hv?'#fff':c;ctx.fill();ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.lineWidth=2;ctx.stroke();}
function lb(t,x,y,c){ctx.font='bold 15px Arial';ctx.strokeStyle='rgba(0,0,0,0.9)';ctx.lineWidth=3.5;ctx.strokeText(t,x,y);ctx.fillStyle=c;ctx.fillText(t,x,y);}
function ar(v,a,b,c,deg,r){const a1=Math.atan2(a.y-v.y,a.x-v.x),a2=Math.atan2(b.y-v.y,b.x-v.x);let d=a2-a1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;ctx.beginPath();ctx.arc(v.x,v.y,r,a1,a1+d,d<0);ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.stroke();const m=a1+d/2;lb(Math.abs(deg)+'°',v.x+(r+18)*Math.cos(m)-10,v.y+(r+18)*Math.sin(m)+5,c);}
function render(){
  ctx.clearRect(0,0,W,H);
  const[bT,bB]=lines.balance.pts,bc=lines.balance.color;
  sg(bT,bB,bc,2.5);ds(bT,{x:bT.x,y:bT.y+60},bc);ar(bT,{x:bT.x,y:bT.y+60},bB,bc,afv(bT,bB),30);
  [bT,bB].forEach(pt=>{ctx.beginPath();ctx.moveTo(pt.x-10,pt.y);ctx.lineTo(pt.x+10,pt.y);ctx.strokeStyle=bc;ctx.lineWidth=2;ctx.stroke();});
  const[sT,sB]=lines.spine.pts,sc=lines.spine.color;
  sg(sT,sB,sc);ds(sT,{x:sT.x,y:sT.y+55},sc);ar(sT,{x:sT.x,y:sT.y+55},sB,sc,afv(sT,sB),30);
  const[lH,lK,lF]=lines.leg.pts,lc=lines.leg.color;
  sg(lH,lK,lc);sg(lK,lF,lc);
  ds(lH,{x:lH.x,y:lH.y+52},lc);ar(lH,{x:lH.x,y:lH.y+52},lK,lc,afv(lH,lK),28);
  ds(lK,{x:lK.x,y:lK.y+48},lc);ar(lK,{x:lK.x,y:lK.y+48},lF,lc,afv(lK,lF),24);
  const[aS,aE,aBl]=lines.arm.pts,ac=lines.arm.color;
  sg(aS,aE,ac);sg(aE,aBl,ac);
  const sdx=sB.x-sT.x,sdy=sB.y-sT.y,sR={x:aS.x+sdx*1.3,y:aS.y+sdy*1.3};
  ds(aS,sR,'rgba(255,119,0,0.5)');ar(aS,sR,aE,ac,ab(aS,sR,aE),36);
  [lines.spine,lines.leg,lines.arm,lines.balance].forEach(l=>l.pts.forEach(pt=>dt(pt,l.color,hp===pt)));
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.beginPath();
  if(ctx.roundRect)ctx.roundRect(8,8,178,92,7);else ctx.rect(8,8,178,92);ctx.fill();
  [['━ Spine (from vert)','#FF7700'],['━ Back Leg (from vert)','#FF00DD'],['━ Arm (from spine)','#FFE800'],['━ Balance (from vert)','#00FF99']].forEach(([t,c],i)=>{ctx.font='bold 12px Arial';ctx.fillStyle=c;ctx.fillText(t,14,28+i*18);});
}
let drag=null,ox=0,oy=0;
function ht(cx,cy){for(const l of[lines.balance,lines.arm,lines.leg,lines.spine])for(const pt of l.pts)if(Math.hypot(cx-pt.x,cy-pt.y)<=DR+5)return pt;return null;}
canvas.addEventListener('mousedown',e=>{const h=ht(e.offsetX,e.offsetY);if(h){drag=h;ox=e.offsetX-h.x;oy=e.offsetY-h.y;canvas.style.cursor='grabbing';e.preventDefault();}});
canvas.addEventListener('mousemove',e=>{if(drag){drag.x=e.offsetX-ox;drag.y=e.offsetY-oy;render();}else{hp=ht(e.offsetX,e.offsetY);canvas.style.cursor=hp?'grab':'default';render();}});
canvas.addEventListener('mouseup',()=>{drag=null;canvas.style.cursor='default';});
canvas.addEventListener('mouseleave',()=>{drag=null;});
render();
})();
