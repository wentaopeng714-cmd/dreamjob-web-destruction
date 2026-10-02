// The webpage stays the only solid terrain. Air support restores mobility without invisible floors.
let airUnlocked=false,airStateShown=false;
function airMobilityAvailable(){
 const destroyedTerrain=glyphs.length>0&&glyphs.length-goneGlyphs<=Math.max(12,Math.ceil(glyphs.length*GAME_CONFIG.airMobility.remainingGlyphRatio));
 if(destroyedTerrain||(level===5&&boss?.active))airUnlocked=true;
 return airUnlocked;
}
function resetAirMobility(){airUnlocked=false;airStateShown=false;renderAirMobility(false)}
function renderAirMobility(active=airMobilityAvailable()){
 const status=$('#air-status');if(!status)return;
 status.hidden=!active;status.textContent='空中借力已启用\n空格 / W / ↑ 上升 · S / ↓ 下降 · 松开悬停';
 const jump=$('#mobile [data-action="jump"]');if(jump)jump.textContent=active?'上升':'跳跃';
 if(active&&!airStateShown){airStateShown=true;notify('空中借力已启用：按住空格 / W 上升，S 下降，松开悬停。',4500)}
 $('#view').setAttribute('aria-label',active?'游戏区域：A D 移动，空格或 W 持续上升，S 下降，松开悬停':'游戏区域：方向键或 A D 移动，空格跳跃');
}
function updateAirVelocity(dt,dropping){
 const up=keys.has(' ')||keys.has('w')||keys.has('arrowup')||mobileKeys.has('jump');
 const rising=up||p.jumpBuffer>0,dir=(dropping?1:0)-(rising?1:0),speed=GAME_CONFIG.airMobility.speed;
 if(dir)manualUntil=0;
 p.vy=clamp(p.vy,-speed,speed)+(dir*speed-clamp(p.vy,-speed,speed))*Math.min(1,dt*14);
 if(!dir&&Math.abs(p.vy)<.5)p.vy=0;
 p.onGround=false;p.coyote=0;p.jumps=0;p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.drop=dropping?.18:Math.max(0,p.drop-dt);
}
function drawAirSupport(){if(!airUnlocked)return;ctx.save();ctx.translate(p.x,p.y);const up=keys.has(' ')||keys.has('w')||keys.has('arrowup')||mobileKeys.has('jump');ctx.globalAlpha=.8;ctx.strokeStyle='#27afa9';ctx.fillStyle='#56dedb';ctx.lineWidth=1.8;
 ctx.beginPath();ctx.ellipse(0,8,12,4,0,0,Math.PI*2);ctx.stroke();
 if(up){for(let i=0;i<3;i++){const x=(i-1)*6,len=11+Math.sin(time*22+i)*4;ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,4+len);ctx.stroke()}}
 ctx.restore();}
