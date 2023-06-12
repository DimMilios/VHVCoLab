import { html, render } from 'lit-html';

export let userListTemplate = (users) => {
  return html`
    <ul class="user-connection-status-list">
      ${users.map(user => onlineUserTemplate(user))}
    </ul>`;
};

let onlineUserTemplate = (user) => {
  return html`<li
    class="user-connection-status-item"
    >
      <img
      src=${user.imageSrc}
      alt="user profile icon"
      width="55"
      height="55"
      style="border-radius: 50%;"
      />
      <span class=${user.status}-status></span>
      <span style="color:white;">${user.name}</span>
    </li>`;
};

export const renderUserList = (users) => {
  const onlineUsersContainer = document.getElementById(
    'online-users'
  );
  if (onlineUsersContainer) {
    render(html`${userListTemplate(users)}`,
      onlineUsersContainer);

    $('[data-toggle="tooltip"]').tooltip();
  }
}

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
