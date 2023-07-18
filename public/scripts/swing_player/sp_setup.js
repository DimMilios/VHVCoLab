var audioContext = audioManager.audioContext;
// var piano_player = new WebAudioFontPlayer();
// var bass_player = new WebAudioFontPlayer();
var drums_player = new WebAudioFontPlayer();
// var flute_player = new WebAudioFontPlayer();
var piano_player = prepare_instrument_player_with_index(5);
var bass_player = prepare_instrument_player_with_index(366);
var flute_player = prepare_instrument_player_with_index(772);
var marimba_player = new WebAudioFontPlayer();
var guitar_player = new WebAudioFontPlayer();
console.log('load_all_drums 1');
load_all_drums();

var playingPlayer;
var kernHasChanged;

// drums_player.loader.decodeAfterLoading(audioContext, '35_16_JCLive_sf2_file');
var playstop = false;
// __SWING_PLAYER__ For running the swing player, you need to assign to the
// kern file to be played as a string in the kern_string variable
var kern_string = null; // in this example, the string value is assigned with the following function:
// __SWING_PLAYER__ When play is pressed, the following function needs to be called
// (the kern_string variable needs to has been assigned properly)
// The play() function acts as toggle, i.e., if you call it while playing, it will stop.
// There is also a stop function available: stop_player() - in js/gjt_player.js.
function midiPlayStop() {
	console.log('play:')
	send_kern_request( 'https://maxim.mus.auth.gr:6001/kern_for_player?kernfile=' + encodeURIComponent(kern_string) );
}

function midiResume() {
  if (playingPlayer == 'swing') {
    play_array(currentCsv, false, false, false, true);
    metronome.toolSendsPlayStop(true);
  } else if (playingPlayer == 'default') {
	const currentBar = window.global_playerOptions.CURRENTBAR;
	const resumePoint = $(`.m-${currentBar}`).find('.note').first()[0];

    window.playCurrentMidi(document.getElementById(resumePoint.id));
  }
}

function midiPause () {
  if (playingPlayer == 'swing'){
    metronome.toolSendsPlayStop(false);
  } else if (playingPlayer == 'default') {
	//stop() is defined in midiplayer.js
	stop();
  }
}

document.querySelector('#midi-play-pause-button').
  addEventListener('click', function () {
		const isPLaying = window.global_playerOptions.PLAY;
		const isPaused = window.global_playerOptions.PAUSE;

		if (!isPLaying) {
			//if player stopped, play
			window.global_playerOptions.PLAY = true;			
			midiPlayStop();
		} else if (isPLaying && !isPaused) {
			//if player already playing and has not been paused, pause
			window.global_playerOptions.PAUSE = true;
			midiPause();
      		setMidiNotPlayingGUI();
		} else if (isPLaying && isPaused) {
			//if player already playing and has been paused, resume
			window.global_playerOptions.PAUSE = false;
			midiResume();
      		setMidiPlayingGUI();
		}     
});

document.querySelector('#midi-stop-button').
  addEventListener('click', e => {
		const isPLaying = window.global_playerOptions.PLAY;
		if (!isPLaying) return;

		window.global_playerOptions.PLAY = false;
		window.global_playerOptions.PAUSE = false;

		midiPlayStop();
		setMidiNotPlayingGUI();	
});

function setMidiPlayingGUI() {
	const midiPPIcon = document
		.querySelector('.midi-play-pause-icon');
	const pPButton = document
		.getElementById('midi-play-pause-button');

	midiPPIcon.classList.remove('fa-play');
	midiPPIcon.classList.add('fa-pause');
	pPButton.title = 'Pause';

	document
		.getElementById("bpm_show")
		.setAttribute('hidden', true);
}

function setMidiNotPlayingGUI() {
	const isPaused = window.global_playerOptions.PAUSE;
	
	const playPauseButton = document
		.querySelector('#midi-play-pause-button');
	const playPauseIcon = document
		.querySelector('.midi-play-pause-icon');

  //restoring PlayPause Button icon and title
	playPauseIcon.classList.remove('fa-pause');
	playPauseIcon.classList.add('fa-play');
  	isPaused
		? playPauseButton.title = 'Resume'
		: playPauseButton.title = 'Play Midi'

  //restoring tempo insert			
	document
		.getElementById("bpm_show")
		.removeAttribute('hidden');
  
  if (!isPaused) {
    //unhighlighting
		const barChangeEvent = new CustomEvent ('barChangeEvent', {
			detail: {
				hasStopped: true,
				barNo: null
			}
		});
		document.dispatchEvent(barChangeEvent);
	}
}

