import { createMachine, interpret } from "xstate";
import { updateHandler } from "../collaboration/collab-extension";
import { displayNotation } from "../vhv-scripts/misc";

let inputElem = document.querySelector('#input');
let outputElem = document.querySelector('#output');

const replaceColValue = (elem, value) => {
  if (!elem) return;

  let oldValue = [...elem.classList].find(cl => /^col/g.test(cl));
  if (oldValue) {
    elem.classList.remove(oldValue);
  }
  elem.classList.add(`col-${value}`);
}

const resize = (inputCol, outputCol, commentsCol) => {
  let commentsSection = document.querySelector('#comments-section');

  return () => {
    replaceColValue(inputElem, inputCol);
    replaceColValue(outputElem, outputCol);
    replaceColValue(commentsSection, commentsCol);
  }
}

const resizeAndRerender = (inputCol, outputCol, commentsCol) => {
  return () => {
    resize(inputCol, outputCol, commentsCol)();
    displayNotation();
  }
}

export const layoutMachine = createMachine({
  initial: 'notationAndTextVisible',
  context: {},
  states: {
    idle: {
      id: 'idleState',
      on: {
        SHOW_NOTATION: {
          target: 'notationVisible',
          actions: resize(0, 12, 0)
        },
      },
    },
    notationVisible: {
      on: {
        SHOW_TEXT: {
          target: 'notationAndTextVisible',
          actions: resizeAndRerender(4, 8, 0)
        },
        SHOW_COMMENTS: {
          target: 'notationAndCommentsVisible',
          actions: resizeAndRerender(0, 8, 4)
        },
      }
    },
    notationAndTextVisible: {
      on: {
        SHOW_COMMENTS: {
          target: 'allVisible',
          actions: resize(2, 8, 2)
        },
        HIDE_TEXT: {
          target: 'notationVisible',
          actions: resizeAndRerender(0, 12, 0)
        }
      },
    },
    notationAndCommentsVisible: {
      on: {
        SHOW_TEXT: {
          target: 'allVisible',
          actions: resize(2, 8, 2)
        },
        HIDE_COMMENTS: {
          target: 'notationVisible',
          actions: resizeAndRerender(0, 12, 0)
        }
      },
    },
    allVisible: {
      on: {
        HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: resize(0, 8, 4)
        },
        HIDE_COMMENTS: {
          target: 'notationAndTextVisible',
          actions: resize(4, 8, 0)
        },
        HIDE_ALL: {
          target: 'notationVisible',
          actions: resizeAndRerender(0, 12, 0)
        }
      },
    },
  },
});

export let layoutService = interpret(layoutMachine);