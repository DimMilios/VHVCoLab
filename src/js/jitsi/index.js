import { yProvider } from '../yjs-setup';
import { featureIsEnabled } from '../bootstrap.js';
import { getURLParams } from '../api/util';

const JITSI_DOMAIN = 'musicolab.hmu.gr:8443/devel';
// const JITSI_DOMAIN = 'meet.jit.si';
const JITSI_DEFAULT_OPTIONS = {
  roomName: 'MusiCoLab Demo',
  width: '100%',
  height: '100%',
  configOverwrite: {
    prejoinPageEnabled: true,
  },
};

//CONFIG TO BE ADDED
//config.analytics.disabled=true
//config.prejoinPageEnabled=true
//config.p2p.enabled=false
//config.disableAP=true
//config.disableAEC=false
//config.disableNS=true
//config.disableAGC=true
//config.disableHPF=true
//config.stereo=false
//config.opusMaxAverageBitrate=10000
//config.enableOpusRed=false
//config.enableNoAudioDetection=false
//config.enableNoisyMicDetection=false
//config.disableAudioLevels=true
//config.disableSimulcast=true
//config.enableLayerSuspension=true

class JitsiAPI {
  api = null;

  constructor() {
    this.jitsiContainer = document.getElementById('jitsi-meeting-container');
    if (!this.jitsiContainer) {
      throw new Error('Failed to initialize Jitsi. ParentNode was not found.');
    }

    this.options = {
      ...JITSI_DEFAULT_OPTIONS,
      parentNode: this.jitsiContainer,
    };

    this.setup();
  }

  setup() {
    let startJitsi   = document.getElementById('start-jitsi-meet-btn');
    let meetRoomForm = document.getElementById('meet-room-form');

    startJitsi.addEventListener('click', (e) => {
      if (startJitsi.classList.contains('call-started')) {
        startJitsi.classList.remove('call-started');
        startJitsi.style.color = '';
    
        this.destroy();
        this.hide();
      } else {
        startJitsi.classList.add('call-started');   
        $('#enter-jitsi-meet-room').modal('show');
      }
    });
    meetRoomForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let formData = new FormData(event.target);
      console.log(Object.fromEntries(formData));

      let meetRoomName = formData.get('meet-room');
      if (meetRoomName != null) {
        this.options.roomName = meetRoomName;
      }

      this.show();
      this.initAPI();

      startJitsi.style.color= 'red'
    });

      this.jitsiContainer.style.resize="height";
      this.jitsiContainer.style.minHeight = '100px';
      this.jitsiContainer.style.maxHeight = '600px';

      $('#meet-room')[0].value = getURLParams().course ?? 'test-room';
  }

  initAPI() {
    if (!this.api) {
      this.api = new JitsiMeetExternalAPI(JITSI_DOMAIN, this.options);

      if (featureIsEnabled('collaboration')) {
        // Retrieve the name the user entered on Jitsi and assign that name on the Yjs session
        this.api.addListener('videoConferenceJoined', (localUser) => {
          console.log(localUser);
          if (localUser?.displayName.length > 0) {
            let user = yProvider.awareness.getLocalState().user;

            if (user) {
              yProvider.awareness.setLocalStateField('user', {
                ...user,
                name: localUser.displayName,
              });
              console.log({
                awarenessUser: yProvider.awareness.getLocalState(),
              });
            }
          }
        });
      }

      this.api.addEventListener('readyToClose', () => {
        console.log(
          'Jitsi call has ended. Jitsi iframe will be hidden and the API will be destroyed.'
        );

    	let startJitsi = document.getElementById('start-jitsi-meet-btn');
	    startJitsi.style.color='green';
        this.destroy();
        this.hide();
      });
    }
  }

  destroy() {
    console.log('Destroying Jitsi');
    this.api.dispose();
    this.api = null;
  }

  show() {
    if (!this.jitsiContainer) {
      console.error('Jitsi container element was not found. Check index.html');
      return;
    }

    $('#jitsi-meeting-container').slideDown('slow', () => {});
    $('#enter-jitsi-meet-room').modal('hide');
  }

  hide() {
    if (!this.jitsiContainer) {
      console.error('Jitsi container element was not found. Check index.html');
      return;
    }

    $('#jitsi-meeting-container').slideUp('slow', () => {
	//startJitsi.style.color='red';
    });
  }
}

export default new JitsiAPI();
