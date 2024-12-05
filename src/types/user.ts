export interface User {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    role: 'owner' | 'manager' | 'staff';
    businessName: string;
  }