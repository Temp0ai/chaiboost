export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { valid: false, error: 'Phone number is required.' };
  }
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^\+?[1-9]\d{9,14}$/.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number.' };
  }
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number.' };
  }
  return { valid: true };
};

export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name.trim()) {
    return { valid: false, error: 'Name is required.' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  return { valid: true };
};

export const validateOTP = (otp: string): { valid: boolean; error?: string } => {
  if (!otp) {
    return { valid: false, error: 'OTP is required.' };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { valid: false, error: 'Please enter a valid 6-digit OTP.' };
  }
  return { valid: true };
};
