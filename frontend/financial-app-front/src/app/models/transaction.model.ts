export type TransactionType = 'payable' | 'receivable';
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  dueDate: Date;
  paidAt?: Date;
  category?: string;
  notes?: string;
  createdAt: Date;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  description: string;
  amount: number;
  dueDate: Date;
  category?: string;
  notes?: string;    
}

export interface UpdateTransactionRequest {
  description?: string;
  amount?: number;
  dueDate?: Date;
  status?: TransactionStatus;
  category?: string;
  notes?: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailyBalance {
  date: string;
  openingBalance: number;
  incoming: number;
  outgoing: number;
  closingBalance: number;
}

export interface DailyExtract {
  date: string;
  balance: DailyBalance;
  transactions: Transaction[];
}

export interface FinancialSummary {
  totalReceivables: number;
  totalPayables: number;
  balance: number;
  paidReceivables: number;
  paidPayables: number;
  overdueCount: number;
}