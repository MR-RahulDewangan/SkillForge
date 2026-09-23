import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, setAuth, logout } = useAuthStore();
  return { user, token, setAuth, logout };
};
