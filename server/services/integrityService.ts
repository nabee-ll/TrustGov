import crypto from 'crypto';
import { ManagedBlockchainClient, GetNetworkCommand } from '@aws-sdk/client-managedblockchain';

interface IntegrityRecordInput {
  userId: string;
  serviceId: string;
  timestamp: string;
}

interface FabricSubmitResponse {
  success?: boolean;
  txId?: string;
  transactionId?: string;
  message?: string;
}

let hasCheckedNetwork = false;

const maybeCheckAmbNetwork = async () => {
  const region = process.env.AWS_REGION;
  const networkId = process.env.AMB_NETWORK_ID;

  if (!region || !networkId || hasCheckedNetwork) return;

  try {
    const client = new ManagedBlockchainClient({ region });
    await client.send(new GetNetworkCommand({ NetworkId: networkId }));
    hasCheckedNetwork = true;
  } catch (error) {
    // Keep request flow non-blocking for demo mode when AMB credentials/network are unavailable.
    hasCheckedNetwork = true;
    console.warn('[AMB] Network check failed, continuing in demo integrity mode.');
  }
};

const submitToFabricBridge = async (input: IntegrityRecordInput, hash: string): Promise<string | null> => {
  const submitUrl = process.env.FABRIC_SUBMIT_URL;
  if (!submitUrl) return null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.FABRIC_SUBMIT_API_KEY) {
    headers['x-api-key'] = process.env.FABRIC_SUBMIT_API_KEY;
  }

  const response = await fetch(submitUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: input.userId,
      serviceId: input.serviceId,
      timestamp: input.timestamp,
      hash,
    }),
  });

  if (!response.ok) {
    throw new Error(`[FABRIC] Submit endpoint responded with ${response.status}.`);
  }

  const data = (await response.json()) as FabricSubmitResponse;
  const txId = data.txId || data.transactionId;

  if (!txId) {
    throw new Error('[FABRIC] Missing txId in submit response.');
  }

  if (data.success === false) {
    throw new Error(data.message || '[FABRIC] Submit endpoint reported failure.');
  }

  return txId;
};

export const logIntegrityRecord = async (input: IntegrityRecordInput) => {
  const payload = `${input.userId}:${input.serviceId}:${input.timestamp}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  try {
    const fabricTxId = await submitToFabricBridge(input, hash);
    if (fabricTxId) {
      return { hash, blockchainTxId: fabricTxId };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Fabric error';
    console.warn(`[FABRIC] Submit failed, falling back to local reference. ${message}`);
  }

  await maybeCheckAmbNetwork();

  // Fallback for hackathon/dev flow when Fabric submit endpoint is not configured.
  const blockchainTxId = `AMB-${Date.now()}-${hash.slice(0, 12)}`;

  return { hash, blockchainTxId };
};
