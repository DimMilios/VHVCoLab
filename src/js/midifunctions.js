/* global $ */

//
// reference: https://github.com/rism-ch/verovio/blob/gh-pages/mei-viewer.xhtml
// vim: ts=3

var LASTLINE = -1;

//////////////////////////////
//
// play_midi --
//

var DELAY = 600;

import { getVrvWorker } from './humdrum-notation-plugin-worker.js';

export function play_midi(starttime) {
  starttime = starttime ? starttime : 0;
  if (starttime == 0) {
    DELAY = 600;
  } else {
    DELAY = 600;
  }

  let vrvWorker = getVrvWorker();
  if (!vrvWorker) {
    throw new Error('Verovio worker is undefined');
  }

  // window.vrvWorker.renderToMidi()
  vrvWorker
    .renderToMidi()
    .then(function (base64midi) {
      var song = 'data:audio/midi;base64,' + base64midi;
      console.log('Midi song', song);
      $('#play-button').hide();
      $('#midiPlayer_play').show();
      $('#midiPlayer_stop').show();
      $('#midiPlayer_pause').show();
      $('#player').show();
      $('#player').midiPlayer.play(song, starttime);
      global_playerOptions.PLAY = true;
      LASTLINE = -1;
      let bpm_show_banner = document.getElementById("bpm_show");
      bpm_show_banner.setAttribute('hidden',true);
    })
    .catch((err) => console.log('Error when trying to play midi', err));
}

// window.play_midi = play_midi;

function downloadFile(base64Song, fileName = '') {
  let element = document.createElement('a');
  element.setAttribute('href', base64Song);
  element.setAttribute('download', fileName + '.mid');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// window.play_midi = function play_midi(starttime) {
//   starttime = starttime ? starttime : 0;
//   if (starttime == 0) {
//     DELAY = 600;
//   } else {
//     DELAY = 600;
//   }

//   vrvWorker
//     .renderToMidi()
//     .then(function (base64midi) {
//       var song = 'data:audio/midi;base64,' + base64midi;
//       console.log('Midi song', song);
//       $('#play-button').hide();
//       $('#midiPlayer_play').show();
//       $('#midiPlayer_stop').show();
//       $('#midiPlayer_pause').show();
//       $('#player').show();
//       $('#player').midiPlayer.play(song, starttime);
//       PLAY = true;
//       LASTLINE = -1;

//       (function downloadFile(base64Song, fileName = '') {
//         let element = document.createElement('a');
//         element.setAttribute('href', base64Song);
//         element.setAttribute('download', fileName + '.mid');
      
//         element.style.display = 'none';
//         document.body.appendChild(element);
      
//         element.click();
      
//         document.body.removeChild(element);
//       })(song, 'testFile');
//     })
//     .catch((err) => console.log('Error when trying to play midi', err));
// }

//////////////////////////////
//
// midiUpdate --
//
import { showIdInEditor } from './vhv-scripts/utility-ace.js';
import { loadPage } from './vhv-scripts/misc.js';
import {
  global_cursor,
  global_playerOptions,
} from './vhv-scripts/global-variables.js';
import { noteBounds } from './collaboration/collab-extension.js';

var ids = [];
export const midiUpdate = function (time) {
  let vrvWorker = getVrvWorker();
  if (!vrvWorker) {
    throw new Error('Verovio worker is undefined');
  }

  var vrvTime = Math.max(0, time - DELAY);
  // window.vrvWorker.getElementsAtTime(vrvTime)
  vrvWorker.getElementsAtTime(vrvTime).then(function (elementsattime) {
    var matches;
    if (elementsattime.page > 0) {
      if (elementsattime.page != vrvWorker.page) {
        vrvWorker.page = elementsattime.page;
        loadPage();
      }
      if (elementsattime.notes.length > 0 && ids != elementsattime.notes) {
        ids.forEach(function (noteid) {
          if ($.inArray(noteid, elementsattime.notes) == -1) {
            // $("#" + noteid ).attr("fill", "#000");
            // $("#" + noteid ).attr("stroke", "#000");
            // $("#" + noteid ).removeClassSVG("highlight");

            var element = document.querySelector('#' + noteid);
            if (element) {
              element.classList.remove('highlight');
            }
          }
        });
        ids = elementsattime.notes;

        if (ids.includes(noteBounds.getBounds()?.rightMost?.id)) {
          console.log('Stopping MIDI player');
          window.midiPlayerStop();
          midiStop();
          return;
        }
        // for (var i=0; i<ids.length; i++) {
        // 	if (matches = ids[i].match(/-L(\d+)/)) {
        // 		var line = matches[1];
        // 		if (line != LASTLINE) {
        // 			showIdInEditor(ids[i]);
        // 			LASTLINE = line;
        // 		}
        // 	}
        // }
        var scrollParent = document.querySelector('#output');
        var parentRect = scrollParent.getBoundingClientRect();
        var scrolled = false;
        var margin = 1 / 3;
        ids.forEach(function (noteid) {
          // console.log("NoteID", noteid);

          if ((matches = noteid.match(/-L(\d+)/))) {
            var line = parseInt(matches[1]);
            // console.log("LASTLINE = ", LASTLINE, "line =", line);
            if (line != LASTLINE && line > LASTLINE) {
              showIdInEditor(noteid);
              LASTLINE = line;
            }
          }

          // $("#" + noteid ).attr("fill", "#c00");
          // $("#" + noteid ).attr("stroke", "#c00");;
          // $("#" + noteid ).addClassSVG("highlight");

          var element = document.querySelector('#' + noteid);
          if (element) {
            element.classList.add('highlight');
            /*
							var classes = element.getAttribute("class");
							var classlist = classes.split(" ");
							var outclass = "";
							for (var i=0; i<classlist.length; i++) {
								if (classlist[i] == "highlight") {
									continue;
								}
								outclass += " " + classlist[i];
							}
							outclass += " highlight";
							element.setAttribute("class", outclass);*/
            if (!scrolled) {
              let system = element.closest('.system');
              let rect;
              let nextsystem = system.nextElementSibling;
              if (system) {
                rect = system.getBoundingClientRect();
                /* Cannot use in Firefox:
									if (rect.top < parentRect.top) {
										scrollParent.scrollTop = scrollParent.scrollTop - (parentRect.top - rect.top) - rect.height * margin;
										scrolled = true;
									} else if (rect.bottom  > parentRect.bottom) {
										scrollParent.scrollTop = scrollParent.scrollTop + (rect.bottom - parentRect.bottom) + rect.height * margin;
										scrolled = true;
									}
									*/
                let nextrect;
                let recttop;
                let rectbottom;
                let rectheight;

                // Also need to deal with systems that are taller than view area...

                if (nextsystem) {
                  let nextnextsystem = nextsystem.nextElementSibling;
                  nextrect = nextsystem.getBoundingClientRect();
                  recttop = rect.top;
                  rectbottom = nextrect.top;
                  rectheight = rectbottom - recttop;
                } else {
                  recttop = rect.top;
                  rectbottom = rect.bottom;
                  rectheight = rectbottom - recttop;
                }

                if (recttop < parentRect.top) {
                  // Scrolling backward in time:
                  // scrollParent.scrollTop = scrollParent.scrollTop - (parentRect.top - recttop) - rectheight * margin;
                  scrollParent.scrollTop =
                    scrollParent.scrollTop -
                    (parentRect.top - recttop) -
                    rectheight * margin;
                  scrolled = true;
                } else if (rectbottom > parentRect.bottom) {
                  // Scrolling forward in time:
                  // scrollParent.scrollTop = scrollParent.scrollTop + (rectbottom - parentRect.bottom) + rectheight * margin;
                  scrollParent.scrollTop =
                    scrollParent.scrollTop +
                    (recttop - parentRect.top) -
                    parentRect.height / 20;
                  scrolled = true;
                }
              }
            }
          }
        });
      }
    }
  });
};

window.midiUpdate = midiUpdate;

//////////////////////////////
//
// midiStop -- Callback for WildWestMidi when stopping MIDI playback.
//

export const midiStop = function () {
  ids.forEach(function (noteid) {
    // $("#" + noteid ).attr("fill", "#000");
    // $("#" + noteid ).attr("stroke", "#000");
    // .removeClassSVG is not working:
    // $("#" + noteid ).removeClassSVG("highlight");

    var element = document.querySelector('#' + noteid);
    if (element) {
      var classes = element.getAttribute('class');
      var classlist = classes.split(' ');
      var outclass = '';
      for (var i = 0; i < classlist.length; i++) {
        if (classlist[i] == 'highlight') {
          continue;
        }
        outclass += ' ' + classlist[i];
      }
      element.setAttribute('class', outclass);
    }
  });

  document.querySelectorAll('.highlight').forEach(note => note.classList.remove('highlight'));
  $('#player').hide();
  $('#play-button').show();
  global_cursor.CursorNote = null;
  global_playerOptions.PLAY = false;
  LASTLINE = -1;
  let bpm_show_banner = document.getElementById("bpm_show");
  bpm_show_banner.removeAttribute('hidden');
};

$.fn.addClassSVG = function (className) {
  $(this).attr('class', function (index, existingClassNames) {
    return existingClassNames + ' ' + className;
  });
  return this;
};

$.fn.removeClassSVG = function (className) {
  $(this).attr('class', function (index, existingClassNames) {
    //var re = new RegExp(className, 'g');
    //return existingClassNames.replace(re, '');
  });
  return this;
};
