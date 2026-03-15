export const users = [
  { id: "123456789012", name: "John Citizen", password: "password123" }
];

export const activityLog = [
  { id: 1, type: "Login", status: "Success", timestamp: new Date().toISOString(), location: "New Delhi, IN" },
  { id: 2, type: "API Access", status: "Verified", timestamp: new Date(Date.now() - 3600000).toISOString(), location: "Mumbai, IN" },
  { id: 3, type: "Document Download", status: "Success", timestamp: new Date(Date.now() - 7200000).toISOString(), location: "Bangalore, IN" }
];

export const services = [
  { id: "tax", name: "Tax Portal", description: "File your income tax returns securely.", icon: "FileText" },
  { id: "health", name: "Healthcare Records", description: "Access your digital health history.", icon: "Activity" },
  { id: "land", name: "Land Records", description: "Verify and manage property documents.", icon: "Map" },
  { id: "id", name: "Digital ID Card", description: "Download your secure digital identity.", icon: "CreditCard" },
  { id: "vote", name: "Voting Portal", description: "Register and verify your voting status.", icon: "UserCheck" },
  { id: "edu", name: "Education Services", description: "Access academic records and certificates.", icon: "GraduationCap" }
];

export const stats = {
  activeUsers: "1.2M",
  apiCalls: "45.8M",
  threatsBlocked: "124K",
  servicesConnected: "150+"
};
