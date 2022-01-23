export let state = {
  comments: [],
  users: []
}

export let setState = (newState = {}) => {
  if (!typeof newState === 'object') {
    throw new Error('State argument has to be an object');
  }
  
  // if (Object.keys(state).length > 0 && state.constructor === Object && !compareKeys(state, newState)) {
  //   throw new Error('The state object provided violates the state structure');
  // }
  
  // console.log('Old state', state);
  state = Object.assign({}, state, newState);
  // console.log('New state', state);
  return state;
}

function compareKeys(a, b) {
  let aKeys = Object.keys(a).sort();
  let bKeys = Object.keys(b).sort();
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}