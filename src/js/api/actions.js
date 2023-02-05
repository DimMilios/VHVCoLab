import { featureIsEnabled } from '../bootstrap';
import { yProvider } from '../yjs-setup';
import { baseUrl, getURLParams } from './util';

/** @typedef { 'change_pitch' | 'change_chord' | 'add_comment' | 'undo' | 'transpose' | 'connect' | 'disconnect' | 'export'} ActionType */
export class ActionPayload {
  /**
   * @param {{ type: ActionType, content: string }} payload
   */
  constructor({ type, content }) {
    this.type = type;
    this.content = content;
  }
}

function getQueryData() {
  const { user } = yProvider.awareness.getLocalState();
  if (user) {
    return {
      username: user.name,
      course: user.course ?? null,
      filename: yProvider.roomname,
    };
  }

  let { user: username, course } = getURLParams();
  if (username) {
    return {
      username,
      course: course ?? null,
      filename: yProvider.roomname ?? null,
    };
  }
}

/**
 *
 * @param {ActionPayload} payload
 */
export async function sendAction(payload) {
  if (!featureIsEnabled('actions')) {
    console.warn(
      'Tried to send an action request, but "actions" feature is disabled. You must enable "actions" feature on features.json for actions to be sent.'
    );
    return;
  }

  try {
    const { username, course, filename } = getQueryData();

    const res = await fetch(`${baseUrl}api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ ...payload, username, course, filename }),
    });
    const json = await res.json();
    console.log(`Received:`, json);
  } catch (error) {
    console.error(`Failed to send comment action`, error);
  }
}
