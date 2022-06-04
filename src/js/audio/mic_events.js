'use strict';


let wavesurfer3, context3, processor3;


wavesurfer3 = WaveSurfer.create({
    container: '#waveform3',
    waveColor: 'black',
    interact: false,
    cursorWidth: 0,
    audioContext: context3 || null,
    audioScriptProcessor: processor3 || null,
    plugins: [
        WaveSurfer.microphone.create({
            bufferSize: 4096,
            numberOfInputChannels: 1,
            numberOfOutputChannels: 1,
            constraints: {
                video: false,
                audio: true
            }
        })
    ]
});

wavesurfer3.microphone.on('deviceReady', function() {
    console.info('Device ready!');
});
wavesurfer3.microphone.on('deviceError', function(code) {
    console.warn('Device error: ' + code);
});
wavesurfer3.on('error', function(e) {
    console.warn(e);
});
wavesurfer3.microphone.start();
