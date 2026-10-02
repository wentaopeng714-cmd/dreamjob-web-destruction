// Finite waves are independent from destructible webpage text and from the old three sources.
let waves=null,waveSource=null;
function resetWaves(){const spec=GAME_CONFIG.waves[level];waves=spec?{index:0,killed:0,spawned:0,inWave:0,nextAt:time+.8,warning:null,ended:false,registered:new Set(),defeated:new Set(),total:spec.reduce((a,b)=>a+b,0)}:null;waveSource={id:'wave',spawned:0,items:[]};}
function waveAlive(){return enemies.filter(e=>e.alive&&e.waveMember)}
function waveSpawnPosition(){const w=82,h=52,vw=sw/scale,vh=sh/scale;const minX=clamp(camX+20/scale,8,W-w-8),maxX=clamp(camX+vw-w-20/scale,minX,W-w-8),minY=clamp(camY+playInsets().top/scale+24,90,H-h-45),maxY=clamp(camY+(sh-playInsets().bottom)/scale-h-20,minY,H-h-45);let best=null,bestScore=Infinity;
 const candidates=[];for(const dx of [220,-220,150,-150,310,-310])for(const dy of [-100,80,-170,160])candidates.push({x:clamp(p.x+dx,minX,maxX),y:clamp(p.y+dy,minY,maxY),w,h});
 for(let y=minY;y<=maxY;y+=60)for(let x=minX;x<=maxX;x+=75)candidates.push({x,y,w,h});
 for(const pos of candidates){const dist=Math.hypot(pos.x+w/2-p.x,pos.y+h/2-(p.y-22));if(dist<125||waveAlive().some(e=>Math.hypot(e.x-pos.x,e.y-pos.y)<80))continue;const overlap=query(pos.x,pos.y,w,h,true).reduce((sum,a)=>sum+Math.max(0,Math.min(a.x+a.w,pos.x+w)-Math.max(a.x,pos.x))*Math.max(0,Math.min(a.y+a.h,pos.y+h)-Math.max(a.y,pos.y)),0);const score=overlap*8+Math.abs(dist-230);if(score<bestScore){best=pos;bestScore=score}if(overlap===0&&dist<350)return pos}
 return best||{x:clamp(p.x+(p.x<W/2?200:-280),8,W-w-8),y:clamp(p.y-160,90,H-h-45),w,h};
}
function updateWaves(){if(!waves||paused||ending||settled||growth?.complete||waves.ended)return;const spec=GAME_CONFIG.waves[level],alive=waveAlive();
 if(waves.index>=spec.length||waves.spawned>=waves.total){waves.warning=null;if(!alive.length&&waves.killed===waves.total)finishWaves();return}
 if(waves.inWave===spec[waves.index]&&!alive.length){waves.index++;waves.inWave=0;waves.warning=null;if(waves.index===spec.length){finishWaves();return}waves.nextAt=time+1.5;notify('第 '+waves.index+' 波已清空；下一波 '+(waves.index+1)+' / '+spec.length+'。全关还剩 '+(waves.total-waves.killed)+' 只。',2400)}
 if(waves.inWave>=spec[waves.index]||alive.length>=combatConfig.globalCap)return;
 if(!waves.warning&&time>=waves.nextAt){const type=waves.spawned%3===2?'shooter':'chaser';if(type==='shooter'&&alive.filter(e=>e.type==='shooter').length>=combatConfig.shooterCap)return;waves.warning={at:time,pos:waveSpawnPosition(),type}}
 if(waves.warning&&time-waves.warning.at>=combatConfig.warning){const w=waves.warning;if(spawnEnemy(waveSource,w.type,w.pos)){waves.warning=null;growthDirty=true}}
}
function finishWaves(){if(waves.ended)return;waves.ended=true;waves.index=GAME_CONFIG.waves[level].length;waves.inWave=0;waves.warning=null;enemyShots=enemyShots.filter(b=>b.source==='boss');growthDirty=true;if(level===5)activateBoss();notify(level===5?'20 只小怪已清空，不再刷新。击败最终 Boss 即可五关通关。':'本关 '+waves.total+' 只小怪已清空，停止刷新！',2600)}
function spawnEnemy(source,type,pos){const spec=GAME_CONFIG.waves[level];if(source!==waveSource||!waves||!started||paused||ending||settled||growth?.complete||waves.ended||waves.spawned>=waves.total||waves.index>=spec.length||waves.inWave>=spec[waves.index])return null;const live=waveAlive();if(live.length>=combatConfig.globalCap||type==='shooter'&&live.filter(e=>e.type==='shooter').length>=combatConfig.shooterCap)return null;
 const cfg=combatConfig[type],words=level>=3?STAGES[level].words[type==='chaser'?0:1]:(type==='chaser'?['没经验','不合适','要求高']:['再等等','你不行','别挑了']);const e={kind:'enemy',id:'enemy-'+level+'-'+(++enemySerial),source:source.id,type,text:words[waves.spawned%3],...pos,alive:true,born:time,hp:cfg.hp,vx:0,vy:0,kick:0,onGround:false,hitUntil:0,home:{x:pos.x,y:pos.y},nextAttack:time+combatConfig.shooter.interval-combatConfig.warning,warning:null,waveMember:true,waveIndex:waves.index,counted:false};enemies.push(e);waves.registered.add(e.id);waves.spawned++;waves.inWave++;source.spawned++;waves.nextAt=time+.28;return e;
}

function updateCombat(dt){if(level<2||paused||ending||settled)return;updateWaves();updateBoss(dt);
 for(const e of enemies){if(!e.alive)continue;const cx=e.x+e.w/2,cy=e.y+e.h/2,dx=p.x-cx,dy=p.y-22-cy,dist=Math.hypot(dx,dy);
  if(e.type==='chaser'){const speed=dist>850?Math.max(230,combatConfig.chaser.speed):combatConfig.chaser.speed;e.kick*=Math.exp(-dt*9);const vx=dist>48?dx/Math.max(1,dist)*speed:0,vy=dist>48?dy/Math.max(1,dist)*speed:0;e.x=clamp(e.x+(vx+e.kick)*dt,8,W-e.w-8);e.y=clamp(e.y+vy*dt,75,H-e.h-30);e.onGround=false}else updateShooter(e,dt);
  if(e.alive&&Math.abs(e.x+e.w/2-p.x)<e.w/2+p.w&&e.y<p.y&&e.y+e.h>p.y-p.h)hurtPlayer(e.x+e.w/2);
 }
 updateEnemyShots(dt);spawnLetters=spawnLetters.filter(c=>time-c.born<.24);enemies=enemies.filter(e=>e.alive||time-e.hitUntil<.35);progress();renderBattleUI();
}
function updateShooter(e,dt){const cfg=combatConfig.shooter;if(e.warning){if(time-e.warning.at>=combatConfig.warning){const w=e.warning;if(enemyShots.length<16)enemyShots.push({id:'enemy-shot-'+(++shotSerial),source:e.source,x:e.x+e.w/2,y:e.y+e.h/2,vx:w.dx*cfg.speedBullet,vy:w.dy*cfg.speedBullet,life:cfg.lifeBullet,remaining:cfg.range,text:shotSerial%2?'？':'！'});e.warning=null;e.nextAttack=time+cfg.interval-combatConfig.warning}return}
 const dx=p.x-e.x-e.w/2,dy=p.y-22-e.y-e.h/2,dist=Math.hypot(dx,dy),move=dist>270?1:dist<160?-1:0,speed=dist>850?230:cfg.speed+level*8;e.kick*=Math.exp(-dt*9);e.x=clamp(e.x+(dx/Math.max(1,dist)*move*speed+e.kick)*dt,8,W-e.w-8);e.y=clamp(e.y+dy/Math.max(1,dist)*move*speed*dt+Math.sin(time*2+e.home.x)*dt*4,75,H-e.h-30);
 const aimX=p.x-e.x-e.w/2,aimY=p.y-22-e.y-e.h/2,d=Math.hypot(aimX,aimY);if(time>=e.nextAttack&&d<=cfg.range&&d>1&&lineClear(e.x+e.w/2,e.y+e.h/2,p.x,p.y-22))e.warning={at:time,dx:aimX/d,dy:aimY/d};
}
function hurtEnemy(e,amount,x){if(e.type==='boss'){hurtBoss(amount,x);return}if(!e.alive)return;e.hp-=amount;e.hitUntil=time+.12;e.kick=(e.x+e.w/2>=x?1:-1)*180;
 if(e.hp<=0){e.alive=false;e.warning=null;scatterEnemy(e);award('enemy',combatConfig[e.type].reward);if(e.waveMember&&!e.counted&&waves.registered.has(e.id)&&!waves.defeated.has(e.id)){e.counted=true;waves.defeated.add(e.id);waves.killed=waves.defeated.size;growthDirty=true}}}
function activateBoss(){if(level!==5||boss.active||boss.defeated)return;const x=clamp(p.x+(p.x<W/2?260:-boss.w-260),20,W-boss.w-20),y=clamp(p.y-p.h/2-boss.h/2,100,H-boss.h-40);Object.assign(boss,{active:true,alive:true,x,y,home:{x,y},born:time,nextAttack:time+1.25});renderAirMobility();notify('最终 Boss 登场！空中换位，留意散射和冲刺。',3000);renderBoss();}
function guideNearestEnemy(){const a=level===5&&boss.active&&boss.alive?boss:waveAlive().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(!a){notify('下一波会在你附近出现。',1500);return}camX=clamp(a.x+a.w/2-sw/scale*.5,0,Math.max(0,W-sw/scale));camY=clamp(a.y+a.h/2-sh/scale*.5,0,Math.max(0,H-sh/scale));manualUntil=time+4;updateTransforms();closeGameSheets();focusGame();}
