"""python3 build.py  -> nteli-battery-pov.mp4 (1920x1080, ~60 s)
Slides from make.mjs (slides/sNN.png), narration from slides.json via edge-tts, Microsoft neural voice en-US-AriaNeural
(the voice used for the site's other demo videos). Narration text is sent to Microsoft's TTS service.
"""
import json, os, subprocess, sys
here=os.path.dirname(os.path.abspath(__file__)); os.chdir(here); os.makedirs('out',exist_ok=True)
S=json.load(open('slides.json',encoding='utf-8'))
VOICE=os.environ.get('VOICE','en-US-AriaNeural'); RATE=os.environ.get('RATE','+0%'); GAP=0.45; LEAD=0.5; TAIL=0.7; FPS=30; XF=0.45
def dur(p): return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout)
clips=[]; durs=[]; t0=0.0
for i,s in enumerate(S):
    t=LEAD
    for j,txt in enumerate(s['vo']):
        mp3=f'out/vo-{i}-{j}.mp3'; wav=mp3[:-4]+'.wav'
        if not os.path.exists(mp3) or os.environ.get('FRESH'):
            subprocess.run([sys.executable,'-m','edge_tts','-v',VOICE,f'--rate={RATE}','-t',txt,'--write-media',mp3],check=True,capture_output=True)
        trim='silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
        subprocess.run(['ffmpeg','-v','error','-y','-i',mp3,'-af',trim,'-ar','48000','-ac','1',wav],check=True)
        clips.append((t0+t,wav)); t+=dur(wav)+GAP
    d=round(t-GAP+TAIL+(XF if 0<i<len(S)-1 else XF/2),2); durs.append(d); t0+=d-XF
total=round(sum(durs)-XF*(len(S)-1),2); print('total',total,'s', [round(x,1) for x in durs])
# One clip per slide with a slow push-in.
parts=[]
for i,d in enumerate(durs):
    out=f'out/clip{i:02d}.mp4'; n=int(d*FPS)
    z=f"zoompan=z='min(1+0.0004*on,1.035)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS}"
    subprocess.run(['ffmpeg','-v','error','-y','-loop','1','-i',f'slides/s{i:02d}.png','-vf',f'scale=3840:2160,{z},format=yuv420p','-t',str(d),'-c:v','libx264','-crf','18','-preset','medium',out],check=True)
    parts.append(out)
# Crossfade the clips together.
inp=[]; [inp.extend(['-i',p]) for p in parts]; fc=''; last='[0:v]'; off=0.0
for i in range(1,len(parts)):
    off+=durs[i-1]-XF; lab=f'[v{i}]'; fc+=f'{last}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.2f}{lab};'; last=lab
subprocess.run(['ffmpeg','-v','error','-y',*inp,'-filter_complex',fc.rstrip(';'),'-map',last,'-c:v','libx264','-crf','18','-preset','medium','-pix_fmt','yuv420p','out/silent.mp4'],check=True)
ins=[];fl=[]
for k,(t,p) in enumerate(clips):
    ins+=['-i',p]; ms=int(t*1000); fl.append(f'[{k+1}:a]adelay={ms}|{ms}[a{k}]')
fca=';'.join(fl)+';'+''.join(f'[a{k}]' for k in range(len(clips)))+f'amix=inputs={len(clips)}:normalize=0,apad[a]'
subprocess.run(['ffmpeg','-v','error','-y','-i','out/silent.mp4',*ins,'-filter_complex',fca,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-ar','48000','-t',str(total),'-movflags','+faststart','nteli-battery-pov.mp4'],check=True)
print('done nteli-battery-pov.mp4',round(dur('nteli-battery-pov.mp4'),1),'s')
