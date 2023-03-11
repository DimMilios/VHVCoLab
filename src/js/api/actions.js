import { createRelativePositionFromJSON } from 'yjs';
import { featureIsEnabled } from '../bootstrap';
import { yProvider } from '../yjs-setup';
import { baseUrl, getURLParams } from './util';

/** @typedef { 'change_pitch' | 'change_chord' | 'add_comment' | 'undo' | 'transpose' | 'connect' | 'disconnect' | 'export'} ActionType */

export const ACTION_TYPES = {
  change_pitch: 'change_pitch',
  change_chord: 'change_chord',
  add_comment: 'add_comment',
  undo: 'undo',
  transpose: 'transpose',
  connect: 'connect',
  disconnect: 'disconnect',
  export: 'export',
};

export class ActionPayload {
  /**
   * @param {{ type: ActionType, content: string, username: string | undefined, course: string | undefined, filename: string | undefined }} payload
   */
  constructor({ type, content, username, course, filename }) {
    this.type = type;
    this.content = content;
    this.username = username;
    this.course = course;
    this.filename = filename;
  }
}

export class ActionResponse {
  /**
   * @param {{ id: number, created_at: Date, type: ActionType, content: string, username: string | undefined, course: string | undefined, filename: string | undefined }} payload
   */
  constructor({ id, created_at, type, content, username, course, filename }) {
    this.id = id;
    this.createdAt = created_at;
    this.type = type;
    this.content = content;
    this.username = username;
    this.course = course;
    this.filename = filename;
  }

  /**
   *
   * @param {string} action
   */
  static fromJSON(action) {
    return new this(JSON.parse(action));
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
    payload.username = username;
    payload.course = course;
    payload.filename = filename;

    const res = await fetch(`${baseUrl}api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log(`Received:`, json);
  } catch (error) {
    console.error(`Failed to send comment action`, error);
  }
}

export async function getActions(params = {}) {
  if (!featureIsEnabled('actions')) {
    console.warn(
      'Tried to send an action request, but "actions" feature is disabled. You must enable "actions" feature on features.json for actions to be sent.'
    );
    return;
  }

  try {
    const { filename, course } = getQueryData();

    const reqUrl = new URL(`${baseUrl}api/actions`);
    reqUrl.searchParams.set('filename', filename);
    reqUrl.searchParams.set('course', course);
    for (let [k, v] of Object.entries(params)) {
      reqUrl.searchParams.set(k, v);
    }

    const res = await fetch(reqUrl, {
      headers: {
        Accept: 'application/json',
      },
    });
    const json = await res.json();
    console.log(`Received:`, json);
    return json.map(
      ({ id, created_at, type, content, username, course, filename }) =>
        new ActionResponse({
          id,
          created_at,
          type,
          content,
          username,
          course,
          filename,
        })
    );
  } catch (error) {
    console.error(`Failed to send comment action`, error);
  }
}
