import TransactionType from './TransactionType';

class Transaction {
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

  public toString = (): string => {
    return `Transaction{ id: ${this.id}, amount: ${this.amount}, type: ${this.type}, payer: ${this.payer}, receiver: ${this.receiver}}
    `;
  };
}

export default Transaction;
