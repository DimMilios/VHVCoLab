import { assign, createMachine, interpret } from 'xstate';
import { updateHandler } from '../collaboration/collab-extension';
import { renderComments, uiCoords } from '../collaboration/templates';
import { displayNotation } from '../vhv-scripts/misc';
import { yProvider } from '../yjs-setup';
import { state as commentState } from './comments';

let inputElem = document.querySelector('#input');
let outputElem = document.querySelector('#output');
let outputWithCommentsElem = document.querySelector('.output-with-comments');

const replaceColValue = (elem, value) => {
  if (!elem) return;

  let oldValue = [...elem.classList].find((cl) => /^col/g.test(cl));
  let shouldRerender = false;
  if (oldValue) {
    let numeric = oldValue.match(/\d+/g);
    if (numeric && numeric != value) {
      shouldRerender = true;
    }

    elem.classList.remove(oldValue);
  }
  elem.classList.add(`col-${value}`);

  return shouldRerender;
};

const resize = (inputCol, outputCol, commentsCol) => {
  let commentsSection = document.querySelector('#comments-section');

  return () => {
    replaceColValue(inputElem, inputCol);
    let rerenderCol = replaceColValue(outputWithCommentsElem, outputCol + commentsCol - inputCol);
    let rerenderSVG = replaceColValue(outputElem, outputCol);
    replaceColValue(commentsSection, commentsCol);

    if (rerenderCol || rerenderSVG) {
      displayNotation();
      let output = document.querySelector('#output > svg');
      uiCoords.svgHeight = output?.height.baseVal.value ?? window.innerHeight;
    }
  };
};

// const resizeAndRerender = (inputCol, outputCol, commentsCol) => {
//   return () => {
//     resize(inputCol, outputCol, commentsCol)();
//     displayNotation();
//   };
// };

export const layoutMachine = createMachine({
  initial: 'notationAndTextVisible',
  context: {
    inputCol: 0,
    outputCol: 0,
    commentsCol: 0,
  },
  states: {
    idle: {
      id: 'idleState',
      on: {
        SHOW_NOTATION: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
      },
    },
    notationVisible: {
      on: {
        SHOW_TEXT: {
          target: 'notationAndTextVisible',
          actions: [
            assign({
              inputCol: 4,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        SHOW_COMMENTS: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 8,
              commentsCol: 4,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        },
        SHOW_COMMENTS_HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 8,
              commentsCol: 4,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        }
      },
    },
    notationAndTextVisible: {
      on: {
        SHOW_COMMENTS: {
          target: 'allVisible',
          actions: [
            assign({
              inputCol: 2,
              outputCol: 10,
              commentsCol: 2,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        },
        HIDE_TEXT: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        SHOW_COMMENTS_HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 8,
              commentsCol: 4,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            },
          ],
        }
      },
    },
    notationAndCommentsVisible: {
      on: {
        SHOW_TEXT: {
          target: 'allVisible',
          actions: [
            assign({
              inputCol: 2,
              outputCol: 10,
              commentsCol: 2,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            },
          ],
        },
        HIDE_COMMENTS: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)()
              updateHandler({ updated: [...yProvider.awareness.getStates().keys()], added: [], removed: [] });
            },
          ],
        },
      },
    },
    allVisible: {
      on: {
        HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 8,
              commentsCol: 4,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        HIDE_COMMENTS: {
          target: 'notationAndTextVisible',
          actions: [
            assign({
              inputCol: 4,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)()
              updateHandler({ updated: [...yProvider.awareness.getStates().keys()], added: [], removed: [] });
            },
          ],
        },
        HIDE_ALL: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: 0,
              outputCol: 12,
              commentsCol: 0,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
      },
    },
  },
});

export let layoutService = interpret(layoutMachine);
