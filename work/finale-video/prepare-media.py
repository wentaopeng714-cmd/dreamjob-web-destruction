"""Optional preparation for this exact user-supplied clip. Build uses checked-in assets."""
from pathlib import Path
import subprocess,sys
source=Path(sys.argv[1]).resolve()
assets=Path(__file__).resolve().parent/'assets'
subprocess.run(['ffmpeg','-v','error','-i',str(source),'-vf','crop=1080:580:0:702','-c:v','libx264','-preset','medium','-crf','20','-profile:v','high','-level','4.0','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-y',str(assets/'ending.mp4')],check=True)
subprocess.run(['ffmpeg','-v','error','-ss','5','-i',str(assets/'ending.mp4'),'-frames:v','1','-vf','scale=540:-2','-y',str(assets/'preview.jpg')],check=True)
