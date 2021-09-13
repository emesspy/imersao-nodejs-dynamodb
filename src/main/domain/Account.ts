class Account {
  public readonly document: string;
  public balance: number;

  constructor(document: string, balance: number) {
    this.document = document;
    this.balance = balance;
  }
}

export const ACCOUNT_ENTITY_NAME = 'ACCOUNT';

export default Account;
