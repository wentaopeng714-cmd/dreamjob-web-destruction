let finaleEnabled=true,finaleSession=0;
function stopFinale(){
 finaleSession++;const v=$('#finale-video');v.pause();
 $('#finale-film').hidden=true;$('#finale-replay').hidden=true;
 $('#clear-dialog').classList.remove('with-film');
}
function finishFinale(message='影片结束。你可以查看成绩，也可以继续拆这页。'){
 finaleSession++;$('#finale-video').pause();$('#finale-film').hidden=true;
 $('#clear-dialog').classList.remove('with-film');
 $('#finale-replay').hidden=false;$('#finale-status').textContent=message;
 $('#clear-upgrades').textContent=message+(pendingNodes().length?' 还有 '+pendingNodes().length+' 次升级可领取。':'');
 $('#clear-end').focus({preventScroll:true});
}
function showFinale(){
 if(!finaleEnabled||level!==5||!growth.complete||$('#clear-dialog').hidden)return;
 const v=$('#finale-video');finaleSession++;v.pause();v.currentTime=0;
 if(!v.getAttribute('src')){v.src=FINALE_MEDIA;v.poster=FINALE_POSTER;v.load()}
 v.muted=false;$('#finale-film').hidden=false;$('#finale-replay').hidden=true;
 $('#clear-dialog').classList.add('with-film');
 $('#finale-play').textContent='播放结局影片';
 $('#finale-status').textContent='点击播放，观看带原声的结局影片。';
 $('#finale-play').focus({preventScroll:true});
}
async function playFinale(){
 const ticket=finaleSession,v=$('#finale-video');
 if($('#finale-film').hidden)return;
 $('#finale-status').textContent='正在播放 · 可随时跳过';
 try{await v.play();if(ticket!==finaleSession){if($('#finale-film').hidden)v.pause();return}$('#finale-play').textContent='从头重播'}
 catch(e){if(ticket!==finaleSession)return;$('#finale-status').textContent='请再次点击播放，或使用视频自带的播放按钮。'}
}
$('#finale-play').onclick=()=>{$('#finale-video').currentTime=0;playFinale()};
$('#finale-skip').onclick=()=>finishFinale('已跳过影片。可重播、查看成绩或继续拆这页。');
$('#finale-replay').onclick=()=>{showFinale();playFinale()};
$('#finale-video').addEventListener('ended',()=>{if(!$('#finale-film').hidden)finishFinale()});
$('#finale-video').addEventListener('error',()=>{if(!$('#finale-film').hidden){$('#finale-status').textContent='影片暂时无法播放，请重试或跳过。';$('#finale-play').textContent='重试播放'}});
