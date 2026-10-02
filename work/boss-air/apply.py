# Applied after the previous enhancement pipeline, preserving its existing source.
airroot=Path('work/boss-air')
c['airMobility']={'remainingGlyphRatio':.04,'speed':300,'trigger':'bossEncounterOrNearlyClearedPage'}
c['level5']['boss'].update(dashSpeed=390,dashDuration=.6,roamSpeed=140,catchupSpeed=420,roamAmplitude=140,roamBounds='document')
s=re.sub(r'const GAME_CONFIG=\{.*?\};\nconst STORE=', 'const GAME_CONFIG='+json.dumps(c,ensure_ascii=False)+';\nconst STORE=',s,count=1,flags=re.S)
replace('<div id="boss-status"></div>', '<div id="boss-status"></div><div id="boss-attack-cue" hidden></div>')
replace('<div id="controls">', '<div id="boss-alert" hidden aria-live="off"></div><div id="controls">')
replace('<div id="build"></div>', '<div id="air-status" hidden></div><div id="build"></div>')
replace('function doJump(){', (airroot/'mobility.js').read_text()+'\nfunction doJump(){')
replace('function resetBoss(){', 'function resetBoss(){\n resetBossVfx();')
replace('function updateBoss(dt){', (airroot/'effects.js').read_text()+'\nfunction updateBoss(dt){')
s,n=re.subn(r'function updateBoss\(dt\)\{.*?\n\}\n(?=function drawBoss)',(airroot/'behavior.js').read_text(),s,count=1,flags=re.S);assert n==1
replace('drawExecutive();ctx.save();ctx.textAlign', 'drawBossRushTrails();drawExecutive();ctx.save();ctx.textAlign')
pos=s.index(' if(boss.warning){const w=boss.warning,m=bossMuzzle');end=s.index('\n if(hitDebug)',pos);s=s[:pos]+' drawBossWarning();drawBossAttackEffects();'+s[end:]
replace("$('#boss-guide').disabled=paused||ending||settled||boss.defeated;", "$('#boss-guide').disabled=paused||ending||settled||boss.defeated;renderBossAttackCue();")
replace("notify('绩效审判出现：先看预告，再躲散射或冲刺。',3200)", "airMobilityAvailable();renderAirMobility();notify('Boss 出现：空中借力已启用，按住空格 / W 上升，S 下降，松开悬停。',4500)")
replace("for(const b of enemyShots){ctx.fillStyle='#ac7770';", "for(const b of enemyShots){if(b.source==='boss'){drawBossProjectile(b);continue}ctx.fillStyle='#ac7770';")
replace('b.life-=d;b.remaining-=d*speed;', 'b.life-=d;b.remaining-=d*speed;b.age=(b.age||0)+d;')
replace("if(hit!==null&&hit<wall){hurtPlayer(b.x);enemyShots.splice(i,1);continue}", "if(hit!==null&&hit<wall){if(b.source==='boss')bossVfx('impact',{x:b.x+(nx-b.x)*hit,y:b.y+(ny-b.y)*hit,phase:b.phase});hurtPlayer(b.x);enemyShots.splice(i,1);continue}")
replace("if(wall!==Infinity||b.life<=1e-8", "if(wall!==Infinity&&b.source==='boss')bossVfx('impact',{x:b.x+(nx-b.x)*wall,y:b.y+(ny-b.y)*wall,phase:b.phase});\n  if(wall!==Infinity||b.life<=1e-8")
replace("function move(dt){\n const left=", "function move(dt){\n const air=airMobilityAvailable();renderAirMobility(air);\n const left=")
start=s.index(' if(dropping){p.drop=.18;');end=s.index('\n let prevY=p.y;',start);normal=s[start:end]
s=s[:start]+' if(air){updateAirVelocity(dt,dropping)}else{\n'+normal+'\n }'+s[end:]
replace('p.x=clamp(p.x+p.vx*dt,8,W-8);p.vy=Math.min(p.vy+G*dt,950);', 'p.x=clamp(p.x+p.vx*dt,8,W-8);if(!air)p.vy=Math.min(p.vy+G*dt,950);')
replace('else{p.x=spawn.x;p.y=H-24;p.onGround=true}', 'else if(airMobilityAvailable()){p.x=clamp(p.x,8,W-8);p.y=clamp(p.y,44,H-25);p.onGround=false}else{p.x=spawn.x;p.y=H-24;p.onGround=true}')
replace("if(message)notify('回到还能站立的文字上。',1600)", "if(message)notify(airMobilityAvailable()?'空中借力可用：空格 / W 上升，S 下降；回位不再强制落到底部。':'回到还能站立的文字上。',2600)")
replace("if(a==='jump')doJump();", "if(a==='jump'){mobileKeys.add('jump');doJump()}")
replace('drawTargetGuide();drawCombat();drawBoss();', 'drawTargetGuide();drawCombat();drawBoss();drawAirSupport();')
replace("progress();updateTransforms();renderGrowth();focusGame();\n}", "resetAirMobility();progress();updateTransforms();renderGrowth();focusGame();\n}")
replace("resetGrowth();saveRun();$('#next-level')", "resetGrowth();resetAirMobility();saveRun();$('#next-level')")
replace('空格跳跃 / 二段跳　·　S 下落', '空格跳跃 / 二段跳　·　S 下落（空中借力时：按住空格上升，松开悬停）')
replace('关闭三处来源并击败巨大董事长。<br>', '关闭三处来源并击败巨大董事长。<br>Boss 战自动开启空中借力：空格 / W 上升，S 下降，松开悬停。<br>')
s=s.replace('</style>',(airroot/'interface.css').read_text()+'</style>',1)

replace("$('#boss-guide').onclick=()=>{if(level!==5||paused||ending||settled)return;const a=bossAnchor();", "$('#boss-guide').onclick=()=>{if(level!==5||paused||ending||settled)return;const a=boss.active&&boss.alive?{x:boss.x+boss.w/2,y:boss.y+boss.h/2}:bossAnchor();")
replace("notify('靠近最终评估，关闭三处来源并击败 Boss；定位不会移动小人。',3500)", "notify(boss.active&&boss.alive?'已定位移动中的 Boss；按住空格 / W 上升，S 下降，松开悬停。':'靠近最终评估，关闭三处来源并击败 Boss；定位不会移动小人。',3500)")
