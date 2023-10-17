import { encoding } from 'lib0';
import { featureIsEnabled } from '../bootstrap';
import { messageActionsReset, yProvider } from '../yjs-setup';
import { baseUrl, getURLParams } from './util';

/** @typedef { 'change_pitch' | 'change_chord' | 'add_comment' | 'undo' | 'transpose' | 'connect' | 'disconnect' | 'export' | 'repository_import'} ActionType */

export const ACTION_TYPES = {
  change_pitch: 'change_pitch',
  change_chord: 'change_chord',
  add_comment: 'add_comment',
  undo: 'undo',
  transpose: 'transpose',
  connect: 'connect',
  disconnect: 'disconnect',
  export: 'export',
  repository_import: 'repository_import',
};

export class ActionPayload {
  /**
   * @param {{ type: ActionType, content: string, username: string | undefined, course: string | undefined, filename: string | undefined, scoreTitle: string | undefined }} payload
   */
  constructor({ type, content, username, course, filename, scoreTitle }) {
    this.type = type;
    this.content = content;
    this.username = username;
    this.course = course;
    this.filename = filename;
    this.scoreTitle = scoreTitle;
  }
}

export class ActionResponse {
  /**
   * @param {{ id: number, created_at: Date, type: ActionType, content: string, username: string | undefined, course: string | undefined, filename: string | undefined, score_title: string | undefined }} payload
   */
  constructor({ id, created_at, type, content, username, course, filename, score_title }) {
    this.id = id;
    this.createdAt = created_at;
    this.type = type;
    this.content = content;
    this.username = username;
    this.course = course;
    this.filename = filename;
    this.scoreTitle = score_title;
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
  const { user } = yProvider?.awareness?.getLocalState();
  let params = new URLSearchParams(yProvider.roomname);
  let filename = params.has('filename')
    ? params.get('filename')
    : yProvider.roomname;
  if (user) {
    return {
      username: user.name,
      course: user.course ?? null,
      filename,
    };
  }

  let { user: username, course } = getURLParams();
  if (username) {
    return {
      username,
      course: course ?? null,
      filename: filename ?? null,
    };
  }
}

const encoder = encoding.createEncoder();
/**
 *
 * @param {Partial<ActionPayload>} payload
 */
export async function sendAction(payload) {
  if (!featureIsEnabled('actions') || !featureIsEnabled('collaboration')) {
    return Promise.reject(
      'Tried to send an action request, but "actions" feature is disabled. You must enable "actions" feature on features.json for actions to be sent.'
    );
  }

  try {
    const { username, course, filename } = getQueryData();
    payload.username = username;
    payload.course = course;
    payload.filename = filename;
    payload.scoreTitle = JSON.parse(sessionStorage.getItem('score-metadata'))?.title;

    const res = await fetch(`${baseUrl}api/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    console.log(`Received:`, json);

    // Invalidate pagination
    encoding.writeVarUint(encoder, messageActionsReset);
    if (encoding.length(encoder) >= 1) {
      yProvider.ws.send(encoding.toUint8Array(encoder));
    }
  } catch (error) {
    return Promise.reject(`Failed to send action, error: ${error}`);
  }
}

export async function getActions(params = {}) {
  if (!featureIsEnabled('actions') || !featureIsEnabled('collaboration')) {
    return Promise.reject(
      'Tried to send an action request, but "actions" feature is disabled. You must enable "actions" feature on features.json for actions to be sent.'
    );
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
      ({ id, created_at, type, content, username, course, filename, score_title }) =>
        new ActionResponse({
          id,
          created_at,
          type,
          content,
          username,
          course,
          filename,
          score_title,
        })
    );
  } catch (error) {
    return Promise.reject(`Failed to send action, error: ${error}`);
  }
}
