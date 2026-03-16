export type Role = 'Citizen' | 'Officer' | 'Auditor' | 'Admin';

export interface GatewayUser {
  userId: string;
  username: string;
  passwordHash: string;
  role: Role;
  department?: string;
  personalDocIds: string[];
  registeredDevices: string[];
  blockedUntil?: number;
  flagged?: boolean;
}

export interface LoginChallenge {
  challengeId: string;
  userId: string;
  otp: string;
  deviceId: string;
  expiresAt: number;
}

export interface JwtClaims {
  user_id: string;
  role: Role;
  device_id: string;
}

export interface DocumentVersion {
  version: number;
  hash: string;
  content: string;
  modifiedBy: string;
  modifiedAt: number;
}

export interface SecureDocument {
  documentId: string;
  title: string;
  ownerUserId: string;
  department?: string;
  createdBy: string;
  createdAt: number;
  currentHash: string;
  versions: DocumentVersion[];
}

export interface BlockchainAuditData {
  document_id?: string;
  action:
    | 'DOCUMENT_CREATE'
    | 'DOCUMENT_MODIFY'
    | 'DOCUMENT_ACCESS'
    | 'FAILED_ACCESS_ATTEMPT'
    | 'MODIFY_ATTEMPT_DENIED'
    | 'ATTACK_ATTEMPT';
  user_id: string;
  previous_hash?: string;
  new_hash?: string;
  ip_address?: string;
  attempt_type?: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface SecurityAlert {
  id: string;
  userId?: string;
  ip: string;
  type:
    | 'FAILED_LOGIN_SPIKE'
    | 'HIGH_MODIFICATION_RATE'
    | 'UNREGISTERED_DEVICE'
    | 'ATTACK_ATTEMPT';
  message: string;
  createdAt: number;
}
