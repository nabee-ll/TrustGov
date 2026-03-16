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

type VerificationMode = 'fabric-bridge' | 'amb-verify' | 'amb-fallback';

interface IntegrityLogResult {
  hash: string;
  blockchainTxId: string;
  verificationMode: VerificationMode;
  blockchainVerified: boolean;
}

let ambCheckAttempted = false;
let ambNetworkVerified = false;

const isTrue = (value?: string) => (value || '').toLowerCase() === 'true';

const getBlockchainMode = () => (process.env.BLOCKCHAIN_MODE || 'demo').toLowerCase();

const maybeCheckAmbNetwork = async (): Promise<{ verified: boolean; reason?: string }> => {
  const region = process.env.AWS_REGION;
  const networkId = process.env.AMB_NETWORK_ID;

  if (!region || !networkId) {
    return { verified: false, reason: 'AWS_REGION or AMB_NETWORK_ID is missing.' };
  }

  if (ambCheckAttempted) {
    return {
      verified: ambNetworkVerified,
      reason: ambNetworkVerified ? undefined : 'Previous AMB verification attempt failed.',
    };
  }

  try {
    ambCheckAttempted = true;
    const client = new ManagedBlockchainClient({ region });
    await client.send(new GetNetworkCommand({ NetworkId: networkId }));
    ambNetworkVerified = true;
    return { verified: true };
  } catch (error) {
    ambCheckAttempted = true;
    ambNetworkVerified = false;
    const message = error instanceof Error ? error.message : 'Unknown AMB error';
    return { verified: false, reason: message };
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

export const logIntegrityRecord = async (input: IntegrityRecordInput): Promise<IntegrityLogResult> => {
  const payload = `${input.userId}:${input.serviceId}:${input.timestamp}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  const mode = getBlockchainMode();
  const fabricStrict = isTrue(process.env.FABRIC_BRIDGE_REQUIRED);
  const ambStrict = isTrue(process.env.AMB_STRICT);

  const shouldTryFabric = Boolean(process.env.FABRIC_SUBMIT_URL) || mode === 'fabric' || mode === 'fabric-bridge';

  if (shouldTryFabric) {
    try {
      const fabricTxId = await submitToFabricBridge(input, hash);
      if (fabricTxId) {
        return {
          hash,
          blockchainTxId: fabricTxId,
          verificationMode: 'fabric-bridge',
          blockchainVerified: true,
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Fabric error';
      if (fabricStrict || mode === 'fabric' || mode === 'fabric-bridge') {
        throw new Error(`[FABRIC] Submit failed in strict mode. ${message}`);
      }
      console.warn(`[FABRIC] Submit failed, falling back to local reference. ${message}`);
    }
  }

  const ambStatus = await maybeCheckAmbNetwork();
  if (!ambStatus.verified) {
    if (ambStrict || mode === 'amb' || mode === 'amb-verify') {
      throw new Error(`[AMB] Network verification failed. ${ambStatus.reason || ''}`.trim());
    }
    console.warn(`[AMB] Network check failed, continuing in demo integrity mode. ${ambStatus.reason || ''}`.trim());
  }

  // Fallback for hackathon/dev flow when Fabric submit endpoint is not configured.
  const prefix = ambStatus.verified ? 'AMB-VERIFIED' : 'AMB';
  const blockchainTxId = `${prefix}-${Date.now()}-${hash.slice(0, 12)}`;

  const verificationMode: VerificationMode = ambStatus.verified ? 'amb-verify' : 'amb-fallback';

  return {
    hash,
    blockchainTxId,
    verificationMode,
    blockchainVerified: ambStatus.verified,
  };
};
