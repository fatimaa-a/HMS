export interface Billing {
  id: number;
  appointment_id: number;
  amount: string;
  status: string;
}

export interface BillingCreate {
  appointment_id: number;
  amount: number;
  status: string;
}

export interface BillingUpdate {
  amount?: number;
  status?: string;
}