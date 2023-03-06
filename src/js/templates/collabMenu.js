import { html, render } from 'lit-html';
import { COMMENTS_VISIBLE, toggleCommentsVisibility } from '../bootstrap';
import { renderActions } from './actionHistory';

const userList = () => {
  //alx
  return html`
    <div class="user-connection-status-container">
      <ul class="user-connection-status-list">
        <li class="user-connection-status-item">
          <span>🔴</span><span>User1</span>
        </li>
        <li class="user-connection-status-item">
          <span>🟢</span><span>User2</span>
        </li>
        <li class="user-connection-status-item">
          <span>🟢</span><span>User3</span>
        </li>
      </ul>
    </div>
  `;
};

export const collabMenuSideBar = () => {
  let commentBtnText = COMMENTS_VISIBLE ? 'Hide Comments' : 'Show Comments';

  const handleCommentToggle = () => {
    const visible = toggleCommentsVisibility();
    commentBtnText = visible ? 'Hide Comments' : 'Show Comments';
    renderCollabMenuSidebar();
  };

  const handleActionHistoryToggle = () => {
    let isOpen = document
      .getElementById('action-history-container')
      ?.classList.toggle('open');

    if (isOpen) {
      renderActions();
    }
  };

  return html`
      <ul class="collab-menu-toolbar-list">
        <li class="collab-menu-toolbar-item d-flex justify-content-center">
          <button
            class="btn btn-outline-light p-3 rounded-lg w-75 d-inline-flex"
            @click=${handleCommentToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-card-text"
              viewBox="0 0 16 16"
            >
              <path
                d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"
              />
              <path
                d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"
              />
            </svg>
            <span class="ml-1 text-nowrap">${commentBtnText}</span>
          </button>
        </li>
        <li class="collab-menu-toolbar-item d-flex justify-content-center">
          <button
            class="btn btn-outline-light p-3 rounded-lg w-75 d-flex"
            @click=${handleActionHistoryToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-clock-history"
              viewBox="0 0 16 16"
            >
              <path
                d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"
              />
              <path
                d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"
              />
              <path
                d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"
              />
            </svg>
            <span class="ml-1 text-nowrap">Action History</span>
          </button>
        </li>
      </ul>
    </div>`;
};
///*
export const renderCollabMenuSidebar = () => {
  const collabActionsContainer = document.getElementById(
    'collab-actions-buttons'
  );

  if (collabActionsContainer) {
    render(html`${collabMenuSideBar()}`, collabActionsContainer);
  }
};
//*/
