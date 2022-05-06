import { addListenersToOutput } from './collaboration/collab-extension.js';
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

        let oldValue = config[featureName];
        config[featureName] = isEnabled;
        resolve({
          config,
          changed: oldValue != isEnabled ? { [featureName]: isEnabled } : null,
        });
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

function initForm() {
  let featureForm = document.getElementById('feature-form');

  let options = featureForm.querySelectorAll('input[type="checkbox"]');
  options.forEach((opt) => {
    opt.checked = FeatureConfig[opt.name];
  });

  featureForm?.addEventListener('submit', handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();

    const asFeatures = Array.from(options).map((o) => ({
      name: o.name,
      checked: o.checked,
    }));
    console.log(asFeatures);

    asFeatures.forEach(async (feat) => {
      let res = await featureToggler.setFeature(feat.name, feat.checked);

      // This option was unchanged, check the next option
      if (res.changed === null) return;

      switch (feat.name) {
        case 'score':
          let scoreElem = document.getElementById('score-editor');
          if (!scoreElem) {
            console.error(
              'Score editor element was not found. Check index.html'
            );
            return;
          }
          scoreElem.style.display = 'block';
          break;
        case 'collaboration':
          if (res.changed[feat.name] && res.config['score']) {
            console.log(
              `Toggled feature: ${feat.name}`,
              JSON.stringify(res.changed, null, 2)
            );
            setupCollaboration();
            addListenersToOutput();
          } else {
            // TODO: disconnect from Yjs provider
            // TODO: destroy Yjs document
          }
          break;
        case 'videoConference':
          console.log(
            `Toggled feature: ${feat.name}`,
            JSON.stringify(res.changed, null, 2)
          );
          // FIX: we're reloading Jitsi Meet every time
          let { default: jitsi } = await import('../js/jitsi/index.js');
          window.JitsiAPI = jitsi.api;
          if (res.changed[feat.name]) {
            document.getElementById('jitsi-meeting-container').style.display =
              'block';
            jitsi.setup();
          } else {
            console.log(jitsi.api.dispose, typeof jitsi.api);
            jitsi.destroy();
            document.getElementById('jitsi-meeting-container').style.display =
              'none';
          }
          return;
        default:
          break;
      }

      let optToDisable = [...options].find((o) => o.name === feat.name);
      if (optToDisable) {
        optToDisable.disabled = true;
      }
    });
  }
}
window.addEventListener('load', initForm);


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
