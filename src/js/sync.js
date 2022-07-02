import { saveContentAsMIDIUpload } from './vhv-scripts/file-operations.js';

export function setupSynchronizeHandlers() {
  let constraints = { audio: true, video: false };

  if (navigator.mediaDevices === undefined) {
    alert(
      'ERROR: failed to access your media devices\n this code is compatible with WebRTC browsers that implement getUserMedia()'
    );
  } else {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log('device: ', device.kind.toUpperCase(), device.label);
        });
      })
      .catch((err) => {
        console.log('ERROR');
        console.log(err.name, err.message);
      });
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (mediaStreamObj) {
      let start = document.getElementById('recordButton');
      let stop = document.getElementById('stopButton');
      let upload = document.getElementById('Synchronize');
      let mediaRecorder = new MediaRecorder(mediaStreamObj);
      let chunks = [];

      start.addEventListener('click', (ev) => {
        mediaRecorder.start();
        chunks = [];
        console.log(
          '- media recording starts, initiated chunks to empty object'
        );
      });

      mediaRecorder.ondataavailable = function (ev) {
        chunks.push(ev.data);
      };

      stop.addEventListener('click', (ev) => {
        mediaRecorder.stop();
        console.log('- media recording stops');
      });

      upload.addEventListener('click', (ev) => {
        saveContentAsMIDIUpload(chunks);
      });
    })
    .catch(function (err) {
      console.log('ERROR');
      console.log(err.name, err.message);
    });
}
