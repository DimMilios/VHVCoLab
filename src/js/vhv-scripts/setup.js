/* global ace, require */

import { displayNotation } from './misc.js';
import { setEditorModeAndKeyboard } from './utility-ace.js';
/** @type {AceAjax.Editor | undefined} */
let editor;
let configureAce = true;

export function getAceEditor() {
  if (!editor) {
    setupAceEditor('input');
  }
  return editor;
}

export function setupAceEditor(idtag) {
  editor = ace.edit(idtag);
  window.EDITOR = editor;

  editor.on('ready', () => {
    if (!configureAce) {
      setEditorModeAndKeyboard();
    }
  });

  let configPath = `${import.meta.env.BASE_URL}scripts/ace`;

  ace.config.set("basePath", configPath);
  ace.config.set('modePath', configPath);
  ace.config.set('workerPath', configPath);
  ace.config.set('themePath', configPath);

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

  // These eat alt-l and alt-shift-l keyboard shortcuts on linux:
  editor.commands.removeCommand('fold', true);
  editor.commands.removeCommand('unfold', true);

  editor.getSession().setTabSize(global_editorOptions.TABSIZE);
  editor.getSession().setUseSoftTabs(false);

  // Don't show line at 80 columns:
  editor.setShowPrintMargin(false);

  // Range = window.require("ace/range").Range;
  window.Range = ace.require('ace/range').Range;

  // Force the cursor to blink when blurred (unfocused):
  //editor.renderer.$cursorLayer.showCursor();
  editor.renderer.$cursorLayer.smoothBlinking = true;
  editor.renderer.$cursorLayer.setBlinking(true);

  // editor.renderer.setOption('maxLines', 50);
  editor.renderer.setOption('minLines', 50);
  editor.renderer.setOption('hScrollBarAlwaysVisible', true);
  editor.renderer.setOption('vScrollBarAlwaysVisible', true);

  var cursor = document.querySelector('.ace_content .ace_cursor-layer');
  if (cursor) {
    CURSOR_OBSERVER = new MutationObserver(customCursor);
    CURSOR_OBSERVER.observe(cursor, { attributes: true });
  }

  editor.setTheme('ace/theme/humdrum_light');
}

import { setTextInEditor } from './misc.js';
import { global_editorOptions, global_interface } from './global-variables.js';
import splitter from './splitter.js';

export function insertSplashMusic() {
  var splashElement = document.querySelector('#input-splash');
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

var CURSOR_OBSERVER;
var CURSOR_DISPLAY;

function customCursor() {
  // Change scope
  let activeElement = document.activeElement.nodeName;
  let cursor = editor.renderer.$cursorLayer.cursor;
  let cursorstate = null;

  for (let i = 0; i < cursor.classList.length; i++) {
    if (cursor.classList[i] == 'blurred') {
      cursorstate = 'blurred';
      break;
    }
    if (cursor.classList[i] == 'focused') {
      cursorstate = 'focused';
      break;
    }
  }
  if (activeElement === 'TEXTAREA') {
    if (cursorstate != 'focused') {
      if (!CURSOR_DISPLAY) {
        CURSOR_DISPLAY = true;
      }
      // console.log("FOCUSING CURSOR");
      cursor.classList.add('focused');
      cursor.classList.remove('blurred');
      editor.renderer.$cursorLayer.setBlinking(true);
      editor.renderer.$cursorLayer.showCursor();
    }
  } else if (CURSOR_DISPLAY) {
    if (cursorstate != 'blurred') {
      // console.log("BLURRING CURSOR");
      cursor.classList.add('blurred');
      cursor.classList.remove('focused');
      editor.renderer.$cursorLayer.showCursor();
      editor.renderer.$cursorLayer.setBlinking(true);
    }
  }
}

export function setupSplitter() {
  var splitterElem = document.querySelector('#splitter');
  if (!splitterElem) {
    return;
  }

  if (!splitter.leftContent) {
    splitter.leftContent = document.querySelector('#input');
  }
  if (!splitter.splitContent) {
    splitter.splitContent = document.querySelector('#splitter');
  }
  if (!splitter.rightContent) {
    splitter.rightContent = document.querySelector('#output');
  }

  splitterElem.addEventListener('mousedown', function (event) {
    splitter.mouseState = 1;
    if (!splitter.leftContent) {
      splitter.leftContent = document.querySelector('#input');
    }
    if (!splitter.splitContent) {
      splitter.splitContent = document.querySelector('#splitter');
    }
    if (!splitter.rightContent) {
      splitter.rightContent = document.querySelector('#output');
    }
    splitter.setPositionX(event.pageX);
  });

  window.addEventListener('mouseup', function (event) {
    if (splitter.mouseState != 0) {
      splitter.mouseState = 0;
      editor.resize();
      displayNotation();
    }
  });

  window.addEventListener('mousemove', function (event) {
    if (splitter.mouseState) {
      var minXPos = splitter.minXPos;
      if (event.pageX < minXPos) {
        if (event.pageX < minXPos - 70) {
          //Adjust closing snap tolerance here
          splitter.setPositionX(0);
          global_interface.InputVisible = false;
        }
        return;
      }
      splitter.setPositionX(event.pageX);
      global_interface.InputVisible = true;
    }
  });
}

//////////////////////////////
//
// GetCgiParameters -- Returns an associative array containing the
//     page's URL's CGI parameters
//

export function GetCgiParameters() {
	var url = window.location.search.substring(1);
	var output = {};
	var settings = url.split('&');
	for (var i=0; i<settings.length; i++) {
		var pair = settings[i].split('=');
		pair[0] = decodeURIComponent(pair[0]);
		pair[1] = decodeURIComponent(pair[1]);
		if (typeof output[pair[0]] === 'undefined') {
			output[pair[0]] = pair[1];
		} else if (typeof output[pair[0]] === 'string') {
			var arr = [ output[pair[0]], pair[1] ];
			output[pair[0]] = arr;
		} else {
			output[pair[0]].push(pair[1]);
		}
	}
	if (!output.mm || output.mm.match(/^\s*$/)) {
		if (output.m) {
			output.mm = output.m;
		}
	}

	// process aliases:

	if (!output.k && output.keys) {
		output.k = output.keys;
	} else if (output.k && !output.keys) {
		output.keys = output.k;
	}

	if (!output.t && output.text) {
		output.t = output.text;
	} else if (output.t && !output.text) {
		output.text = output.t;
	}

	if (!output.f && output.file) {
		output.f = output.file;
	} else if (output.f && !output.file) {
		output.file = output.f;
	}

	if (!output.F && output.filter) {
		output.F = output.filter;
	} else if (output.F && !output.filter) {
		output.filter = output.F;
	}

	if (!output.p && output.pitch) {
		output.p = output.pitch;
	} else if (output.p && !output.pitch) {
		output.pitch = output.p;
	}

	if (!output.r && output.rhythm) {
		output.r = output.rhythm;
	} else if (output.r && !output.rhythm) {
		output.rhythm = output.r;
	}

	if (!output.i && output.interval) {
		output.i = output.interval;
	} else if (output.i && !output.interval) {
		output.interval = output.i;
	}

	// store the URL anchor as a output parameter
	let hash = location.hash.replace(/^#/, "");
	let matches;

	// store #m parameter
	matches = hash.match(/m(?![a-z])(\d+.*)/);
	if (matches) {
		output.hash_m = matches[1];
	}

	// store #mm parameter
	matches = hash.match(/mm(?![a-z])(\d+.*)/);
	if (matches) {
		output.hash_mm = matches[1];
	}

	// store #mh parameter
	matches = hash.match(/mh(?![a-z])(\d+.*)/);
	if (matches) {
		output.hash_mh = matches[1];
	}

	// store #mmh parameter
	matches = hash.match(/mmh(?![a-z])(\d+.*)/);
	if (matches) {
		output.hash_mmh = matches[1];
	}

	return output;
}