import Account from '../../../domain/Account';
import AccountTransaction from '../../../domain/AccountTransaction';

export default interface AccountRepository {
  findAccount(tenant: string, document: string): Promise<Account | undefined>;
  findAccountValid(tenant: string, document: string): Promise<Account>;
  createAccount(account: Account): Promise<Account>;
  updateAccount(account: Account): Promise<Account>;

  createAccountTransaction(
    transaction: AccountTransaction,
  ): Promise<AccountTransaction>;

  findAccountTransactions(
    tenant: string,
    document: string,
  ): Promise<AccountTransaction[]>;
}
