// utils/storage.ts

export const getStorage = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }
  return null;
};

export const getStorageJSON = (key: string): any => {
  const value = getStorage(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return null;
};

// ✅ Sirf sessionStorage set karo (localStorage nahi)
export const setStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(key, value);
    // localStorage SET MAT KARO - sirf sessionStorage use karo
  }
};

// ✅ Sirf sessionStorage set karo JSON
export const setStorageJSON = (key: string, value: any): void => {
  if (typeof window !== 'undefined') {
    const strValue = JSON.stringify(value);
    sessionStorage.setItem(key, strValue);
    // localStorage SET MAT KARO
  }
};

// ✅ Sirf sessionStorage remove karo (current tab)
export const removeStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(key);
    // localStorage REMOVE MAT KARO
  }
};

// ✅ Logout - Sirf sessionStorage clear karo (current tab)
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    const keys = [
      'token',
      'user',
      'userData',
      'isLoggedIn'
    ];
    keys.forEach(key => {
      sessionStorage.removeItem(key);
    });
    // ✅ localStorage REMOVE MAT KARO - branch info rakhna hai
  }
};

// ✅ Full logout (optional - sirf current tab)
export const clearAuthStorage = (): void => {
  if (typeof window !== 'undefined') {
    const keys = [
      'token',
      'user',
      'userData',
      'isLoggedIn'
    ];
    keys.forEach(key => {
      sessionStorage.removeItem(key);
    });
    // ✅ localStorage REMOVE MAT KARO
  }
};

// ✅ Check if user is authenticated (current tab)
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('token');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    return !!(token && isLoggedIn === 'true');
  }
  return false;
};

// ✅ Get current user (current tab)
export const getCurrentUser = (): any => {
  if (typeof window !== 'undefined') {
    return getStorageJSON('user');
  }
  return null;
};

// ✅ Get selected branch (localStorage se - shared)
export const getSelectedBranch = (): { branch: string; branchCode: string } => {
  if (typeof window !== 'undefined') {
    return {
      branch: localStorage.getItem('selectedBranch') || '',
      branchCode: localStorage.getItem('branchCode') || ''
    };
  }
  return { branch: '', branchCode: '' };
};

// ✅ Set branch (localStorage mein - shared)
export const setSelectedBranch = (branch: string, branchCode: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedBranch', branch);
    localStorage.setItem('branchCode', branchCode);
  }
};