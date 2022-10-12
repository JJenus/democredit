export interface TransferTransactionDTO {
  senderId: number;
  beneficiaryId: number;
  beneficiaryEmail: string;
  amount: number;
  currencyCode: string;
  status: string;
  transactionId: string;
  createdAt: string
}
