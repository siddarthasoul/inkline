
import process from 'node:process';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import env from '../src/config/env.js';
import { User } from '../src/models/User.js';

async function createOwner(): Promise<void> {
  const email = env.owner.email;
  const password = env.owner.password;

  if (!email || !password) {
    throw new Error('OWNER_EMAIL and OWNER_PASSWORD are required.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new Error(
      'Password must be at least 8 characters and at most 72 UTF-8 bytes.',
    );
  }

  await mongoose.connect(env.db.mongo_uri, {
    dbName: env.db.database,
  });

  try {
    const existingOwner = await User.exists({ role: 'owner' });

    if (existingOwner) {
      throw new Error(
        'An owner already exists. No account was created.',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const owner = await User.create({
      email,
      passwordHash,
      role: 'owner',
    });

    console.log('Owner created successfully.');
    console.log(`Email: ${owner.email}`);
    console.log(`ID: ${owner.id}`);
  } finally {
    await mongoose.disconnect();
  }
}

createOwner().catch((error: unknown) => {
  console.error(
    'Owner setup failed:',
    error instanceof Error ? error.message : 'Unknown error',
  );
  process.exitCode = 1;
});
