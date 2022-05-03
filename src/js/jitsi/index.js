import { yProvider } from "../yjs-setup";

let api = null;
window.addEventListener('load', () => {
  let parentNode = document.getElementById('jitsi-meeting-container');

  $('#jitsi-meeting-container').resizable({
    resizeWidth: false,
  });

  if (parentNode) {
    api = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: 'MusiCoLab Demo',
      width: '100%',
      height: '100%',
      parentNode,
    });

    api.addListener('videoConferenceJoined', (localUser) => {
      console.log(localUser);
      if (localUser?.displayName.length > 0) {
        let user = yProvider.awareness.getLocalState().user;

        if (user) {
          yProvider.awareness.setLocalStateField('user', {
            ...user,
            name: localUser.displayName,
          });
          console.log({ awarenessUser: yProvider.awareness.getLocalState()})
        }
      }
    });
    window.JitsiAPI = api;
  }
});

export function getJitsiApiInstance() {
  if (api === null) {
    console.warn("JitsiMeetExternalApi isn't initialized yet.");
  }
  return api;
}