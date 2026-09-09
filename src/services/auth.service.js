import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/app-error.js';

const toPublicUser = (user) => ({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });

export async function signup({ name, email, password }) {
  const exists = await User.exists({ email });
  if (exists) throw new AppError(409, 'An account with this email already exists');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  return toPublicUser(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password');
  }
  return toPublicUser(user);
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw new AppError(401, 'Session is no longer valid');
  return toPublicUser(user);
}
