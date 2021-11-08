import { initializeVerovioToolkit, displayNotation } from './misc.js';

import Ace from 'ace-builds/src/ace';
import 'ace-builds/src/mode-xml';
import 'ace-builds/src/ext-searchbox';
// import '../ace/mode-humdrum.js';

// import 'ace-builds/src/mode-humdrum';
// import 'ace-builds/src/theme-humdrum_light';
// import 'ace-builds/src/worker-humdrum';

// const Range = Ace.require('ace/range').Range;

//////////////////////////////
//
// downloadVerovioToolkit --
//
import { getVrvWorker } from '../humdrum-notation-plugin-worker.js';

let vrvWorker = getVrvWorker();
if (!vrvWorker) {
	throw new Error('Verovio worker is undefined');
}

function downloadVerovioToolkit(use_worker) {
	console.log('Downloading vrv toolkit from setup.js');
	// window.vrvWorker = new window.vrvInterface(use_worker, initializeVerovioToolkit);
	vrvWorker = new window.vrvInterface(use_worker, initializeVerovioToolkit);
};



//////////////////////////////
//
// setupAceEditor --
//       https://en.wikipedia.org/wiki/Ace_(editor)
//
//  see: https://github.com/ajaxorg/ace/wiki/Embedding-API
//
// Folding:
//   https://cloud9-sdk.readme.io/docs/code-folding
//
// console.log("NUMBER OF LINES IN FILE",editor.session.getLength());
//
// Keyboard Shortcuts:
//   https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts
//
// ACE Grammar editor:
// https://foo123.github.io/examples/ace-grammar
//

/* global ace, require */

import { setEditorModeAndKeyboard } from './utility-ace.js';
let editor;
let configureAce = true;

export function getAceEditor() {
	if (typeof editor === 'undefined') {
		console.log('Ace wasn\'t initialized, setting Ace up now', new Error().stack);
		setupAceEditor('input');
	}
	return editor;
}

export function setupAceEditor(idtag) {
	// window.EDITOR = Ace.edit(idtag);
	editor = Ace.edit(idtag);

	editor.on('ready', () => {
		if (!configureAce) {
			console.log('Ace ready event handler called');
			setEditorModeAndKeyboard();
			insertSplashMusic();
		}
	})

	// Ace.config.set("basePath", "/scripts-static/ace");
	Ace.config.set('modePath', "/scripts-static/ace");
	Ace.config.set('workerPath', "/scripts-static/ace");
	Ace.config.set('themePath', "/scripts-static/ace");
	
	// Ace.config.set('modePath', "/scripts/ace");
	// Ace.config.set('workerPath', "/scripts/ace");
	// Ace.config.set('themePath', "/scripts/ace");
	if (configureAce) {
		configureAceEditor();
		configureAce = false;
	}
}

export function configureAceEditor() {
	editor.getSession().setUseWorker(true);
	editor.$blockScrolling = Infinity;
	editor.setAutoScrollEditorIntoView(true);
	editor.setBehavioursEnabled(false); // no auto-close of parentheses, quotes, etc.
	//editor.cursorStyle: 'ace', // "ace"|"slim"|"smooth"|"wide"

	// See this webpage to turn of certain ace editor shortcuts:
	// https:github.com//ajaxorg/ace/blob/master/lib/ace/commands/default_commands.js

	// These eat alt-l and alt-shift-l keyboard shortcuts on linux:
	editor.commands.removeCommand("fold", true);
	editor.commands.removeCommand("unfold", true);
	// best themes:
	// kr_theme == black background, gray highlight, muted colorizing
	// solarized_dark == blue background, light blue hilight, relaxing colorizing
	// vibrant_ink == black background, gray highlight, nice colorizing
	// solarized_light == yellowish background, gray highlight, nice colorizing

	//editor.setKeyboardHandler("ace/keyboard/vim");

	// keybinding = ace | vim | emacs | custom
	// fontsize   = 10px, etc
	// theme = "ace/theme/solarize_light"

	//editor.getSession().setMode("ace/mode/javascript");

	editor.getSession().setTabSize(window.TABSIZE);
	editor.getSession().setUseSoftTabs(false);

	// Don't show line at 80 columns:
	editor.setShowPrintMargin(false);

	// Range = window.require("ace/range").Range;
	window.Range = Ace.require('ace/range').Range;


	//editor.getSession().selection.on("changeCursor", function(event)
	// 	{ highlightNoteInScore(event)});

	// Force the cursor to blink when blurred (unfocused):
	//editor.renderer.$cursorLayer.showCursor();
	editor.renderer.$cursorLayer.smoothBlinking = true;
	editor.renderer.$cursorLayer.setBlinking(true);

	//EDITOR.commands.addCommand({
	//	name: 'saveFile',
	//	bindKey: {
	//			win: 'Alt-G',
	//			mac: 'Alt-G',
	//			sender: 'editor|cli'
	//		},
	//	exec: function(env, argc, request) {
	//		alert("HI!", env, argc, request);
	//	}
	//});

	var cursor = document.querySelector(".ace_content .ace_cursor-layer");
	if (cursor) {
		CURSOR_OBSERVER = new MutationObserver(customCursor);
		CURSOR_OBSERVER.observe(cursor, {attributes: true});
	}

	// editor.setTheme('ace/theme/humdrum_light');
	// editor.session.setMode('ace/mode/humdrum');

	// setEditorModeAndKeyboard();
	// insertSplashMusic();
	// editor._dispatchEvent('ready');
}

(function () {
	// setupAceEditor('input');
	// editor._dispatchEvent('ready');
})()


//////////////////////////////
//
// insertSplashMusic --
//
import { setTextInEditor } from './misc.js'

function insertSplashMusic() {
	var splashElement = document.querySelector("#input-splash");
	if (!splashElement) {
		return;
	}
	let text = editor.getValue();
	if (!text.match(/^\s*$/)) {
		return;
	}
	var splash = splashElement.textContent;
	setTextInEditor(splash);
}



//////////////////////////////
//
// Setup styling of blurred ace-editor cursor:
//

var CURSOR_OBSERVER;
var CURSOR_DISPLAY;

function customCursor() {
	// Change scope
	let activeElement = document.activeElement.nodeName;
	let cursor = editor.renderer.$cursorLayer.cursor;
	let cursorstate = null;

	for (let i=0; i<cursor.classList.length; i++) {
		if (cursor.classList[i] == "blurred") {
			cursorstate = "blurred";
			break;
		}
		if (cursor.classList[i] == "focused") {
			cursorstate = "focused";
			break;
		}
	}
	if (activeElement === "TEXTAREA") {
		if (cursorstate != "focused") {
			if (!CURSOR_DISPLAY) {
				CURSOR_DISPLAY = true;
			}
			// console.log("FOCUSING CURSOR");
			cursor.classList.add("focused");
			cursor.classList.remove("blurred");
			editor.renderer.$cursorLayer.setBlinking(true);
			editor.renderer.$cursorLayer.showCursor();
		}
	} else if (CURSOR_DISPLAY) {
		if (cursorstate != "blurred") {
			// console.log("BLURRING CURSOR");
			cursor.classList.add("blurred");
			cursor.classList.remove("focused");
			editor.renderer.$cursorLayer.showCursor();
			editor.renderer.$cursorLayer.setBlinking(true);
		}

	}
}



//////////////////////////////
//
// setupSplitter --
//

export function setupSplitter() {
	var splitter = document.querySelector("#splitter");
	if (!splitter) {
		return;
	}

	if (!window.Splitter.leftContent) {
		window.Splitter.leftContent = document.querySelector('#input');
	}
	if (!window.Splitter.splitContent) {
		window.Splitter.splitContent = document.querySelector('#splitter');
	}
	if (!window.Splitter.rightContent) {
		window.Splitter.rightContent = document.querySelector('#output');
	}

	splitter.addEventListener('mousedown', function(event) {
		window.Splitter.mouseState    = 1;
		if (!window.Splitter.leftContent) {
			window.Splitter.leftContent   = document.querySelector('#input');
		}
		if (!window.Splitter.splitContent) {
			window.Splitter.splitContent  = document.querySelector('#splitter');
		}
		if (!window.Splitter.rightContent) {
			window.Splitter.rightContent  = document.querySelector('#output');
		}
		window.Splitter.setPositionX(event.pageX);
	});

	window.addEventListener('mouseup', function(event) {
		if (window.Splitter.mouseState != 0) {
			window.Splitter.mouseState = 0;
			editor.resize();
			displayNotation();
		}
	});

	window.addEventListener('mousemove', function(event) {
		if (window.Splitter.mouseState) {
			var minXPos = window.Splitter.minXPos;
			if (event.pageX < minXPos){
				if (event.pageX < minXPos - 70){ //Adjust closing snap tolerance here
					window.Splitter.setPositionX(0);
					window.InputVisible = false;
				}
				return;
			}
			window.Splitter.setPositionX(event.pageX);
			window.InputVisible = true;
		}
	});
}