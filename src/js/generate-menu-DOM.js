import { getMenu } from './menu.js';
import * as menuJSON from '/src/menu.json';

window.addEventListener('DOMContentLoaded', () => {
  const menuBar = document.querySelector('#menubar');

  const navBarTemplate = `
    <nav id="actions-nav" class="navbar navbar-expand-lg navbar-dark" style="background-color: #01313f; margin-left: 10px;">
      
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
  
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto"></ul>
      </div>
  
    </nav>
  `;

  menuBar.innerHTML = navBarTemplate;

  const navBarList = document.querySelector(
    '#actions-nav > div.collapse > ul.navbar-nav'
  );

  function createMenuItems(menuJSON) {
    for (const entry of menuJSON.ENTRY) {
      const textValue = entry.TEXT.DEFAULT;
      const submenu = entry.SUBMENU.ENTRY;
      const type = entry?.TYPE;

      const li = document.createElement('li');
      li.id = `${textValue}__menu-item`.toLowerCase();
      li.setAttribute('class', 'nav-item dropdown mr-2');
      li.innerHTML += `<a class="nav-link" href="#" role="button" data-toggle="dropdown" aria-expanded="false">${textValue}</a>`;

      const submenuItem = createSubmenu(submenu);
      if (submenuItem) {
        li.appendChild(submenuItem);
      }

      navBarList.appendChild(li);
    }
  }

  function createSubmenu(submenuJSON, nested = false) {
    const submenu = document.createElement('ul');
    submenu.setAttribute(
      'class',
      `dropdown-menu p-0 ${nested && 'dropdown-submenu'}`
    );

    if (isIterable(submenuJSON)) {
      for (const entry of submenuJSON) {
        submenu.appendChild(createSubmenuItem(entry));
      }
    } else {
      submenu.appendChild(createSubmenuItem(submenuJSON));
    }

    return submenu;
  }
  const clickHandlers = [];

  function createSubmenuItem(entry) {
    const defaultText = entry?.TEXT?.DEFAULT;
    const action = entry?.TEXT?.ACTION;
    const rightText = entry?.RIGHT_TEXT;

    const li = document.createElement('li');
    li.id = `${defaultText?.split(/\W/).join('-')}__submenu-item`.toLowerCase();
    li.setAttribute(
      'class',
      'dropdown-item d-flex justify-content-between bg-dark text-white'
    );

    const item = document.createElement('a');
    // item.setAttribute('class', 'dropdown-item');
    item.setAttribute('class', 'text-decoration-none');
    item.href = '#';

    const isFunctionOf = (func, obj) => typeof obj[func] === 'function';
    if (action) {
      const funcName = action
        .slice(action.indexOf('.') + 1)
        .replace(/\(.*\)/g, '');
      li.onclick = isFunctionOf(funcName, menu())
        ? () => new Function(action)()
        : null;

      if (li.onclick !== null) {
        clickHandlers.push(
          `document.querySelector('#${li.id}').addEventListener('click', () => ${action});`
        );
      }

      // console.log('Click handler of:', {defaultText,
      //   action: `document.querySelector('#${li.id}').addEventListener('click', () => ${action});`
      // });
    }

    item.textContent = `${defaultText} ${entry?.SUBMENU ? '»' : ''}`;

    li.appendChild(item);
    if (rightText?.DEFAULT?.length > 0) {
      li.innerHTML += `<small class="ml-3 text-nowrap"><strong>${rightText.DEFAULT}</strong></small>`;
    }

    if (entry?.SUBMENU?.ENTRY) {
      // console.log('Recursively creating SUBMENU', entry.SUBMENU.ENTRY);
      // const submenuList = document.createElement('ul');
      // submenuList.setAttribute('class', 'dropdown-menu dropdown-submenu');
      li.appendChild(createSubmenu(entry.SUBMENU.ENTRY, true));
    }

    return li;
  }

  function isIterable(dataStructure) {
    if (
      typeof dataStructure === 'null' ||
      typeof dataStructure === 'undefined'
    ) {
      return false;
    }

    return typeof dataStructure[Symbol.iterator] === 'function';
  }

  createMenuItems(menuJSON);
});
