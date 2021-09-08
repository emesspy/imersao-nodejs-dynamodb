import Account from '../../../domain/Account';

export default interface AccountRepository {
  findAccount(document: string): Account | undefined;
  findAccountValid(document: string): Account;
  createAccount(account: Account): Account;
  updateAccount(account: Account): Account;
}
