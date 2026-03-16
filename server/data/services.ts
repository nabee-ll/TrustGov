export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const services: ServiceDefinition[] = [
  { id: 'tax', name: 'Tax Services', description: 'File tax returns and check tax documents securely.', icon: 'FileText' },
  { id: 'health', name: 'Healthcare', description: 'Access healthcare records and schemes.', icon: 'Activity' },
  { id: 'land', name: 'Land Records', description: 'Verify and manage property documents.', icon: 'Map' },
  { id: 'welfare', name: 'Welfare Schemes', description: 'View and apply for government welfare schemes.', icon: 'UserCheck' },
  { id: 'id', name: 'ID Verification', description: 'Download and verify digital identity documents.', icon: 'CreditCard' }
];

export const stats = {
  activeUsers: '1.2M',
  apiCalls: '45.8M',
  threatsBlocked: '124K',
  servicesConnected: '150+'
};
