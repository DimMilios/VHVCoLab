const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  let formData = new FormData(event.target);
  let entries = Object.fromEntries([...formData.entries()]);
  console.log(entries);

  let response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    body: JSON.stringify(entries),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });

  let json = await response.json();

  if (response.status === 200) {
    console.log('ok');
    window.location.href = 'http://localhost:3000/pages/dashboard/index.html';
  } else if (response.status === 400) {
    console.log('bad request');
  }
  console.log(json);
});
