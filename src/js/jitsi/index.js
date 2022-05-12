import { yProvider } from '../yjs-setup';

class JitsiAPI {
  setup() {
    let parentNode = document.getElementById('jitsi-meeting-container');
    if (!parentNode) {
      throw new Error('Failed to initialize Jitsi. ParentNode was not found.');
    }

    $('#jitsi-meeting-container').resizable({
      resizeWidth: false,
    });

    if (!this.api) {
      this.api = new JitsiMeetExternalAPI('meet.jit.si', {
        roomName: 'MusiCoLab Demo',
        width: '100%',
        height: '100%',
        parentNode,
      });

      this.api.addListener('videoConferenceJoined', (localUser) => {
        console.log(localUser);
        if (localUser?.displayName.length > 0) {
          let user = yProvider.awareness.getLocalState().user;
  
          if (user) {
            yProvider.awareness.setLocalStateField('user', {
              ...user,
              name: localUser.displayName,
            });
            console.log({ awarenessUser: yProvider.awareness.getLocalState() });
          }
        }
      });
      // window.JitsiAPI = this.api;
    }
  }

  destroy() {
    console.log('Destroying Jitsi');
    // console.log(this.api.dispose, typeof this.api);
    this.api.dispose();
    this.api = null;
  }
}

export default new JitsiAPI();

// export function getJitsiApiInstance() {
//   if (api === null) {
//     console.warn("JitsiMeetExternalApi isn't initialized yet.");
//   }
//   return api;
// }
