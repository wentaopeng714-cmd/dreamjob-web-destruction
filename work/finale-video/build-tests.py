from pathlib import Path
s=Path('outputs/dreamjob-five-levels/index.html').read_text().replace("const STORE='dreamjob.two-levels.v2'","const STORE='dreamjob.finale.qa.v1'").replace('dreamjob.music.','dreamjob.finale.music.').replace('let run=readRun();','let run=emptyRun();')
out=Path('outputs/dreamjob-five-levels/finale-tests');out.mkdir(exist_ok=True)
qa=Path('work/level-standards/live.js').read_text()
qa+='''
if(new URLSearchParams(location.search).has('tail'))$('#finale-video').addEventListener('playing',()=>{$('#finale-video').currentTime=26.8},{once:true});
const probe=document.createElement('pre');probe.id='video-state';probe.hidden=true;document.body.append(probe);setInterval(()=>{const v=$('#finale-video');probe.textContent=JSON.stringify({visible:!$('#finale-film').hidden,paused:v.paused,time:v.currentTime,duration:v.duration,ready:v.readyState,error:v.error?.code,ended:v.ended,gamePaused:paused,dialog:!$('#clear-dialog').hidden,wavesStopped:!waveAlive().length&&waves?.ended,bossDefeated:boss?.defeated})},100);
'''
(out/'live.html').write_text(s.replace('\n}\ninit().catch',qa+'\n}\ninit().catch'))
# Simulation tests use the real victory flow, without sound or autonomous animation.
helpers=Path('work/level-standards/tests.js').read_text().split('fresh();check(')[0].replace('qaNext=null','')
unit=s.replace('requestAnimationFrame(frame);','/* deterministic */')
(out/'core.html').write_text(unit.replace('\n}\ninit().catch',helpers+Path('work/finale-video/tests.js').read_text()+'\n}\ninit().catch'))
