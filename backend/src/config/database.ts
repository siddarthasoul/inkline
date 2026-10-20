
import mongoose from 'mongoose';

import env from './env.js';
import ArticleLike from '../models/ArticleLike.js';

class MongoDatabase {
  public async connect(): Promise<void> {
    await mongoose.connect(env.db.mongo_uri, {
      dbName: env.db.database,
    });

    // Ensure the unique article + visitor index exists before serving requests.
    await ArticleLike.createIndexes();

    console.log('MongoDB connected; article-like indexes verified');
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  public async healthCheck(): Promise<boolean> {
    return mongoose.connection.readyState === 1;
  }
}

const mongoDatabase = new MongoDatabase();

export default mongoDatabase;
