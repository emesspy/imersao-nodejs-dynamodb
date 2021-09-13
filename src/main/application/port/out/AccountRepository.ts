import Account from '../../../domain/Account';
import AccountTransaction from '../../../domain/AccountTransaction';

export default interface AccountRepository {
  findAccount(document: string): Promise<Account | undefined>;
  findAccountValid(document: string): Promise<Account>;
  createAccount(account: Account): Promise<Account>;
  updateAccount(account: Account): Promise<Account>;
  createAccountTransaction(
    transaction: AccountTransaction,
  ): Promise<AccountTransaction>;
  findAccountTransactions(document: string): Promise<AccountTransaction[]>;
}
