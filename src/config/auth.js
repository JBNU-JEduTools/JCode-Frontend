export const AUTH_CONFIG = {
  keycloakUrl: process.env.REACT_APP_KEYCLOAK_URL,
  clientId: process.env.REACT_APP_CLIENT_ID,
  redirectUri: window.location.origin + "/callback",
  scope: process.env.REACT_APP_SCOPE,
  tokenEndpoint: `${process.env.REACT_APP_KEYCLOAK_URL}/token`
};

export const fetchTokenConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  mode: 'cors',
  credentials: 'include'
};