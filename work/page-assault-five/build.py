from pathlib import Path
import json
# Run the current pipeline in memory; preserve all existing production outputs.
script=Path('work/enhanced-five/build.py').read_text()
script=script[:script.index("for p in ['outputs/dreamjob-five-levels/index.html'")]
ns={};exec(compile(script,'work/enhanced-five/build.py','exec'),ns)
exec(compile(Path('work/page-assault-five/apply.py').read_text(),'work/page-assault-five/apply.py','exec'),ns)
out=Path('outputs/dreamjob-page-assault-1-5');out.mkdir(parents=True,exist_ok=True)
(out/'index.html').write_text(ns['s'])
Path('outputs/dreamjob-page-assault-1-5.html').write_text(ns['s'])
(out/'GAME_CONFIG.json').write_text(json.dumps(ns['c'],ensure_ascii=False,indent=2))

# Keep the user's current local preview URL current; the previous HTML is in before-page-assault.zip.
Path('outputs/dreamjob-level1-page-assault.html').write_text(ns['s'])
Path('outputs/dreamjob-level1-page-assault').mkdir(parents=True,exist_ok=True)
Path('outputs/dreamjob-level1-page-assault/index.html').write_text(ns['s'])
Path('outputs/dreamjob-level1-survival.html').write_text(ns['s'])
