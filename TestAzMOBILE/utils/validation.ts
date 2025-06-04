export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'E-poçt ünvanı boş ola bilməz' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Düzgün e-poçt ünvanı daxil edin' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Şifrə boş ola bilməz' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Şifrə ən azı 6 simvol olmalıdır' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Şifrədə ən azı 1 böyük hərf olmalıdır' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Şifrədə ən azı 1 kiçik hərf olmalıdır' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Şifrədə ən azı 1 rəqəm olmalıdır' };
  }

  return { isValid: true };
}; 