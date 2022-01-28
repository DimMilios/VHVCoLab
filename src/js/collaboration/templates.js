import { html, render } from 'lit-html';
import { layoutService } from '../state/layoutStateMachine.js';
import { calculateMultiSelectCoordsWithOffset } from './util-collab.js';

import { commentReplyContainerTemplate } from '../templates/commentReplyContainer';
import { updateHandler } from './collab-extension.js';
import { yProvider } from '../yjs-setup.js';

export let uiCoords = {
  outputSVGHeight: 10,

  /**
   * @param {number|string} value
   */
  set svgHeight(value) {
    this.outputSVGHeight = typeof value == 'string' ? parseInt(value, 10) : value;
    render(commentSectionTemplate(this.outputSVGHeight), document.querySelector('.output-container'));
  },

  /**
   * @returns {number}
   */
  get svgHeight() {
    return this.outputSVGHeight;
  }
};

export let collabTemplate = (svgHeight, ...children) => {
  return html`<div id="collab-container" style="height: ${svgHeight}px">${children}</div>`;
}

export const multiSelectCoords = (selectedNotes) => {
  const selector = selectedNotes.map((id) => '#' + id).join(',');
  let output = document.querySelector('#output');

  return calculateMultiSelectCoordsWithOffset(
    Array.from(document.querySelectorAll(selector)),
    document.querySelector('#input'),
    output.closest('[class*=output-container]').scrollTop
  );
}

let commentSectionTemplate = (height) => {
  return html`
    <div
      id="comments-section"
      class="col-0 h-100"
      style="min-height: 95vh; max-height: 95vh; position: relative;"
    >
      <div
        id="comments-container"
        style="height: ${height}px; background-color: rgba(216, 215, 215, 0.8);"
      ></div>
    </div>
  `;
}

export function remToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}


export let renderComments = (comments, overlaps = []) => {
  let container = document.querySelector('#comments-container');

  if (container) {
    layoutService.send('SHOW_COMMENTS_HIDE_TEXT');

    let commentsWithReplies = [];
    for (let c of comments) {
      if (!c?.parentCommentId) {
        commentsWithReplies.push({ ...c, children: [] });
        continue;
      }

      let parent = commentsWithReplies.find(p => p.id == c.parentCommentId);
      if (!parent) continue;
      parent.children = [ ...parent.children, c ];
    }

    let width = container.offsetWidth;
    console.log('commentsWithReplies', commentsWithReplies);

    
    
    render(
      html`${commentsWithReplies.map(p => commentReplyContainerTemplate(p, width))}`,
      container
      );

    updateHandler({ added: [...yProvider.awareness.getStates().keys()] });
    
    // let commentElements = Array.from(document.querySelectorAll('.comment-with-replies'));
    // let overlappingElements = [];
    // for (let i = 0; i < commentElements.length; i++) {
    //   for (let j = i + 1; j < commentElements.length; j++) {
    //     let box1 = commentElements[i].getBoundingClientRect();
    //     let box2 = commentElements[j].getBoundingClientRect();
        
    //     // Calculations problematic in some browsers (way more "sensitive" on MS Edge)
    //     if (box2.y > box1.y && box2.y < box1.y + box1.height
    //       || box1.y > box2.y && box1.y < box2.y + box2.height) {
    //       // console.log('Overlapping elements', commentElements[i], commentElements[j]);
    //       let id1 = +commentElements[i].id.match(/(\d+)/)[0];
    //       let id2 = +commentElements[j].id.match(/(\d+)/)[0];

    //       let hasId1 = overlappingElements.find(arr => arr.includes(id1));
    //       let hasId2 = overlappingElements.find(arr => arr.includes(id2));
          
    //       if (hasId1) {
    //         // hasId1 = [...new Set([...hasId1, id2])]
    //         hasId1.push(id2);
    //       }
    //       else if (hasId2) {
    //         // hasId2 = [...new Set([...hasId2, id1])]
    //         hasId2.push(id1);
    //       } else {
    //         overlappingElements.push([ id1, id2 ]);
    //       }
    //     }
    //   }
    // }
    // // console.log(overlappingElements);

    // if (overlappingElements.length > 0) {
    //   // renderComments(state.comments, overlappingElements.map(arr => [...new Set(arr)]));
    //   let overlaps = overlappingElements.map(arr => [...new Set(arr)]);
    //   let test = [];
    //   if (overlaps.length > 0) {
    //     let lasthighestTop = 0;
    //     overlaps.forEach(arr => {
    //       let groupById = commentsWithReplies.filter(cwr => arr.includes(cwr.id));
    //       groupById[0].highlight.top += lasthighestTop + 10;
    //       for (let i = 1; i < groupById.length; i++) {
    //         let curr = groupById[i];
    //         let prev = groupById[i - 1];

    //         // TODO: We're not considering comment replies right now
    //         curr.highlight = { ...curr.highlight, top: prev.highlight.top + prev.highlight.height };
    //         lasthighestTop = curr.highlight.top;
    //       }
    //       test.push(groupById);
    //     })
    //   }

      // console.log('overlapping comments', test)
    // }
    
  }
}