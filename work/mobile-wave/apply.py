# Extend the existing build, keeping webpage registration and projectile geometry intact.
mobile=Path('work/mobile-wave')
c['waves']={str(k):v for k,v in {2:[3,3,2],3:[4,4,4],4:[4,4,4,4],5:[5,5,5,5]}.items()}
for k,cap in [(2,3),(3,4),(4,4),(5,5)]:c['level'+str(k)]['globalCap']=cap
c['airMobility']['trigger']='allLevelsFromStart'
c['linkedWeapons']='Gun A/B tier boosts grenade radius/damage/cooldown and eraser range/damage/cooldown; dedicated C/D upgrades remain available'
s=re.sub(r'const GAME_CONFIG=\{.*?\};\nconst STORE=', 'const GAME_CONFIG='+json.dumps(c,ensure_ascii=False)+';\nconst STORE=',s,count=1,flags=re.S)
def function_span(src,name):
 start=src.index('function '+name+'(');i=src.index('{',start);depth=0;quote=None;escape=False;line=False;block=False
 for j in range(i,len(src)):
  ch=src[j];nx=src[j+1:j+2]
  if line:
   if ch=='\n':line=False
   continue
  if block:
   if ch=='/' and src[j-1]=='*':block=False
   continue
  if quote:
   if escape:escape=False
   elif ch=='\\':escape=True
   elif ch==quote:quote=None
   continue
  if ch in "'\"`":quote=ch;continue
  if ch=='/' and nx=='/':line=True;continue
  if ch=='/' and nx=='*':block=True;continue
  if ch=='{':depth+=1
  if ch=='}':
   depth-=1
   if depth==0:return start,j+1
 raise ValueError(name)
def replace_fn(name,code):
 global s
 a,b=function_span(s,name);s=s[:a]+code+s[b:]
for name in ['getWeaponStats','modDescription']:
 src=(mobile/'weapons.js').read_text();a,b=function_span(src,name);replace_fn(name,src[a:b])
for name in ['updateCombat','updateShooter','hurtEnemy','activateBoss','spawnEnemy']:
 replace_fn(name,'')
replace('function resetGrowth(){', (mobile/'combat.js').read_text()+'\nfunction resetGrowth(){')
replace('shield=combatConfig.shield;invincibleUntil=time;resetBoss();','shield=combatConfig.shield;invincibleUntil=time;resetBoss();resetWaves();')
replace("else if(a.kind==='surface'&&a.el.matches('.apply'))award('button',GAME_CONFIG.rewards.button);", "else if(a.kind==='surface'&&a.el.matches('.apply'))award('button',GAME_CONFIG.rewards.button);\n if(level!==1)return;")
replace('growth.complete=done===3&&(level!==5||boss.defeated);','growth.complete=level===1?done===3:!!waves&&waves.ended&&waves.killed===waves.total&&(level!==5||boss.defeated);')
replace('function requestEnd(){','function requestEnd(){closeGameSheets();')
replace("$('#pending').onclick=openUpgrade","$('#pending').onclick=()=>{closeGameSheets();openUpgrade()}")
replace("$('#continue-break').onclick=()=>{growth.continued=true","$('#continue-break').onclick=()=>{closeGameSheets();growth.continued=true")
replace('function closeSource(t){','function closeSource(t){if(level>=2)return;')
replace('if(targets.every(t=>t.done)||Math.hypot(p.x-a.x,p.y-a.y)<cfg.activationDistance)activateBoss();else return','if(waves?.ended)activateBoss();else return')
a,b=function_span(s,'drawCombat');frag=s[a:b];t=frag.index(' for(const t of targets)');end=frag.index(' for(const c of spawnLetters)');frag=frag[:t]+frag[end:];s=s[:a]+frag+s[b:]
replace('drawTargetGuide();drawCombat();drawBoss();','drawTargetGuide();drawWaveWarning();drawCombat();drawBoss();')
replace_fn('airMobilityAvailable','function airMobilityAvailable(){airUnlocked=true;return true}')
replace('airUnlocked=false;airStateShown=false;renderAirMobility(false)','airUnlocked=true;airStateShown=true;renderAirMobility(true)')
replace('if(time-lastErase<.35)return;lastErase=time;', 'const spec=getWeaponStats();if(time-lastErase<spec.eraserCooldown)return;lastErase=time;')
replace('Math.cos(p.angle)*230,y:m.y+Math.sin(p.angle)*230','Math.cos(p.angle)*spec.eraserRange,y:m.y+Math.sin(p.angle)*spec.eraserRange')
replace('function updateAim(){','function updateAim(){\n if(mobileAim())return;')
replace("button.onclick=()=>guideTarget(t.id)","button.onclick=()=>{closeGameSheets();guideTarget(t.id)}")
replace(".disabled=t.done||paused||ending||settled", ".disabled=t.done||!!choiceNode||ending||settled")
replace("if(level===5)renderBoss();\n}","if(level===5)renderBoss();renderBattleUI();\n}")
replace('function uiTarget(el){return !!el.closest(', 'function uiTarget(el){return !!el.closest(')
replace('#hud,#hint,#mobile,#ending,#track,#return,#paused,#growth-hud,#upgrade', '#hud,#hint,#mobile,#ending,#track,#return,#paused,#growth-hud,#upgrade,#settings-sheet,#battle-strip,#weapon-dock,#touch-controls')
a=s.index('<div id="hud"');b=s.index('<div id="growth-hud"',a);s=s[:a]+(mobile/'ui.html').read_text()+s[b:]
replace('<div id="goal-detail">','<div id="enemy-progress" hidden></div><div id="goal-detail">')
replace('let last=0;', (mobile/'ui.js').read_text()+'\ndocument.body.classList.add("mobile-wave-ui");\nlet last=0;')
replace('resetGrowth();resetAirMobility();saveRun();', 'resetGrowth();resetAirMobility();setupGameUI();saveRun();')
replace('draw();requestAnimationFrame(frame);','renderBattleUI();draw();requestAnimationFrame(frame);')
replace('function clearHeldInput(){keys.clear();','function clearHeldInput(){clearTouchControls();keys.clear();')
replace("if(e.pointerType==='touch'){touchFire=true;return}","if(e.pointerType==='touch'){stageFirePointer=e.pointerId;touchFire=true;fire(false);return}")
replace("if(e.pointerType==='touch'){touchFire=false;return}", "if(e.pointerType==='touch'){if(e.pointerId===stageFirePointer){stageFirePointer=null;touchFire=firePointer!==null}return}")
replace("window.addEventListener('pointercancel',()=>{touchFire=false;mouseDown=false;heavyHeld=false});", "window.addEventListener('pointercancel',e=>{if(e.pointerType==='touch'){if(e.pointerId===stageFirePointer){stageFirePointer=null;touchFire=firePointer!==null}return}mouseDown=false;heavyHeld=false});")
replace("window.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')", "window.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&e.pointerId===stageFirePointer){pointer.x=e.clientX;pointer.y=e.clientY;pointer.moved=true}if(e.pointerType==='mouse')")
replace("if(k==='escape'){e.preventDefault();if(!e.repeat)togglePause();return}","if(k==='escape'){e.preventDefault();if(!e.repeat){if(!$('#settings-sheet').hidden||$('#growth-hud').classList.contains('sheet-open'))closeGameSheets();else togglePause()}return}")
replace("settled=true;ending=false;renderGrowth();$('#level-select').focus({preventScroll:true})", "settled=true;ending=false;renderGrowth();openGameSheet('#settings-sheet');$('#level-select').focus({preventScroll:true})")
# Camera uses the same world transform as aiming and collision. Reserve UI insets, never shift hit boxes.
replace_fn('resize', '''function clampCameraY(v){const inset=playInsets(),min=-inset.top/scale,max=Math.max(min,H-(sh-inset.bottom)/scale);return clamp(v,min,max)}
function resize(){refreshGeometry();sw=innerWidth;sh=innerHeight;scale=(mobileLayout()?(sh<500?.60:.78):Math.max(sw/W,.58))*viewZoom;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(sw*dpr);canvas.height=Math.round(sh*dpr);canvas.style.width=sw+'px';canvas.style.height=sh+'px';ctx.setTransform(dpr,0,0,dpr,0,0);camX=clamp(started?camX:p.x-sw/scale*.4,0,Math.max(0,W-sw/scale));const inset=playInsets(),py=(p.y-camY)*scale;if(mobileLayout()&&(!started||py<inset.top+40||py>sh-inset.bottom))camY=clampCameraY(p.y-(inset.top+(sh-inset.top-inset.bottom)*.45)/scale);else camY=clampCameraY(started?camY:-inset.top/scale);updateTransforms()}''')
s=re.sub(r'camY=clamp\(([^;]*?),0,Math.max\(0,H-sh/scale\)\)',r'camY=clampCameraY(\1)',s)
replace('if(p.y<camY+vh*.22)ty=p.y-vh*.22;if(p.y>camY+vh*.78)ty=p.y-vh*.78;', 'const inset=playInsets(),top=inset.top/scale,usable=(sh-inset.top-inset.bottom)/scale;if(p.y<camY+top+usable*.22)ty=p.y-top-usable*.22;if(p.y>camY+top+usable*.78)ty=p.y-top-usable*.78;')
replace('ty=clamp(ty,0,Math.max(0,H-vh))','ty=clampCameraY(ty)')
replace("const off=p.y<camY||p.y>camY+sh/scale", "const off=p.y<camY+playInsets().top/scale||p.y>camY+(sh-playInsets().bottom)/scale")
replace('camX=0;camY=0;manualUntil=0;', 'camX=clamp(p.x-sw/scale*.4,0,Math.max(0,W-sw/scale));camY=clampCameraY(p.y-(playInsets().top+(sh-playInsets().top-playInsets().bottom)*.5)/scale);manualUntil=0;')
replace("$('#audio').onclick=toggleAudio;$('#reset').onclick=resetGame;", "$('#audio').onclick=toggleAudio;$('#reset').onclick=()=>{closeGameSheets();resetGame()};$('#new-run').onclick=()=>{closeGameSheets();newRun()};")
s=s.replace('</style>',(mobile/'ui.css').read_text()+'</style>',1)
