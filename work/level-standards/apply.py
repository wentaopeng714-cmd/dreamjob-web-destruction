# One definition supplies the fixed roster, displayed standard, and completion guard.
standards=Path('work/level-standards')
replace('<div id="battle-strip"><span', '<div id="battle-strip"><div id="battle-rule"></div><span')
replace('<progress id="battle-meter"', '<button id="quick-next" hidden></button><span id="battle-remaining"></span><progress id="battle-meter"')
replace('<div id="enemy-progress" hidden>', '<ol id="all-level-rules" aria-label="五关通关标准"></ol><div id="enemy-progress" hidden>')
replace('<nav id="weapon-dock"', (standards/'ui.html').read_text()+'\n<nav id="weapon-dock"')
replace('let viewZoom=1,', (standards/'flow.js').read_text()+'\nlet viewZoom=1,')
replace("function openGameSheet(id){if(choiceNode||ending)return", "function openGameSheet(id){if(choiceNode||ending||!$('#clear-dialog').hidden)return")
replace('#settings-sheet,#battle-strip,#weapon-dock,#touch-controls', '#settings-sheet,#battle-strip,#weapon-dock,#touch-controls,#clear-dialog,#clear-screen')
replace('function resetGrowth(){', 'function resetGrowth(){resetClearFlow();')
replace('function requestEnd(){closeGameSheets();','function requestEnd(){dismissClear();closeGameSheets();if(!choiceNode&&!ending&&!settled)paused=false;')
replace('if(endingRequested&&!pendingNodes().length)finishLevel();', 'if(endingRequested){if(pendingNodes().length)openUpgrade();else finishLevel()}')
replace("$('#ending').classList.add('visible');$('#again').focus({preventScroll:true});", "$('#ending').classList.add('visible');$('#again').focus({preventScroll:true});if(clearAction==='next'&&level<5){clearAction=null;goLevel(level+1)}")
replace("if(!e.repeat){if(!$('#settings-sheet').hidden", "if(!e.repeat){if(!$('#clear-dialog').hidden){continueAfterClear();return}if(!$('#settings-sheet').hidden")
replace("const st=getWeaponStats(),summary=missionText(),next=", "const st=getWeaponStats(),summary=missionText(),next=")
# Add rendering at the end of the existing UI function so it owns its final text.
a,b=function_span(s,'renderBattleUI');s=s[:b-1]+' renderClearStandards();\n'+s[b-1:]
s=s.replace('</style>',(standards/'ui.css').read_text()+'</style>',1)

replace('function togglePause(){if(ending||settled||choiceNode)return;',"function togglePause(){if(ending||settled||choiceNode||!$('#clear-dialog').hidden)return;")
