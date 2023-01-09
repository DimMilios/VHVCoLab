import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import userProfileImgUrl from '../../../images/user-profile.png';
import { yProvider } from '../yjs-setup';


export let userListTemplate = (users) => {
  return html`
    <ul class="users-online m-0 p-0 d-flex justify-content-between">
      ${users.map(user => onlineUserTemplate(user))}
    </ul>`;
};

let onlineUserTemplate = (user) => {
  let classes = { 'online-status': user.online, 'offline-status': !user.online };

  return html`<li data-toggle="tooltip" title=${user.name}>
    <span class="position-relative d-inline-flex">
      <div style="background-color: white; border-radius: 50%;">
        <img src=${user.imageProfileURL} alt="user profile icon" width="40" height="40" style="border-radius: 50%;" />
      </div>
      <span class=${classMap(classes)}></span>
    </span>
  </li>`;
};

// let onlineUserTemplate = (url, user) => {
//   let classes = { 'online-status': user.online, 'offline-status': !user.online };
//   return html`<li data-toggle="tooltip" title=${user.name}>
//     <span class="position-relative d-inline-flex">
//       <div style="background-color: white; border-radius: 50%;">
//         <img src=${url} alt="user profile icon" width="40" height="40" />
//       </div>
//       <span class=${classMap(classes)}></span>
//     </span>
//   </li>`;
// };
