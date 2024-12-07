export interface CreditCustomer {
    id: string;
    name: string;
    phone: string;
    totalCredit: number;
    balanceDue: number;
    lastPaymentDate: Date;
    status: 'active' | 'overdue' | 'paid';
  }
  