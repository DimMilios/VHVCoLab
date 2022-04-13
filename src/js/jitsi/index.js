window.addEventListener('load', () => {
  let parentNode = document.getElementById('jitsi-meeting-container');

  $('#jitsi-meeting-container').resizable({
    resizeWidth: false,
  });

  if (parentNode) {
    const api = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: 'MusiCoLab Demo',
      width: '100%',
      height: '100%',
      parentNode,
    });
  }
});
