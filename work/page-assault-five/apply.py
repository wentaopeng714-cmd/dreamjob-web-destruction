surv=Path('work/page-assault-five')
s=s.replace('dreamjob.growth.v1','dreamjob.page-assault-legacy.v1')
replace("const STORE='dreamjob.two-levels.v2'","const STORE='dreamjob.page-assault-trial.v1'")
replace("const nodeThresholds=level>=2?combatConfig.thresholds:GAME_CONFIG.thresholds", "const nodeThresholds=level>=2?combatConfig.thresholds:[40,140,300,540,850,1200]")
replace('<nav id="weapon-dock"',(surv/'ui.html').read_text()+'\n<nav id="weapon-dock"')
# Empty paper after the original page; this contributes no platform or invincible terrain.
replace('async function init(){', '{const arena=document.createElement("section");arena.id="survival-arena";arena.setAttribute("aria-label","招聘页底部出发区");page.append(arena)}\nasync function init(){')
replace('if(!paused){time+=dt;if(started&&!ending&&!settled)', 'if(survival&&survival.phase!==\'free\'){survivalFrame(dt);renderBattleUI();draw();requestAnimationFrame(frame);return}\n if(!paused){time+=dt;if(started&&!ending&&!settled)')
replace('function frame(ts){',(surv/'engine.js').read_text()+'\n'+(surv/'boss.js').read_text()+'\n'+(surv/'pressure.js').read_text()+'\n'+(surv/'flow.js').read_text()+'\nfunction frame(ts){')
replace('setupGameUI();saveRun();','setupGameUI();resetSurvival();saveRun();')
replace('if(level!==1)return;\n for(const t of targets)', 'if(level!==1||survival)return;\n for(const t of targets)')
replace('(goneGlyphs+1e-8>=n.threshold)', '((survival?survival.ink:goneGlyphs)+1e-8>=n.threshold)')
replace("growth.complete=level===1?done===3:!!waves&&waves.ended&&waves.killed===waves.total&&(level!==5||boss.defeated);","growth.complete=!!survival&&['clear','free'].includes(survival.phase);")
replace("function levelRule(n){if(n===1)return '拆除 3 处压力话语，各打掉 40%';const total=GAME_CONFIG.waves[n].reduce((a,b)=>a+b,0);return '击败 '+total+' 只小怪'+(n===5?'，再击败最终 Boss':'')}","function levelRule(n){return '推进到页顶，清空全页文字与标题'+(n===5?'，再击败最终 Boss':'')}")
replace("$('#clear-detail').textContent=level===1?'三处话语已拆除。':waves.killed+' / '+waves.total+' 只小怪已击败，刷新已停止。'+(level===5?'最终 Boss 已击败。':'');", "$('#clear-detail').textContent=survival.killed+' / '+survival.total+' 个字、'+survival.eliteKills+' / '+survival.eliteTotal+' 个标题全部清空。'+(level===5?'最终 Boss 已击败。':'');")
replace('drawTargetGuide();drawWaveWarning();drawCombat();drawBoss();drawAirSupport();',"if(!survival||survival.phase==='free')drawTargetGuide();drawWaveWarning();drawCombat();drawBoss();if(survival&&survival.phase!=='free')drawSurvivalWorld();else drawAirSupport();")
replace('#clear-dialog,#clear-screen\'', '#clear-dialog,#clear-screen,#survival-guide,#survival-overlay,#assault-menu,#assault-intro\'')
# Gameplay mouse clicks cannot silently destroy stationary webpage content in this trial.
replace("if(uiTarget(e.target)||paused||ending||settled)return;focusGame();begin();", "if(uiTarget(e.target)||paused||ending||settled)return;focusGame();begin();if(survival&&survival.phase!==\'free\')return;")
replace("window.addEventListener('wheel',e=>{if(ending", "window.addEventListener('wheel',e=>{if(uiTarget(e.target))return;if(survival&&survival.phase!==\'free\'){e.preventDefault();return}if(ending")
s=s.replace('</style>',(surv/'ui.css').read_text()+'</style>',1)
c['pageAssaultFive']={'advanceWorldPerSecond':34,'letterSpeed':160,'maxActive':64,'source':'all original webpage glyphs','direction':'bottom to top','spawn':'native source coordinates','trialStorage':'dreamjob.page-assault-trial.v1'}

# Direct level selection has a viable loadout; a completed earlier level still wins.
replace("level>=3?STAGES[level].starter:null", "level>=2?({2:{A:3,B:1,C:0,D:0},3:{A:5,B:2,C:1,D:1},4:{A:7,B:3,C:2,D:2},5:{A:9,B:4,C:3,D:3}})[level]:null")
replace("run.practice[level]=level>=3&&!inherited", "run.practice[level]=level>=2&&!inherited")
replace("$('#loadout-mode').textContent=level>=3?", "$('#loadout-mode').textContent=level>=2?")

# Export the same difficulty profiles used by the actual battle loop.
import json,re
profile_source=(surv/'engine.js').read_text().split('const ASSAULT_PROFILES=',1)[1].split(';\nconst PAGE_ASSAULT=',1)[0]
profile_source=re.sub(r'([,{]\s*)([A-Za-z][A-Za-z0-9]*|[1-5]):',r'\1"\2":',profile_source).replace("'",'"')
profile_source=re.sub(r'(?<=:)\.(\d+)',r'0.\1',profile_source)
c['pageAssaultFive']['profiles']=json.loads(profile_source)
c['pageAssaultFive']['difficultyRevision']='2026-10-03'

replace('if(e.metaKey||e.ctrlKey||e.altKey)return;',"if(!$('#assault-menu').hidden)return;if(survival?.phase==='intro'){if(['Escape',' '].includes(e.key)){e.preventDefault();finishSurvivalIntro()}return;}if(e.metaKey||e.ctrlKey||e.altKey)return;")
c['pageAssaultFive']['presentation']={'startMenu':'five stage themes','introSeconds':5.8,'skip':True,'weaponSwitch':'selected main weapon with lower frequency support','medkitBudgets':[5,4,3,3,3],'medkitHeal':2,'medkitLifetimeSeconds':16}
