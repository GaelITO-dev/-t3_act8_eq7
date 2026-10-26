export function loginUser(username, password) {
  return fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username,
      password: password,
      expiresInMins: 30, // optional, defaults to 60
    }),
    credentials: 'include' // Include cookies (e.g., accessToken) in the request
  })
  .then(res => {
    if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
    return res.json();
  });
}