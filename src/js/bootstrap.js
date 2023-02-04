import CONFIG from '../features.json';
import { getURLInfo } from './api/util';

import {
  addListenersToOutput,
  commentsObserver,
} from './collaboration/collab-extension.js';
import { keysEqual } from './util';
import { setupCollaboration } from './yjs-setup.js';

/** @typedef {'score' | 'collaboration' | 'videoConference' | 'soundEditor'} FeatureKey */
/** @param {{FeatureKey: boolean }} FeatureConfig*/
const FeatureConfig = {
  score: false,
  collaboration: false,
  videoConference: false,
  soundEditor: false,
};

const isDevMode = import.meta.env.DEV;

if (isDevMode) {
  document.getElementById('feature-toggle').style.display = 'block';
}

let featureForm = document.getElementById('feature-form');
let options = featureForm.querySelectorAll('input[type="checkbox"]');

// TODO: How should we handle dependencies for features?
// E.g. enabling collaboration while score is disabled doesn't make sense
// In other words, collaboration depends on score.

/**
 * Based on https://www.martinfowler.com/articles/feature-toggles.html
 *
 * @param {FeatureConfig} initialConfig
 * @returns
 */
function createFeatureToggler(initialConfig = FeatureConfig) {
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
        error = new Error(
          `Feature ${featureName} not found on feature config ${JSON.stringify(
            config,
            null,
            2
          )}`
        );
      }
      if (typeof isEnabled !== 'boolean')
        error = new Error('Value must be boolean');

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
      });
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

let useConfigFile = keysEqual(CONFIG, FeatureConfig);
const featureToggler = createFeatureToggler(
  useConfigFile ? CONFIG : FeatureConfig
);
if (useConfigFile) {
  bootstrap().then(() =>
    console.log('Loaded features from file configuration')
  );
}
/**
 *
 * @param {FeatureKey} featureName
 * @returns {boolean}
 */
export function featureIsEnabled(featureName) {
  return featureToggler.featureIsEnabled(featureName);
}

function getCollabStatus() {
  const { course, collab } = getURLInfo();

  // `course` URL search parameter
  if (typeof course == 'string' && course.length > 0 && collab !== 'false') {
    return {
      enable: true,
      reason: `course search parameter specified with value: ${course}`,
    };
  }

  // `collab` URL search parameter
  if (typeof collab != 'undefined') {
    return {
      enable: collab === 'true',
      reason: `collab search parameter specified with value: ${collab}`,
    };
  }

  // Fallback to features.json file config
  return {
    enable: featureToggler.featureIsEnabled('collaboration'),
    reason:
      'Relevant search parameters not specified. Falling back to "features.json" config file',
  };
}

async function bootstrap() {
  if (featureToggler.featureIsEnabled('score')) {
    handleScore();
    disableOption('score', options);
  }

  const collabStatus = getCollabStatus();
  console.log(collabStatus.reason);
  if (collabStatus.enable) {
    await featureToggler.setFeature('collaboration', true);
    handleCollabSetup();
    disableOption('collaboration', options);
  }

  if (featureToggler.featureIsEnabled('videoConference')) {
    let { default: jitsi } = await import('./jitsi/index.js');
    handleVideoConfSetup(jitsi);
  }

  if (featureToggler.featureIsEnabled('soundEditor')) {
  }
}

function disableOption(featureName, options) {
  if (isDevMode) {
    console.log(`Disabling ${featureName} option`);
    let optToDisable = [...options].find((o) => o.name === featureName);
    if (!optToDisable) {
      console.error('Option to disable was not found.');
      return;
    }
    optToDisable.disabled = true;
  }
}

function enableOption(featureName, options) {
  if (isDevMode) {
    console.log(`Enabling ${featureName} option`);
    let optToEnable = [...options].find((o) => o.name === featureName);
    if (!optToEnable) {
      console.error('Option to enable was not found.');
      return;
    }
    optToEnable.disabled = false;
    optToEnable.checked = false;
  }
}

function showCommentsInNav() {
  document.getElementById('comments__menu-item')?.classList.remove('hidden');
}

function handleScore() {
  let scoreElem = document.getElementById('score-editor');
  if (!scoreElem) {
    console.error('Score editor element was not found. Check index.html');
    return;
  }
  scoreElem.style.display = 'block';
}

function handleCollabSetup() {
  console.log('Setting up collaboration feature');
  setupCollaboration();
  addListenersToOutput();
  showCommentsInNav();
}

function handleCollabTearDown() {
  console.warn('Tearing down collaboration feature');
  // TODO: disconnect from Yjs provider
  // TODO: destroy Yjs document
}

function handleVideoConfSetup(jitsi) {
  jitsi.setup();
}

function handleVideoConfTearDown(jitsi) {
  jitsi.destroy();
}

export let COMMENTS_VISIBLE = false;
export function toggleCommentsVisibility(commentsVisible) {
  if (!featureIsEnabled('collaboration')) {
    console.log(`Collaboration feature must be enabled to show comments`);
    return;
  }

  if (typeof commentsVisible != 'undefined') {
    COMMENTS_VISIBLE = commentsVisible;
    commentsObserver();
    return;
  }

  COMMENTS_VISIBLE = !COMMENTS_VISIBLE;
  commentsObserver();
}

function initForm(config) {
  return function () {
    options.forEach((opt) => {
      opt.checked = config[opt.name];
    });

    featureForm?.addEventListener('submit', handleSubmit);

    function handleSubmit(e) {
      e.preventDefault();

      const asFeatures = Array.from(options).map((o) => ({
        name: o.name,
        checked: o.checked,
      }));
      if (isDevMode) {
        console.log(asFeatures);
      }

      asFeatures.forEach(async (feat) => {
        let res = await featureToggler.setFeature(feat.name, feat.checked);

        // This option was unchanged, check the next option
        if (res.changed === null) return;

        switch (feat.name) {
          case 'score':
            if (res.changed[feat.name]) {
              handleScore();
              disableOption('score', options);
            }
            break;
          case 'collaboration':
            if (res.changed[feat.name] && res.config['score']) {
              handleCollabSetup();
              disableOption('collaboration', options);
            } else {
              // handleCollabTearDown();
            }
            break;
          case 'videoConference':
            // FIX: we're reloading Jitsi Meet every time
            let { default: jitsi } = await import('./jitsi/index.js');
            if (res.changed[feat.name]) {
              handleVideoConfSetup(jitsi);
            } else {
              handleVideoConfTearDown(jitsi);
            }
            return;
          default:
            break;
          case 'soundEditor':
            // disappearing only, still working on the background

            if (res.changed[feat.name]) {
              document
                .getElementById('control_section_buttons')
                .removeAttribute('style');
              document
                .getElementById('waveforms-display')
                .removeAttribute('style');
            } else {
              document
                .getElementById('control_section_buttons')
                .setAttribute('style', 'display: none');
              document
                .getElementById('waveforms-display')
                .setAttribute('style', 'display: none');
              wavesurfer.stop();
            }
            break;
        }
      });
    }
  };
}

if (isDevMode) {
  window.addEventListener(
    'load',
    initForm(useConfigFile ? CONFIG : FeatureConfig)
  );
}

window.bts = bootstrap;
window.FeatureConfig = FeatureConfig;
window.toggler = featureToggler;
