import { setupCollaboration } from './yjs-setup.js';

/** @typedef {'score' | 'collaboration' | 'videoConference' | 'waveSurfer'} FeatureKey */
/** @param {{FeatureKey: boolean }} FeatureConfig*/
const FeatureConfig = {
  score: false,
  collaboration: false,
  videoConference: false,
  waveSurfer: false,
};

// TODO: How should we handle dependencies for features?
// E.g. enabling collaboration while score is disabled doesn't make sense
// In other words, collaboration depends on score.

/**
 * Based on https://www.martinfowler.com/articles/feature-toggles.html
 * 
 * @param {FeatureConfig} initialConfig 
 * @returns 
 */
function createFeatureToggler(initialConfig) {
  let config = Object.assign({}, initialConfig);

  return {
    /**
     * 
     * @param {FeatureKey} featureName 
     * @param {boolean} isEnabled
     * @returns {Promise<Object>}>}
     */
    setFeature(featureName, isEnabled) {
      let error;
      if (!(featureName in config)) {
        error = new Error(`Feature ${featureName} not found on feature config ${JSON.stringify(config, null, 2 )}`);
      }
      if (typeof isEnabled !== 'boolean') error = new Error('Value must be boolean');
      
      return new Promise((resolve, reject) => {
        if (error) {
          reject(error);
        }

        config[featureName] = isEnabled;
        resolve({ config, changed: { [featureName]: isEnabled } });
      })
    },
    /**
     * 
     * @param {FeatureKey} featureName 
     * @returns {boolean}
     */
    featureIsEnabled(featureName) {
      return config[featureName];
    },
  };
}

const featureToggler = createFeatureToggler(FeatureConfig);
/**
 * 
 * @param {FeatureKey} featureName
 * @returns {boolean}
 */
export function featureIsEnabled(featureName) {
  return featureToggler.featureIsEnabled(featureName);
}

async function bootstrap() {
  if (featureToggler.featureIsEnabled('score')) {

  }

  if (featureToggler.featureIsEnabled('collaboration')) {
    setupCollaboration();
  }

  if (featureToggler.featureIsEnabled('videoConference')) {
    let module = await import('../js/jitsi/index.js');
    console.log('Module was loaded', module);
  }

  if (featureToggler.featureIsEnabled('waveSurfer')) {

  }
}

async function enableVideoConference() {
  let { config, changed } = await featureToggler.setFeature('videoConference', true);
  console.log(config, changed);
  if (changed['videoConference']) {
    let { setupJitsi } = await import('../js/jitsi/index.js');
    setupJitsi();
  } 
}
window.enableVideoConference = enableVideoConference;

window.bts = bootstrap;
window.FeatureConfig = FeatureConfig;
window.toggler = featureToggler;
