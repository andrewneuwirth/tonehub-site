# Regenerates assets/shots and assets/brand (icons, favicons, OG image) from the app repo.
# Screenshots: light-mode captures from the current app build (iPhone 17 Pro simulator, headless simctl,
# `-hasCompletedOnboarding YES -screen=<name>`, see app/GtrTone/Screens/Root/DebugLaunch.swift),
# saved as app/build/shots-site/<screen>.png in gtr-tone-app.
# To swap the logo: replace design/icon/tonehub-icon-source.jpg in gtr-tone-app (square, 1024px+) and run: python3 tools/make-assets.py
import os, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter
A=os.path.expanduser('~/Developer/gtr-tone-app/')
S=A+'app/build/shots-site/'
D=os.path.expanduser('~/Developer/tonehub-site/assets/')
# site name -> -screen= capture
shots={
 'songs':'songs','listen':'listen','result':'result-preview','song':'song','playalong':'practicesong',
 'tabs':'song-tabs','play':'play','effects':'effects-on','tuner':'tuner','metronome':'metronome',
 'looper':'looper','recorder':'recorder','fretboard':'fretboard-practice','ear':'ear','drills':'drills','plan':'plan',
}
for old in glob.glob(D+'shots/*.webp'): os.remove(old)
CROP=2380  # drop the tab bar
for k,p in shots.items():
    im=Image.open(S+p+'.png').convert('RGB')
    w,h=im.size; c=round(CROP*w/1206)
    im=im.crop((0,0,w,c)).resize((600,round(CROP*600/1206)),Image.LANCZOS)
    im.save(D+'shots/'+k+'.webp','WEBP',quality=80,method=6)
src=Image.open(A+'design/icon/tonehub-icon-source.jpg').convert('RGB')
def rounded(im,r):
    m=Image.new('L',im.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,im.size[0]-1,im.size[1]-1),r,fill=255)
    out=Image.new('RGBA',im.size,(0,0,0,0)); out.paste(im,(0,0),m); return out
for n in (512,):
    src.resize((n,n),Image.LANCZOS).save(D+'brand/icon-%d.webp'%n,'WEBP',quality=85)
src.resize((180,180),Image.LANCZOS).save(D+'brand/apple-touch-icon.png',optimize=True)
src.resize((192,192),Image.LANCZOS).save(D+'brand/icon-192.png',optimize=True)
for n in (32,48):
    rounded(src.resize((n,n),Image.LANCZOS),n*0.22).save(D+'brand/favicon-%d.png'%n,optimize=True)
# OG image
og=Image.new('RGB',(1200,630),'#F7F7F5'); d=ImageDraw.Draw(og)
ic=rounded(src.resize((120,120),Image.LANCZOS),27); og.paste(ic,(80,96),ic)
fb=ImageFont.truetype('/System/Library/Fonts/SFNSRounded.ttf',84); fb.set_variation_by_name('Bold')
fr=ImageFont.truetype('/System/Library/Fonts/SFNSRounded.ttf',40); fr.set_variation_by_name('Medium')
d.text((80,260),'ToneHub',font=fb,fill='#18181B')
d.text((80,370),'Get the tone.',font=fr,fill='#0B6E65')
d.text((80,420),'Learn the song.',font=fr,fill='#0B6E65')
fs=ImageFont.truetype('/System/Library/Fonts/SFNSRounded.ttf',28); fs.set_variation_by_name('Regular')
d.text((80,520),'Coming soon to iPhone',font=fs,fill='#4A4A50')
ph=Image.open(S+'songs.png').convert('RGB')
pw=330; ph=ph.resize((pw,round(2622*pw/1206)),Image.LANCZOS)
ph=rounded(ph,46)
sh=Image.new('RGBA',(pw+80,ph.size[1]+80),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((40,50,pw+40,ph.size[1]+40),46,fill=(0,0,0,60))
sh=sh.filter(ImageFilter.GaussianBlur(18))
og.paste(sh,(760,40),sh); og.paste(ph,(800,70),ph)
og.save(D+'brand/og.png',optimize=True)
