import { setupCollaboration } from './yjs-setup.js';

/** @typedef {'score' | 'collaboration' | 'videoConference' | 'waveSurfer'} FeatureKey */
/** @param {{FeatureKey: boolean }} FeatureConfig*/
const FeatureConfig = {
  score: true,
  collaboration: true,
  videoConference: false,
  waveSurfer: false,
};

/**
 * Based on https://www.martinfowler.com/articles/feature-toggles.html
 * 
 * @param {FeatureConfig} featureConfig 
 * @returns 
 */
function createFeatureToggler(featureConfig) {
  return {
    /**
     * 
     * @param {FeatureKey} featureName 
     * @param {boolean} isEnabled 
     */
    setFeature(featureName, isEnabled) {
      if (!(featureName in featureConfig)) {
        throw new Error(`Feature ${featureName} not found on feature config ${JSON.stringify(featureConfig, null, 2 )}`);
      }
      if (typeof isEnabled !== 'boolean') throw new Error('Value must be boolean');
      featureConfig[featureName] = isEnabled;
    },
    /**
     * 
     * @param {FeatureKey} featureName 
     * @returns {boolean}
     */
    featureIsEnabled(featureName) {
      return featureConfig[featureName];
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

window.bts = bootstrap;
window.FeatureConfig = FeatureConfig;
