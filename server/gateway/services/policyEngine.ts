import type { GatewayUser, SecureDocument } from '../models/types';

export const policyEngine = {
  canRead(user: GatewayUser, doc: SecureDocument): boolean {
    if (user.role === 'Admin' || user.role === 'Auditor') return true;
    if (user.role === 'Officer') return user.department === doc.department;
    return doc.ownerUserId === user.userId;
  },

  canModify(user: GatewayUser, doc: SecureDocument): boolean {
    if (user.role === 'Admin') return true;
    if (user.role === 'Officer') return user.department === doc.department;
    return false;
  },

  canCreate(user: GatewayUser): boolean {
    return user.role === 'Admin' || user.role === 'Officer' || user.role === 'Citizen';
  },
};
