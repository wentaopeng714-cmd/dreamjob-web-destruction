from pathlib import Path
import subprocess,sys,shutil
root=Path(__file__).resolve().parent
(root/'outputs/dreamjob-five-levels').mkdir(parents=True,exist_ok=True)
subprocess.run([sys.executable,'work/enhanced-five/build.py'],cwd=root,check=True)
(root/'docs').mkdir(exist_ok=True)
shutil.copyfile(root/'outputs/dreamjob-finale-video.html',root/'docs/index.html')
(root/'docs/.nojekyll').touch()
print('Ready: docs/index.html')
