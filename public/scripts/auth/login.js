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
  });

  let json = await response.json();
  console.log(json);
});
