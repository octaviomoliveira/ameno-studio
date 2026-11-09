"""Publish all R036 Topaz takes as 4K60 web copies; never modify sources."""
import hashlib, json, pathlib, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'public/experiences/bom-jesus'
SOURCE=pathlib.Path('D:/Unreal/Projects/BomJesus/Renders/R035_Clean/GateTV_20261105_032103/Delivery/Upscale')
QUEUE=pathlib.Path('D:/Unreal/Projects/BomJesus/Audit/Interativo_R036/phase_two_manifest.json')
def probe(f):
 d=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_frames,pix_fmt:format=duration','-of','json',str(f)]))
 return dict(d['streams'][0],duration=float(d['format']['duration']))
def main():
 takes=json.loads(QUEUE.read_text(encoding='utf-8-sig')); rows=[]
 dest=BASE/'media/r036-topaz';dest.mkdir(exist_ok=True)
 for i,t in enumerate(takes):
  name='video_'+t['id']+'.mp4';src=SOURCE/('video_'+t['id']+'_apo8_prob4.mp4'); out=dest/name
  original=probe(src)
  assert (original['width'],original['height'],original['avg_frame_rate'])==(3840,2160,'60/1')
  if not out.exists():
   tmp=dest/(name+'.tmp.mp4')
   subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-an','-c:v','h264_nvenc','-preset','p7','-tune','hq','-rc','vbr','-cq','18','-b:v','0','-maxrate','35M','-bufsize','70M','-spatial-aq','1','-temporal-aq','1','-pix_fmt','yuv420p','-g','60','-movflags','+faststart',str(tmp)],check=True)
   tmp.replace(out)
  result=probe(out)
  for k in ['width','height','avg_frame_rate','nb_frames']:assert result[k]==original[k],(name,k,result,original)
  assert result['codec_name']=='h264' and result['pix_fmt']=='yuv420p'
  assert out.stat().st_size <95*1024*1024
  rows.append(dict(id=t['id'],src='media/r036-topaz/'+name,bytes=out.stat().st_size,sourceBytes=src.stat().st_size,**result))
  print(f'{i+1}/{len(takes)} {name} {out.stat().st_size/1e6:.1f} MB',flush=True)
 (BASE/'r036-topaz-manifest.json').write_text(json.dumps(rows,indent=2)+'\n')
 nav=BASE/'navigation.js';text=nav.read_text(encoding="utf-8");start=text.index('const extraTakes = ');end=text.index(';\nfor (const take of extraTakes)',start)
 text=text[:start]+'const extraTakes = '+json.dumps([{k:t[k] for k in ['id','from','to']} for t in takes],indent=2)+text[end:]
 nav.write_text(text.replace("src: 'media/r036/video_'","src: 'media/r036-topaz/video_'"), encoding="utf-8")
 print('DONE',sum(r['bytes'] for r in rows),flush=True)
if __name__=='__main__':main()
