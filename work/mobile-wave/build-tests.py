from pathlib import Path
s=Path('outputs/dreamjob-five-levels/index.html').read_text().replace("const STORE='dreamjob.two-levels.v2'","const STORE='dreamjob.mobile.qa'").replace('dreamjob.music.', 'dreamjob.mobile.qa.music.').replace('let run=readRun();','let run=emptyRun();').replace('requestAnimationFrame(frame);','/* deterministic */')
s=s.replace('clearDialogsEnabled=true','clearDialogsEnabled=false')
out=Path('outputs/dreamjob-five-levels/mobile-tests');out.mkdir(exist_ok=True)
old=Path('work/growth/regression.html').read_text();code=old[old.index('const rows=[];'):old.rindex('\n}\ninit().catch')].replace('glyphs[1450]','glyphs[Math.floor(glyphs.length*.8)]').replace('&&p.y>y','')
code=code.replace("for(const [label,selector,kind='glyph'] of cases)","if(level>=2)for(const c of cases){if(c[1]==='.search .glyph')c[1]='.inbox-search .glyph';if(c[1]==='.search')c[1]='.inbox-search';if(c[0]==='notice background'){c[1]='.chat-msg.mine .glyph';c[2]='glyph'}if(c[0]==='heading rule')c[1]='.conversation-heading'}\nfor(const [label,selector,kind='glyph'] of cases)").replace("surfaces.find(a=>a.el.matches('.notice'))","surfaces.find(a=>a.el.matches(level>=2?'.inbox-search':'.notice'))").replace('x:surface.x+300','x:surface.x+surface.w*.5')
(out/'foundation.html').write_text(s.replace('\n}\ninit().catch','musicEnabled=false;muted=true;'+code+'\n}\ninit().catch'))
(out/'core.html').write_text(s.replace('\n}\ninit().catch',Path('work/mobile-wave/test.js').read_text()+'\n}\ninit().catch'))
for name in ['layout','stress','live','navigation']:
 main=s
 if name in ['live','navigation']:main=main.replace('/* deterministic */','requestAnimationFrame(frame);')
 if name=='navigation':main=main.replace('let run=emptyRun();','let run=readRun();').replace('dreamjob.mobile.qa','dreamjob.mobile.navigation.v1')
 (out/(name+'.html')).write_text(main.replace('\n}\ninit().catch',(Path('work/mobile-wave')/(name+'.js')).read_text()+'\n}\ninit().catch'))

for name in ['audio','live-audio']:
 main=s.replace('/* deterministic */','requestAnimationFrame(frame);') if name=='live-audio' else s
 (out/(name+'.html')).write_text(main.replace('\n}\ninit().catch',Path('work/enhanced-five/'+name+'.js').read_text()+'\n}\ninit().catch'))
for name in ['visual','boss-visual']:
 main=s.replace('/* deterministic */','requestAnimationFrame(frame);')
 code="musicEnabled=false;muted=true;begin();"
 if name=='boss-visual':code+="invincibleUntil=time+5;let step=0;while(!waves.ended&&step++<3000){time+=1/60;updateCombat(1/60);for(const e of waveAlive())hurtEnemy(e,1e6,p.x);progress()}camX=clamp(p.x-85/scale,0,W-sw/scale);camY=clampCameraY(p.y-sh/scale*.47);boss.x=clamp(p.x+100,20,W-boss.w-20);boss.y=clamp(p.y-230,100,H-boss.h-40);boss.warning={at:time,dx:-1,dy:.12,side:-1,type:'fan'};boss.nextAttack=time+10;manualUntil=time+3;renderBoss();updateTransforms();"
 (out/(name+'.html')).write_text(main.replace('\n}\ninit().catch',code+'\n}\ninit().catch'))
