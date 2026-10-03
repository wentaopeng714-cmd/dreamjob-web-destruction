function assaultAdvancedStats(){
 const st=getWeaponStats(),rawArsenal=mods.A+mods.B,equipment=Math.min(12,st.arsenal+mods.C),cooling=Math.min(12,Math.ceil(st.arsenal*.6)+mods.D);
 return {...st,radius:72+equipment*8+mods.C*3+rawArsenal,grenadeDamage:5+Math.floor(equipment*1.5)+mods.C+Math.floor(rawArsenal/4),
 cooldown:Math.max(.45,GAME_CONFIG.upgrades.D[cooling]+.15-mods.D*.015),rate:Math.min(20,8+mods.A*.6+mods.B*.4),pierce:Math.min(12,Math.max(2,st.pierce)),fan:Math.min(8,st.split.count),
 eraserRange:78+st.arsenal*3+mods.C*2+rawArsenal,guardDamage:1+Math.floor(mods.C/8),eraserDamage:st.eraserDamage+(sh<500?1:0),eraserCooldown:Math.max(sh<500?.16:.2,.46-st.arsenal*.02-mods.D*.01-(sh<500?.1:0))};
}
// Use the existing executive drawing, silhouette collision and attack effects.
// One final encounter follows the finite page roster; no legacy wave generator runs.
function survivalStartBoss(){
 const s=survival,b=survivalBounds();s.bossStarted=true;s.hp=Math.min(s.maxHp,s.hp+2);
 const h=Math.min(400,b.height*(sh<500?.52:.65)),w=h*260/400;
 Object.assign(boss,{kind:'boss',type:'boss',state:'active',active:true,alive:true,defeated:false,
  hp:18000,maxHp:18000,w,h,x:clamp(p.x-w/2,12,W-w-12),y:b.top+25,
  born:time,phase:1,nextAttack:time+1.8,cycle:0,warning:null,dash:null});
 s.actors.push(boss);bossVfx('phase',{x:boss.x+w/2,y:boss.y+h/2,phase:1});
 notify('页面已清空 · 董事长登场！回复 2 格护盾，留意散射射线与冲刺路线，继续移动。',4500);
 renderBoss();renderSurvivalUI();
}
function survivalDamageBoss(e,damage,x,y){
 e.hp=Math.max(0,e.hp-damage);e.hitUntil=time+.13;
 survival.hits.push({id:e.id,x,y,rect:{x:e.x,y:e.y,w:e.w,h:e.h},at:time});
 if(survival.hits.length>30)survival.hits.shift();
 if(!e.hp){e.alive=false;e.defeated=true;e.deathAt=time;e.warning=null;e.dash=null;
  survival.projectiles=survival.projectiles.filter(q=>q.source!=='boss');
  bossVfx('phase',{x:e.x+e.w/2,y:e.y+e.h/2,phase:3});scatterEnemy(e);
  award('boss',combatConfig.boss.reward);growthDirty=true;
  notify('绩效审判结束。你的判断，留在自己手里。',3600);
 }
 renderBoss();
}
function survivalUpdateBoss(dt){
 if(!boss?.alive)return;const b=survivalBounds(),cfg=combatConfig.boss;
 // Keep the full figure inside the usable field, including after resize/zoom.
 const h=Math.min(400,b.height*(sh<500?.52:.65));boss.h=h;boss.w=h*260/400;
 const prior={x:boss.x,y:boss.y},next=bossPhase();
 if(next!==boss.phase){boss.phase=next;bossVfx('phase',{x:boss.x+boss.w/2,y:boss.y+boss.h/2,phase:next});notify('Boss 第 '+next+' 阶段：'+(next===2?'散射加密，开始冲刺。':'最后一轮，躲开红色冲刺路线。'),2200)}
 const spec=cfg.phases[boss.phase-1],cx=boss.x+boss.w/2,cy=boss.y+boss.h/2;
 const constrain=()=>{boss.x=clamp(boss.x,b.left+6,b.right-boss.w-6);boss.y=clamp(boss.y,b.top+24,b.bottom-boss.h-16)};
 if(boss.dash){const d=boss.dash;boss.x+=d.dx*390*dt;boss.y+=d.dy*390*dt;constrain();
  if(time>=d.until){boss.dash=null;boss.nextAttack=time+.9;bossVfx('stop',{x:boss.x+boss.w/2,y:boss.y+boss.h/2,phase:boss.phase})}
 }else if(boss.warning){const t=boss.warning;
  if(time-t.at>=spec.warning){const m=bossMuzzle(t.side);
   if(t.type==='rush'){boss.dash={dx:t.dx,dy:t.dy,until:time+.6};bossVfx('rush',{x:cx,y:cy,dx:t.dx,dy:t.dy,phase:boss.phase})}
   else{const angle=Math.atan2(t.dy,t.dx),span=bossFanSpan();
    for(let i=0;i<spec.fan;i++){const a=angle+(i/(spec.fan-1)-.5)*span;survival.projectiles.push({source:'boss',x:m.x,y:m.y,vx:Math.cos(a)*spec.speed,vy:Math.sin(a)*spec.speed,life:cfg.range/spec.speed,age:0,guardHp:4+boss.phase,guardMax:4+boss.phase,phase:boss.phase,text:boss.phase===3?'！':'？'})}
    bossVfx('muzzle',{...m,dx:t.dx,dy:t.dy,phase:boss.phase});
   }
   survival.bossAttackCount=(survival.bossAttackCount||0)+1;boss.lastAttack={type:t.type,at:time};boss.warning=null;boss.nextAttack=time+spec.cooldown;boss.cycle++;
  }
 }else{
  const tx=clamp(p.x-boss.w/2+Math.sin((time-boss.born)*.85)*120,b.left+6,b.right-boss.w-6);
  const ty=b.top+24+(b.height-boss.h-60)*(.25+.22*Math.sin((time-boss.born)*.6));
  boss.x+=clamp(tx-boss.x,-95*dt,95*dt);boss.y+=clamp(ty-boss.y,-70*dt,70*dt);constrain();
  if(time>=boss.nextAttack){const side=p.x<boss.x+boss.w/2?-1:1,m=bossMuzzle(side),rush=boss.phase>=2&&boss.cycle%3===2;
   const ox=rush?boss.x+boss.w/2:m.x,oy=rush?boss.y+boss.h/2:m.y,dx=p.x-ox,dy=p.y-24-oy,d=Math.max(1,Math.hypot(dx,dy));
   boss.warning={at:time,side,dx:dx/d,dy:dy/d,type:rush?'rush':'fan'};
  }
 }
 boss.vxActual=(boss.x-prior.x)/dt;boss.vyActual=(boss.y-prior.y)/dt;
 if(time-boss.born>1.5&&bossTouchesPlayer())survivalHurtPlayer(p.x,p.y-24,'bossContact');
 renderBoss();
}
const assaultOldCombat=updateCombat;updateCombat=function(dt){if(survival)return;assaultOldCombat(dt)};
// The original listener captured the old resize function before the battle wrapper.
// Rebind it so native window resizing also follows the character while paused.
window.removeEventListener('resize',survivalOldResize);window.addEventListener('resize',resize);
// Original UI still renders weapon descriptions, pause and level selection.
// Completion belongs to the actual page roster, rather than the old wave quota.
renderClearStandards=function(){
 if(!growth||!survival)return;
 $('#quick-next').hidden=!growth.complete||level===5||ending||settled;
 $('#quick-next').textContent='进入第 '+(level+1)+' 关';
 $('#battle-strip').classList.toggle('cleared',growth.complete);
 if(survival.phase==='free'){
  $('#battle-summary').textContent='✓ 本关通关 · 自由拆页';
  $('#battle-remaining').textContent='文字 '+survival.killed+'/'+survival.total+' · 标题 '+survival.eliteKills+'/'+survival.eliteTotal;
  $('#battle-meter').max=survival.total+survival.eliteTotal;$('#battle-meter').value=survival.total+survival.eliteTotal;
  $('#enemy-progress').textContent='本关敌人已全部击败，停止出击。可以继续拆图片和网页表面。';
  $('#hint strong').textContent='第 '+level+' 关 · 已通关，自由拆页';
  $('#hint-copy').innerHTML='鼠标瞄准并射击；1 / 2 / 3 切换武器。<br>W / 空格上升，S 下降；没有新敌人或额外通关配额。';
 }
 if(!$('#all-level-rules').children.length)for(let n=1;n<=5;n++){const row=document.createElement('li');row.textContent='第 '+n+' 关：'+levelRule(n);row.classList.toggle('current',n===level);$('#all-level-rules').append(row)}
 showClearIfReady();
};
// During a retry the previous clear state must not reopen a completion dialog.
resetGame=function(){survival=null;survivalOldReset();resetSurvival()};
$('#find-enemy').hidden=true;

const assaultOldBossUI=renderBoss;renderBoss=function(){assaultOldBossUI();if(level===5&&survival){$('#boss-guide').hidden=survival.phase!=='free';$('#boss-status').textContent=boss.defeated?'✓ 最终 Boss 已击败':boss.active?'董事长 · 阶段 '+boss.phase+'/3 · '+Math.ceil(boss.hp)+' / '+boss.maxHp:'先清空整页文字与标题，再迎战最终 Boss'}};
