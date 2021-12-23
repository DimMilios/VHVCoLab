import { assign, createMachine, interpret } from 'xstate';
import { displayNotation } from '../vhv-scripts/misc';

let inputElem = document.querySelector('#input');
let outputElem = document.querySelector('#output');
let outputWithCommentsElem = document.querySelector('.output-with-comments');

const replaceColValue = (elem, value) => {
  if (!elem) return;

  let oldValue = [...elem.classList].find((cl) => /^col/g.test(cl));
  if (oldValue) {
    elem.classList.remove(oldValue);
  }
  elem.classList.add(`col-${value}`);
};

const resize = (inputCol, outputCol, commentsCol) => {
  let commentsSection = document.querySelector('#comments-section');

  return () => {
    replaceColValue(inputElem, inputCol);
    replaceColValue(outputWithCommentsElem, outputCol + commentsCol - inputCol);
    replaceColValue(outputElem, outputCol);
    replaceColValue(commentsSection, commentsCol);
  };
};

const resizeAndRerender = (inputCol, outputCol, commentsCol) => {
  return () => {
    resize(inputCol, outputCol, commentsCol)();
    displayNotation();
  };
};

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
              resizeAndRerender(inputCol, outputCol, commentsCol)(),
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
            ({ inputCol, outputCol, commentsCol }) =>
              resizeAndRerender(inputCol, outputCol, commentsCol)(),
          ],
        },
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
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
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
              resizeAndRerender(inputCol, outputCol, commentsCol)(),
          ],
        },
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
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
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
            ({ inputCol, outputCol, commentsCol }) =>
              resizeAndRerender(inputCol, outputCol, commentsCol)(),
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
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
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
              resizeAndRerender(inputCol, outputCol, commentsCol)(),
          ],
        },
      },
    },
  },
});

export let layoutService = interpret(layoutMachine);
