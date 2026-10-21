
import { User, type IUser } from '../models/User.js';
import type { UpdateQuery } from 'mongoose';

function logDb(operation: string): void {
  console.info(`[MongoDB] User.${operation}`);
}

export class UserRepository {
  async create(data: Pick<IUser, 'email' | 'passwordHash'>) {
    logDb('create');

    return User.create({
      ...data,
      role: 'owner',
    });
  }

  async findById(id: string) {
    logDb('findById');
    return User.findById(id).exec();
  }

  async findByEmail(email: string) {
    logDb('findByEmail');

    return User.findOne({
      email: email.trim().toLowerCase(),
    })
      .select('+passwordHash')
      .exec();
  }

  async existsByEmail(email: string): Promise<boolean> {
    logDb('existsByEmail');

    const user = await User.exists({
      email: email.trim().toLowerCase(),
    });

    return user !== null;
  }

  async updateById(
    id: string,
    updates: UpdateQuery<IUser>,
  ) {
    logDb('updateById');

    return User.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true,
    }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    logDb('deleteById');

    const result = await User.deleteOne({ _id: id }).exec();
    return result.deletedCount === 1;
  }
}

export const userRepository = new UserRepository();
