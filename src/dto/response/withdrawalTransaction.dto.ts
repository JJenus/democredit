export interface WithdrawalTransactionDTO {
  userId: number;
  amount: number;
  accountNumber: number;
  accountName: string;
  bank: string;
  currencyCode: string;
  status: string;
  transactionId: string;
  createdAt: string;
}
