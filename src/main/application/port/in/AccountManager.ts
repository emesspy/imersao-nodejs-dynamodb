import Account from '../../../domain/Account';
import AccountTransaction from '../../../domain/AccountTransaction';

export default interface AccountManager {
  createAccount(document: string, balance: number): Account;
  makeDeposit(document: string, amount: number): Account;
  makeWithdraw(document: string, amount: number): Account;
  transfer(
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): [Account, Account];
  getExtract(document: string): AccountTransaction[];
  getBalance(document: string): number;
}
