class Account {
  public readonly tenant: string;
  public readonly document: string;
  public balance: number;

  constructor(tenant: string, document: string, balance: number) {
    this.tenant = tenant;
    this.document = document;
    this.balance = balance;
  }
}

export const ACCOUNT_ENTITY_NAME = 'ACCOUNT';

export default Account;
