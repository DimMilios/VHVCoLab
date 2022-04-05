window.addEventListener('load', () => {
  let parentNode = document.getElementById('jitsi-meeting-container');

  $('#jitsi-meeting-container').resizable({
    resizeWidth: false,
  });

  const api = new JitsiMeetExternalAPI('meet.jit.si', {
    roomName: 'ExternalAPIInitModuleDemo',
    width: '100%',
    height: '100%',
    parentNode,
  });
});
