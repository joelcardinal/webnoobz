// TogetherJS events
TogetherJS.hub.on("togetherjs.form-init", function (msg) {
	updateIframe();
});
TogetherJS.hub.on("renderKeyPress", function (msg) {
  updateIframe();
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


// Start main app functions

var data = [
	['html',''],
	['javascript',''],
	['css','']
];

var editor;

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

// update page render
function updateIframe(){
	var js,css,html;
	data[0][1] = encodeURIComponent(editor.getSession().getValue());
	
	for (k in data){
		switch( data[k][0] ){
			case 'html':
				html = data[k][1] ? data[k][1]: '<div style="font-family:monospace;color:#D1CACA;margin-top:31px;margin">Cycles Editors: Ctrl+j<br>Update Render: Update button or Ctrl+k<br>Resize Workspace: Ctrl+d<br>Resize Render: Ctrl+f</div>';
				break;
			case 'css':
				css = data[k][1].split('%C2%A0').join('');
				break;
			case 'js':
				js = data[k][1];
				break;
		}
	}
	
  var page = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0,maximum-scale=1.0,initial-scale=1.0"><title>' + (document.querySelector('.name').value || 'My Website') + '</title><style>' + decodeURIComponent(css) + '</style></head><body>' + decodeURIComponent(html) + '<' + 'script>' + decodeURIComponent(js) + '<'+'/script></body></html>';
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
}

// Ctrl+j
function switchEditor(){
	data[0][1] = encodeURIComponent(editor.getSession().getValue());
	data.push(data.shift());
	//document.querySelector('.leftColumn').setAttribute('id',data[0][0]);
	document.querySelector('.mode').innerHTML = data[0][0].toUpperCase();
	if( editor && editor.getSession() ){
		  editor.getSession().setMode("ace/mode/" + data[0][0]);
			editor.getSession().setValue(decodeURIComponent(data[0][1]));
	}
}

// Ctrl+k
function updateEditor(){
	updateIframe();
	renderKeyPressMsg(); // should this go in updateIframe()?
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

function initAce(){
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/html");
	editor.setShowPrintMargin(false);
	editor.commands.addCommand({
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
	editor.commands.addCommand({
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
	editor.commands.addCommand({
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
	editor.commands.addCommand({
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
	editor.$blockScrolling = Infinity;
	//editor.getSession().setTabSize(2);
	//setOptions({enableBasicAutocompletion: true});
	/*
	editor.getSession().on('change', function(){
	  console.log(editor.getSession().getValue());
	});
	*/
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
	document.querySelector('#collaborateBtn').addEventListener('click', TogetherJS, false );
	document.querySelector('.eye').addEventListener('click', toggleEye, false );
	
	/*
	forEachElement('.resize', function(el, i){
		el.onclick = function(e){editFullSize(e);};
	});
	*/
	
});

/*	

TODO:
- Add Help nav with commands, etc.
- Double scroll bars if vertical content?
- Create normalize.css file?
- Eye gets out of sync with Collaborate?
- Save content
- Refactor
- Mobile UX
- Add learning panel
	- Voice and keyboard recording?
	- Youtube?
	- Web hub for sharing
	- sync learning panel with Collaborate?
- Multi-language support
- Abilty to edit html/head/body tags
- Login? Need to think about how this will affect user if added later (lose all local data)
- Add quick load of library examples (jQuery,D3,ThreeJS...etc.)

IDEAS:
- Pre-parser to catch errors?

Resources:
http://pixlr.com/editor/
http://duri.me/

*/