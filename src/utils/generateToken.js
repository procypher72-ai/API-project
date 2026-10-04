import jwt from 'jsonwebtoken';

export const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'default_jwt_secret_dev_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};
