import { MongoClient, Db, Collection } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'trustgov';

let client: MongoClient | null = null;
let db: Db | null = null;
let connectPromise: Promise<Db> | null = null;

const connect = async (): Promise<Db> => {
  if (db) return db;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Add MONGO_URI to your environment variables.');
  }

  if (!connectPromise) {
    client = new MongoClient(MONGO_URI);
    connectPromise = client.connect().then((connectedClient) => {
      db = connectedClient.db(DB_NAME);
      return db;
    });
  }

  return connectPromise;
};

export const getDb = async (): Promise<Db> => connect();

export const getCollection = async <T>(name: string): Promise<Collection<T>> => {
  const database = await getDb();
  return database.collection<T>(name);
};

export const verifyMongoConnection = async () => {
  const database = await getDb();
  await database.command({ ping: 1 });
};
