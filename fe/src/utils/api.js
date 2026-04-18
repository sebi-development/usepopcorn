import { BACKEND_URL } from './config';

const TOKEN_KEY = 'usepopcorn_token';
const EMAIL_KEY = 'usepopcorn_auth_email';
const PASSWORD = 'usepopcorn-local-user';

function getEmail() {
  const storedEmail = localStorage.getItem(EMAIL_KEY);

  if (storedEmail) return storedEmail;

  const email = `user-${crypto.randomUUID()}@usepopcorn.local`;
  localStorage.setItem(EMAIL_KEY, email);
  return email;
}

async function authenticate(path, body) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function ensureToken() {
  const storedToken = localStorage.getItem(TOKEN_KEY);

  if (storedToken) return storedToken;

  const email = getEmail();

  try {
    const { token } = await authenticate('/auth/register', {
      email,
      password: PASSWORD,
    });

    localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch (error) {
    if (error.status !== 409) throw error;
  }

  const { token } = await authenticate('/auth/login', {
    email,
    password: PASSWORD,
  });

  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

async function request(path, options = {}, retry = true) {
  const token = await ensureToken();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (response.status === 401 && retry) {
    localStorage.removeItem(TOKEN_KEY);
    return request(path, options, false);
  }

  if (!response.ok) {
    throw new Error(data.error);
  }

  return data;
}

export function getWatchedMovies() {
  return request('/watched');
}

export function addWatchedMovie(movie) {
  return request('/watched', {
    method: 'POST',
    body: JSON.stringify(movie),
  });
}

export function deleteWatchedMovie(imdbID) {
  return request(`/watched/${imdbID}`, {
    method: 'DELETE',
  });
}
