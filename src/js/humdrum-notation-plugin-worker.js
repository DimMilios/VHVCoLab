//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec  2 08:11:05 EST 2018
// Last Modified: Sun Dec 23 01:58:26 EST 2018
// Filename:      humdrum-notation-plugin.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
//	This script sets up an editiable humdrum text region
//	on a webpage plus a dynamcially calculated SVG image
//	generated from the humdrum text using verovio.
//
//	Input parameters for plugin styling:
//		tabsize:            default none (browser default)
//		humdrumMinHeight: the minimum height of the humdrum text box
//		humdrumMaxWidth:  the maximum width of the humdrum text box
//		humdrumMinWidth:  the maximum width of the humdrum text box
//		humdrumVisible:    "false" will hide the humdrum text.
//		callback:           callback when notation changes
//
//	Parameters for verovio:
//	http://www.verovio.org/command-line.xhtml
//
//		adjustPageHeight default 1
//		border           default 50
//		evenNoteSpacing  default 0
//		font             default "Leipzig"
//		inputFrom        default "auto"
//		# page           default 1
//		# header         default 0
//		# footer         default 0
//		pageHeight       default 60000
//		pageWidth        default 1350
//		scale            default 40
//		spacingLinear    default 0.25
//		spacingNonLinear default 0.6
//		spacingStaff     default 12
//		spacingSystem    default 12
//

//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Sun Dec 23 01:47:54 EST 2018
// Last Modified: Sun Dec 23 01:47:57 EST 2018
// Filename:      _includes/code/global.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3
//
// This file contains global functions for the Humdrum notation plugin.
//

'use strict';

import { featureIsEnabled } from './bootstrap.js';
//////////////////////////////
//
// DOMContentLoaded event listener --
//

// document.addEventListener("DOMContentLoaded", function() {
// 	downloadVerovioToolkit("true");
// });

/* global $ */
import { midiStop, midiUpdate } from './midifunctions.js';
import { global_interface } from './vhv-scripts/global-variables.js';
import {
  monitorNotationUpdating,
  displayNotation,
  applyZoom,
} from './vhv-scripts/misc.js';
import { getAceEditor } from './vhv-scripts/setup.js';
import { humdrumDataNoteIntoView } from './vhv-scripts/utility-ace.js';
import { markItem } from './vhv-scripts/utility-svg.js';
import { yProvider } from './yjs-setup.js';

let vrvWorker;

export function getVrvWorker() {
  // Download verovio if the worker hasn't been initialized yet
  if (typeof vrvWorker === 'undefined') {
    downloadVerovioToolkit('true');
  }
  return vrvWorker;
}

//////////////////////////////
//
// downloadVerovioToolkit --
//

function downloadVerovioToolkit(use_worker) {
  console.log('Downloading vrv toolkit from humdrum-notation-plugin-worker.js');
  vrvWorker = new vrvInterface(use_worker, callbackAfterInitialized);
  // window.vrvWorker = vrvWorker;
}

function callbackAfterInitialized() {
  console.log('Initialized verovio worker');
  initializeVerovioToolkit();
}

function initializeVerovioToolkit() {
  // console.log("Verovio toolkit being initialized.");

  let editor = getAceEditor();
  if (editor) {
    editor.session.on('change', function (e) {
      // console.log("EDITOR content changed", e);
      monitorNotationUpdating();
    });

    editor.getSession().selection.on('changeCursor', function () {
      const { row, column } = editor.selection.getCursor();
      const item = humdrumDataNoteIntoView(row, column);
      // console.log('changeCursor event', { row, column, item })
      const noteOrHarmItem = item?.classList.contains('note') || 
        item?.classList.contains('harm');
      if (noteOrHarmItem) {
        //markItem(item);
        // createNewEditorSession({ item, row, column });
        // createDraggableContainer(item);

        if (featureIsEnabled('collaboration')) {
          if (yProvider) {
            const localState = yProvider.awareness.getLocalState();

            yProvider.awareness.setLocalState({
              ...localState,
              singleSelect: { elemId: item.id },
              multiSelect: null,
            });
          }
        }
      }
    });
  } else {
    console.log('Warning: Editor not setup yet');
  }

  // $(window).resize(function() { applyZoom(); });
  $(window).resize(function () {
    displayNotation();
  });

  $('#input').mouseup(function () {
    let $this = $(this);
    if (
      $this.outerWidth() != $this.data('x') ||
      $this.outerHeight() != $this.data('y')
    ) {
      applyZoom();
    }
    $this.data('x', $this.outerWidth());
    $this.data('y', $this.outerHeight());
  });

  if (!global_interface.ShowingIndex) {
    console.log('Score will be displayed after verovio has finished loading');
    displayNotation();
  }

  // downloadWildWebMidi('scripts/midiplayer/wildwebmidi.js');
  initializeWildWebMidi();
}

function initializeWildWebMidi() {
  $('#player').midiPlayer({
    color: null,
    // color: "#c00",
    // onUnpdate: window.midiUpdate,
    // onStop: window.midiStop,
    onUpdate: midiUpdate,
    onStop: midiStop,
    width: 250,
    // locateFile: function () {
    //   return 'wildwebmidi.data';
    // }
  });

  $('#input').keydown(function () {
    stop();
  });

  /*
  // window blur event listener -- Stop MIDI playback.  It is very computaionally
  //    expensive, and is not useful if the window is not in focus.
  window.addEventListener('blur', function () {
    window.pause();
  });
  */
}
//////////////////////////////
//
// vrvInterface::vrvInterface --
//

function vrvInterface(use_worker, onReady) {
  this.WIDTH = 0;
  this.HEIGHT = 0;
  this.page = 1;
  this.pageCount = 0;
  this.options = {};

  this.initialized = false;
  this.usingWorker = use_worker;

  if (use_worker) {
    this.createWorkerInterface(onReady);
  } else {
    this.createDefaultInterface(onReady);
  }
}

//////////////////////////////
//
// vrvInterface::createWorkerInterface --
//
vrvInterface.prototype.createWorkerInterface = function (onReady) {
  var vrv = this;

  function handleEvent(oEvent) {
    switch (oEvent.data.method) {
      case 'ready':
        vrv.initialized = true;
        onReady();
        break;
      default:
        while (vrv.resolvedIdx <= oEvent.data.idx) {
          //resolve or reject
          if (vrv.resolvedIdx === oEvent.data.idx) {
            if (oEvent.data.success) {
              vrv.promises[vrv.resolvedIdx].deferred.resolve(
                oEvent.data.result
              );
            } else {
              vrv.promises[vrv.resolvedIdx].deferred.reject(oEvent.data.result);
            }
          } else {
            vrv.promises[vrv.resolvedIdx].deferred.reject();
          }
          if (vrv.promises[vrv.resolvedIdx].method === 'renderData') {
            vrv.renderDataPending--;
            if (vrv.renderDataPending === 0) vrv.handleWaitingRenderData();
          }
          delete vrv.promises[vrv.resolvedIdx];
          vrv.resolvedIdx++;
        }
    }
  }

  console.log('creating verovio worker interface');
  this.promises = {};
  this.promiseIdx = 0;
  this.resolvedIdx = 0;
  this.renderDataPending = 0;
  this.renderDataWaiting = null;

  //
  // 	console.log("LOADING https://verovio-script.humdrum.org/scripts/verovio-worker.js");
  // 	var workerUrl = "https://verovio-script.humdrum.org/scripts/verovio-worker.js";
  //

  this.worker = null;
  var that = this;
  try {
    // Worker script location need to be static, otherwise Vite won't transform them
    if (import.meta.env.DEV) {
      console.log('Loading development Verovio Worker');
      that.worker = new Worker(
        new URL('./worker/verovio-worker-dev.js', import.meta.url)
      );
    } else {
      console.log('Loading production Verovio Worker');
      that.worker = new Worker(
        new URL('./worker/verovio-worker-prod.js', import.meta.url)
      );
    }
    that.worker.addEventListener('message', handleEvent);

    that.worker.onerror = function (event) {
      event.preventDefault();
      console.log(event);
    };
  } catch (e) {
    console.log(e);
  }
};

//////////////////////////////
//
// vrvInterface::checkInitialized --
//

vrvInterface.prototype.checkInitialized = function () {
  if (!this.initialized) throw 'Verovio toolkit not (yet) initialized';
};

//////////////////////////////
//
// vrvInterface::filterData --
//

vrvInterface.prototype.filterData = function (opts, data, type) {
  // Don't store options when filtering data.
  return this.execute('filterData', arguments);
};

//////////////////////////////
//
// vrvInterface::renderData --
//

vrvInterface.prototype.renderData = function (opts, data, page) {
  // console.log("%cvrvInterface.renderData", "color: #aa8800; font-weight: bold");
  this.options = opts;
  return this.execute('renderData', arguments);
};

//////////////////////////////
//
// vrvInterface::getHumdrum --
//

vrvInterface.prototype.getHumdrum = function () {
  // console.log("%cvrvInterface.getHumdrum", "color: #aa8800; font-weight: bold");
  var value = this.execute('getHumdrum', arguments);
  return value;
};

//////////////////////////////
//
// vrvInterface::redoLayout --
//

vrvInterface.prototype.redoLayout = function (opts, redo, measure) {
  // console.log("%cvrvInterface.redoLayout", "color: #8800aa; font-weight: bold");
  this.options = opts;
  return this.execute('redoLayout', arguments);
};

//////////////////////////////
//
// vrvInterface::renderPage --
//

vrvInterface.prototype.renderPage = function (page) {
  return this.execute('renderPage', arguments);
};

//////////////////////////////
//
// vrvInterface::renderAllPages --
//

vrvInterface.prototype.renderAllPages = function (data, opts) {
  return this.execute('renderAllPages', arguments);
};

//////////////////////////////
//
// vrvInterface::gotoPage --
//

vrvInterface.prototype.gotoPage = function (page) {
  var vrv = this;
  return this.execute('gotoPage', arguments).then(function (obj) {
    vrv.page = obj.page;
    vrv.pageCount = obj.pageCount;
    return page;
  });
};

//////////////////////////////
//
// vrvInterface::getMEI --
//

vrvInterface.prototype.getMEI = function (page) {
  return this.execute('getMEI', arguments);
};

//////////////////////////////
//
// vrvInterface::renderToMidi --
//

vrvInterface.prototype.renderToMidi = function () {
  var value = this.execute('renderToMidi', arguments);
  return value;
};

//////////////////////////////
//
// vrvInterface::getElementsAtTime --
//

vrvInterface.prototype.getElementsAtTime = function (vrvTime) {
  return this.execute('getElementsAtTime', arguments);
};

//////////////////////////////
//
// vrvInterface::getTimeForElement --
//

vrvInterface.prototype.getTimeForElement = function (id) {
  return this.execute('getTimeForElement', arguments);
};

//////////////////////////////
//
// vrvInterface::execute --
//

vrvInterface.prototype.execute = function (method, args) {
  var vrv = this;
  if (this.usingWorker) {
    var arr = Array.prototype.slice.call(args);
    switch (method) {
      case 'renderData':
        return vrv.postRenderData(method, arr);
      default:
        vrv.handleWaitingRenderData();
        return vrv.post(method, arr);
    }
  } else {
    return new RSVP.Promise(function (resolve, reject) {
      try {
        vrv.checkInitialized();
        resolve(vrv.verovio[method].apply(vrv.verovio, args));
      } catch (err) {
        reject(err);
      }
    });
  }
};

//////////////////////////////
//
// vrvInterface::handleWaitingRenderData --
//

vrvInterface.prototype.handleWaitingRenderData = function () {
  if (this.renderDataWaiting) {
    this.postDeferredMessage(
      'renderData',
      this.renderDataWaiting.args,
      this.renderDataWaiting.deferred
    );
    this.renderDataWaiting = null;
    this.renderDataPending++;
  }
};

//////////////////////////////
//
// vrvInterface::postRenderData --
//

vrvInterface.prototype.postRenderData = function (method, args) {
  // squash pending renderings:
  if (this.renderDataPending > 0) {
    if (!this.renderDataWaiting) {
      this.renderDataWaiting = {
        deferred: new RSVP.defer(),
      };
    }
    this.renderDataWaiting.args = args;
    return this.renderDataWaiting.deferred.promise;
  } else {
    this.renderDataPending++;
    this.renderDataWaiting = null;
    return this.post(method, args);
  }
};

//////////////////////////////
//
// vrvInterface::post --
//

vrvInterface.prototype.post = function (method, args) {
  return this.postDeferredMessage(method, args, new RSVP.defer());
};

//////////////////////////////
//
// vrvInterface::postDeferredMessage --
//

vrvInterface.prototype.postDeferredMessage = function (method, args, deferred) {
  // console.log('Posting deferred message to Verovio worker', { method, args });
  this.worker.postMessage({
    idx: this.promiseIdx,
    method: method,
    args: args,
  });
  this.promises[this.promiseIdx] = {
    method: method,
    deferred: deferred,
  };
  this.promiseIdx++;
  return deferred.promise;
};
