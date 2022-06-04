'use strict';

// Create an instance
let wavesurfer = {};
var VHVtime = 2.5;

// Read a file
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

// document
//   .getElementById('file-input')
//   .addEventListener('change', readSingleFile, false);


// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
  let playButton = document.querySelector('#PlayPause'),
    toggleMuteButton = document.querySelector('#toggleMute'),
    stopButton = document.querySelector('#Stop'),
    // selectedfile = document
    //   .getElementById('file-input')
    //   .addEventListener('change', readSingleFile, false);
  wavesurfer = WaveSurfer.create({
    container: document.querySelector('#waveform'),
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
  console.log(wavesurfer)

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

  // Go to selection button
  // εδώ αν σταλεί χρόνος από το VHV θα κληθεί η συνάρτηση "go_to_selection" με όρισμα το χρόνο αυτό (σε s)
  // wavesurfer.go_to_selection(4.88);
  GotoSelectionButton.onclick = function () {
    wavesurfer.go_to_selection(VHVtime);
  };
  //
  //
  //
  //
});
