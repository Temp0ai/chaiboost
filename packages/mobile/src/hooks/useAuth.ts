import { useAuthStore, User } from '../stores/authStore';
import { LoginCredentials, RegisterData } from '../services/auth.service';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    verifyOTP,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials);
  };

  const handleRegister = async (data: RegisterData) => {
    return await register(data);
  };

  const handleVerifyOTP = async (phone: string, otp: string) => {
    await verifyOTP(phone, otp);
  };

  const handleLogout = async () => {
    await logout();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    verifyOTP: handleVerifyOTP,
    logout: handleLogout,
    checkAuth,
    clearError,
  };
};
