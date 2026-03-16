import { ObjectId } from 'mongodb';
import { getCollection } from '../db/mongo';
import { logIntegrityRecord } from './integrityService';

interface SecurityQueueEvent {
  type: string;
  userId?: string;
  documentId?: string;
  ip?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface SecurityEventDocument {
  _id?: ObjectId;
  type: string;
  userId?: string;
  documentId?: string;
  ip?: string;
  details?: Record<string, unknown>;
  createdAt: string;
  blockchainTxId?: string;
}

const queue: SecurityQueueEvent[] = [];
let workerStarted = false;

const securityEventsCollection = () => getCollection<SecurityEventDocument>('security_events');

const processEvent = async (event: SecurityQueueEvent) => {
  let blockchainTxId: string | undefined;
  try {
    if (event.userId) {
      const integrity = await logIntegrityRecord({
        userId: event.userId,
        serviceId: event.type,
        timestamp: event.createdAt,
      });
      blockchainTxId = integrity.blockchainTxId;
    }
  } catch {
    // Keep queue non-blocking if blockchain call fails.
  }

  await (await securityEventsCollection()).insertOne({
    ...event,
    blockchainTxId,
  });
};

const runWorker = async () => {
  if (queue.length === 0) return;
  const event = queue.shift();
  if (!event) return;
  try {
    await processEvent(event);
  } catch {
    // Drop malformed events to keep the worker resilient.
  }
};

export const securityEventQueue = {
  start() {
    if (workerStarted) return;
    workerStarted = true;
    setInterval(() => {
      void runWorker();
    }, 250);
  },

  enqueue(event: Omit<SecurityQueueEvent, 'createdAt'>) {
    queue.push({ ...event, createdAt: new Date().toISOString() });
  },
};
