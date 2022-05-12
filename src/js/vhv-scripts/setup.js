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
  console.log({ configPath, meta: import.meta.url })

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
