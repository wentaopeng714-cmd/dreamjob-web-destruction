from pathlib import Path
s=Path('outputs/dreamjob-page-assault-1-5.html').read_text().replace("const STORE='dreamjob.page-assault-trial.v1'","const STORE='dreamjob.page-assault-five-qa.v1'").replace('let run=readRun();','let run=emptyRun();').replace('dreamjob.music.','dreamjob.page-assault-five-qa.music.')
out=Path('outputs/dreamjob-page-assault-1-5/tests');out.mkdir(exist_ok=True)
unit=s.replace('requestAnimationFrame(frame);','/* deterministic */')
for name in ['core','balance']:
 (out/(name+'.html')).write_text(unit.replace('\n}\ninit().catch',Path('work/page-assault-five/'+name+'.js').read_text()+'\n}\ninit().catch'))
qa='''\nconst trace=[],introTrace=[];const qaFinishIntro=finishSurvivalIntro;if(new URLSearchParams(location.search).has('preview'))finishSurvivalIntro=function(){qaFinishIntro();paused=true;$('#paused').style.display='none';};for(const kind of ['pointerdown','pointermove','pointerup'])$('#joy').addEventListener(kind,e=>{trace.push({kind,x:p.x,y:p.y,stick:{...survival?.stick},trusted:e.isTrusted});if(trace.length>15)trace.shift()});const readout=document.createElement('pre');readout.id='qa-state';readout.hidden=true;document.body.append(readout);setInterval(()=>{if(survival?.phase==='intro')introTrace.push({at:survival.introElapsed,y:camY,x:camX,spawned:survival.spawned});readout.textContent=JSON.stringify({level,introTrace,boss:boss?{active:boss.active,hp:boss.hp,phase:boss.phase}:null,phase:survival?.phase,weapon,weaponCounts:survival?.weaponCounts,menu:!$('#assault-menu').hidden,intro:survival?.introElapsed,medkits:survival?.medkits,medkitsPicked:survival?.medkitsPicked,healthRecovered:survival?.healthRecovered,progress:survival?.progress,total:survival?.total,sourceTotal:survival?.sourceTotal,spawned:survival?.spawned,killed:survival?.killed,eliteKills:survival?.eliteKills,eliteTotal:survival?.eliteTotal,ink:survival?.ink,hp:survival?.hp,actors:survival?.actors.filter(e=>e.alive).length,pending:survival?.pending.length,camera:{x:camX,y:camY,scale},player:{x:p.x,y:p.y},route:survival?.routeY,mods,paused,trace})},100);'''
(out/'live.html').write_text(s.replace('\n}\ninit().catch',qa+'\n}\ninit().catch'))


nav=s.replace("const STORE='dreamjob.page-assault-five-qa.v1'","const STORE='dreamjob.page-assault-five-navigation.v1'").replace('let run=emptyRun();',"let run=new URLSearchParams(location.search).get('level')==='1'?emptyRun():readRun();")
bot=Path('work/page-assault-five/balance.js').read_text().split('const output=')[0]
bot=bot.replace("(new URLSearchParams(location.search).get('mode')==='collect'?['collect']:['idle','weave','collect'])","['collect']")
code="const qaRun=document.createElement('button');qaRun.id='qa-run';qaRun.textContent='模拟本关真实战斗';qaRun.style='position:fixed;top:160px;left:10px;z-index:99';document.body.append(qaRun);const navOut=document.createElement('pre');navOut.id='qa-navigation';navOut.hidden=true;document.body.append(navOut);qaRun.onclick=()=>{const saveUI=renderBattleUI,saveS=renderSurvivalUI,saveBoss=renderBoss;"+bot+"renderBattleUI=saveUI;renderSurvivalUI=saveS;renderBoss=saveBoss;clearDialogsEnabled=true;renderGrowth();draw();navOut.textContent=JSON.stringify({level,result:results[0],entry:run.entries[level],previous:run.results[level-1],done:growth.complete,finale:!$('#finale-film').hidden})};"
(out/'navigation.html').write_text(nav.replace('requestAnimationFrame(frame);','/* deterministic */').replace('\n}\ninit().catch',code+'\n}\ninit().catch'))

# Snapshot fixtures stop real battle simulation at a chosen point and draw its actual state.
show=s.replace('requestAnimationFrame(frame);','/* deterministic snapshot */')
showbot=Path('work/page-assault-five/balance.js').read_text().split('const output=')[0].replace("(new URLSearchParams(location.search).get('mode')==='collect'?['collect']:['idle','weave','collect'])","['collect']")
showbot=showbot.replace("steps++<60*420", "steps++<60*420&&(new URLSearchParams(location.search).get('boss')==='1'?(!boss?.active||!boss.warning):time<35)")
showcode="const keepUI=renderBattleUI,keepSurvival=renderSurvivalUI,keepBoss=renderBoss;"+showbot+"renderBattleUI=keepUI;renderSurvivalUI=keepSurvival;renderBoss=keepBoss;renderGrowth();draw();paused=true;$('#paused').style.display='none';"
(out/'showcase.html').write_text(show.replace('\n}\ninit().catch',showcode+'\n}\ninit().catch'))

# Use the actual completed earlier-level loadout to check that growth cannot erase later pressure.
inherited=unit.replace("const STORE='dreamjob.page-assault-five-qa.v1'","const STORE='dreamjob.page-assault-five-navigation.v1'").replace('let run=emptyRun();','let run=readRun();')
(out/'inherited.html').write_text(inherited.replace('\n}\ninit().catch',Path('work/page-assault-five/balance.js').read_text()+'\n}\ninit().catch'))
