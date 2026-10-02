// Geometry and painting share these shapes. The large boss has no invisible rectangular corners.
const EXECUTIVE_SHAPES=[
 {kind:'ellipse',x:130,y:64,rx:55,ry:61,fill:'#dca988'},
 {kind:'ellipse',x:74,y:70,rx:10,ry:19,fill:'#c89173'},
 {kind:'ellipse',x:186,y:70,rx:10,ry:19,fill:'#c89173'},
 {kind:'poly',points:[[109,111],[151,111],[156,144],[104,144]],fill:'#cd9574'},
 {kind:'poly',points:[[79,127],[109,119],[151,119],[183,130],[204,162],[196,291],[65,291],[56,161]],fill:'#253b54'},
 {kind:'poly',points:[[65,141],[45,149],[13,228],[18,285],[55,290],[72,223],[83,164]],fill:'#304965'},
 {kind:'poly',points:[[183,142],[217,150],[247,225],[244,280],[209,287],[190,226],[175,166]],fill:'#304965'},
 {kind:'ellipse',x:35,y:291,rx:21,ry:24,fill:'#dca988'},
 {kind:'ellipse',x:226,y:288,rx:21,ry:24,fill:'#dca988'},
 {kind:'poly',points:[[68,279],[129,279],[124,379],[72,385],[61,339]],fill:'#1c2d43'},
 {kind:'poly',points:[[131,279],[193,279],[202,337],[191,383],[137,379]],fill:'#203147'},
 {kind:'poly',points:[[71,373],[124,373],[127,397],[51,397],[50,388]],fill:'#111d2b'},
 {kind:'poly',points:[[139,373],[191,373],[211,387],[212,397],[136,397]],fill:'#111d2b'}
];
const MONSTER_SHAPE=[[4,14],[13,9],[9,0],[26,7],[56,7],[73,0],[69,9],[78,14],[82,39],[69,47],[13,47],[0,39]];
function shapeParts(a){
 if(a.type==='boss'){const sx=a.w/260,sy=a.h/400;return EXECUTIVE_SHAPES.map(s=>s.kind==='ellipse'?{...s,x:a.x+s.x*sx,y:a.y+s.y*sy,rx:s.rx*sx,ry:s.ry*sy}:{...s,points:s.points.map(([x,y])=>[a.x+x*sx,a.y+y*sy])})}
 if(a.kind==='enemy'){const sx=a.w/82,sy=a.h/52,poly=points=>({kind:'poly',points:points.map(([x,y])=>[a.x+x*sx,a.y+y*sy])});return [poly(MONSTER_SHAPE),poly([[14,46],[29,46],[29,52],[14,52]]),poly([[53,46],[68,46],[68,52],[53,52]])]}
 return null;
}
function inShape(x,y,s){if(s.kind==='ellipse')return ((x-s.x)/s.rx)**2+((y-s.y)/s.ry)**2<=1;
 let inside=false;for(let i=0,j=s.points.length-1;i<s.points.length;j=i++){const [xi,yi]=s.points[i],[xj,yj]=s.points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside}return inside;
}
function shapeSegment(x,y,tx,ty,s){if(inShape(x,y,s))return 0;const dx=tx-x,dy=ty-y;
 if(s.kind==='ellipse'){const ax=(x-s.x)/s.rx,ay=(y-s.y)/s.ry,bx=dx/s.rx,by=dy/s.ry,A=bx*bx+by*by,B=2*(ax*bx+ay*by),C=ax*ax+ay*ay-1,D=B*B-4*A*C;if(A<1e-12||D<0)return null;const t=(-B-Math.sqrt(D))/(2*A);return t>=0&&t<=1?t:null}
 let best=Infinity;for(let i=0;i<s.points.length;i++){const [ex,ey]=s.points[i],[fx,fy]=s.points[(i+1)%s.points.length],vx=fx-ex,vy=fy-ey,den=dx*vy-dy*vx;if(Math.abs(den)<1e-10)continue;const t=((ex-x)*vy-(ey-y)*vx)/den,u=((ex-x)*dy-(ey-y)*dx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)best=Math.min(best,t)}return isFinite(best)?best:null;
}
function actorSegment(x,y,tx,ty,a,pad=1){const parts=shapeParts(a);if(!parts)return segmentBox(x,y,tx,ty,a,pad);let best=Infinity;for(const s of parts){const t=shapeSegment(x,y,tx,ty,s);if(t!==null)best=Math.min(best,t)}return isFinite(best)?best:null}
function bossTouchesPlayer(){const b={x:p.x-p.w,y:p.y-p.h,w:p.w*2,h:p.h};
 for(const s of shapeParts(boss)){if([[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h],[p.x,p.y-p.h/2]].some(([x,y])=>inShape(x,y,s)))return true;
  if([[b.x,b.y,b.x+b.w,b.y],[b.x,b.y+b.h,b.x+b.w,b.y+b.h],[b.x,b.y,b.x,b.y+b.h],[b.x+b.w,b.y,b.x+b.w,b.y+b.h]].some(q=>shapeSegment(...q,s)!==null))return true}
 return false;
}
function paintShape(s){ctx.beginPath();if(s.kind==='ellipse')ctx.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);else{ctx.moveTo(...s.points[0]);for(const q of s.points.slice(1))ctx.lineTo(...q);ctx.closePath()}ctx.fillStyle=s.fill;ctx.fill();ctx.strokeStyle='#15283b';ctx.lineWidth=1.5;ctx.stroke()}
function drawExecutive(){ctx.save();ctx.translate(boss.x,boss.y);ctx.scale(boss.w/260,boss.h/400);
 const glow=ctx.createRadialGradient(130,230,35,130,230,215);glow.addColorStop(0,'#c03c4520');glow.addColorStop(1,'#c03c4500');ctx.fillStyle=glow;ctx.fillRect(-45,-45,350,485);
 ctx.shadowColor='#17203245';ctx.shadowBlur=10;for(const s of EXECUTIVE_SHAPES)paintShape(s);ctx.shadowBlur=0;
 // Shirt, collar, lapels and silk tie.
 ctx.fillStyle='#e9e5dd';ctx.beginPath();ctx.moveTo(105,121);ctx.lineTo(151,121);ctx.lineTo(143,230);ctx.lineTo(123,260);ctx.closePath();ctx.fill();
 ctx.fillStyle='#152b43';ctx.beginPath();ctx.moveTo(90,125);ctx.lineTo(113,125);ctx.lineTo(132,201);ctx.lineTo(95,173);ctx.lineTo(104,158);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(155,124);ctx.lineTo(177,133);ctx.lineTo(157,163);ctx.lineTo(165,176);ctx.lineTo(128,233);ctx.closePath();ctx.fill();
 ctx.fillStyle=boss.phase===3?'#d34b57':'#973647';ctx.beginPath();ctx.moveTo(125,139);ctx.lineTo(141,139);ctx.lineTo(145,153);ctx.lineTo(137,159);ctx.lineTo(147,233);ctx.lineTo(133,249);ctx.lineTo(121,232);ctx.lineTo(130,159);ctx.lineTo(120,150);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#516780';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(68,179);ctx.lineTo(67,260);ctx.moveTo(193,179);ctx.lineTo(188,255);ctx.moveTo(72,343);ctx.lineTo(119,348);ctx.moveTo(144,347);ctx.lineTo(192,343);ctx.stroke();
 ctx.fillStyle='#d8b569';ctx.fillRect(203,271,39,9);ctx.fillStyle='#f7e0a0';ctx.fillRect(217,266,13,18);ctx.fillStyle='#d5af68';ctx.beginPath();ctx.arc(175,167,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#304359';ctx.font='bold 7px Arial';ctx.textAlign='center';ctx.fillText('董',175,170);
 // Combed black hair, grey temples, defined brows and rectangular glasses.
 ctx.fillStyle='#182129';ctx.beginPath();ctx.moveTo(76,57);ctx.bezierCurveTo(65,4,98,-6,145,5);ctx.bezierCurveTo(177,5,190,30,183,61);ctx.lineTo(173,31);ctx.bezierCurveTo(130,35,124,13,85,38);ctx.lineTo(85,61);ctx.closePath();ctx.fill();ctx.fillStyle='#8b8e91';ctx.fillRect(77,45,7,21);ctx.fillRect(176,44,7,23);
 ctx.strokeStyle='#2d2928';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(93,57);ctx.lineTo(116,62);ctx.moveTo(144,62);ctx.lineTo(168,56);ctx.stroke();ctx.fillStyle='#343335';ctx.beginPath();ctx.ellipse(106,73,5,3,0,0,Math.PI*2);ctx.ellipse(156,73,5,3,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#656c70';ctx.lineWidth=2.5;ctx.strokeRect(87,64,38,24);ctx.strokeRect(137,64,38,24);ctx.beginPath();ctx.moveTo(125,70);ctx.lineTo(137,70);ctx.moveTo(86,69);ctx.lineTo(76,66);ctx.moveTo(176,69);ctx.lineTo(186,66);ctx.stroke();ctx.fillStyle='#b7d0db22';ctx.fillRect(88,65,36,22);ctx.fillRect(138,65,36,22);
 ctx.strokeStyle='#aa765a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(131,74);ctx.lineTo(125,94);ctx.lineTo(135,96);ctx.moveTo(92,92);ctx.lineTo(99,98);ctx.moveTo(165,93);ctx.lineTo(159,99);ctx.stroke();ctx.strokeStyle='#713f38';ctx.lineWidth=2.7;ctx.beginPath();ctx.moveTo(111,107);ctx.quadraticCurveTo(130,103,151,105);ctx.stroke();
 ctx.fillStyle='#345068';for(const y of [224,252,273]){ctx.beginPath();ctx.arc(138,y,3,0,Math.PI*2);ctx.fill()}
 if(time<boss.hitUntil){ctx.globalAlpha=.25;ctx.fillStyle='#fff0c4';for(const s of EXECUTIVE_SHAPES){ctx.beginPath();if(s.kind==='ellipse')ctx.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);else{ctx.moveTo(...s.points[0]);s.points.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath()}ctx.fill()}ctx.globalAlpha=1}
 ctx.restore();
}
function drawMonster(e){const sx=e.w/82,sy=e.h/52;ctx.save();ctx.translate(e.x,e.y);ctx.scale(sx,sy);ctx.globalAlpha=e.alive?Math.min(1,(time-e.born)/.24+.35):Math.max(0,(e.hushUntil-time)/.45);
 const chase=e.type==='chaser',color=chase?'#c85149':'#327f9c';ctx.shadowColor=chase?'#c8514960':'#327f9c60';ctx.shadowBlur=6;ctx.fillStyle=time<e.hitUntil?'#ffd67b':color;ctx.strokeStyle=chase?'#672628':'#173e59';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...MONSTER_SHAPE[0]);MONSTER_SHAPE.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 ctx.fillStyle='#fff3df';ctx.beginPath();ctx.ellipse(24,18,10,6,0,0,Math.PI*2);ctx.ellipse(58,18,10,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#252b3b';ctx.fillRect(25+(p.x>e.x?2:-2),16,4,5);ctx.fillRect(56+(p.x>e.x?2:-2),16,4,5);ctx.strokeStyle='#402b38';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,12);ctx.lineTo(32,15);ctx.moveTo(50,15);ctx.lineTo(68,12);ctx.stroke();
 ctx.fillStyle='#ffffff';ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.text,41,34);ctx.fillStyle=chase?'#752b2c':'#1a445a';ctx.fillRect(14,46,15,6);ctx.fillRect(53,46,15,6);
 ctx.fillStyle='#172839';ctx.fillRect(6,-8,70,4);ctx.fillStyle=chase?'#ff9b80':'#74e5e4';ctx.fillRect(6,-8,70*Math.max(0,e.hp/combatConfig[e.type].hp),4);
 if(e.warning){ctx.strokeStyle='#ffcf65';ctx.lineWidth=3;ctx.beginPath();ctx.arc(41,24,34,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp((time-e.warning.at)/combatConfig.warning,0,1));ctx.stroke();ctx.fillStyle='#9c4c26';ctx.font='bold 10px Arial';ctx.fillText('即将发射',41,-20)}
 ctx.restore();if(hitDebug){ctx.strokeStyle='#9d50bb';ctx.lineWidth=1;ctx.strokeRect(e.x,e.y,e.w,e.h)}
}
function bossMuzzle(){return {x:boss.x+(p.x<boss.x+boss.w/2?-3:boss.w+3),y:boss.y+boss.h*.72}}
function actorBlastDistance(x,y,a){const parts=shapeParts(a);if(!parts)return Math.hypot(x-clamp(x,a.x,a.x+a.w),y-clamp(y,a.y,a.y+a.h));let best=Infinity;
 for(const s of parts){if(inShape(x,y,s))return 0;if(s.kind==='ellipse'){const dx=Math.abs(x-s.x),dy=Math.abs(y-s.y),r2=s.rx*s.rx,q2=s.ry*s.ry,f=t=>(s.rx*dx/(t+r2))**2+(s.ry*dy/(t+q2))**2;let lo=0,hi=Math.max(r2,q2);while(f(hi)>1)hi*=2;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(f(mid)>1)lo=mid;else hi=mid}const t=(lo+hi)/2;best=Math.min(best,Math.hypot(dx-r2*dx/(t+r2),dy-q2*dy/(t+q2)))}else for(let i=0;i<s.points.length;i++){const [ax,ay]=s.points[i],[bx,by]=s.points[(i+1)%s.points.length],dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);best=Math.min(best,Math.hypot(x-ax-t*dx,y-ay-t*dy))}}
 return best;
}
function bossRushBlocked(nx,ny){const oldParts=shapeParts(boss),nextParts=shapeParts({...boss,x:nx,y:ny});for(const a of query(Math.min(boss.x,nx),Math.min(boss.y,ny),Math.abs(nx-boss.x)+boss.w,Math.abs(ny-boss.y)+boss.h)){const x=a.x+a.w/2,y=a.y+a.h/2;if(oldParts.some(s=>inShape(x,y,s)))continue;if(nextParts.some(s=>inShape(x,y,s)))return true}return false;}
