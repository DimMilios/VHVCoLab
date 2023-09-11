'use strict';

import { getCollabStatus } from "../bootstrap";

//var synchronizeButton = document.getElementById('Synchronize');
//synchronizeButton.addEventListener('click', startSynchronization);

// variables
var GotoSelectionButton = document.getElementById('GotoSelectionButton');
var D_array, wp_array, wp_s_array;
var rec_time;
//var score_measure_value
//var C_path

/*
window.D_array = D_array
window.C_path = C_path
window.wp_array = wp_array
window.wp_s_array = wp_s_array
*/

/* //sync button must be disabled after pressed and must be re-enabled when new recording or new krn file loaded
function startSynchronization(audio_file,midi_file){
    console.log('syncButton clicked');

    wp_array = (wp from server)
    wp_s_array = (wp_s from server)
    D_array = (D from server)

    Synchronize.disabled = true;
}
*/

// Create an instance
let wavesurfer;
let wavesurfer3;

/* //Read a file  (this was a function to load any audio file to the wavesurfer instance)
function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    var contents = e.target.result;
    wavesurfer.loadArrayBuffer(contents);
    displayContents(contents);
  };
  reader.readAsArrayBuffer(file);
}

function displayContents(contents) {
  var element = document.getElementById('file-content');
  element.textContent = contents;
}
*/
// document
//   .getElementById('file-input')
//   .addEventListener('change', readSingleFile, false);

// Init & load audio file

document.addEventListener('DOMContentLoaded', function () {});

function setupWaveSurfer() {
  let playButton = document.querySelector('#PlayPause'),
    toggleMuteButton = document.querySelector('#toggleMute'),
    stopButton = document.querySelector('#Stop'),
    // selectedfile = document
    //   .getElementById('file-input')
    //   .addEventListener('change', readSingleFile, false);
    wavesurfer = WaveSurfer.create({
      container: document.querySelector('#waveform'),
      waveColor: '#345',
      cursorWidth: 1,
      progressColor: '#e81',
      plugins: [
        WaveSurfer.cursor.create({
          showTime: true,
          opacity: 1,
          customShowTimeStyle: {
            'background-color': '#345',
            color: '#0f5',
            padding: '2px',
            'font-size': '10px',
          },
        }),
      ],
    });

  window.wavesurfer = wavesurfer;

  wavesurfer.on('error', function (e) {
    console.warn(e);
  });

  // Load audio from URL
  //wavesurfer.load("");

  // Play button
  playButton.onclick = function () {
    wavesurfer.playPause();
  };

  // Mute-Unmute button
  toggleMuteButton.onclick = function () {
    wavesurfer.toggleMute();
  };

  // Stop button
  stopButton.onclick = function () {
    wavesurfer.stop();
  };

  // GotoSelectionButton3Tables.onclick = function () {
  //   let ajax1 = new XMLHttpRequest();
  //   let v1 = '';
  //   ajax1.onreadystatechange = function () {
  //     if (this.readyState == 4 && this.status == 200) {
  //       v1 = ajax1.responseText;
  //       //console.log(v1);
  //       let ajax2 = new XMLHttpRequest();
  //       let v2 = '';
  //       ajax2.onreadystatechange = function () {
  //         if (this.readyState == 4 && this.status == 200) {
  //           v2 = ajax2.responseText;
  //           //console.log(v2);
  //           let ajax3 = new XMLHttpRequest();
  //           let v3 = '';
  //           ajax3.onreadystatechange = function () {
  //             if (this.readyState == 4 && this.status == 200) {
  //               v3 = ajax3.responseText;
  //               console.log(v3);

  //               // all thre vars have been loaded at this point

  //               // converting them to arrays
  //               D_array = v1.split('\n').map(function (row) {
  //                 return row.split(' ');
  //               });
  //               wp_array = v2.split('\n').map(function (row) {
  //                 return row.split(' ');
  //               });
  //               wp_s_array = v3.split('\n').map(function (row) {
  //                 return row.split(' ');
  //               });

  //               // calculate recorded time from score time
  //               score_2_rec_time(
  //                 wp_s_array,
  //                 window.MEASURENO,
  //                 window.TEMPO,
  //                 window.BEATSPERMEASURE
  //               );

  //               wavesurfer.setCurrentTime(rec_time);
  //             }
  //           };
  //           ajax3.open('get', 'wp_s_array.csv');
  //           ajax3.send();
  //         }
  //       };
  //       ajax2.open('get', 'wp_array.csv');
  //       ajax2.send();
  //     }
  //   };
  //   ajax1.open('get', 'D_array.csv');
  //   ajax1.send();
  // };

  GotoSelectionButton.onclick = function () {
    let ajax3 = new XMLHttpRequest();
    let v3 = '';
    ajax3.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        v3 = ajax3.responseText;
        console.log(v3);
        wp_s_array = v3.split('\n').map(function (row) {
          return row.split(' ');
        });
        score_2_rec_time(
          wp_s_array,
          window.MEASURENO,
          window.TEMPO,
          window.BEATSPERMEASURE
        );
        wavesurfer.setCurrentTime(rec_time);

        if (getCollabStatus().enabled) {
          window.awareness.setLocalStateField('recTime', rec_time);
        }
      }
    };
    ajax3.open('get', 'https://musicolab.hmu.gr/vhv/wp_s_array.csv');
    ajax3.send();
  };
}

function score_2_rec_time(
  wp_s,
  score_measure,
  score_tempo,
  score_beatspermeasure
) {
  console.log('score_measure=', score_measure);
  console.log('score_tempo=', score_tempo);
  console.log('score_beatspermeasure=', score_beatspermeasure);

  var score_time =
    ((score_measure - 1) * score_beatspermeasure * 60) / score_tempo; // time in seconds
  console.log('score_time=', score_time);

  var i = 0;
  var rectime = 0;
  if (wp_s_array[i][0] <= score_time) {
    console.log(
      'something went wrong, score_time should not be greater than wp_s_array[0][0]'
    );
    rectime = wp_s_array[i][1];
  }
  while (wp_s_array[i][0] > score_time) {
    //console.log("score_time=",wp_s[i][0]," and rec_time=",wp_s[i][1]);
    rectime = wp_s[i][1];
    ++i;
  }
  rec_time = rectime; //assign to global variable
  console.log('rec_time=', rec_time);
}

/* // this function goes fronm the recorded time (from cursor) to the number of the vhv measure
function rec_time_2_score(wp_s_array,selected_rec_time,score_bpm,score_rythm,){ //score_rythm only nominator (integer)
  var i = 0;
  var scoretime = 0;
  
  while (wp_s_array[i][1] > selected_rec_time){
      scoretime = wp_s_array[i][1];
      ++i;
  }
  var scoremetervalue = scoretime*score_bpm/(60*score_rythm); // score meter number ( +- 1 ???)
  score_measure_value=scoremetervalue //assign to global variable?
  console.log("go to meter #", score_measure_value)

}
*/

/*  // this function produces a single dimension array with values representing
    //the degree of differentiation between recording and midi file over time
function calculate_C_D_path(D_array,wp_array){

  var len = D_array.length;
  var Dpath = new Array(len+1);
  var Cpath = new Array(len);
  for (let i=0; i<(len+1); ++i) Dpath[i] = 0;
  for (let i=0; i<len; ++i) Cpath[i] = 0;
  for (let i=len-1; i>=0; --i){
      Dpath[p] = D_array[wp_array[p][0]],[wp_array[p][1]];
      Cpath[p] = Dpath[p]-Dpath[p+1]; 
  }
  // different syntax for the same process ?
  //var p = len-1;
  //while (p>=0){
  //    Dpath[p] = D_array[wp_array[p,0]],[wp_array[p,1]];
  //    Cpath[p] = Dpath[p]-Dpath[p+1];
  //    p = p - 1;
  }
  
  C_path = Cpath; //assign to global variable?
}
*/

window.setupWaveSurfer = setupWaveSurfer;

function setupMicWaveSurfer(audioContext) {
  wavesurfer3 = WaveSurfer.create({
    container: document.querySelector('#waveform3'),
    waveColor: '#999',
    progressColor: '#e81',
    cursorWidth: 0,
    audioContext,
    plugins: [
      WaveSurfer.microphone.create({
        bufferSize: 4096,
        numberOfInputChannels: 1,
        numberOfOutputChannels: 1,
        constraints: {
        audio: {echoCancellation: false}
        },
      }),
    ],
  });

  window.wavesurfer3 = wavesurfer3;

  wavesurfer3.microphone.on('deviceReady', function () {
    console.info('Device ready!');
  });
  wavesurfer3.microphone.on('deviceError', function (code) {
    console.warn('Device error: ' + code);
  });
  wavesurfer3.on('error', function (e) {
    console.warn(e);
  });
}
window.setupMicWaveSurfer = setupMicWaveSurfer;
