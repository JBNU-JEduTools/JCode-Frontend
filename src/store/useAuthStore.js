import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      idToken: null,
      user: null,
      setTokens: (accessToken, refreshToken, idToken) => {
        set({ accessToken, refreshToken, idToken });
        if (accessToken) {
          sessionStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        if (idToken) {
          sessionStorage.setItem('idToken', idToken);
        }
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, idToken: null, user: null });
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('idToken');
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => sessionStorage,
    }
  )
);

export { useAuthStore }; 