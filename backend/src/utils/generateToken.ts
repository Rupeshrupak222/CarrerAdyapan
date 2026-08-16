import jwt from 'jsonwebtoken';

export const generateToken = (user: any) => {
  const secret = (process.env.JWT_SECRET || 'adyapan_default_jwt_secret_key_2026') as jwt.Secret;
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    options
  );
};