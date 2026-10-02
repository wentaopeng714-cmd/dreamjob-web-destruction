from pathlib import Path
s=Path('outputs/dreamjob-five-levels/index.html').read_text().replace("const STORE='dreamjob.two-levels.v2'","const STORE='dreamjob.standards.qa.v1'").replace('dreamjob.music.','dreamjob.standards.music.').replace('let run=readRun();','let run=emptyRun();').replace('requestAnimationFrame(frame);','/* deterministic */')
out=Path('outputs/dreamjob-five-levels/standards-tests');out.mkdir(exist_ok=True)
# Tests call the actual clear flow, observing the next-stage handoff without leaving the assertions.
a=s.index('function goLevel(n){');b=s.index('\nfunction newRun()',a);unit=s[:a]+'let qaNext=null;function goLevel(n){qaNext=n;}'+s[b:]
(out/'core.html').write_text(unit.replace('\n}\ninit().catch',Path('work/level-standards/tests.js').read_text()+'\n}\ninit().catch'))
live=s.replace('/* deterministic */','requestAnimationFrame(frame);').replace('let run=emptyRun();','let run=readRun();').replace('dreamjob.standards.qa.v1','dreamjob.standards.navigation.v1')
(out/'live.html').write_text(live.replace('\n}\ninit().catch',Path('work/level-standards/live.js').read_text()+'\n}\ninit().catch'))
helpers=Path('work/level-standards/tests.js').read_text().split('fresh();check(')[0]
(out/'clear-layout.html').write_text(unit.replace('\n}\ninit().catch',helpers+Path('work/level-standards/clear-layout.js').read_text()+'\n}\ninit().catch'))
