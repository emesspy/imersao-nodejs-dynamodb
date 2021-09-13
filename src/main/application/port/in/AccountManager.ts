import Account from '../../../domain/Account';
import AccountTransaction from '../../../domain/AccountTransaction';

export default interface AccountManager {
  createAccount(document: string, balance: number): Promise<Account>;
  makeDeposit(document: string, amount: number): Promise<Account>;
  makeWithdraw(document: string, amount: number): Promise<Account>;
  transfer(
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): Promise<[Account, Account]>;
  getExtract(document: string): Promise<AccountTransaction[]>;
  getBalance(document: string): Promise<number>;
}
