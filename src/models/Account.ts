import { v4 as uuidv4 } from 'uuid';
import Transaction from './Transaction';
import TransactionType from './TransactionType';

class Account {
  public readonly document: string;
  public balance: number;
  public extract: Transaction[];

  private initExtract(balance: number) {
    if (balance > 0) {
      this.extract.push(
        new Transaction(uuidv4(), balance, TransactionType.DEPOSIT),
      );
    }
  }

  constructor(document: string, balance: number) {
    this.document = document;
    this.balance = balance;
    this.extract = [];
    this.initExtract(balance);
  }

  doTransaction(amount: number, transaction: Transaction): void {
    this.balance += amount;
    this.extract.push(transaction);
  }
}

export default Account;
