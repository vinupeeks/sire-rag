export const signIn = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  return {
    id: 'user-1',
    name: 'Solmarine User',
    email,
    token: 'solmarine-token',
  };
};
