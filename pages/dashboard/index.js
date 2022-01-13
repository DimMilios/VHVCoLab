import { html, render } from 'lit-html';

let content = document.querySelector('#content');
let newDocForm = document.querySelector('#new-document');

newDocForm.addEventListener('submit', async event => {
  event.preventDefault();

  let title = event.target.querySelector('input[name="document-title"]');
  let response = await fetch('http://localhost:3001/api/documents', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ 'document-title': title.value }),
    headers: { 'Content-Type': 'application/json' },
  });

  let json = await response.json();
  console.log(json);

  if (response.status === 201) {
    let documents = localStorage.getItem('documents');
    if (documents) {
      let newDocs = JSON.parse(documents).concat(json);
      localStorage.setItem('documents', JSON.stringify(newDocs));
      render(DocumentsTable(newDocs), content);
    } else {
      localStorage.setItem('documents', JSON.stringify([json]));
      render(DocumentsTable([json]), content);
    }
  }

  title.value = '';
  $('#new-document-modal').modal('hide');
})

const DocumentsTable = (documents) => {
  const handleClick = async (event) => {
      let currentElem;
      let deleteDoc = false;
      if (event.target.nodeName === 'TD') {
        currentElem = event.target.parentElement;
      } else if (event.target.nodeName === 'TR') {
        currentElem = event.target;
      } else if (event.target.nodeName === 'BUTTON') {
        currentElem = event.target.closest('tr');
        deleteDoc = true;
      }
    
      if (currentElem) {
        let doctitle = currentElem.querySelector('td.title')?.textContent;
    
        if (deleteDoc) {
          let response = await fetch('http://localhost:3001/api/documents', {
            method: 'DELETE',
            credentials: 'include',
            body: JSON.stringify({ title: doctitle }),
            headers: { 
              'Content-Type': 'application/json'
            }
          });
    
          if (response.status === 200) {
            // window.location.href = 'http://localhost:3001/dashboard';
            // window.location.reload();
            let filteredDocs = documents.filter(doc => doc.title !== doctitle);
            localStorage.setItem('documents', JSON.stringify(filteredDocs))
            render(DocumentsTable(filteredDocs), content);
          }
          return;
        }
    
        if (doctitle) {
          localStorage.setItem('documentTitle', doctitle);
          console.log(doctitle)
          // window.open(`http://localhost:3000?roomname=${doctitle}`,'_blank');
          // window.location.href = `http://localhost:3000?roomname=${doctitle}`;
        }
      }
  }

  return html`<table class="table" id="documents-table">
    <thead>
      <tr>
        <th scope="col">Title</th>
        <th scope="col">Created</th>
        <th scope="col">Modified</th>
      </tr>
    </thead>
    <tbody id="document-list" @click=${handleClick}>
      ${documents.map((doc) => {
        return html`
          <tr class="document-item">
            <td class="title">${doc.title}</td>
            <td>${doc.createdAt}</td>
            <td>${doc.updatedAt}</td>
            <td><button class="btn btn-danger document-delete" type="button"> X</button></td>
          </tr>
        `;
      })}
    </tbody>
  </table>`;
};

const ErrorElem = (message) => {
  return html`<div
    class="alert alert-danger alert-dismissible fade show my-3"
    role="alert"
  >
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div><a href="/pages/login.html">Log In</a></div>
  `;
};

async function getDocuments() {
  const response = await fetch('http://localhost:3001/api/documents', {
    method: 'GET',
    credentials: 'include',
  });

  let json = await response.json();
  console.log(json);

  if (response.status === 200) {
    localStorage.setItem('documents', JSON.stringify(json));
  } else if (response.status === 401) {
    while (content.firstElementChild) {
      content.firstElementChild.remove();
    }
    render(ErrorElem(json.msg), content);
  }
  return json;
}

async function renderDocTable() {
  let documents = await getDocuments();

  render(DocumentsTable(documents), content);
}

renderDocTable();
