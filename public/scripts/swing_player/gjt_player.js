const Http = new XMLHttpRequest();
// const url='https://jsonplaceholder.typicode.com/posts';
// const url = 'http://155.207.188.7:5000/songcsvcomplex?name=ALL_THE_THINGS_YOU_ARE&r=3&h=3'
// Http.open("GET", url);
// Http.send();

// Http.onreadystatechange = (e) => {
//   console.log(Http.responseText)
// }

// const url = 'http://155.207.188.7:5000/songcsvcomplex?name=ALL_THE_THINGS_YOU_ARE&r=3&h=3'
// Http.open("GET", url);
// Http.send();

// Http.onreadystatechange = (e) => {
//   console.log(Http.responseText)
// }

var currentCsv;

function dynamicallyLoadScript(url) {
  var script = document.createElement("script");  // create a script DOM node
  script.src = url;  // set its src to the provided URL
 
  document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

var drumsKeys;
var allChordSymbols = [];
var currentChordIdx = 0;
var i = 1;
var t = -1;

// load all drums
function load_all_drums(){
  console.log('load_all_drums 2');
  drumsKeys = drums_player.loader.drumKeys();
  var drumInfo = [];
  for(var i=0; i<drumsKeys.length; i++){
    drumInfo.push( drums_player.loader.drumInfo(i) );
    dynamicallyLoadScript( drumInfo[drumInfo.length-1].url );
  }
  //console.log('drumInfo:', drumInfo);
}
function prepare_instrument_player_with_index(idx){
  var instrument_player = new WebAudioFontPlayer();
  var info = instrument_player.loader.instrumentInfo(idx);
			console.log('info.variable: ', info.variable);
			console.log('info.url: ', info.url);
			instrument_player.loader.startLoad(audioContext, info.url, info.variable);
			instrument_player.loader.waitLoad(function() {
				instrument_player.loader.decodeAfterLoading(audioContext, info.variable);
			});
    return instrument_player;
}

function get_chords_from_array( a ){
  allChordSymbols = [];
  for(var i=0; i<a.length; i++){
    if (a[i][0] == 'Chord'){
      allChordSymbols.push(a[i][1]);
    }
  }
}

function send_GJT_request(url){
  Http.open("GET", url);
  Http.send();

  var name = url.split('name=')[1].replace('&r=', '_r~').replace('&h=', '_h~') + '.csv'

  Http.onreadystatechange = (e) => {
    var jsonObj = JSON.parse( Http.responseText );
    
    // var jsonObj = Http.responseText;

    // console.log( 'jsonObj:', jsonObj );
    // console.log( 'keys', Object.keys( jsonObj ) );
    // console.log( 'name', name );
    // console.log('jsonObj[name]:', jsonObj[name]);

    // returning the array part
    play_array( jsonObj[name] );
    playstop = !playstop;
    metronome.toolSendsPlayStop(playstop);
    // return jsonObj[name]
  }
}

function stop_player(){
  console.log('stopping swing player');

  if (playingPlayer == 'swing') {
    playstop = false;

    metronome.toolSendsPlayStop(playstop);
  } else if (playingPlayer == 'default') {
    stop();
  }
  playingPlayer = null;
}

function send_kern_request(url){

  const aboutToStart = window.global_playerOptions.PLAY;

  if (aboutToStart) {
    console.log('url:', url);

    Array.from( document.querySelectorAll('.midi-button') )
      .forEach( btn => btn.classList.add('button-inactive') );
    console.log(kernHasChanged)
    if (!kernHasChanged) {
      setMidiPlayingGUI();
      playSwing();
      return;
    }

    Http.open("GET", url);
    Http.onreadystatechange = (e) => {


      if (Http.readyState == 4 && Http.status == 200){
        setMidiPlayingGUI();
        //swing player play
        var csv = JSON.parse( Http.responseText )['csv_array'];
        playSwing(csv);
        
        kernHasChanged = false;
      }else if (Http.readyState == 4 && Http.status == 0){
        setMidiPlayingGUI();
        //making buttons active again
        Array.from( document.querySelectorAll('.midi-button') )
          .forEach( btn => btn.classList.remove('button-inactive') );
        //default player play
        playingPlayer = 'default';
        playCurrentMidi();
      }
    }
    Http.send();
  } else {
    stop_player();
  }
}

function playSwing(csv = currentCsv) {
  playstop = !playstop;
  console.log('playstop 1:', playstop);

  Array.from( document.querySelectorAll('.midi-button') )
    .forEach( btn => btn.classList.remove('button-inactive') );

  currentCsv = csv;
  playingPlayer = 'swing';

  // // Remove the beatTimeEvent listener when stopping playback
  // if (isBeatTimeListenerAdded) {
  //   document.removeEventListener('beatTimeEvent', eventHandler);
  //   isBeatTimeListenerAdded = false;
  // }
  play_array(csv, has_precount = false, has_chords = false, has_header = false);
  metronome.toolSendsPlayStop(playstop);
}

function play_note_for_instrument(a, tempo){
  // console.log(' ======================================== ');
  // console.log('instrument: ', a[0]);
  console.log("ARRAY IS NOW IN play_note_for_instrument",a);
  // console.log('duration: ', a[3]*(60.0/tempo));
  // console.log('volume: ', a[4]/127.0);
  
  if (a[0] == 'Piano'){
    piano_player.queueWaveTable(audioContext, audioContext.destination
      , _tone_0000_SBLive_sf2, 0, a[1], a[3]*(60.0/tempo), (0.1*a[4])/127.0);
    console.log('PLAYING 2: ', a[1])
  }else if(a[0] == 'Bass'){
    bass_player.queueWaveTable(audioContext, audioContext.destination
      , _tone_0320_Aspirin_sf2_file, 0, a[1], a[3]*(60.0/tempo), (0.1*a[4])/127.0);
  }else if(a[0] == 'Flute'){
    flute_player.queueWaveTable(audioContext, audioContext.destination, _tone_0730_Chaos_sf2_file, 0, a[1], a[3]*(60.0/tempo), (0.1*a[4])/127.0);
  }else{
    var drum_variable =  '_drum_' + drumsKeys[drums_player.loader.findDrum( a[1] )];
    // console.log('drum_variable:', drum_variable);
    drums_player.queueWaveTable(audioContext, audioContext.destination
      , eval(drum_variable), 0, a[1], a[3]*(60.0/tempo), (0.1*a[4])/127.0);
  }
}
function show_chord(a){
  // console.log('CHORD: ', a[1]);
  document.getElementById('chord').innerHTML = a[1];
  document.getElementById('chord').style.fontWeight = "900";
  document.getElementById('chord').style.fontSize = "21";
  if (currentChordIdx < allChordSymbols.length - 1){
    document.getElementById('chord1').innerHTML = '\t' + allChordSymbols[currentChordIdx+1];
  }
  if (currentChordIdx < allChordSymbols.length - 2){
    document.getElementById('chord2').innerHTML = '\t' + allChordSymbols[currentChordIdx+2];
  }
  if (currentChordIdx < allChordSymbols.length - 3){
    document.getElementById('chord3').innerHTML = '\t' + allChordSymbols[currentChordIdx+3];
  }
  currentChordIdx++;
}

let isBeatTimeListenerAdded = false;
let eventHandler;


function addBeatTimeEventListener(a, starting_onset, tempo, tick) {
  // Check if the event listener is already added and remove it if so
  if (isBeatTimeListenerAdded) {
    document.removeEventListener('beatTimeEvent', eventHandler);
  }

  // Define the event handler function with partial application for a, starting_onset, and tempo
  eventHandler = function (e) {
    handleBeatTimeEvent(e, a, starting_onset, tempo, tick);
  };

  // Add the event listener with the defined handler
  document.addEventListener('beatTimeEvent', eventHandler);
  isBeatTimeListenerAdded = true;
}

function handleBeatTimeEvent(e, a, starting_onset, tempo, tick) {
    
  // Access the array data from the event object.
  // const a = e.detail.a;
  
  if ( i < a.length ){
    console.log('e.metroBeatTimeStamp: ', e.metroBeatTimeStamp);
    while ( t < e.metroBeatTimeStamp - starting_onset ){
      if (  a[i][0] == 'Piano' || a[i][0] == 'Bass' || a[i][0] == 'Flute' || a[i][0] == 'Drums' || a[i][0] == 'Precount' || a[i][0] == 'Metro'  ){
        // console.log('starting_onset: ', starting_onset);
        // console.log('i: ', i);
        // console.log('t: ', t);
        // console.log('PLAYING a[i]: ', a[i]);
        console.log("ARRAY IS NOW IN beatTimeEvent",a);
        play_note_for_instrument(a[i], tempo);
        i++;
      }else if( a[i][0] == 'Chord' ){
        show_chord(a[i]);
        i++;
      }else if(a[i][0].includes("Bar")){
        const CSVCurrentBar = a[i][0].split("~")[1].split("@")[0];
        console.log(CSVCurrentBar);

        const barChangeEvent = new CustomEvent ('barChangeEvent', {
          detail: {hasStopped: false, barNo: `${ parseInt(CSVCurrentBar)+1 }`}
        });
        document.dispatchEvent(barChangeEvent);

        i++;
      }
      else{
        i++;
      }
      if ( i >= a.length ){
        break;
      }
      if (  a[i][0] == 'Piano' || a[i][0] == 'Bass' || a[i][0] == 'Flute' || a[i][0] == 'Drums' || a[i][0] == 'Precount' || a[i][0] == 'Metro'  ){
        t = a[i][2];
      }else if( a[i][0] == 'Chord' ){
        t = a[i][3];
      }
    }
    // i++;
  }else{
    playstop = false;
    metronome.toolSendsPlayStop(playstop);

    playingPlayer = null;

    window.global_playerOptions.PLAY = false;
    window.global_playerOptions.CURRENTBAR = null;

    setMidiNotPlayingGUI();
  }
    // document.getElementById('beatTime').innerHTML = e.metroBeatTimeStamp;
    // VELENIS: ADD PLAYER HERE
    // e.metroBeatTimeStamp is called very frequently and it includes the
    // time that we need to trigger notes
    // CAUTION: metronome currently does not work for tempo changes.
    // TODO: we need to fix it
    // console.log( 'time: ', e.metroBeatTimeStamp - starting_onset );

}







function play_array( a, has_precount=true, has_chords=true, has_header=true, hasBeenPaused = false ){
  console.log('array: ', a)
  if (has_chords){
    get_chords_from_array( a );
  }
  currentChordIdx = 0;

  tempo = hasBeenPaused
    ? document
        .querySelector('#tempo-input')
        .placeholder
    : a[0][4];

  var starting_onset = 0.0;
  if (has_header){
    starting_onset = a[0][3];
  }
  metronome.setTempo(tempo);

  /*
  let currentBar = window.global_playerOptions.CURRENTBAR;
  i = hasBeenPaused && currentBar
    ? currentCsv
        .findIndex(item => item[0].includes(`Bar~${currentBar-1}`)) + 1
    : 1;
  */

  if (has_precount){
    while (a[i][0] != 'Precount'){
      i++;
    }
  }

  const barChangeEvent = new CustomEvent ('barChangeEvent', {
    detail: {
      hasStopped: false,
      barNo: `${ (hasBeenPaused && currentBar) ? currentBar : 1 }`
    }
  });
  document.dispatchEvent(barChangeEvent);

  t = a[i][2];
  console.log("TAF EINAI:",t, i)
  addBeatTimeEventListener(a, starting_onset, tempo, t);
  
  isBeatTimeListenerAdded = true;
}


