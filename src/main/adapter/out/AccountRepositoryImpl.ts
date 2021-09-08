import AccountRepository from '../../application/port/out/AccountRepository';
import Account from '../../domain/Account';

class AccountRepositoryImpl implements AccountRepository {
  private accounts: Map<string, Account>;

  constructor(accounts: Map<string, Account> = new Map<string, Account>()) {
    this.accounts = accounts;
  }

  findAccount(document: string): Account | undefined {
    return this.accounts.get(document);
  }

  findAccountValid(document: string): Account {
    const account = this.accounts.get(document);
    if (!account) {
      throw new Error(`conta inexistente. document=${document}`);
    }
    return account;
  }

  createAccount(account: Account): Account {
    const savedAccount = this.findAccount(account.document);
    if (!savedAccount) {
      this.accounts.set(account.document, account);
      return account;
    }
    throw new Error(`conta ja existe. document=${account.document}`);
  }

  updateAccount(account: Account): Account {
    const savedAccount = this.findAccount(account.document);
    if (!savedAccount) {
      throw new Error(
        `nao foi possivel editar, conta inexistente. document=${account.document}`,
      );
    }
    this.accounts.set(account.document, account);
    return account;
  }
}

export default new AccountRepositoryImpl();
