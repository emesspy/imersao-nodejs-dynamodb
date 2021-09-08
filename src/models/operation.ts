export interface Operation {
  type: OperationType;
  docuemnt: string;
  balance?: number;
  amount?: number;
  transaction?: Transaction;
}

export enum OperationType {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
  EXTRACT = 'EXTRACT',
  BALANCE = 'BALANCE',
}

export interface Transaction {
  id: string;
  payer: string;
  receiver: string;
  amount: number;
}
