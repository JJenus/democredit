export interface DepositTransaction{
    userId: number;
    amount: number;
    currencyCode: string;
    status: string;
    transactionId: string;
    createdAt: string;
}