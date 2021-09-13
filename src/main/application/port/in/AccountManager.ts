import Account from '../../../domain/Account';
import AccountTransaction from '../../../domain/AccountTransaction';

export default interface AccountManager {
  createAccount(
    tenant: string,
    document: string,
    balance: number,
  ): Promise<Account>;

  makeDeposit(
    tenant: string,
    document: string,
    amount: number,
  ): Promise<Account>;

  makeWithdraw(
    tenant: string,
    document: string,
    amount: number,
  ): Promise<Account>;

  transfer(
    tenant: string,
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): Promise<[Account, Account]>;

  getExtract(tenant: string, document: string): Promise<AccountTransaction[]>;

  getBalance(tenant: string, document: string): Promise<number>;
}
