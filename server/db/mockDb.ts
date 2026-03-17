export const users = [
  { id: "123456789012", name: "John Citizen", password: "password123" }
];

export const activityLog = [
  { id: 1, type: "Login", status: "Success", timestamp: new Date().toISOString(), location: "Fetching location..." },
  { id: 2, type: "API Access", status: "Verified", timestamp: new Date(Date.now() - 3600000).toISOString(), location: "Fetching location..." },
  { id: 3, type: "Document Download", status: "Success", timestamp: new Date(Date.now() - 7200000).toISOString(), location: "Fetching location..." }
];

export const services = [
  { id: "tax", name: "Tax Portal", description: "File your income tax returns securely.", icon: "Briefcase" },
  { id: "passport", name: "Passport Seva", description: "Apply and manage your passport services.", icon: "Plane" },
  { id: "parivahan", name: "Parivahan Sewa", description: "Vehicle registration and driving licenses.", icon: "Car" },
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
