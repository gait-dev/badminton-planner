export const config = {
    apiUrl: '/api',  // L'URL relative fonctionnera avec le proxy nginx
    recaptchaSiteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || '',
};
