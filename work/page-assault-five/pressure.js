// Locked warnings and the displayed hit areas share the same world coordinates.
function survivalLanes(e){return e.warning?.lanes||[e.warning?.targetX]}
function survivalHostile(x,y,angle,speed,heavy=false){
 if(survival.projectiles.length>=140)return;
 const guardHp=heavy?PAGE_ASSAULT.chargedHp:1;
 survival.projectiles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:5,guardHp,guardMax:guardHp});
 if(heavy)survival.attackCounts.charged++;
}
function survivalEliteAttack(e,b){
 if(e.warning){
  if(time<e.warning.fireAt)return;
  const lanes=survivalLanes(e);for(const x of lanes){if(Math.abs(p.x-x)<28&&p.y>e.y+e.h)survivalHurtPlayer(x,p.y-24,'beam')}
  e.beam={lanes:[...lanes],until:time+.25};survival.attackCounts.beam+=lanes.length;
  const angle=Math.atan2(p.y-24-e.y-e.h,p.x-e.x-e.w/2);
  for(let n=0;n<PAGE_ASSAULT.fan;n++)survivalHostile(e.x+e.w/2,e.y+e.h,angle+(n-(PAGE_ASSAULT.fan-1)/2)*.18,PAGE_ASSAULT.shotSpeed,level>=3&&n%2===0);
  e.warning=null;e.nextShot=time+PAGE_ASSAULT.eliteCooldown;
 }else if(time>=e.nextShot){
  const spacing=Math.min(145,b.width*.24),sign=Math.sin(e.born+time)>=0?1:-1;
  const lanes=[p.x];if(PAGE_ASSAULT.lanes>=2)lanes.push(clamp(p.x+spacing*sign,b.left+30,b.right-30));if(PAGE_ASSAULT.lanes>=3)lanes.push(clamp(p.x-spacing*sign,b.left+30,b.right-30));
  e.warning={fireAt:time+PAGE_ASSAULT.warning,targetX:p.x,lanes:[...new Set(lanes)]};
 }
}
function survivalCasterAttack(e,b,dt){
 // This is the original detached glyph, not an extra enemy or an infinite spawn.
 const age=time-e.born,tx=clamp(e.homeX,b.left+20,b.right-e.w-20),ty=b.top+65+Math.sin(age*1.1+e.homeX)*22;
 e.x+=clamp(tx-e.x,-100*dt,100*dt);e.y+=clamp(ty-e.y,-120*dt,120*dt);
 if(e.warning){if(time>=e.warning.fireAt){
  const a=Math.atan2(e.warning.targetY-e.y-e.h,e.warning.targetX-e.x-e.w/2),fan=level===3?2:3;
  for(let i=0;i<fan;i++)survivalHostile(e.x+e.w/2,e.y+e.h,a+(i-(fan-1)/2)*.17,PAGE_ASSAULT.shotSpeed*.9,true);
  survival.attackCounts.caster++;e.warning=null;e.nextShot=time+(level===3?3.5:level===4?3:2.6);
 }}else if(time>=e.nextShot)e.warning={fireAt:time+PAGE_ASSAULT.warning,targetX:p.x,targetY:p.y-24};
}
function drawSurvivalLanes(e,b){
 ctx.strokeStyle='#c19045';ctx.lineWidth=2;ctx.setLineDash([5,5]);
 for(const x of survivalLanes(e)){ctx.beginPath();ctx.moveTo(x,e.y+e.h);ctx.lineTo(x,b.bottom);ctx.stroke();ctx.fillStyle='#c190451c';ctx.fillRect(x-28,e.y+e.h,56,b.bottom-e.y-e.h)}
 ctx.setLineDash([]);ctx.font='11px Arial';ctx.textAlign='center';ctx.fillStyle='#9c6638';ctx.fillText(PAGE_ASSAULT.lanes+' 线封锁 · 离开预警',e.x+e.w/2,e.y+e.h+23);
}
function drawSurvivalArmor(q){
 ctx.save();ctx.strokeStyle=time<(q.hitUntil||0)?'#fff':'#df5c44';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,12,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<q.guardHp;i++){ctx.fillStyle='#e06c48';ctx.fillRect(q.x-8+i*4,q.y+15,3,2)}ctx.restore();
}
function drawSurvivalHostile(q){ctx.font='bold 18px Arial';ctx.fillStyle=q.guardMax>1?'#b94b39':'#3e5063';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(q.guardMax>1?'压':'！',q.x,q.y);if(q.guardMax>1)drawSurvivalArmor(q)}
