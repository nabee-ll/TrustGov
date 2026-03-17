export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const services: ServiceDefinition[] = [
  { id: 'tax', name: 'Tax Services', description: 'File tax returns and check tax documents securely.', icon: 'FileText' },
  { id: 'passport', name: 'Passport Seva', description: 'Apply and manage your passport services.', icon: 'Plane' },
  { id: 'parivahan', name: 'Parivahan Sewa', description: 'Vehicle registration and driving licenses.', icon: "Car" },
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
