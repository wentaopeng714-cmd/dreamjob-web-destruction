// Decorative light does not alter the existing projectile damage or collision radius.
let bossAttackEffects=[];
function bossFanSpan(){return .85+(boss.phase-1)*.14}
function bossVfx(kind,data){bossAttackEffects.push({kind,...data,at:time,life:kind==='phase'?.75:kind==='rush'?.45:.3});if(bossAttackEffects.length>48)bossAttackEffects.shift()}
function resetBossVfx(){bossAttackEffects=[];const cue=$('#boss-alert');if(cue)cue.hidden=true}
function renderBossAttackCue(){
 const cue=$('#boss-attack-cue'),alert=$('#boss-alert');if(!cue||!alert)return;
 if(level!==5||!boss?.active||!boss.alive){cue.hidden=true;alert.hidden=true;return}
 let text='',kind='';if(boss.warning){const w=boss.warning,left=Math.max(0,combatConfig.boss.phases[boss.phase-1].warning-(time-w.at));kind=w.type;text=(kind==='rush'?'冲刺蓄力 · 离开红色路线':'散射蓄力 · 避开橙色射线')+' · '+left.toFixed(1)+' 秒'}else if(boss.dash){kind='rush';text='冲刺中 · 侧向避让'}else if(boss.lastAttack?.type==='fan'&&time-boss.lastAttack.at<.6){kind='fired';text='散射已发 · 留意发光弹芯'}
 cue.hidden=!text;cue.textContent=text;alert.hidden=!text;alert.textContent=text;alert.dataset.kind=kind;
}
function bossRayLength(x,y,dx,dy,range){let len=range;for(const a of query(Math.min(x,x+dx*range)-1,Math.min(y,y+dy*range)-1,Math.abs(dx*range)+2,Math.abs(dy*range)+2)){const t=segmentBox(x,y,x+dx*range,y+dy*range,a,1);if(t!==null)len=Math.min(len,range*t)}return len}
function drawBossProjectile(b){
 ctx.save();const speed=Math.hypot(b.vx,b.vy),dx=b.vx/speed,dy=b.vy/speed,tail=Math.min(42,(b.age||0)*speed),color=b.phase===3?'#c83da2':'#f07b25';
 const g=ctx.createLinearGradient(b.x-dx*tail,b.y-dy*tail,b.x,b.y);g.addColorStop(0,color+'00');g.addColorStop(1,color);ctx.strokeStyle=g;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(b.x-dx*tail,b.y-dy*tail);ctx.lineTo(b.x,b.y);ctx.stroke();
 ctx.shadowBlur=14;ctx.shadowColor=color;ctx.fillStyle=color;ctx.beginPath();ctx.arc(b.x,b.y,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff4de';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#682b37';ctx.font='bold 15px Arial';ctx.textAlign='center';ctx.fillText(b.text,b.x,b.y-17);ctx.restore();
}
function drawBossAttackEffects(){
 bossAttackEffects=bossAttackEffects.filter(e=>time-e.at<e.life);
 for(const e of bossAttackEffects){const f=clamp((time-e.at)/e.life,0,1),c=e.phase===3?'#c83da2':'#f07b25';ctx.save();ctx.translate(e.x,e.y);ctx.globalAlpha=(1-f)*.9;ctx.strokeStyle=c;ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=14;ctx.lineWidth=3;
  const radius=e.kind==='phase'?35+f*240:e.kind==='muzzle'?15+f*48:8+f*50;
  ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
  if(e.kind==='muzzle'){ctx.rotate(Math.atan2(e.dy,e.dx));ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(35*(1-f)+8,-15);ctx.lineTo(22,0);ctx.lineTo(35*(1-f)+8,15);ctx.closePath();ctx.fill()}
  for(let i=0;i<8;i++){const a=i*Math.PI/4+f*.4;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius,Math.sin(a)*radius);ctx.lineTo(Math.cos(a)*(radius+13*(1-f)),Math.sin(a)*(radius+13*(1-f)));ctx.stroke()}
  ctx.restore();
 }
}
function drawBossWarning(){if(!boss.warning)return;const w=boss.warning,m=bossMuzzle(w.side),spec=combatConfig.boss.phases[boss.phase-1],f=clamp((time-w.at)/spec.warning,0,1),base=Math.atan2(w.dy,w.dx);ctx.save();
 if(w.type==='fan'){
  const span=bossFanSpan(),r=Math.min(420,combatConfig.boss.range);ctx.fillStyle='#f39b3120';ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.arc(m.x,m.y,r,base-span/2,base+span/2);ctx.closePath();ctx.fill();
  for(let i=0;i<spec.fan;i++){const angle=base+(i/(spec.fan-1)-.5)*span,dx=Math.cos(angle),dy=Math.sin(angle),len=bossRayLength(m.x,m.y,dx,dy,combatConfig.boss.range);ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+dx*len,m.y+dy*len);ctx.strokeStyle='#fff5e8';ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle='#c97728';ctx.lineWidth=2.3;ctx.setLineDash([12,8]);ctx.lineDashOffset=-f*22;ctx.stroke();ctx.setLineDash([])}
 }else{
  const cx=boss.x+boss.w/2,cy=boss.y+boss.h/2,len=combatConfig.boss.dashSpeed*combatConfig.boss.dashDuration,nx=-w.dy*55,ny=w.dx*55;drawBossRushEnvelope(w.dx*len,w.dy*len);ctx.fillStyle='#e53e5630';ctx.strokeStyle='#ce324d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx+nx,cy+ny);ctx.lineTo(cx+w.dx*len+nx,cy+w.dy*len+ny);ctx.lineTo(cx+w.dx*len-nx,cy+w.dy*len-ny);ctx.lineTo(cx-nx,cy-ny);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+w.dx*len,cy+w.dy*len);ctx.lineWidth=6;ctx.stroke();const ex=cx+w.dx*len,ey=cy+w.dy*len;ctx.beginPath();ctx.moveTo(ex-w.dx*24-w.dy*17,ey-w.dy*24+w.dx*17);ctx.lineTo(ex,ey);ctx.lineTo(ex-w.dx*24+w.dy*17,ey-w.dy*24-w.dx*17);ctx.stroke();
 }
 ctx.strokeStyle=w.type==='rush'?'#f24c67':'#f8a434';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=15;ctx.lineWidth=5;ctx.beginPath();ctx.arc(m.x,m.y,27+Math.sin(f*Math.PI*6)*3,-Math.PI/2,-Math.PI/2+Math.PI*2*f);ctx.stroke();ctx.restore();
}
function drawBossRushTrails(){if(!boss.dash)return;ctx.save();for(let i=3;i>=1;i--){ctx.globalAlpha=.07*(4-i);ctx.fillStyle='#d23c69';for(const s of shapeParts(boss)){ctx.beginPath();const ox=-boss.dash.dx*i*22,oy=-boss.dash.dy*i*22;if(s.kind==='ellipse')ctx.ellipse(s.x+ox,s.y+oy,s.rx,s.ry,0,0,Math.PI*2);else{ctx.moveTo(s.points[0][0]+ox,s.points[0][1]+oy);s.points.slice(1).forEach(([x,y])=>ctx.lineTo(x+ox,y+oy));ctx.closePath()}ctx.fill()}}ctx.restore()}

function drawBossRushEnvelope(dx,dy){const corners=[[boss.x,boss.y],[boss.x+boss.w,boss.y],[boss.x+boss.w,boss.y+boss.h],[boss.x,boss.y+boss.h]],points=[...corners,...corners.map(([x,y])=>[x+dx,y+dy])].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let low=[],high=[];for(const q of points){while(low.length>1&&cross(low.at(-2),low.at(-1),q)<=0)low.pop();low.push(q)}for(const q of [...points].reverse()){while(high.length>1&&cross(high.at(-2),high.at(-1),q)<=0)high.pop();high.push(q)}const hull=[...low.slice(0,-1),...high.slice(0,-1)];ctx.save();ctx.beginPath();ctx.moveTo(...hull[0]);hull.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath();ctx.fillStyle='#e53e5614';ctx.fill();ctx.strokeStyle='#cc496787';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.stroke();ctx.restore()}
