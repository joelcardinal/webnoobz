// global vars
var editors = [
	['html',{}],
	['css',{}],
	['javascript',{}]
];


// TogetherJS events
TogetherJS.hub.on("togetherjs.form-init", function (msg) {
	updateIframe();
});
TogetherJS.hub.on("renderKeyPress", function (msg) {
  updateIframe();
});
TogetherJS.hub.on("switchEditor", function (msg) {
  while(msg.currentMode != editors[0][0]){switchEditor()};
});
TogetherJS.on("ready", function (msg) {
	var eyeElm = document.querySelector('.eye');
	var collabElm = document.getElementById('collaborateBtn');
	eyeElm.style.display = 'block';
	eyeElm.classList.remove('darkEye');
	eyeElm.classList.add('lightEye');
	collabElm.style.color = '#FFF';
});

TogetherJS.on("close", function (msg) {
	var eyeElm = document.querySelector('.eye');
	var collabElm = document.getElementById('collaborateBtn');
	eyeElm.style.display = 'none';
	eyeElm.classList.remove('lightEye');
	eyeElm.classList.add('darkEye');
	collabElm.setAttribute('style','');
});
TogetherJS.hub.on("togetherjs.hello", function (msg) {
	TogetherJS.send({type: "modeUpdate",currentMode:editors[0][0]});
});
TogetherJS.hub.on("modeUpdate", function (msg) {
	// TODO: this solution depends on dataUpdate being received before TJ form-init and client editor already being init - needs QA
	if(TogetherJS.require("peers").Self.isCreator === false){
		while(msg.currentMode != editors[0][0]){switchEditor(msg.currentMode)};
	}
});

// Start main app functions


// Download content as file hack, file name may work depending on browser
// http://dtsn.me/2013/03/12/downloading-data-from-localstorage/	
function download() {
	var content = updateIframe();
  var tmpEl = document.createElement('a');
	var name = function(){
		var nameText = document.querySelector('.name').value;
		if(nameText){
			return (nameText.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '_').toLowerCase() + '.html');
		}else{
			return 'My_Website.html';
		}
	};
	// make sure you choose correct data type
  tmpEl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  tmpEl.setAttribute('download', name());
	// click event
  var event = new MouseEvent('click', {
  	'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var clicked = !tmpEl.dispatchEvent(event);
}

// update render panel
function updateIframe(){
	var js,css,html;
	
	for (var i = 0; editors.length > i; i++){
		switch( editors[i][0] ){
			case 'html':
				html = editors[i][1].getSession().getValue() ? editors[i][1].getSession().getValue(): '<div style="font-family:monospace;color:#D1CACA;margin-top:31px;margin">Cycle Editors: Ctrl+j<br>Update Render: Update button or Ctrl+k<br>Resize Workspace: Ctrl+d<br>Resize Render: Ctrl+f</div>';
				break;
			case 'css':
				css = editors[i][1].getSession().getValue() ? editors[i][1].getSession().getValue().split('%C2%A0').join('') : '';
				break;
			case 'javascript':
				js = editors[i][1].getSession().getValue() ? editors[i][1].getSession().getValue() : '';
				break;
		}
	}
	
  var page = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0,maximum-scale=1.0,initial-scale=1.0"><title>' + (document.querySelector('.name').value || 'My Website') + '</title><style>' + decodeURIComponent(css) + '</style></head><body>' + decodeURIComponent(html) + '<' + 'script>' + decodeURIComponent(js) + '<' + '/script></body></html>';
	var iframe = document.querySelector('div.rightColumn iframe');

  if (iframe.contentDocument){
  	doc = iframe.contentDocument;
  } else if(iframe.contentWindow) {
  	doc = iframe.contentWindow.document;
  } else {
  	doc = iframe.document;
  }

  doc.open();
  doc.writeln(page);
  doc.close();

	return page;
}

// resize panel
function resizePanel(panel){
	var e = (panel === 'rightColumn')? document.querySelector('.rightColumn') : document.querySelector('.leftColumn');
	
	if(e.style.zIndex === '5000'){
		
		if(e.getAttribute('class') === 'rightColumn'){
			e.style.left = '49.5%';
		}else{
			e.style.right = '50.5%'; 
		}
		e.removeAttribute("style");

	}else{
		
		if(e.getAttribute('class') === 'rightColumn'){
			e.style.left = 0;
		}else{
			e.style.right = 0;
		}
		e.style.zIndex = '5000';
	}
	// resize Ace editor
	editor.resize();
}

// Ctrl+j
function switchEditor(mode){
	if( editors && editors[0][1].getSession() ){
		if(!mode){
			editors.push(editors.shift());
			cycleEditors();
			document.getElementById('mode').innerHTML = editors[0][0].toUpperCase();
			if(TogetherJS && TogetherJS.running){
					TogetherJS.send({type: "switchEditor",currentMode:editors[0][0]});
			}
		}else{
			editors.push(editors.shift());
			cycleEditors();
			document.getElementById('mode').innerHTML = editors[0][0].toUpperCase();
		}
	}
}

function cycleEditors(){
	for (var i=0;editors.length > i; i++){
		if(i === 0){
			document.getElementById(editors[i][0]).style.display = 'block';
		}else{
			document.getElementById(editors[i][0]).style.display = 'none';
		}
	}
	editors[0][1].focus();
}

// Ctrl+k
function updateEditor(){
	updateIframe();
	renderKeyPressMsg();
}

// show/hide TogetherJS UI
function toggleEye(){
	var elm = document.querySelector('.eye');
	if(elm.classList.contains('lightEye')){
		elm.classList.remove('lightEye');
		elm.classList.add('darkEye');
		document.getElementById('togetherjs-container').style.display = 'none';
	}else{
		elm.classList.remove('darkEye');
		elm.classList.add('lightEye');
		document.getElementById('togetherjs-container').style.display = 'block';
	}
}

// toggle help dialog
function toggleHelp(e){
	var elem = document.getElementById('helpMsg'); 
	var elemToClose = document.getElementById('aboutMsg');
	var elemToRemoveStyle = document.getElementById('aboutBtn');
	if(	getComputedStyle(elem,null).getPropertyValue('display') === 'none'  ){
		elemToClose.style.display = 'none';
		elemToRemoveStyle.removeAttribute("style");
		elem.style.display = 'block';
		e.target.style.color = '#FFFFFF'
	}else{
		elem.style.display = 'none';
		e.target.removeAttribute("style");
	}
}

// toggle help dialog
function toggleAbout(e){
	var elem = document.getElementById('aboutMsg');
	var elemToClose = document.getElementById('helpMsg');
	var elemToRemoveStyle = document.getElementById('helpBtn');
	if(	getComputedStyle(elem,null).getPropertyValue('display') === 'none'  ){
		elemToClose.style.display = 'none';
		elemToRemoveStyle.removeAttribute("style");
		elem.style.display = 'block';
		e.target.style.color = '#FFFFFF'
	}else{
		elem.style.display = 'none';
		e.target.removeAttribute("style");
	}
}

// init Ace editors
function initAce(){
	
	for(var i=0; editors.length > i; i++){		
	  editors[i][1] = ace.edit(editors[i][0]);
	  editors[i][1].setTheme("ace/theme/monokai");
	  editors[i][1].getSession().setMode("ace/mode/"+editors[i][0]);
		editors[i][1].setShowPrintMargin(false);
		editors[i][1].$blockScrolling = Infinity; // prevents unnecessary messaging in console
		editors[i][1].setOptions({highlightActiveLine:false});
		
		editors[i][1].commands.addCommand({
			name: 'switchEditor',
			bindKey: {
				win: 'Ctrl-J',
				mac: 'Ctrl-J',
				sender: 'editor|cli'
			},
			exec: function(env, args, request) {
					switchEditor();
				}
		});
		editors[i][1].commands.addCommand({
			name: 'updateEditor',
			bindKey: {
				win: 'Ctrl-K',
				mac: 'Ctrl-K',
				sender: 'editor|cli'
			},
			exec: function(env, args, request) {
				updateEditor();
			}
		});
		editors[i][1].commands.addCommand({
			name: 'resizeLeftPanel',
			bindKey: {
				win: 'Ctrl-D',
				mac: 'Ctrl-D',
				sender: 'editor|cli'
			},
			exec: function(env, args, request) {
				resizePanel('leftColumn');
			}
		});
		editors[i][1].commands.addCommand({
			name: 'resizeRightPanel',
			bindKey: {
				win: 'Ctrl-F',
				mac: 'Ctrl-F',
				sender: 'editor|cli'
			},
			exec: function(env, args, request) {
				resizePanel('rightColumn');
			}
		});
	} // end for
	
	editors[0][1].focus();

}

// utils
function forEachElement(selector, fn){
  var elements = document.querySelectorAll(selector);
  for (var i = 0; i < elements.length; i++){
    fn(elements[i], i);
	}
}

function renderKeyPressMsg() {
  if(TogetherJS.running){
  	TogetherJS.send({type: "renderKeyPress"});
  }
}

// onload...
document.addEventListener('DOMContentLoaded', function(){
	initAce();
	updateIframe();
	// listeners
	document.querySelector('#updateBtn').addEventListener('click', updateIframe, false );
	document.querySelector('#downloadBtn').addEventListener('click', download, false );
	document.querySelector('#helpBtn').addEventListener('click', toggleHelp, false );
	document.querySelector('#aboutBtn').addEventListener('click', toggleAbout, false );
	document.querySelector('#collaborateBtn').addEventListener('click', TogetherJS, false );
	document.querySelector('.eye').addEventListener('click', toggleEye, false );
});

/*

Use your own product, be your most active customer!

TODO:
- Abilty to edit html/head/body tags
- add toggle for read only
- add toggle for switch sync
- tidyup
- lint
- Add name input for togetherjs
		var userName = window.prompt('Please enter your name:');
		TogetherJS.require("peers").Self.name = userName;
		TogetherJS.require("peers").Self.update(TogetherJS.require("peers").Self);

- Save content
	https://github.com/mozilla/localForage

- Create normalize.css file (test on diff. browsers)?

- include one app in another

- Refactor

- Add quick load of library/examples (jQuery,D3,ThreeJS...etc.), UX (text search?)
	- Babel Support

- Add learning panel
	- Voice and keyboard recording?
	- Youtube?
	- Web hub for sharing
	- sync learning panel with Collaborate?

- Mobile UX
	- add icon controls for tablet users

- Multi-language support
	https://hacks.mozilla.org/2014/12/introducing-the-javascript-internationalization-api/

- Login? Need to think about how this will affect user if added later (lose all local data)
	- login cookies can get stolen

- Add beta flag / name 
- get domain .com .rocks .school .site .team .page .education .academy .exchange .website .link .band
	htmlnoobs.com pairide.com pearide.com paireditor.com peareditor.com oiceditor.com oicedit.com
	peepseditor.com htmltogether.com htmlpartner.com synceditor.com sinkeditor.com webbudz.com webudz.com
	online real time editor partner pair program web page tutor teach learn together connect collaborate html css js render
	buddy cohort comrade pal helper sidekick playmate sync 

*/