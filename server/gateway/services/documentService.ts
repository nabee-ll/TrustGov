import crypto from 'crypto';
import { randomUUID } from 'crypto';
import type { SecureDocument } from '../models/types';
import { policyEngine } from './policyEngine';
import { userStore } from './userStore';
import { auditChain } from '../blockchain/mockChain';

const documents = new Map<string, SecureDocument>();

const hashContent = (content: string) => crypto.createHash('sha256').update(content).digest('hex');

export const documentService = {
  createDocument(input: { title: string; content: string; ownerUserId: string; department?: string; actorUserId: string }) {
    const actor = userStore.findById(input.actorUserId);
    if (!actor) throw new Error('Actor not found');
    if (!policyEngine.canCreate(actor)) throw new Error('Permission denied');

    const documentId = randomUUID();
    const firstHash = hashContent(input.content);
    const createdAt = Date.now();

    const doc: SecureDocument = {
      documentId,
      title: input.title,
      ownerUserId: input.ownerUserId,
      department: input.department,
      createdBy: input.actorUserId,
      createdAt,
      currentHash: firstHash,
      versions: [
        {
          version: 1,
          hash: firstHash,
          content: input.content,
          modifiedBy: input.actorUserId,
          modifiedAt: createdAt,
        },
      ],
    };

    documents.set(documentId, doc);

    auditChain.addBlock({
      document_id: documentId,
      action: 'DOCUMENT_CREATE',
      user_id: input.actorUserId,
      previous_hash: undefined,
      new_hash: firstHash,
      timestamp: new Date().toISOString(),
    });

    const owner = userStore.findById(input.ownerUserId);
    if (owner && !owner.personalDocIds.includes(documentId)) {
      owner.personalDocIds.push(documentId);
      userStore.update(owner);
    }

    return doc;
  },

  getDocument(documentId: string) {
    return documents.get(documentId);
  },

  accessDocument(input: { documentId: string; actorUserId: string }) {
    const actor = userStore.findById(input.actorUserId);
    const doc = documents.get(input.documentId);
    if (!actor || !doc) throw new Error('Not found');

    if (!policyEngine.canRead(actor, doc)) {
      auditChain.addBlock({
        document_id: doc.documentId,
        action: 'FAILED_ACCESS_ATTEMPT',
        user_id: actor.userId,
        previous_hash: doc.currentHash,
        new_hash: doc.currentHash,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Permission denied');
    }

    auditChain.addBlock({
      document_id: doc.documentId,
      action: 'DOCUMENT_ACCESS',
      user_id: actor.userId,
      previous_hash: doc.currentHash,
      new_hash: doc.currentHash,
      timestamp: new Date().toISOString(),
    });

    return doc;
  },

  modifyDocument(input: { documentId: string; content: string; actorUserId: string }) {
    const actor = userStore.findById(input.actorUserId);
    const doc = documents.get(input.documentId);
    if (!actor || !doc) throw new Error('Not found');

    if (!policyEngine.canModify(actor, doc)) {
      auditChain.addBlock({
        document_id: doc.documentId,
        action: 'MODIFY_ATTEMPT_DENIED',
        user_id: actor.userId,
        previous_hash: doc.currentHash,
        new_hash: doc.currentHash,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Permission denied');
    }

    const previousHash = doc.currentHash;
    const newHash = hashContent(input.content);

    const nextVersion = doc.versions.length + 1;
    doc.versions.push({
      version: nextVersion,
      hash: newHash,
      content: input.content,
      modifiedBy: actor.userId,
      modifiedAt: Date.now(),
    });
    doc.currentHash = newHash;

    auditChain.addBlock({
      document_id: doc.documentId,
      action: 'DOCUMENT_MODIFY',
      user_id: actor.userId,
      previous_hash: previousHash,
      new_hash: newHash,
      timestamp: new Date().toISOString(),
    });

    documents.set(doc.documentId, doc);
    return doc;
  },

  listHistory(documentId: string) {
    const doc = documents.get(documentId);
    if (!doc) throw new Error('Not found');
    return doc.versions;
  },
};
