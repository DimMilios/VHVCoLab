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
var currentBar;

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
    console.log
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
  console.log('playstop 1:', playstop);

  if (playingPlayer == 'swing') {
    currentCsv = null;
    currentBar = null;
    playingPlayer = null;

    metronome.toolSendsPlayStop(playstop);
  } else if (playingPlayer == 'default') {
    stop();
  }
}

function send_kern_request(url){

  playstop = !playstop;

  if (playstop){
    console.log('url:', url);
    Http.open("GET", url);
    Http.onreadystatechange = (e) => {
      setMidiPlayingGUI();
      if (Http.readyState == 4 && Http.status == 200){
        var jsonObj = JSON.parse( Http.responseText );
        play_array( jsonObj['csv_array'], has_precount=false, has_chords=false, has_header=false );
        console.log('playstop 1:', playstop);
        metronome.toolSendsPlayStop(playstop);

        currentCsv = jsonObj['csv_array'];
        playingPlayer = 'swing';
      }else if (Http.readyState == 4 && Http.status == 0){
        playingPlayer = 'default';
        playCurrentMidi();
      }
    }
    Http.send();
  }else{
    stop_player();
  }
}

function play_note_for_instrument(a, tempo){
  // console.log(' ======================================== ');
  // console.log('instrument: ', a[0]);
  // console.log('pitch: ', a[1]);
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

function play_array( a, has_precount=true, has_chords=true, has_header=true, hasBeenPaused = false ){
  // console.log('array: ', a)
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

  i = hasBeenPaused && currentBar
    ? currentCsv
        .findIndex(item => item[0].includes(`Bar~${currentBar}`)) + 1
    : 1;

  if (has_precount){
    while (a[i][0] != 'Precount'){
      i++;
    }
  }

  const barChangeEvent = new CustomEvent ('barChangeEvent', {
    detail: {
      hasStopped: false,
      barNo: `${(hasBeenPaused && currentBar)? (parseInt(currentBar)+1) : 1}`
    }
  });
  document.dispatchEvent(barChangeEvent);

  t = a[i][2];
  document.addEventListener('beatTimeEvent', function (e){
    if ( i < a.length ){
      console.log('e.metroBeatTimeStamp: ', e.metroBeatTimeStamp);
      while ( t < e.metroBeatTimeStamp - starting_onset ){
        if (  a[i][0] == 'Piano' || a[i][0] == 'Bass' || a[i][0] == 'Flute' || a[i][0] == 'Drums' || a[i][0] == 'Precount' || a[i][0] == 'Metro'  ){
          console.log('starting_onset: ', starting_onset);
          console.log('i: ', i);
          console.log('t: ', t);
          console.log('PLAYING a[i]: ', a[i]);
          play_note_for_instrument(a[i], tempo);
          i++;
        }else if( a[i][0] == 'Chord' ){
          show_chord(a[i]);
          i++;
        }else if(a[i][0].includes("Bar")){
          currentBar = a[i][0].split("~")[1].split("@")[0];
          console.log(currentBar);

          const barChangeEvent = new CustomEvent ('barChangeEvent', {
            detail: {hasStopped: false, barNo: `${ parseInt(currentBar)+1 }`}
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

      currentCsv = null;
      currentBar = null;
      playingPlayer = null;

      setMidiNotPlayingGUI();
    }
      // document.getElementById('beatTime').innerHTML = e.metroBeatTimeStamp;
      // VELENIS: ADD PLAYER HERE
      // e.metroBeatTimeStamp is called very frequently and it includes the
      // time that we need to trigger notes
      // CAUTION: metronome currently does not work for tempo changes.
      // TODO: we need to fix it
      // console.log( 'time: ', e.metroBeatTimeStamp - starting_onset );
  });
}

