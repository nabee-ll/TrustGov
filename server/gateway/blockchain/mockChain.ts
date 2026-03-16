import crypto from 'crypto';
import type { BlockchainAuditData } from '../models/types';

export interface AuditBlock {
  index: number;
  timestamp: string;
  data: BlockchainAuditData;
  previous_hash: string;
  current_hash: string;
}

const calcHash = (index: number, timestamp: string, data: BlockchainAuditData, previousHash: string) =>
  crypto.createHash('sha256').update(`${index}|${timestamp}|${JSON.stringify(data)}|${previousHash}`).digest('hex');

class MockBlockchain {
  private chain: AuditBlock[];

  constructor() {
    const timestamp = new Date().toISOString();
    const genesisData: BlockchainAuditData = {
      action: 'ATTACK_ATTEMPT',
      user_id: 'system',
      attempt_type: 'GENESIS',
      timestamp,
      metadata: { note: 'Genesis block for TrustGov audit chain' },
    };

    const genesis: AuditBlock = {
      index: 0,
      timestamp,
      data: genesisData,
      previous_hash: '0',
      current_hash: calcHash(0, timestamp, genesisData, '0'),
    };

    this.chain = [genesis];
  }

  addBlock(data: BlockchainAuditData): AuditBlock {
    const previous = this.chain[this.chain.length - 1];
    const timestamp = new Date().toISOString();
    const block: AuditBlock = {
      index: previous.index + 1,
      timestamp,
      data,
      previous_hash: previous.current_hash,
      current_hash: calcHash(previous.index + 1, timestamp, data, previous.current_hash),
    };

    this.chain.push(block);
    return block;
  }

  getBlocks(): AuditBlock[] {
    return [...this.chain];
  }

  verifyIntegrity(): boolean {
    for (let i = 1; i < this.chain.length; i += 1) {
      const prev = this.chain[i - 1];
      const current = this.chain[i];
      const expected = calcHash(current.index, current.timestamp, current.data, current.previous_hash);
      if (current.previous_hash !== prev.current_hash || current.current_hash !== expected) {
        return false;
      }
    }
    return true;
  }
}

export const auditChain = new MockBlockchain();
