import { createMachine } from "xstate";

let inputElem = document.querySelector('#input');
let outputElem = document.querySelector('#output');

const replaceColValue = (elem, value) => {
  let oldValue = [...elem.classList].find(cl => /^col/g.test(cl));
  if (oldValue) {
    elem.classList.remove(oldValue);
  }
  elem.classList.add(`col-${value}`);
}

const resize = (inputCol, outputCol, commentsCol) => {
  return () => {
    let commentsSection = document.querySelector('#comments-section');
  
    replaceColValue(inputElem, inputCol);
    replaceColValue(outputElem, outputCol);
    replaceColValue(commentsSection, commentsCol);
  }
}

export const layoutMachine = createMachine({
  initial: 'idle',
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
          actions: resize(4, 8, 0)
        },
        SHOW_COMMENTS: {
          target: 'notationAndCommentsVisible',
          actions: resize(0, 8, 4)
        },
      }
    },
    notationAndTextVisible: {
      on: {
        SHOW_COMMENTS: {
          target: 'allVisible',
          actions: resize(4, 6, 2)
        },
        HIDE_TEXT: {
          target: 'notationVisible',
          actions: resize(0, 12, 0)
        }
      },
    },
    notationAndCommentsVisible: {
      on: {
        SHOW_TEXT: {
          target: 'allVisible',
          actions: resize(4, 6, 2)
        },
        HIDE_COMMENTS: {
          target: 'notationVisible',
          actions: resize(0, 12, 0)
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
      },
    },
  },
});