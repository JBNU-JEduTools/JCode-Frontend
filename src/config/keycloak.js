import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_REALM,
  clientId: process.env.REACT_APP_CLIENT_ID
};

const keycloak = new Keycloak(keycloakConfig);

// 토큰 갱신 설정
keycloak.onTokenExpired = () => {
  keycloak.updateToken(70).catch(() => {
    console.error('Failed to refresh token');
  });
};

export default keycloak; 