
import { User, type IUser } from '../models/User.js';
import type { UpdateQuery } from 'mongoose';

export class UserRepository {
  async create(data: Pick<IUser, 'email' | 'passwordHash'>) {
    return User.create({
      ...data,
      role: 'owner',
    });
  }

  async findById(id: string) {
    return User.findById(id).exec();
  }

  async findByEmail(email: string) {
    return User.findOne({
      email: email.trim().toLowerCase(),
    })
      .select('+passwordHash')
      .exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await User.exists({
      email: email.trim().toLowerCase(),
    });

    return user !== null;
  }

  async updateById(
    id: string,
    updates: UpdateQuery<IUser>,
  ) {
    return User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await User.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }
}

export const userRepository = new UserRepository();
