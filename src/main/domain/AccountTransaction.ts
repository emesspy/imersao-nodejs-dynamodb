import TransactionType from './TransactionType';

class AccountTransaction {
  public readonly id: string;
  public readonly payer?: string;
  public readonly receiver?: string;
  public readonly amount: number;
  public readonly type: TransactionType;

  constructor(
    id: string,
    amount: number,
    type: TransactionType,
    payer?: string,
    receiver?: string,
  ) {
    this.id = id;
    this.payer = payer;
    this.receiver = receiver;
    this.amount = amount;
    this.type = type;
  }
}

export const ACCOUNT_TRANSACTION_ENTITY_NAME = 'TRANSACTION';

export default AccountTransaction;
