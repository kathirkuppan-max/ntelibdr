"""Builds a vertical demo video in the panels template.
python3 build.py <name> [--stills]   -> out/nteli-quoting-<name>.mp4
Voice: macOS say "Matilda (Premium)" at 180 wpm (the panels demo's pace); Nteli is spoken "En-telly".
"""
import json, subprocess, sys, os
here=os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
name=sys.argv[1]; cfg=json.load(open(f"configs/{name}.json"))
VOICE="Matilda (Premium)"; RATE=180; GAP=0.45; LEAD=0.5; TAIL=1.5
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout)
scenes=[]; clips=[]; t0=0
for si,lines in enumerate(cfg["vo"]):
    t=LEAD; starts=[]
    for li,txt in enumerate(lines):
        p=f"out/{name}-vo-{si}-{li}.wav"
        subprocess.run(["say","-v",VOICE,"-r",str(RATE),"-o",p,"--data-format=LEI16@48000",txt],check=True)
        d=dur(p); starts.append(t); clips.append((t0+t,p)); t+=d+GAP
    sc={"dur":round(t-GAP+TAIL,2),"sub_at":round(starts[1] if len(starts)>1 else 1.0,2)}
    if si==3: sc["step_at"]=[round(x,2) for x in starts[1:5]]
    if si==8: sc["week_at"]=[round(x,2) for x in starts[1:5]]
    if si==5: sc["sub_at"]=round(starts[-1],2)
    scenes.append(sc); t0+=sc["dur"]
cfg["scenes"]=scenes
open(f"out/{name}.cfg.js","w").write("window.CFG="+json.dumps(cfg)+";")
print(name,"total",round(t0,1),"s")
if "--stills" in sys.argv:
    subprocess.run(["node","render.mjs",name,"--stills"],check=True); sys.exit()
subprocess.run(["node","render.mjs",name],check=True)
ins=[];fl=[]
for i,(t,p) in enumerate(clips):
    ins+=["-i",p]; ms=int(t*1000); fl.append(f"[{i+1}:a]adelay={ms}|{ms}[a{i}]")
fc=";".join(fl)+";"+"".join(f"[a{i}]" for i in range(len(clips)))+f"amix=inputs={len(clips)}:normalize=0,apad[a]"
subprocess.run(["ffmpeg","-v","error","-y","-i",f"out/{name}-silent.mp4",*ins,"-filter_complex",fc,"-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","128k","-ac","1","-ar","48000","-t",str(round(t0,2)),"-movflags","+faststart",f"out/nteli-quoting-{name}.mp4"],check=True)
print("done",f"out/nteli-quoting-{name}.mp4",round(dur(f"out/nteli-quoting-{name}.mp4"),1))
