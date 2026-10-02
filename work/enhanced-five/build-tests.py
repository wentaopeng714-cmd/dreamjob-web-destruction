from pathlib import Path
s=Path('outputs/dreamjob-five-levels/index.html').read_text().replace("const STORE='dreamjob.two-levels.v2'","const STORE='dreamjob.enhanced.test'").replace("dreamjob.music.enabled","dreamjob.enhanced.test.music.enabled").replace("dreamjob.music.volume","dreamjob.enhanced.test.music.volume").replace('let run=readRun();',"let run=emptyRun();").replace('requestAnimationFrame(frame);','/* deterministic clock */')
out=Path('outputs/dreamjob-five-levels/current-tests');out.mkdir(exist_ok=True)
old=Path('work/growth/regression.html').read_text();code=old[old.index('const rows=[];'):old.rindex('\n}\ninit().catch')].replace('glyphs[1450]','glyphs[Math.floor(glyphs.length*.8)]')
code=code.replace("for(const [label,selector,kind='glyph'] of cases)","if(level>=2)for(const c of cases){if(c[1]==='.search .glyph')c[1]='.inbox-search .glyph';if(c[1]==='.search')c[1]='.inbox-search';if(c[0]==='notice background'){c[1]='.chat-msg.mine .glyph';c[2]='glyph'}if(c[0]==='heading rule')c[1]='.conversation-heading'}\nfor(const [label,selector,kind='glyph'] of cases)")
code=code.replace("surfaces.find(a=>a.el.matches('.notice'))","surfaces.find(a=>a.el.matches(level>=2?'.inbox-search':'.notice'))").replace('x:surface.x+300','x:surface.x+surface.w*.5')
(out/'foundation.html').write_text(s.replace('\n}\ninit().catch','musicEnabled=false;muted=true;'+code+'\n}\ninit().catch'))
for name in ['core','audio','balance','boss','demo','stress','navigation','live-audio','enemy']:
 p=Path('work/enhanced-five/'+name+'.js')
 if p.exists():
  main=s.replace('/* deterministic clock */','requestAnimationFrame(frame);') if name in ['demo','live-audio','enemy'] else s
  if name=='navigation':main=main.replace('let run=emptyRun();','let run=readRun();').replace('dreamjob.enhanced.test\'','dreamjob.enhanced.navigation.air.v1\'')
  (out/(name+'.html')).write_text(main.replace('\n}\ninit().catch',p.read_text()+'\n}\ninit().catch'))

for name,filename in [('air-tests','test'),('air-visual','visual-demo'),('air-live','live-demo')]:
 main=s.replace('dreamjob.enhanced.test','dreamjob.air.current.test')
 if name=='air-live':main=main.replace('/* deterministic clock */','requestAnimationFrame(frame);')
 (out/(name+'.html')).write_text(main.replace('\n}\ninit().catch',Path('work/boss-air/'+filename+'.js').read_text()+'\n}\ninit().catch'))
