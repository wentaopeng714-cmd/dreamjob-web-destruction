function updateBoss(dt){
 if(level!==5||paused||ending||settled)return;const cfg=combatConfig.boss,a=bossAnchor();
 if(!boss.active){if(targets.every(t=>t.done)||Math.hypot(p.x-a.x,p.y-a.y)<cfg.activationDistance)activateBoss();else return}
 if(!boss.alive)return;const next=bossPhase();if(next!==boss.phase){boss.phase=next;bossVfx('phase',{x:boss.x+boss.w/2,y:boss.y+boss.h/2,phase:next});notify('Boss 第 '+next+' 阶段：'+(next===2?'散射更密，留意冲刺预告。':'最后一轮，继续移动找空隙。'),2000)}
 const spec=cfg.phases[boss.phase-1];
 if(boss.dash){const d=boss.dash,nx=clamp(boss.x+d.dx*cfg.dashSpeed*dt,8,W-boss.w-8),ny=clamp(boss.y+d.dy*cfg.dashSpeed*dt,100,H-boss.h-40);
  const block=bossRushBlocked(nx,ny);if(!block){boss.x=nx;boss.y=ny}if(block||time>=d.until){bossVfx('stop',{x:boss.x+boss.w/2,y:boss.y+boss.h/2,phase:boss.phase});boss.dash=null;boss.nextAttack=time+.7}
 }else if(boss.warning){const tell=boss.warning;
  if(time-tell.at>=spec.warning){const origin=bossMuzzle(tell.side);if(tell.type==='rush'){boss.dash={dx:tell.dx,dy:tell.dy,until:time+cfg.dashDuration};bossVfx('rush',{x:boss.x+boss.w/2,y:boss.y+boss.h/2,dx:tell.dx,dy:tell.dy,phase:boss.phase})}else{
   const base=Math.atan2(tell.dy,tell.dx),span=bossFanSpan();
   for(let i=0;i<spec.fan&&enemyShots.length<cfg.shotCap;i++){const angle=base+(i/(spec.fan-1)-.5)*span;enemyShots.push({id:'boss-shot-'+(++shotSerial),source:'boss',x:origin.x,y:origin.y,vx:Math.cos(angle)*spec.speed,vy:Math.sin(angle)*spec.speed,life:cfg.range/spec.speed,remaining:cfg.range,age:0,phase:boss.phase,text:boss.phase===3?'！':'？'})}
   bossVfx('muzzle',{...origin,dx:tell.dx,dy:tell.dy,phase:boss.phase});
  }boss.lastAttack={type:tell.type,at:time};boss.warning=null;boss.nextAttack=time+spec.cooldown;boss.cycle++}
 }else{
  // Flank and rise throughout the actual document, rather than clamping to the final paragraph.
  const side=p.x<boss.x+boss.w/2?1:-1,t=time-boss.born;
  const tx=clamp(p.x+side*(260+Math.sin(t*.65)*45)-boss.w/2,8,W-boss.w-8);
  const ty=clamp(p.y-p.h/2-boss.h/2+Math.sin(t*.9)*cfg.roamAmplitude,100,H-boss.h-40);
  const dx=tx-boss.x,dy=ty-boss.y,vx=cfg.roamSpeed+25*(boss.phase-1),vy=Math.abs(dy)>cfg.range*.7?cfg.catchupSpeed:cfg.roamSpeed+32*(boss.phase-1);
  boss.x=clamp(boss.x+clamp(dx,-vx*dt,vx*dt),8,W-boss.w-8);boss.y=clamp(boss.y+clamp(dy,-vy*dt,vy*dt),100,H-boss.h-40);
  const m=bossMuzzle(side===1?-1:1),aimX=p.x-m.x,aimY=p.y-24-m.y,dist=Math.hypot(aimX,aimY);
  if(time>=boss.nextAttack&&dist<cfg.range&&dist>1&&lineClear(m.x,m.y,p.x,p.y-24))boss.warning={at:time,side:side===1?-1:1,dx:aimX/dist,dy:aimY/dist,type:boss.phase>=2&&boss.cycle%3===2?'rush':'fan'};
 }
 if(time-boss.born>=1.25&&bossTouchesPlayer())hurtPlayer(boss.x+boss.w/2);
 renderBoss();
}
