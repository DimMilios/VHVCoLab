import * as menuJSON from '/src/menu.json';

window.addEventListener('DOMContentLoaded', () => {
  const menuBar = document.querySelector('#menubar');

  const navBarTemplate = `
    <nav id="actions-nav" class="navbar navbar-expand-lg navbar-dark bg-dark">
      
      <a class="navbar-brand" href="#">Navbar</a>
      
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
  
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto"></ul>
      </div>
  
    </nav>
  `;
  
  menuBar.innerHTML = navBarTemplate;
  
  const navBarList = document.querySelector('#actions-nav > div.collapse > ul.navbar-nav');
  
  function createMenuItems(menuJSON) {
    for (const entry of menuJSON.ENTRY) {
      const textValue = entry.TEXT.DEFAULT;
      const submenu = entry.SUBMENU.ENTRY;
      const type = entry?.TYPE;
      
      const li = document.createElement('li');
      li.setAttribute('class', 'nav-item dropdown mr-2');
      li.innerHTML += `<a class="nav-link" href="#" id="${textValue}-menu-item" role="button" data-toggle="dropdown" aria-expanded="false">${textValue}</a>`;
      
      const submenuItem = createSubmenu(submenu);
      if (submenuItem) {
        li.appendChild(submenuItem);
      }
  
      navBarList.appendChild(li);
  
    }
  }
  
  function createSubmenu(submenuJSON, nested = false) {
    const submenuItem = document.createElement('ul');
    submenuItem.setAttribute('class', `dropdown-menu p-0 ${nested && 'dropdown-submenu'}`);
  
    if (isIterable(submenuJSON)) {
      for (const entry of submenuJSON) {
        const defaultText = entry?.TEXT?.DEFAULT;
        const action = entry?.TEXT?.ACTION;
        const rightText = entry?.RIGHT_TEXT;
        
        const li = document.createElement('li');
        li.setAttribute('class', 'dropdown-item d-flex justify-content-between bg-dark text-white');

        const item = document.createElement('a');
        // item.setAttribute('class', 'dropdown-item');
        item.setAttribute('class', 'text-decoration-none');
        item.href = '#';
  
        const functionExistsOn = (func, obj) => typeof obj[func] === 'function';
        if (action) {
          let funcName = action;
          funcName = funcName.slice(action.indexOf(".") + 1).replace(/\(|\)/g, '');
          // FIX: function calls with parameters don't work properly, e.g MENU.pitchUpOctave(1)
          li.onclick = functionExistsOn(funcName, window.MENU) ? () => new Function(action)() : null;
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

        submenuItem.appendChild(li);
      }
    
    } else {
      console.log('Not iterable, value:', submenuJSON);
    }
    return submenuItem;
  }
  
  function isIterable(dataStructure) {
    if (typeof dataStructure === 'null' || typeof dataStructure === 'undefined') {
      return false;
    }
  
    return typeof dataStructure[Symbol.iterator] === 'function';
  }
  
  createMenuItems(menuJSON);
})
