/** @type {{ [x: string]: boolean }} */
const featureConfig = {
  score: false,
  collaboration: false,
  videoConference: false,
  waveSurfer: false,
};

/**
 * @param {{ [x: string]: boolean; }} config
 * @param {string} key
 * @param {boolean} val
 */
function setConfig(config, key, val) {
  if (!(key in config))
    throw new Error(
      `Key ${key} not found on object ${JSON.stringify(config, null, 2)}`
    );
  if (typeof val !== 'boolean') throw new Error('Value must be boolean');

  return { ...config, [key]: val };
}

async function bootstrap() {
  for (const [ k, v ] of Object.entries(featureConfig)) {
    switch (k) {
      case 'score':
        break;
      case 'collaboration':
        break;
      case 'videoConference':
        if (v) {
          let module = await import('../js/jitsi/index.js');
          console.log('Module was loaded', module);
        }
        break;
      case 'waveSurfer':
        break;
      default:
        break;
    }
  }
}

window.bts = bootstrap;