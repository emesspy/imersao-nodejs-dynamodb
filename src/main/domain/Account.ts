import { v4 as uuidv4 } from 'uuid';
import AccountTransaction from './AccountTransaction';
import TransactionType from './TransactionType';

class Account {
  public readonly document: string;
  public balance: number;
  public extract: AccountTransaction[];

  private initExtract(balance: number) {
    if (balance > 0) {
      this.extract.push(
        new AccountTransaction(uuidv4(), balance, TransactionType.DEPOSIT),
      );
    }
  }

  constructor(document: string, balance: number) {
    this.document = document;
    this.balance = balance;
    this.extract = [];
    this.initExtract(balance);
  }

  doTransaction(amount: number, transaction: AccountTransaction): void {
    this.balance += amount;
    this.extract.push(transaction);
  }
}

export default Account;
