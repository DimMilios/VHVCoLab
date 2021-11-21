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

//////////////////////////////
//
// DOMContentLoaded event listener --
//

// document.addEventListener("DOMContentLoaded", function() {
// 	downloadVerovioToolkit("true");
// });

/* global $ */

let vrvWorker;

export function getVrvWorker() {
	// Download verovio if the worker hasn't been initialized yet
	if (typeof vrvWorker === 'undefined') {
		downloadVerovioToolkit("true");
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
	console.log("Initialized verovio worker");
	initializeVerovioToolkit();
}

import { global_interface } from './vhv-scripts/global-variables.js';
import { monitorNotationUpdating, displayNotation, applyZoom } from './vhv-scripts/misc.js';
import { getAceEditor } from './vhv-scripts/setup.js';

function initializeVerovioToolkit() {
  // console.log("Verovio toolkit being initialized.");

	let editor = getAceEditor();
  if (editor) {
   editor.session.on('change', function (e) {
      // console.log("EDITOR content changed", e);
      monitorNotationUpdating();
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
  $("#player").midiPlayer({
    color: null,
    // color: "#c00",
    onUnpdate: window.midiUpdate,
    onStop: window.midiStop,
    width: 250,
    // locateFile: function () {
    //   return 'wildwebmidi.data';
    // }
  });

	$('#input').keydown(function () {
    stop();
  });

  // window blur event listener -- Stop MIDI playback.  It is very computaionally
  //    expensive, and is not useful if the window is not in focus.
  window.addEventListener('blur', function () {
    window.pause();
  });
}

//////////////////////////////
//
// convertMusicXmlToHumdrum --
//

// function convertMusicXmlToHumdrum(targetElement, sourcetext, vrvOptions, pluginOptions) {
// 	// var toolkit = pluginOptions.renderer;
// 	if (typeof vrvWorker !== "undefined") {
// 		toolkit = vrvWorker;
// 	}

// 	if (!toolkit) {
// 		console.log("Error: Cannot find verovio toolkit!");
// 		return;
// 	}
// 	// inputFrom = input data type
// 	vrvOptions.inputFrom = "musicxml-hum";


// 	vrvWorker.filterData(vrvOptions, sourcetext, "humdrum")
// 	.then(function(content) {
// 		targetElement.textContent = content;
// 		targetElement.style.display = "block";
// 	});

// }



//////////////////////////////
//
// getHumdrum -- Return the Humdrum data used to render the last
//    SVG image(s).  This Humdrum data is the potentially
//    filtered input Humdrum data (otherwise the last raw
//    Humdrum input data).
//


// function getHumdrum(pluginOptions) {
// 	var toolkit = pluginOptions.renderer;
// 	if (typeof vrvWorker !== "undefined") {
// 		toolkit = vrvWorker;
// 	}


// 	if (!toolkit) {
// 		console.log("Error: Cannot find verovio toolkit!");
// 		return;
// 	}


// 	vrvWorker.getHumdrum()
// 	.then(function(content) {
// 		return content;
// 	});

// }



//////////////////////////////
//
// convertMeiToHumdrum --
//


// function convertMeiToHumdrum(targetElement, sourcetext, vrvOptions, pluginOptions) {
// 	var toolkit = pluginOptions.renderer;
// 	if (typeof vrvWorker !== "undefined") {
// 		toolkit = vrvWorker;
// 	}


// 	if (!toolkit) {
// 		console.log("Error: Cannot find verovio toolkit!");
// 		return;
// 	}
// 	// inputFrom = input data type
// 	vrvOptions.inputFrom = "mei-hum";


// 	vrvWorker.filterData(vrvOptions, sourcetext, "humdrum")
// 	.then(function(content) {
// 		targetElement.textContent = content;
// 		targetElement.style.display = "block";
// 	});

// }



//////////////////////////////
//
// getFilters -- Extract filters from the options and format for insertion
//    onto the end of the Humdrum data inpt to verovio.
//

// function getFilters(options) {
// 	var filters = options.filter;
// 	if (!filters) {
// 		filters = options.filters;
// 	}
// 	if (!filters) {
// 		return "";
// 	}
// 	if (Object.prototype.toString.call(filters) === "[object String]") {
// 		filters = [filters];
// 	} else if (!Array.isArray(filters)) {
// 		// expected to be a string or array, so giving up
// 		return "";
// 	}
// 	var output = "";
// 	for (var i=0; i<filters.length; i++) {
// 		output += "!!!filter: " + filters[i] + "\n";
// 	}

// 	return output;
// }



//////////////////////////////
//
// executeFunctionByName -- Also allow variable names that store functions.
//

// function executeFunctionByName(functionName, context /*, args */) {
// 	if (typeof functionName === "function") {
// 		return
// 	}
// 	var args = Array.prototype.slice.call(arguments, 2);
// 	var namespaces = functionName.split(".");
// 	var func = namespaces.pop();
// 	for (var i = 0; i < namespaces.length; i++) {
// 		context = context[namespaces[i]];
// 		if (context && context[func]) {
// 			break;
// 		}
// 	}
// 	return context[func].apply(context, args);
// }



//////////////////////////////
//
// functionName --
//

// function functionName(fun) {
//   var ret = fun.toString();
//   ret = ret.substr('function '.length);
//   ret = ret.substr(0, ret.indexOf('('));
//   return ret;
// }


//////////////////////////////
//
// saveHumdrumSvg -- Save the specified Hudrum SVG images to the hard disk.  The input
// can be any of:
//    * A Humdrum script ID
//    * An array of Humdrum script IDs
//    * Empty (in which case all images will be saved)
//    * An SVG element
//

// function saveHumdrumSvg(tags, savename) {
// 	if ((tags instanceof Element) && (tags.nodeName === "svg")) {
// 		// Save a single SVG element's contents to the hard disk.
// 		var sid = "";
// 		sid = tags.id;
// 		if (!sid) {
// 			sid = tags.parentNode.id;
// 		}
// 		var filename = savename;
// 		if (!filename) {
// 			filename = sid.replace(/-svg$/, "") + ".svg";
// 		}
// 		var text = tags.outerHTML.replace(/&nbsp;/g, " ").replace(/&#160;/g, " ");
// 		blob = new Blob([text], { type: 'image/svg+xml' }),
// 		anchor = document.createElement('a');
// 		anchor.download = filename;
// 		anchor.href = window.URL.createObjectURL(blob);
// 		anchor.dataset.downloadurl = ['image/svg+xml', anchor.download, anchor.href].join(':');
// 		(function (anch, blobby, fn) {
// 			setTimeout(function() {
// 				anch.click();
// 				window.URL.revokeObjectURL(anch.href);
//       		blobby = null;
// 			}, 0)
// 		})(anchor, blob, filename);
// 		return;
// 	}

// 	var i;
// 	if (!tags) {
// 		// var selector = 'script[type="text/x-humdrum"]';
// 		var selector = '.humdrum-text[id$="-humdrum"]';
// 		var items = document.querySelectorAll(selector);
// 		tags = [];
// 		for (i=0; i<items.length; i++) {
// 			var id = items[i].id.replace(/-humdrum$/, "");
// 			if (!id) {
// 				continue;
// 			}
// 			var ss = "#" + id + "-svg svg";
// 			var item = document.querySelector(ss);
// 			if (item) {
// 				tags.push(item);
// 			}
// 		}
// 	}
// 	if (tags.constructor !== Array) {
// 		tags = [tags];
// 	}

// 	(function (i, sname) {
// 		(function j () {
// 			var tag = tags[i++];
// 			if (typeof tag  === "string" || tag instanceof String) {
// 				var s = tag
// 				if (!tag.match(/-svg$/)) {
// 					s += "-svg";
// 				}
// 				var thing = document.querySelector("#" + s + " svg");
// 				if (thing) {
// 					saveHumdrumSvg(thing, sname);
// 				}
// 			} else if (tag instanceof Element) {
// 				(function(elem) {
// 					saveHumdrumSvg(elem, sname);
// 				})(tag);
// 			}
// 			if (i < tags.length) {
// 				// 100 ms delay time is necessary for saving all SVG images to
// 				// files on the hard disk.  If the time is too small, then some
// 				// of the files will not be saved.  This could be relate to
// 				// deleting the temporary <a> element that is used to download
// 				// the file.  100 ms is allowing 250 small SVG images to all
// 				// be saved correctly (may need to increase for larger files, or
// 				// perhaps it is possible to lower the wait time between image
// 				// saves).  Also this timeout (even if 0) will allow better
// 				// conrol of the UI vesus the file saving.
// 				setTimeout(j, 100);
// 			}
// 		})();
// 	})(0, savename);
// }



// //////////////////////////////
// //
// // saveHumdrumText -- Save the specified Hudrum text to the hard disk.  The input
// // can be any of:
// //    * A Humdrum script ID
// //    * An array of Humdrum script IDs
// //    * Empty (in which case all Humdrum texts will be saved)
// //    * If the third parameter is present, then the first parameter will be ignored
// //      and the text content of the third parameter will be stored in the filename
// //      of the second parameter (with a default of "humdrum.txt").
// //

// function saveHumdrumText(tags, savename, savetext) {

// 	if (savetext) {
// 		// Saving literal text content to a file.
// 		if (!savename) {
// 			savename = "humdrum.txt";
// 		}
// 		// Unescaping < and >, which may cause problems in certain conditions, but not many:
// 		var stext = savetext.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// 		blob = new Blob([stext], { type: 'text/plain' }),
// 		anchor = document.createElement('a');
// 		anchor.download = savename;
// 		anchor.href = window.URL.createObjectURL(blob);
// 		anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
// 		(function (anch, blobby) {
// 			setTimeout(function() {
// 				anch.click();
// 				window.URL.revokeObjectURL(anch.href);
// 					blobby = null;
// 			}, 0)
// 		})(anchor, blob);
// 		return;
// 	}

// 	if ((tags instanceof Element) && (tags.className.match(/humdrum-text/))) {
// 		// Save the text from a single element.
// 		var sid = "";
// 		sid = tags.id;
// 		if (!sid) {
// 			sid = tags.parentNode.id;
// 		}
// 		var filename = savename;
// 		if (!filename) {
// 			filename = sid.replace(/-humdrum$/, "") + ".txt";
// 		}
// 		var text = tags.textContent.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// 		blob = new Blob([text], { type: 'text/plain' }),
// 		anchor = document.createElement('a');
// 		anchor.download = filename;
// 		anchor.href = window.URL.createObjectURL(blob);
// 		anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
// 		anchor.click();
// 		window.URL.revokeObjectURL(anchor.href);
//       blob = null;
// 		return;
// 	}

// 	if (typeof tags  === "string" || tags instanceof String) {
// 		// Convert a Humdrum ID into an element and save contents in that element.
// 		var myid = tags.replace(/-humdrum$/, "");
// 		var myelement = document.querySelector("#" + myid + "-humdrum");
// 		if (!myelement) {
// 			myelement = document.querySelector("#" + myid);
// 		}
// 		saveHumdrumText(myelement);
// 		return;
// 	}

// 	if (!tags) {
// 		// If tags is empty, then create a list of all elements that
// 		// should contain Humdrum content.
// 		var selector = '.humdrum-text[id$="-humdrum"]';
// 		tags = document.querySelectorAll(selector);
// 	}
// 	if (tags.constructor !== NodeList) {
// 		if (tags.constructor !== Array) {
// 			// Force tags to be in an array-like structure (not that necessary).
// 			tags = [tags];
// 		}
// 	}
// 	if (tags.length == 0) {
// 		// Nothing to do, so give up.
// 		return;
// 	}
// 	if (tags.length == 1) {
// 		// Just one element on the page with interesting content, so save that
// 		// to a filename based on the element ID.
// 		saveHumdrumText(tags[0]);
// 		return;
// 	}

// 	// At this point, there are multiple elements with Humdrum content that should
// 	// be saved to the hard-disk.  Combine all of the content into a single data
// 	// stream, and then save (with a default filename of "humdrum.txt").

// 	var i;
// 	var outputtext = "";
// 	var humtext = "";
// 	for (i=0; i<tags.length; i++) {
// 		if (!tags[i]) {
// 			continue;
// 		}
// 		if (typeof tags[i]  === "string" || tags[i] instanceof String) {
// 			saveHumdrumText(tags[i]);
// 			// convert a tag to an element:
// 			var s = tags[i];
// 			if (!tags[i].match(/-humdrum$/)) {
// 				s += "-humdrum";
// 			}
// 			var thing = document.querySelector("#" + s);
// 			if (thing) {
// 				tags[i] = thing;
// 			} else {
// 				continue;
// 			}
// 		}
// 		// Collect the Humdrum file text of the element.
// 		if (tags[i] instanceof Element) {
// 			var segmentname = tags[i].id.replace(/-humdrum$/, "");
// 			if (!segmentname.match(/\.[.]*$/)) {
// 				segmentname += ".krn";
// 			}
// 			humtext = tags[i].textContent.trim()
// 					// remove any pre-existing SEGMENT marker:
// 					.replace(/^!!!!SEGMENT\s*:[^\n]*\n/m, "");
// 			if (humtext.match(/^\s*$/)) {
// 				// Ignore empty elements.
// 				continue;
// 			}
// 			outputtext += "!!!!SEGMENT: " + segmentname + "\n";
// 			outputtext += humtext + "\n";
// 		}
// 	}
// 	// save all extracted Humdrum content in a single file:
// 	saveHumdrumText(null, null, outputtext);
// }



// //////////////////////////////
// //
// // cloneObject -- Make a deep copy of an object, preserving arrays.
// //

// function cloneObject(obj) {
// 	var output, v, key;
// 	output = Array.isArray(obj) ? [] : {};
// 	for (key in obj) {
// 		v = obj[key];
// 		if (v instanceof HTMLElement) {
// 			continue;
// 		}
// 		output[key] = (typeof v === "object") ? cloneObject(v) : v;
// 	}
// 	return output;
// }

// This is the Web Worker interface for the verovio toolkit.  These functions are
// interfaced through the verovio-calls.js functions.
//


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
		switch(oEvent.data.method) {
			case "ready":
				vrv.initialized = true;
				onReady();
				break;
			default:
				while (vrv.resolvedIdx <= oEvent.data.idx) {
					//resolve or reject
					if (vrv.resolvedIdx === oEvent.data.idx) {
						if (oEvent.data.success) {
							vrv.promises[vrv.resolvedIdx].deferred.resolve(oEvent.data.result);
						} else {
						vrv.promises[vrv.resolvedIdx].deferred.reject(oEvent.data.result);
						}
					} else {
						vrv.promises[vrv.resolvedIdx].deferred.reject();
					}
					if (vrv.promises[vrv.resolvedIdx].method === "renderData") {
						vrv.renderDataPending--;
						if (vrv.renderDataPending === 0) vrv.handleWaitingRenderData();
					}
					delete vrv.promises[vrv.resolvedIdx];
					vrv.resolvedIdx++;
				}
		}
	}

	console.log("creating verovio worker interface");
	this.promises = {};
	this.promiseIdx = 0;
	this.resolvedIdx = 0;
	this.renderDataPending = 0;
	this.renderDataWaiting = null;

// 
// 	console.log("LOADING https://verovio-script.humdrum.org/scripts/verovio-worker.js");
// 	var workerUrl = "https://verovio-script.humdrum.org/scripts/verovio-worker.js";
// 


	console.log("LOADING /scripts/verovio-worker.js");
	// var workerUrl = "/scripts/verovio-worker.js";
	var workerUrl = "/scripts/verovio-worker.js";

	this.worker = null;
	var that = this;
	try {
		that.worker = new Worker(workerUrl);
		that.worker.addEventListener("message", handleEvent);

		that.worker.onerror = function (event) {
			event.preventDefault();
			that.worker = createWorkerFallback(workerUrl);
			that.worker.addEventListener("message", handleEvent);
		};
	} catch (e) {
		that.worker = createWorkerFallback(workerUrl);
		that.worker.addEventListener("message", handleEvent);
	}
};



//////////////////////////////
//
// createWorkerFallback -- Cross-origin worker
//

function createWorkerFallback(workerUrl) {
	console.log("Getting cross-origin worker");
	var worker = null;
	try {
		var blob;
		try {
			console.log('humdrum plugin createWorkerFallback URL', workerUrl);
			blob = new Blob(["importScripts('" + workerUrl + "');"], { "type": 'application/javascript' });
		} catch (e) {
			var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
			console.log('createWorkerFallback BlobBuilder URL', workerUrl);
			blobBuilder.append("importScripts('" + workerUrl + "');");
			blob = blobBuilder.getBlob('application/javascript');
		}
		var url = window.URL || window.webkitURL;
		var blobUrl = url.createObjectURL(blob);
		worker = new Worker(blobUrl);
	} catch (e1) {
		//if it still fails, there is nothing much we can do
	}
	return worker;
}



//////////////////////////////
//
// vrvInterface::createDefaultInterface --
//

vrvInterface.prototype.createDefaultInterface = function (onReady) {

/*  No longer needed?


	var url = 'https://verovio-script.humdrum.org/scripts/verovio-toolkit.js';


	console.log("create default interface")
	var vrv = this;
	this.verovio = new verovioCalls();

	var script = document.createEleent('script');
	script.onload = function () {
		vrv.verovio.vrvToolkit = new verovio.toolkit();
		vrv.initialized = true;
		onReady();
	};
	script.src = url;
	document.head.appendChild(script);

/* verovio toolkit is larger than allowed by localStorage (5 MB limit), so 
 * using basket to store it between sessions is not useful to use:

	basket
	.require(
		{url: url, expire: 500, unique: BasketVersion}
		// loaded as an include:
		// {url: "scripts/ace/humdrumValidator.js", skipCache: true}
	)
	.then(
		function () {
			vrv.verovio.vrvToolkit = new verovio.toolkit();
			vrv.initialized = true;
			onReady();
		},
		function () {
			console.log("There was an error loading script", url);
		}
	);
*/




};



//////////////////////////////
//
// vrvInterface::checkInitialized --
//

vrvInterface.prototype.checkInitialized = function () {
	console.log((new Error()).stack);
	if (!this.initialized) throw("Verovio toolkit not (yet) initialized");
};



//////////////////////////////
//
// vrvInterface::filterData --
//

vrvInterface.prototype.filterData = function (opts, data, type) {
	// Don't store options when filtering data.
	return this.execute("filterData", arguments);
};



//////////////////////////////
//
// vrvInterface::renderData --
//

vrvInterface.prototype.renderData = function (opts, data, page) {
	// console.log("%cvrvInterface.renderData", "color: #aa8800; font-weight: bold");
	this.options = opts;
	return this.execute("renderData", arguments);
};



//////////////////////////////
//
// vrvInterface::getHumdrum --
//

vrvInterface.prototype.getHumdrum = function () {
	// console.log("%cvrvInterface.getHumdrum", "color: #aa8800; font-weight: bold");
	var value = this.execute("getHumdrum", arguments);
	return value;
};



//////////////////////////////
//
// vrvInterface::redoLayout --
//

vrvInterface.prototype.redoLayout = function (opts, redo, measure) {
	// console.log("%cvrvInterface.redoLayout", "color: #8800aa; font-weight: bold");
	this.options = opts;
	return this.execute("redoLayout", arguments);
};



//////////////////////////////
//
// vrvInterface::renderPage --
//

vrvInterface.prototype.renderPage = function (page) {
	return this.execute("renderPage", arguments);
};



//////////////////////////////
//
// vrvInterface::renderAllPages --
//

vrvInterface.prototype.renderAllPages = function (data, opts) {
	return this.execute("renderAllPages", arguments);
};



//////////////////////////////
//
// vrvInterface::gotoPage --
//

vrvInterface.prototype.gotoPage = function (page) {
	var vrv = this;
	return this.execute("gotoPage", arguments)
	.then(function (obj) {
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
	return this.execute("getMEI", arguments);
};



//////////////////////////////
//
// vrvInterface::renderToMidi --
//

vrvInterface.prototype.renderToMidi = function () {
	var value = this.execute("renderToMidi", arguments);
	return value;
};



//////////////////////////////
//
// vrvInterface::getElementsAtTime --
//

vrvInterface.prototype.getElementsAtTime = function (vrvTime) {
	return this.execute("getElementsAtTime", arguments);
};



//////////////////////////////
//
// vrvInterface::getTimeForElement --
//

vrvInterface.prototype.getTimeForElement = function (id) {
	return this.execute("getTimeForElement", arguments);
};



//////////////////////////////
//
// vrvInterface::execute --
//

vrvInterface.prototype.execute = function (method, args) {
	var vrv = this;
	if (this.usingWorker) {
		var arr = Array.prototype.slice.call(args);
		switch(method) {
			case "renderData":
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
			} catch(err) {
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
		this.postDeferredMessage("renderData",
				this.renderDataWaiting.args,
				this.renderDataWaiting.deferred);
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
	this.worker.postMessage({
		idx: this.promiseIdx,
		method: method,
		args: args
	});
	this.promises[this.promiseIdx] = {
		method: method,
		deferred: deferred
	};
	this.promiseIdx++;
	return deferred.promise;
};