const CSRF_COOKIE_NAME = 'x-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export const getCSRFToken = () => {
  const name = CSRF_COOKIE_NAME + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

export const setCSRFHeader = (config) => {
  const token = getCSRFToken();
  if (token) {
    config.headers[CSRF_HEADER_NAME] = token;
  }
  return config;
};
