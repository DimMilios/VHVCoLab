import store from ".";

window.addEventListener('DOMContentLoaded', () => {
  // console.log('Store intial value', store.state.items);
  store.events.subscribe('stateChange', (state) => {
    console.log('==================Store stateChange subscriber', state.items);
  })

  store.dispatch('addItem', `New Value added ${new Date().toDateString()}`);

  // console.log('Store value after mutation:', store.state.items);
  store.dispatch('clearItem', 'Another thing');
})
