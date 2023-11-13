import { getAceEditor } from '../vhv-scripts/setup.js';
import { getVrvWorker } from '../humdrum-notation-plugin-worker.js';
import { getCollabStatus } from '../bootstrap.js';
import { yProvider } from '../yjs-setup.js';

URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
export var rec; //Recorder.js object needs to be exported
var input; //MediaStreamAudioSourceNode we'll be recording


// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //audio context to help us record

var recordButton = document.getElementById('recordButton');
var stopButton = document.getElementById('stopButton');
var pauseButton = document.getElementById('pauseButton');
export var download; // the name of the downloaded file

//kalohr
var syncronizeButton = document.getElementById("Synchronize");

var transcribeButton = document.getElementById("Transcribe"); 

//trancription modal elements
const transcriptionModal = document.getElementById('transcription-modal');
const applyTranscriptionBtn = transcriptionModal.querySelector('#apply-transcribe-btn');
const cancelTranscriptionBtn = transcriptionModal.querySelector('#cancel-transcribe-btn');

console.log("kalohr: adding event listener for the sync button");
export var fileUrl; // url to the produced audio file
const constraints = {
  audio: {echoCancellation: false}
};
export var theblob;
//kalohr

//add events to those 3 buttons
recordButton.addEventListener('click', () => {
  startRecording();
  if (getCollabStatus().enabled) {
    yProvider.awareness.setLocalStateField('record', {status:'started'});
  }
});
stopButton.addEventListener('click', () => {
  stopRecording();
});
pauseButton.addEventListener('click', pauseRecording);

syncronizeButton.addEventListener('click', doSyncronize); //kalohr

transcribeButton.addEventListener('click', doTranscribe);

document.getElementById('Download').addEventListener('click', handleFileDownload(), false);

let chunks = []; //kalohr

async function doSyncronize(){
  console.log("rec2wav_2.js: doSynchronize: SYNCRONISE ");
  console.log(" - getting the song");

  let base64Midi = await getVrvWorker().renderToMidi();
  let song = base64Midi;
  //console.log(song);
  //let song = 'data:audio/midi;base64,' + base64Midi;
 
  let fd = new FormData();

  console.log(" - setting the action");
  fd.append('action','synchronization');
  fd.append("theUrl", fileUrl);

  console.log(" - appeding the audio/midi as BLOB")
  let midifile = new Blob([song], {'type':'audio/midi'});
  console.log(midifile);
  fd.append('themid', midifile);

  console.log(" - appeding the wav as FILE")
 /*
  let audiofile =  new Blob(rec.exportWav(
   function(blob){ 
    return blob; 
   }), {'type':'audio'});
   */
  console.log(" -- recorder.js: ",rec);
  console.log(" -- theblob ",theblob);
 /*
  theblob = {
   theblob, 
   [Symbol.iterator]:function(){
    return{
     next:() => ({
      value: 0,
      done: true
     })
    }
   }
  }
  */
  //console.log(" -- theblob[Symbol.iterator] ",theblob[Symbol.iterator]);
  //let bb = new BlobBuilder();
  //bb.append(theblob)
  //let audiofile = bb.getBob('audio');
  //let audiofile =  new Blob(theblob);
  //let audiofile =  new Blob(theblob, {type:'audio/wav; codecs=0'});
  let audiofile =  theblob;
  //kalohr: the line above needs to be replaced with a line that uses Record.js
  //let audiofile =  new Blob(rec.getBuffer(), {'type':'audio'});

  //let audiofile   = fileUrl;
  //console.log("saveContentAsMidiUpload: ",audiofile);
  fd.append('theaudio', audiofile);
  //fd.append('file', audiofile, 'blobname');
 
  var ajax = new XMLHttpRequest();
  ajax.open("post", "https://musicolab.hmu.gr/apprepository/synchroniseScoreAudioResp.php", true);
  ajax.onreadystatechange = function(){
   if(ajax.readyState ==4){
    //alert("the upload has finished !");
    GotoSelectionButton.disabled=false;
    document.getElementById("syncImg").src="LABstill.png";

    if (getCollabStatus().enabled) {
      yProvider.awareness.setLocalStateField('recordSync', 'completed');
    }
   }
  }
  ajax.send(fd);
  document.getElementById("syncImg").src="LAB.webp";

  if (getCollabStatus().enabled) {
    yProvider.awareness.setLocalStateField('recordSync', 'clicked');
  }

}

async function doTranscribe() {
  renderTranscriptionModal()
    .then(() => {
      //user entered values
      const bendir_tempo = document
        .getElementById('transcriptionTempo')
        .value;
      const bendir_numerator = document
        .getElementById('transcriptionNumerator')
        .value;
      const bendir_denominator = document
        .getElementById('transcriptionDenominator')
        .value;

      console.log({trTempo:bendir_tempo, trRhythm:`${bendir_numerator}/${bendir_denominator}`})
      console.log({recorder:rec, recording:theblob});

      //creating the form
      let fd2 = new FormData();
      fd2.append('action','convert2krn');
      fd2.append('tempo', bendir_tempo);
      fd2.append('numerator', bendir_numerator);
      fd2.append('denominator', bendir_denominator);
      fd2.append('theaudio', theblob);

      //HTTP request
      var ajax = new XMLHttpRequest();
      ajax.open("POST", "https://musicolab.hmu.gr/apprepository/bendir2krn.php", true);

      ajax.onload = function () {
        const transcribedKern = ajax.response;
        console.log({transcribedKern});

        const edtr = getAceEditor();
        edtr.setValue(transcribedKern);

        if (getCollabStatus().enabled) {
          yProvider.awareness.setLocalStateField('kernTranscription', true);
        }
      }

      ajax.send(fd2);
    })
    .catch(() => {
      console.log('Transcription canceled');
    });
}

function renderTranscriptionModal() {
  return new Promise((resolve, reject) => {
    $('#transcription-modal').modal('show');
    // modalPrompt.classList.add('show');
    // modalPrompt.style.display = 'block';

    applyTranscriptionBtn.addEventListener('click', function () {
      resolve();
      $('#transcription-modal').modal('hide');
      // transcriptionModal.classList.remove('show');
      // transcriptionModal.style.display = 'none';
    });

    cancelTranscriptionBtn.addEventListener('click', function () {
      reject();
      $('#transcription-modal').modal('hide');
      // transcriptionModal.classList.remove('show');
      // transcriptionModal.style.display = 'none';
    });
  });
}

function startRecording() {
  console.log('recordButton clicked');
  let rec_waveform = document.getElementById('rec_wave');
  rec_waveform.removeAttribute('hidden');
  let play_waveform = document.getElementById('play_wave');
  play_waveform.setAttribute('hidden', true);


  /*
            Simple constraints object, for more advanced audio features see
            https://addpipe.com/blog/audio-constraints-getusermedia/
        */

  //var constraints = { audio: true, video: false };

  /*
            Disable the record button until we get a success or fail from getUserMedia() 
        */
  console.log('enable stopButton');
  recordButton.disabled = true;
  stopButton.disabled = false;
  pauseButton.disabled = false;
  PlayPause.disabled = true;
  Stop.disabled = true;
  toggleMute.disabled = true;
  Synchronize.disabled = true;
  Transcribe.disabled = true;
  GotoSelectionButton.disabled = true;
  /*
            We're using the standard promise based getUserMedia() 
            https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        */

  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

      console.log(
        'recorder.js: getUserMedia() success, stream created, initializing Recorder.js ...'
      );

      /*
                create an audio context after getUserMedia is called
                sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
                the sampleRate defaults to the one set in your OS for your playback device
    
      */
      audioContext = new AudioContext();

      //update the format
      document.getElementById('formats').innerHTML = 'Format: 1 channel pcm @ ' + audioContext.sampleRate / 1000 + 'kHz';

      /*  assign to gumStream for later use  */
      gumStream = stream;

      /* use the stream */
      input = audioContext.createMediaStreamSource(stream);

      if (!window.wavesurfer) {
        window.setupWaveSurfer();
      }

      if (!window.wavesurfer3) {
        window.setupMicWaveSurfer(audioContext);
      }

      /* 
                Create the Recorder object and configure to record mono sound (1 channel)
                Recording 2 channels  will double the file size
      */
      rec = new Recorder(input, { numChannels: 1 });

      //start the recording process
      rec.record();

      window.wavesurfer3.microphone.togglePlay();

      console.log('Recording started');
    }).catch(function (err) {
 //enable the record button if getUserMedia() fails
 recordButton.disabled = false;
 stopButton.disabled = true;
 pauseButton.disabled = true;
 console.log("ERROR: recorder.js maybe? ");
    });
}

function pauseRecording() {
  console.log('pauseButton clicked rec.recording=', rec.recording);
  if (rec.recording) {
    //pause
    rec.stop();
    pauseButton.title = 'Resume Recording';
  } else {
    //resume
    rec.record();
    pauseButton.title = 'Pause Recording';
  }
}

function stopRecording() {
  console.log('stopButton clicked');
  let rec_waveform = document.getElementById('rec_wave');
  rec_waveform.setAttribute('hidden', true);
  let play_waveform = document.getElementById('play_wave');
  play_waveform.removeAttribute('hidden');

  //disable the stop button, enable the record to allow for new recordings
  stopButton.disabled = true;
  recordButton.disabled = false;
  pauseButton.disabled = true;
  PlayPause.disabled = false;
  Stop.disabled = false;
  toggleMute.disabled = false;
  Synchronize.disabled = false;
  Transcribe.disabled = false;
  Download.disabled = false;
  //GotoSelectionButton.disabled = false;

  //reset button just in case the recording is stopped while paused
  pauseButton.title = 'Pause Recording';
  window.wavesurfer3.microphone.stop();

  //tell the recorder to stop the recording
  rec.stop();

  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //create the wav blob and pass it on to createDownloadLink
  rec.exportWAV(createDownloadLink);

//kalohr
   console.log("stop recording: pushing the env data in chunks");
   //rec.ondataavailable = function(ev) {
    //chunks.push(ev.data);
   //};
//kalohr

}

function createDownloadLink(blob) {
 theblob = blob;
  var url = URL.createObjectURL(blob);
  var au = document.createElement('audio');
  var li = document.createElement('li');
  var link = document.createElement('a');

  //name of .wav file to use during upload and download (without extendion)
  var filename = new Date().toISOString();

  //add controls to the <audio> element
  au.controls = true;
  au.src = url;

  window.wavesurfer.load(au); // LOAD RECORDING TO WAVESURFER ###############################################################
  window.collabRec = false;

  //save to disk link
  link.href = url;
  link.download = filename + '.wav'; //download forces the browser to donwload the file using the filename
  link.innerHTML = 'Save to disk';

  // update information for the .wav file (needed for downloading)
  download = link.download;
  fileUrl = url; 
  console.log("create download link: download = ", download.toString());
  console.log("create download link: fileUrl = ", fileUrl.toString());

  //add the new audio element to li
  li.appendChild(au);

  //add the filename to the li
  li.appendChild(document.createTextNode(filename + '.wav '));

  //add the save to disk link to li
  li.appendChild(link);

  //upload link
  var upload = document.createElement('a');
  upload.href = '#';
  upload.innerHTML = 'Upload';

  upload.addEventListener('click', function (event) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
      if (this.readyState === 4) {
        console.log('Server returned: ', e.target.responseText);
      }
    };
    var fd = new FormData();
    fd.append('audio_data', blob, filename);
    xhr.open('POST', 'upload.php', true);
    xhr.send(fd);
  });
  //li.appendChild(document.createTextNode (" "))//add a space in between
  //li.appendChild(upload)//add the upload link to li

  //add the li element to the ol
  //recordingsList.appendChild(li);

  //collaborative rec stop event. Put here because Recorder.exportWav posts a message to a worker that runs in a seperate thread
  //so the blob is generated at an unknown time
  if (getCollabStatus().enabled) {
    const reader = new FileReader()
    reader.readAsDataURL(blob); 
    reader.onload = function () {
      yProvider.awareness.setLocalStateField('record', {
        status:'stopped',
        recDataURL: reader.result,
        name: download
      });
    }
  }

}

function download_file(name, audio) {
  var antikeimeno2 = document.createElement('a');
  antikeimeno2.setAttribute('href', audio);
  antikeimeno2.setAttribute('download', name);
  document.body.appendChild(antikeimeno2);
  antikeimeno2.click();

  //document.body.removeChild(antikeimeno2);
    //URL.revokeObjectURL(fileUrl);
}

function handleFileDownload() {
  return function(event) {
    if (!window.collabRec) {
      console.log('Download click handler', { download, fileUrl });
      download_file(download, fileUrl);
    } else {
      download_file(window.collabRecName, window.collabRecUrl);
    }
  }
}

