export function keysEqual(obj1, obj2) {
  let keys1 = Object.keys(obj1).sort();
  let keys2 = Object.keys(obj2).sort();

  if (keys1.length !== keys2.length) return false;
  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i]) return false;
  }
  return true;
}