const ASSAULT_THEMES={
 1:{title:'招聘网页',chapter:'第一章 / 一份看起来正常的招聘信息',lead:'从一份招聘网页开始。看清那些条件，再让纸上的压力成为可以击败的文字。',type:'JOB / 招聘信息',tag:'求职的第一步，不是接受每一种定义。',accent:'#377bd8',wash:'#e6eef8'},
 2:{title:'沟通记录',chapter:'第二章 / 对话开始了',lead:'消息气泡、等待答复、迟来的评价。沿着这份沟通记录，找到属于自己的回应。',type:'CHAT / 沟通记录',tag:'已读，不代表你的故事到此为止。',accent:'#368b76',wash:'#e5f1eb'},
 3:{title:'面试复盘',chapter:'第三章 / 把经历讲清楚',lead:'问题会追过来，评价会变成弹幕。保留自己的判断，移动、反击，然后继续向前。',type:'REVIEW / 面试复盘',tag:'一次评价，无法概括你的全部价值。',accent:'#a27339',wash:'#f4e9d7'},
 4:{title:'项目群聊',chapter:'第四章 / 所有人都在催',lead:'群里的消息接连涌来。多线围攻之下，选择主武器，也给自己留一条退路。',type:'GROUP / 项目群聊',tag:'认真负责，也可以保留清楚的边界。',accent:'#8960ac',wash:'#ece4f6'},
 5:{title:'高压终面',chapter:'最终章 / 最后的审判',lead:'清空最后一份记录，迎战董事长。那些压力有了形状，但未来依然由你决定。',type:'FINAL / 高压终面',tag:'你不必永远证明自己。',accent:'#ac4d62',wash:'#f4e3e8'}
};
const MENU_INERT=['#view','#hud','#battle-strip','#weapon-dock','#touch-controls','#growth-hud','#settings-sheet'];
function assaultMenuState(open){$('#assault-menu').hidden=!open;document.body.classList.toggle('assault-menu-open',open);for(const sel of MENU_INERT)$(sel).inert=open;}
function showAssaultMenu(){
 const theme=ASSAULT_THEMES[level];document.body.style.setProperty('--menu-wash',theme.wash);document.body.style.setProperty('--game-accent',theme.accent);
 $('#menu-chapter').textContent=theme.chapter;$('#menu-lead').textContent=theme.lead;
 $('#menu-document-type').textContent=theme.type;$('#menu-document-title').textContent=page.querySelector('h1').textContent.trim();
 $('#menu-document-copy').textContent=page.querySelector(level===1?'article p':'.chat-msg p').textContent.trim();$('#menu-document-tag').textContent=theme.tag;
 $('#menu-rule').textContent='本关 · '+PAGE_ASSAULT.name+'：'+PAGE_ASSAULT.description+'。推进到页顶，清空全部文字与标题'+(level===5?'，再击败最终 Boss':'')+'。';
 $('#menu-loadout').textContent=run.results[level-1]?'继承上一关已结算装备 · 这次继续向前。':level===1?'基础装备起步 · 在战斗中收集墨点升级。':'直接挑战 · 使用本关起始装备。';
 $('#menu-level-list').replaceChildren();for(let n=1;n<=5;n++){
  const button=document.createElement('button');button.className='menu-level-card';button.dataset.level=n;button.style.setProperty('--card-accent',ASSAULT_THEMES[n].accent);button.setAttribute('aria-current',String(n===level));
  button.setAttribute('aria-label','第 '+n+' 关 '+ASSAULT_THEMES[n].title+' · '+ASSAULT_PROFILES[n].name);
  const number=document.createElement('span');number.className='menu-level-number';number.textContent='0'+n;
  const detail=document.createElement('span');detail.className='menu-level-details';const name=document.createElement('b');name.textContent=ASSAULT_THEMES[n].title;const copy=document.createElement('small');copy.textContent=ASSAULT_PROFILES[n].name+' · '+(['','单线预警，熟悉移动','双线封锁，开始躲避','追踪文字，远程重字弹','三线围攻，精英交火','高密弹幕，最终 Boss'][n]);detail.append(name,copy);
  const rating=document.createElement('span');rating.className='menu-difficulty';rating.setAttribute('aria-hidden','true');for(let i=0;i<5;i++){const pip=document.createElement('i');if(i<n)pip.className='on';rating.append(pip)}
  button.append(number,detail,rating);button.onclick=()=>{if(n!==level)goLevel(n);};$('#menu-level-list').append(button);
 }
 $('#menu-audio').textContent='音乐 · '+(musicEnabled?'开':'关');assaultMenuState(true);$('#menu-play').focus({preventScroll:true});
}
function startSurvivalIntro(){
 if(!survival||survival.phase!=='ready')return;assaultMenuState(false);closeGameSheets();clearHeldInput();
 if(!$('#menu-scan').checked||matchMedia('(prefers-reduced-motion: reduce)').matches){finishSurvivalIntro();return;}
 survival.phase='intro';survival.introElapsed=0;survival.introDuration=5.8;
 document.body.classList.add('assault-browsing');$('#assault-intro').hidden=false;
 $('#intro-title').textContent='第 '+level+' 关 · '+ASSAULT_THEMES[level].title;$('#intro-skip').focus({preventScroll:true});survivalIntroCamera();renderSurvivalUI();
}
function survivalIntroCamera(){
 const s=survival,t=clamp((s.introElapsed-.55)/4.65,0,1),eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const finalX=clamp(p.x-sw/scale/2,0,Math.max(0,W-sw/scale)),finalY=Math.max(-playInsets().top/scale,s.routeY-survivalAnchor()/scale);
 const topY=-68/scale;camY=topY+(finalY-topY)*eased;
 // On a phone, read the page's main column first, then arrive at the character.
 const article=localRect(page.querySelector('article')),startX=clamp(article.x-28,0,Math.max(0,W-sw/scale));camX=startX+(finalX-startX)*eased;updateTransforms();
 $('#intro-progress').value=clamp(s.introElapsed/s.introDuration,0,1);$('#intro-copy').textContent=t>=1?'抵达页底 · 准备反击':t>.5?'穿过这些文字，来到你的起点':'先看看这份记录';
}
function survivalIntroStep(dt){survival.introElapsed+=dt;survivalIntroCamera();if(survival.introElapsed>=survival.introDuration)finishSurvivalIntro();}

// The same base stats feed both the HUD and physical shots. Focus is meaningful,
// while lower-frequency support preserves the existing movement-first combat.
const assaultBaseStats=survivalStats;survivalStats=function(){
 const st=assaultBaseStats();return {...st,rate:st.rate*(weapon===0?1.12:.65),cooldown:st.cooldown*(weapon===1?.72:1.35),grenadeDamage:Math.round(st.grenadeDamage*(weapon===1?1.2:1)),eraserRange:Math.round(st.eraserRange*(weapon===2?1.12:1)),eraserCooldown:st.eraserCooldown*(weapon===2?.8:1.25)};
};
const assaultSelect=selectWeapon;selectWeapon=function(next){
 if(!survival||survival.phase==='free')return assaultSelect(next);if(![0,1,2].includes(next))return;weapon=next;$('#weapon').textContent=['1 射击 ▸','2 榴弹 ▸','3 橡皮擦 ▸'][weapon];if(survival.phase==='battle')focusGame();
 if(survival&&survival.phase!=='free'){renderSurvivalUI();if(survival.phase==='battle')notify(['连发枪主攻 · 远距离贯穿','榴弹主攻 · 更频繁的范围爆破','橡皮擦主攻 · 加强近身清理'][next],1400);}
};

const MEDKIT_BUDGET=[0,5,4,3,3,3];
function survivalMedkitY(y){const b=survivalBounds(),s=survival;return clamp(y,Math.max(b.top+25,s.routeY-b.height*.42-20),Math.min(b.bottom-25,s.routeY+b.height*.14-20));}
function survivalDropMedkit(x,y){
 const s=survival;if(!s||s.medkitsDropped>=s.medkitBudget)return null;
 const b=survivalBounds(),item={id:++s.medkitsDropped,x:clamp(x,b.left+25,b.right-25),y:survivalMedkitY(y),born:time,expires:time+16,heal:2};s.medkits.push(item);return item;
}
function survivalMaybeMedkit(e){
 const s=survival;if(e.kind!=='letter'||s.medkitsDropped>=s.medkitBudget)return;
 const next=Math.ceil(s.total*(s.medkitsDropped+1)/(s.medkitBudget+1));if(s.killed>=next)survivalDropMedkit(e.x+e.w/2,e.y+e.h/2);
}
const assaultActorHurt=survivalHurtActor;survivalHurtActor=function(e,damage,x,y){const alive=e.alive;assaultActorHurt(e,damage,x,y);if(alive&&!e.alive)survivalMaybeMedkit(e);};
function survivalMedkits(){
 const s=survival;if(s.phase!=='battle')return;for(let i=s.medkits.length-1;i>=0;i--){const item=s.medkits[i];item.y=survivalMedkitY(item.y);if(time>=item.expires){s.medkits.splice(i,1);continue;}
  if(s.hp<s.maxHp&&Math.hypot(item.x-p.x,item.y-(p.y-20))<=27){const healed=Math.min(item.heal,s.maxHp-s.hp);s.hp+=healed;s.medkitsPicked++;s.healthRecovered+=healed;s.medkits.splice(i,1);rings.push({x:item.x,y:item.y,r:42,t:0,life:.4,heavy:false});notify('拾取血包 · 生命 +'+healed,1400);sound('heavy');}
 }
}
const assaultInk=survivalInk;survivalInk=function(dt){assaultInk(dt);survivalMedkits();};
const assaultWorld=drawSurvivalWorld;drawSurvivalWorld=function(){assaultWorld();if(!survival||!['battle','clear'].includes(survival.phase))return;ctx.save();
 for(const item of survival.medkits){const size=28/scale;ctx.globalAlpha=item.expires-time<3?.5+.5*Math.sin(time*9):1;ctx.fillStyle='#d4f3dd99';ctx.beginPath();ctx.arc(item.x,item.y,size*.8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fffefa';ctx.strokeStyle='#379864';ctx.lineWidth=2/scale;ctx.fillRect(item.x-size/2,item.y-size/2,size,size);ctx.strokeRect(item.x-size/2,item.y-size/2,size,size);ctx.fillStyle='#379864';ctx.fillRect(item.x-size*.1,item.y-size*.3,size*.2,size*.6);ctx.fillRect(item.x-size*.3,item.y-size*.1,size*.6,size*.2);ctx.font='bold '+10/scale+'px Arial';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='#348459';ctx.fillText('血包 +2',item.x,item.y-size*.7);}
 ctx.restore();};

const assaultFinishIntro=finishSurvivalIntro;finishSurvivalIntro=function(){
 if(!survival||!['ready','intro'].includes(survival.phase))return;assaultMenuState(false);document.body.classList.remove('assault-browsing');$('#assault-intro').hidden=true;
 survivalCamera();assaultFinishIntro();focusGame();
};
const assaultResetSurvival=resetSurvival;resetSurvival=function(){
 document.body.classList.remove('assault-browsing');$('#assault-intro').hidden=true;assaultMenuState(false);assaultResetSurvival();
 Object.assign(survival,{medkits:[],medkitBudget:MEDKIT_BUDGET[level],medkitsDropped:0,medkitsPicked:0,healthRecovered:0,introElapsed:0});showAssaultMenu();
 $('#settings-sheet p').innerHTML='从页底向上推进，网页文字从原处袭来。<br>WASD、方向键或摇杆移动；点武器或按 1 / 2 / 3 切换主武器。<br>主武器自动攻击，其他两把提供较慢的自动支援。<br>蓝色墨点用于升级；绿色血包需要靠近拾取，恢复 2 格生命。<br>本关 '+PAGE_ASSAULT.name+'：'+PAGE_ASSAULT.description+'。';
};
$('#menu-play').onclick=()=>{begin();renderBattleUI();};$('#intro-skip').onclick=finishSurvivalIntro;
$('#menu-audio').onclick=()=>{musicEnabled=!musicEnabled;try{localStorage.setItem('dreamjob.music.enabled',musicEnabled?'on':'off')}catch(e){}if(musicEnabled){unlockAudio();musicReady();}else stopMusicNodes();renderMusic();$('#menu-audio').textContent='音乐 · '+(musicEnabled?'开':'关');};
