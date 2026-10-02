from pathlib import Path
import json,re
root=Path('work/enhanced-five');s=(root/'base.html').read_text();c=json.loads((root/'base-config.json').read_text())
thresholds={1:[70,190,360,600,920,1320],2:[90,230,420,650,930,1210,1510],3:[100,240,410,600,800,1010,1220,1390],4:[110,250,410,580,750,920,1080,1230,1390],5:[120,260,410,550,690,840,990,1140,1280,1420]}
c['thresholds']=thresholds[1];c['level1MaxLevel']=4
for n in range(2,6):c['level'+str(n)]['thresholds']=thresholds[n];c['level'+str(n)]['maxLevel']=n*2+2;c['level'+str(n)]['monsterSize']={'width':82,'height':52}
c['upgrades']['A'] += [23,26,30,34];c['upgrades']['B'] += [{'count':n,'range':350+20*(n-9)} for n in range(9,13)];c['upgrades']['C'] += [205,220,235,250];c['upgrades']['D'] += [.75,.66,.59,.52]
c['growthMetric']='uniqueDestroyedGlyphs';c['level5']['boss'].update(hp=3600,width=260,height=400,reward=500,range=760,activationDistance=720,explosionMultiplier=3)
for p,num in zip(c['level5']['boss']['phases'],[5,7,9]):p['fan']=num
c['music']={'defaultVolume':.28,'maxVolume':.6,'themes':5,'source':'embedded original WebAudio composition'}
s=re.sub(r'const GAME_CONFIG=\{.*?\};\nconst STORE=', 'const GAME_CONFIG='+json.dumps(c,ensure_ascii=False)+';\nconst STORE=',s,count=1,flags=re.S)
def replace(a,b):
 global s
 assert a in s,a[:90]
 s=s.replace(a,b)
replace('Math.min(8,Math.floor(Number(m?.[k])||0))','Math.min(12,Math.floor(Number(m?.[k])||0))')
replace("roman=['','I','II','III','IV','V','VI','VII','VIII']", "roman=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']")
replace('maxModLevel=level>=2?combatConfig.maxLevel:3','maxModLevel=level>=2?combatConfig.maxLevel:GAME_CONFIG.level1MaxLevel')
replace("growth.points+1e-8>=n.threshold||Math.ceil(done*growth.nodes.length/3)>=i+1", "goneGlyphs+1e-8>=n.threshold")
replace("`改造 ${claimed}/${growth.nodes.length} · ${Math.floor(growth.points+1e-6)}${next?' / '+next.threshold:''} 点`", "`改造 ${claimed}/${growth.nodes.length} · 打掉 ${goneGlyphs}${next?' / '+next.threshold:''} 字${next?' · 还差 '+Math.max(0,next.threshold-goneGlyphs)+' 字':''}`")
replace("$('#loadout-mode').textContent=level>=3?", "$('#compact-task').textContent='来源 '+targets.filter(t=>t.done).length+'/3'+(level===5?' · Boss '+(boss.defeated?'✓':'待击败'):'')+(next?' · 下次升级还差 '+Math.max(0,next.threshold-goneGlyphs)+' 字':' · 本关升级已完成');$('#growth-meter').max=next?.threshold||nodeThresholds.at(-1);$('#growth-meter').value=goneGlyphs;$('#mission-completion').textContent='来源 '+targets.filter(t=>t.done).length+' / 3'+(level===5?'　·　Boss '+(boss.defeated?'已击败':'待击败'):'');\n $('#loadout-mode').textContent=level>=3?")
replace("$('#goal-'+t.id).textContent=t.done?", "$('#goal-'+t.id).classList.toggle('done',t.done);const meter=$('#goal-meter-'+t.id);meter.max=Math.ceil(t.items.length*targetFraction());meter.value=t.gone;$('#goal-'+t.id).textContent=t.done?")
replace("row.append(label,button);$('#goals').append(row)", "const meter=document.createElement('progress');meter.id='goal-meter-'+t.id;meter.className='goal-meter';meter.setAttribute('aria-label',t.label+'进度');row.append(label,button,meter);$('#goals').append(row)")
replace("$('#upgrade-title').textContent=`第 ${growth.nodes.indexOf(n)+1} 次改造 · 选择后继续`", "$('#upgrade-title').textContent=`升级已解锁 · 第 ${growth.nodes.indexOf(n)+1} / ${growth.nodes.length} 次改造`")
replace("mods[k]++;choiceNode.state=", "mods[k]++;$('#growth-hud').classList.remove('level-up');void $('#growth-hud').offsetWidth;$('#growth-hud').classList.add('level-up');choiceNode.state=")
replace('<div id="growth-hud">','<div id="growth-hud" class="game-panel"><div class="panel-head"><span>本关任务 / MISSION</span><span id="level-badge"></span><button id="mission-toggle" aria-expanded="true">收起</button></div><div id="compact-task"></div>')
replace('<div id="mission-rule"></div>','<div id="mission-rule"></div><div id="mission-completion"></div>')
replace('<div id="build"></div>', '<progress id="growth-meter" aria-label="打字破坏升级进度"></progress><div id="build"></div>')
replace('id="upgrade"', 'class="game-upgrade" id="upgrade"')
replace('<div id="hud">','<div id="hud" class="game-toolbar">')
replace('<button id="audio"', '<button id="music" aria-label="背景音乐开关" aria-pressed="true">♫ 音乐 待启</button><span id="music-track"></span><input id="music-volume" type="range" min="0" max="60" value="28" aria-label="背景音乐音量"><span class="sep">·</span><button id="audio"')
replace("$('#level-select').value=String(level);", "$('#mission-toggle').onclick=()=>{const closed=$('#growth-hud').classList.toggle('compact');$('#mission-toggle').textContent=closed?'展开':'收起';$('#mission-toggle').setAttribute('aria-expanded',String(!closed));focusGame()};$('#level-badge').textContent='LEVEL 0'+level;$('#level-select').value=String(level);")
# Enlarged enemies use matching real body dimensions and need a suitable gap above nearby text.
replace("query(c.x-80,c.y-12,Math.min(320,W-c.x+80),80,true)", "query(c.x-90,c.y-170,Math.min(360,W-c.x+90),300,true)")
replace("const pos={x:clamp(a.x,8,W-52),y:a.y-23,w:44,h:22};if(Math.hypot(pos.x+22-p.x,pos.y+11-(p.y-22))", "const sz=combatConfig.monsterSize,pos={x:clamp(a.x,8,W-sz.width-8),y:a.y-sz.height,w:sz.width,h:sz.height};if(Math.hypot(pos.x+pos.w/2-p.x,pos.y+pos.h/2-(p.y-22))")
# Remove the old extra one-shooter restriction; the configured per-stage cap is authoritative.
replace("if(t.warning.type==='shooter'&&enemies.some(e=>e.alive&&e.type==='shooter'))", "if(t.warning.type==='shooter'&&enemies.filter(e=>e.alive&&e.type==='shooter').length>=cfg.shooterCap)")
s=re.sub(r' for\(const e of enemies\)\{if\(!e.alive&&!e.hushUntil\).*?\n for\(const b of enemyShots\)', ' for(const e of enemies){if(e.alive||e.hushUntil)drawMonster(e)}\n for(const b of enemyShots)',s,count=1,flags=re.S)
replace('const t=segmentBox(b.x,b.y,nx,ny,a);if(t!==null)collisions.push', 'const t=actorSegment(b.x,b.y,nx,ny,a);if(t!==null)collisions.push')
replace('const t=segmentBox(from.x,from.y,to.x,to.y,a,8);', 'const t=actorSegment(from.x,from.y,to.x,to.y,a,8);')
replace("const dx=x-clamp(x,a.x,a.x+a.w),dy=y-clamp(y,a.y,a.y+a.h);if(dx*dx+dy*dy<=r*r)","if(actorBlastDistance(x,y,a)<=r)")
# Same shape collection paints the executive and receives bullets, blasts and eraser beams.
replace('// A compact word boss shares', (root/'actors.js').read_text()+'\n// A large fictional executive shares')
replace("left=clamp(a.x-220,20,W-boss.w-20),right=clamp(a.x+220,20,W-boss.w-20)", "left=clamp(a.x-340,20,W-boss.w-20),right=clamp(a.x+340,20,W-boss.w-20)")
replace('y:Math.max(100,a.y-82),home:{x:a.x,y:a.y-60}', 'y:Math.max(100,a.y-boss.h+20),home:{x:a.x,y:a.y-boss.h+20}')
replace('boss.phase=next;notify(', 'boss.phase=next;notify(')
replace("const block=!lineClear(cx,cy,nx+boss.w/2,ny+boss.h/2);", "const block=bossRushBlocked(nx,ny);")
replace("const base=Math.atan2(tell.dy,tell.dx),span=.78+(boss.phase-1)*.12;", "const origin=bossMuzzle(tell.side),base=Math.atan2(tell.dy,tell.dx),span=.85+(boss.phase-1)*.14;")
replace("source:'boss',x:cx,y:cy", "source:'boss',x:origin.x,y:origin.y")
replace('Math.max(100,a.y-250),Math.min(H-boss.h-45,a.y+200)', 'Math.max(100,a.y-boss.h-260),H-boss.h-45')
replace("const aimX=p.x-boss.x-boss.w/2,aimY=p.y-24-boss.y-boss.h/2,dist=Math.hypot(aimX,aimY);", "const side=p.x<boss.x+boss.w/2?-1:1,m=bossMuzzle(side),aimX=p.x-m.x,aimY=p.y-24-m.y,dist=Math.hypot(aimX,aimY);")
replace("lineClear(boss.x+boss.w/2,boss.y+boss.h/2,p.x,p.y-24))boss.warning={at:time,dx:aimX/dist,dy:aimY/dist", "lineClear(m.x,m.y,p.x,p.y-24))boss.warning={at:time,side,dx:aimX/dist,dy:aimY/dist")
replace('Math.abs(boss.x+boss.w/2-p.x)<boss.w/2+p.w&&boss.y<p.y&&boss.y+boss.h>p.y-p.h', 'bossTouchesPlayer()')
replace('boss.warning=null;boss.dash=null;enemyShots=', 'boss.warning=null;boss.dash=null;boss.deathAt=time;enemyShots=')
replace("boss.text:'", "boss.text:'") if "boss.text:'" in s else None
replace("text:'绩效审判'", "text:'绩效审判'")
replace("Math.min(3,amount*.2)", "Math.min(1.2,amount*.12)")
new_draw='''function drawBoss(){
 if(level!==5||!boss?.active)return;
 if(!boss.alive){if(boss.defeated&&time-boss.deathAt<1){const f=time-boss.deathAt;ctx.save();ctx.globalAlpha=1-f;ctx.translate((boss.x+boss.w/2)*f,0);ctx.scale(1-f,1);drawExecutive();ctx.restore()}return}
 drawExecutive();ctx.save();ctx.textAlign='center';ctx.textBaseline='bottom';ctx.font='bold 19px Arial';ctx.fillStyle='#912e42';ctx.fillText('董事长 · 绩效审判',boss.x+boss.w/2,boss.y-21);ctx.fillStyle='#17293b';ctx.fillRect(boss.x+5,boss.y-16,boss.w-10,7);ctx.fillStyle='#e67960';ctx.fillRect(boss.x+5,boss.y-16,(boss.w-10)*boss.hp/boss.maxHp,7);
 if(boss.warning){const w=boss.warning,m=bossMuzzle(w.side),spec=combatConfig.boss.phases[boss.phase-1],f=clamp((time-w.at)/spec.warning,0,1);ctx.globalAlpha=.4+f*.5;ctx.strokeStyle=w.type==='rush'?'#eb5d6a':'#d48f32';ctx.lineWidth=w.type==='rush'?5:2;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+w.dx*(w.type==='rush'?235:190),m.y+w.dy*(w.type==='rush'?235:190));ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(m.x,m.y,35,-Math.PI/2,-Math.PI/2+Math.PI*2*f);ctx.stroke();ctx.fillStyle='#9c293e';ctx.font='bold 14px Arial';ctx.fillText(w.type==='rush'?'冲刺预告 · 换位躲开':'散射预告 · 留意空隙',boss.x+boss.w/2,boss.y-48)}
 if(hitDebug){ctx.strokeStyle='#bd38a7';for(const s of shapeParts(boss)){ctx.beginPath();if(s.kind==='ellipse')ctx.ellipse(s.x,s.y,s.rx,s.ry,0,0,Math.PI*2);else{ctx.moveTo(...s.points[0]);s.points.slice(1).forEach(q=>ctx.lineTo(...q));ctx.closePath()}ctx.stroke()}}ctx.restore();
}
'''
s=re.sub(r'function drawBoss\(\)\{.*?\n\}\n(?=\$\(\x27#boss-guide)',new_draw,s,count=1,flags=re.S)
replace('function bossMuzzle(){return {x:boss.x+(p.x<boss.x+boss.w/2?-3:boss.w+3)', 'function bossMuzzle(side=p.x<boss.x+boss.w/2?-1:1){return {x:boss.x+(side<0?-3:boss.w+3)')
replace("$('#boss-status').textContent=boss.defeated?'✓ 绩效审判已击败'", "$('#boss-status').textContent=boss.defeated?'✓ 董事长已击败'")
# The browser's user gesture starts both audio systems; each has its own toggle.
replace('if(muted)return;\n try{if(!audioCtx)', 'if(muted&&!musicEnabled)return;\n try{if(!audioCtx)')
replace("audioCtx.resume().catch(()=>{})}catch(e)", "audioCtx.resume().then(musicReady).catch(()=>{});musicReady()}catch(e)")
replace('function wrapText(){', (root/'music.js').read_text()+'\nfunction wrapText(){')
replace('resetGrowth();lastShot=-100;', 'restartMusic();resetGrowth();lastShot=-100;')
replace("if(musicEnabled){begin();unlockAudio();musicReady()}", "if(musicEnabled){begin();unlockAudio();musicReady()}")
# Starting music via its initial button is a clear gesture, not a request to mute it.
replace("$('#music').onclick=()=>{musicEnabled=!musicEnabled;", "$('#music').onclick=()=>{if(musicEnabled&&(!started||audioCtx?.state==='suspended')){begin();unlockAudio();musicReady();renderMusic();return}musicEnabled=!musicEnabled;")
replace('hurtEnemy(a,getWeaponStats().grenadeDamage,x)',"hurtEnemy(a,getWeaponStats().grenadeDamage*(a.type==='boss'?combatConfig.boss.explosionMultiplier:1),x)")
# Remove obsolete three-upgrade hints; stage-specific copy stays intact.
replace("$('#ending p').textContent=STAGES[level].comfort;}", "$('#ending p').textContent=STAGES[level].comfort;}\n$('#hint-copy').innerHTML=(level===5?'关闭三处来源并击败巨大董事长。<br>三阶段预告攻击；护盾归零会让 Boss 回血 12%。<br>Boss 抵抗副弹，榴弹命中有 3 倍破甲伤害。<br>':'三处各拆掉 '+Math.round(targetFraction()*100)+'% 即可通关。<br>')+'本关 '+nodeThresholds.length+' 次改造，上限 '+roman[maxModLevel]+'。<br>打掉 '+nodeThresholds[0]+' 字解锁首次升级；完成任务后也可继续拆。<br>开始移动或射击后，播放本关专属音乐。';")
# First / second hint and stage outline must agree with the real node counts.
replace("wrapText();measure();resize();resetGrowth();", "wrapText();measure();resize();for(const n of nodeThresholds)if(n>glyphs.length)console.warn('Upgrade threshold exceeds available glyphs',level,n,glyphs.length);resetGrowth();")
s=s.replace('进阶 · 5 次改造','进阶 · 8 次改造').replace('高压 · 5 次改造','高压 · 9 次改造').replace('极难 · Boss 战 · 4 次改造','极难 · Boss 战 · 10 次改造')
s=s.replace('</style>',(root/'interface.css').read_text()+'</style>',1)
exec(Path('work/boss-air/apply.py').read_text())
exec(Path('work/mobile-wave/apply.py').read_text())
exec(Path('work/level-standards/apply.py').read_text())
exec(Path('work/finale-video/apply.py').read_text())
for p in ['outputs/dreamjob-five-levels/index.html','outputs/dreamjob-levels-1-5.html','outputs/dreamjob-levels-1-2.html','outputs/dreamjob-levels-1-5-enhanced.html','outputs/dreamjob-boss-air-combat.html','outputs/dreamjob-mobile-waves.html','outputs/dreamjob-clear-standards.html','outputs/dreamjob-finale-video.html']:Path(p).write_text(s)
Path('outputs/dreamjob-five-levels/GAME_CONFIG.json').write_text(json.dumps(c,ensure_ascii=False,indent=2))
