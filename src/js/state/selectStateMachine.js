import { assign, createMachine, interpret } from "xstate";

const setElemId = (parentClass) => (context, event) => {
  let target = document.querySelector(`#${event.elemId}`);
  target = target?.closest(`.${parentClass}`);
  return target?.id ? target.id : '';
}

export const selectMachine = createMachine({
  initial: 'idle',
  context: {
    elemId: '',
    // refElemId: '',
    // clientId: '',
  },
  states: {
    idle: {
      id: 'idleState',
      on: {
        SELECT: {
          target: 'noteSelected',
          actions: assign({
            elemId: setElemId('note')
          }),
        },
      },
    },
    noteSelected: {
      on: {
        SELECT: [
          {
            target: 'chordSelected',
            actions: assign({
              elemId: setElemId('chord'),
            }),
            cond: (context, event) => {
              return !!document.querySelector(`#${event.elemId}`)?.closest('.chord');
            }
          },
          {
            target: 'layerSelected',
            actions: assign({
              elemId: setElemId('layer'),
            }),
          },
        ],
        RESET: { 
          target: 'idle',
          actions: assign({
            elemId: (_, __) => ''
          })
        }
      },
    },
    chordSelected: {
      on: {
        SELECT: {
          target: 'layerSelected',
          actions: assign({
            elemId: setElemId('layer'),
          }),
        },
        RESET: { 
          target: 'idle',
          actions: assign({
            elemId: (_, __) => ''
          })
        }
      },
    },
    layerSelected: {
      id: 'layer',
      on: {
        SELECT: {
          target: 'idle',
          actions: assign({
            elemId: (context, event) => '',
          }),
        },
        RESET: { 
          target: 'idle',
          actions: assign({
            elemId: (_, __) => ''
          })
        }
      },
    },
  },
});

export let selectService = interpret(selectMachine);