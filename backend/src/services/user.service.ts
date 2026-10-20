import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { ApiError } from '../utils/ApiError.js';

export class UserService {
  async login(email: string, password: string) {
    if (!email?.trim() || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getOwner(id: string) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, 'Owner account not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const userService = new UserService();
