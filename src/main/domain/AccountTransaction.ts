import TransactionType from './TransactionType';

class AccountTransaction {
  public readonly tenant: string;
  public readonly id: string;
  public readonly payer?: string;
  public readonly receiver?: string;
  public readonly amount: number;
  public readonly type: TransactionType;

  constructor(
    tenant: string,
    id: string,
    amount: number,
    type: TransactionType,
    payer?: string,
    receiver?: string,
  ) {
    this.tenant = tenant;
    this.id = id;
    this.payer = payer;
    this.receiver = receiver;
    this.amount = amount;
    this.type = type;
  }
}

export const ACCOUNT_TRANSACTION_ENTITY_NAME = 'TRANSACTION';

export default AccountTransaction;
