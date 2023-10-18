import { sendAction } from '../api/actions';
import { yProvider } from '../yjs-setup';

/**
 * Single select change_pitch action
 * data: { "note-L11F1" => {"type": "single", "changes": []} }
 *
 * Multi select change_pitch action
 * data: { "note-L15F1,note-L17F1" => {"type": "multi", "changes": [[]]} }
 */
const groupedActions = {
  currentPos: undefined, // key of the latest change_pitch action
  type: undefined, // whether it's a singleSelect or multiSelect action
  data: {}, // key of action => changes in that action
};

/**
 *
 * @param {string} key
 * @param {import('../api/actions').ActionResponse} changePitchAction
 * @param {"single" | "multi"} changePitchType
 */
export function addChangePitchActionToGroup(
  key,
  changePitchAction,
  changePitchType
) {
  if (changePitchType === 'single' && changePitchAction) {
    const actions = key in groupedActions.data ? groupedActions.data[key] : [];
    groupedActions.data[key] = actions.concat(changePitchAction);
    groupedActions.currentPos = key;
    groupedActions.type = changePitchType;
  } else if (changePitchType === 'multi' && Array.isArray(changePitchAction.transposedNotes)) {
    const actions = key in groupedActions.data ? groupedActions.data[key] : [];
    groupedActions.data[key] = actions.concat([changePitchAction.transposedNotes]);
    groupedActions.currentPos = key;
    groupedActions.type = changePitchType;
  }
}

/**
 *
 * @param {{ added: number[], updated: number[], removed: number[] }} changedClients
 */
export function sendGroupedChangePitchActionIfChanged({
  added,
  updated,
  removed,
}) {
  if (added.concat(updated, removed).includes(yProvider.awareness.clientID)) {
    const { singleSelect, multiSelect } = yProvider.awareness.getLocalState();
    const isSingleSelectGroup =
      singleSelect &&
      'elemId' in singleSelect &&
      groupedActions.currentPos !== singleSelect.elemId &&
      groupedActions.data[groupedActions.currentPos]?.length > 0;
    const isMultiSelectGroup =
      multiSelect &&
      groupedActions.currentPos !== multiSelect.join(',') &&
      groupedActions.data[groupedActions.currentPos]?.length > 0;

    if (isSingleSelectGroup || isMultiSelectGroup) {
      sendAction({
        type: 'change_pitch',
        content: JSON.stringify({
          type: groupedActions.type,
          changes: groupedActions.data[groupedActions.currentPos],
        }),
      })
        .then(() => {
          console.log(`change_pitch action was sent.`);
          delete groupedActions.data[groupedActions.currentPos];
        })
        .catch(() => console.error(`Failed to send change_pitch action`));
    }
  }
}
