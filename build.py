from pathlib import Path
import subprocess,sys,shutil
root=Path(__file__).resolve().parent
subprocess.run([sys.executable,'work/page-assault-five/build.py'],cwd=root,check=True)
(root/'docs').mkdir(exist_ok=True)
shutil.copyfile(root/'outputs/dreamjob-page-assault-1-5/index.html',root/'docs/index.html')
(root/'docs/.nojekyll').touch()
print('Ready: docs/index.html')
