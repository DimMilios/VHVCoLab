import * as menuJSON from '/src/menu.json';
console.log(menuJSON)

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
    const submenuItem = document.createElement('div');
    submenuItem.setAttribute('class', `dropdown-menu p-0 ${nested && 'dropdown-submenu'}`);
  
    if (isIterable(submenuJSON)) {
      for (const entry of submenuJSON) {
        const defaultText = entry?.TEXT?.DEFAULT;
        const action = entry?.TEXT?.ACTION;
        const rightText = entry?.RIGHT_TEXT;
        
        const item = document.createElement('a');
        item.setAttribute('class', 'dropdown-item d-flex justify-content-between bg-dark text-light');
        item.href = '#';
  
        if (action) {
          item.onclick = () => new Function(action)();
        }
  
        item.textContent = `${defaultText} ${entry?.SUBMENU ? '»' : ''}`;
    
        if (rightText?.DEFAULT?.length > 0) {
          item.innerHTML += `<small class="ml-3"><strong>${rightText.DEFAULT}</strong></small>`;
        }
    
        if (entry?.SUBMENU?.ENTRY) {
          // console.log('Recursively creating SUBMENU', entry.SUBMENU.ENTRY);
          // const submenuList = document.createElement('ul');
          // submenuList.setAttribute('class', 'dropdown-menu dropdown-submenu');
          item.appendChild(createSubmenu(entry.SUBMENU.ENTRY, true));
        }
    
        submenuItem.appendChild(item);
      }
    
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
