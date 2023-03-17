var audioContext = audioManager.audioContext;
var piano_player = new WebAudioFontPlayer();
var bass_player = new WebAudioFontPlayer();
var drums_player = new WebAudioFontPlayer();
console.log('load_all_drums 1');
load_all_drums();
piano_player.loader.decodeAfterLoading(audioContext, '0000_JCLive_sf2_file');
bass_player.loader.decodeAfterLoading(audioContext, '0320_Aspirin_sf2_file');
// drums_player.loader.decodeAfterLoading(audioContext, '35_16_JCLive_sf2_file');
var playstop = false;
// __SWING_PLAYER__ For running the swing player, you need to assign to the
// kern file to be played as a string in the kern_string variable
var kern_string = null; // in this example, the string value is assigned with the following function:
// __SWING_PLAYER__ When play is pressed, the following function needs to be called
// (the kern_string variable needs to has been assigned properly)
// The play() function acts as toggle, i.e., if you call it while playing, it will stop.
// There is also a stop function available: stop_player() - in js/gjt_player.js.
function playSwing() {
    console.log('play:')
    send_kern_request( 'https://maxim.mus.auth.gr:6001/kern_for_player?kernfile=' + encodeURIComponent(kern_string) );
}

document.querySelector('.swing-player-button').
    addEventListener('click', playSwing);