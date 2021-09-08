import AccountRepositoryImpl from '../../../main/adapter/out/AccountRepositoryImpl';
import AccountRepository from '../../../main/application/port/out/AccountRepository';
import Account from '../../../main/domain/Account';

function createNewAccount(repo: AccountRepository, document: string): Account {
  const account = new Account(document, 0);
  return repo.createAccount(account);
}

describe('AccountRepositoryImpl', () => {
  describe('findAccount', () => {
    test('findAccount when account not exists', () => {
      const repository = new AccountRepositoryImpl();

      const result = repository.findAccount('123');

      expect(result).toBeUndefined();
    });

    test('findAccount when account exists', () => {
      const repository = new AccountRepositoryImpl();
      const account = createNewAccount(repository, '123');

      const result = repository.findAccount('123');

      expect(result).toBeDefined();
      expect(result).toBe(account);
    });
  });

  describe('findAccountValid', () => {
    test('findAccountValid when account not exists => should throw', () => {
      const repository = new AccountRepositoryImpl();
      expect(() => {
        repository.findAccountValid('123');
      }).toThrow('conta inexistente. document=123');
    });

    test('findAccountValid when account exists', () => {
      const repository = new AccountRepositoryImpl();
      const account = createNewAccount(repository, '123');

      const result = repository.findAccountValid('123');

      expect(result).toBeDefined();
      expect(result).toBe(account);
    });
  });

  describe('createAccount', () => {
    test('createAccount when account already exists => should throw', () => {
      const repository = new AccountRepositoryImpl();
      const account = new Account('123', 0);
      createNewAccount(repository, '123');

      expect(() => {
        repository.createAccount(account);
      }).toThrow('conta ja existe. document=123');
    });

    test('createAccount when account not exists', () => {
      const repository = new AccountRepositoryImpl();
      const account = new Account('123', 0);

      const result = repository.createAccount(account);

      expect(result).toBeDefined();
      expect(result).toBe(account);
    });
  });

  describe('updateAccount', () => {
    test('updateAccount when account already exists', () => {
      const repository = new AccountRepositoryImpl();
      createNewAccount(repository, '123');
      const account = new Account('123', 100);

      const result = repository.updateAccount(account);

      expect(result).toBeDefined();
      expect(result).toBe(account);
    });

    test('updateAccount when account not exists => should throw', () => {
      const repository = new AccountRepositoryImpl();
      const account = new Account('123', 0);

      expect(() => {
        repository.updateAccount(account);
      }).toThrow('nao foi possivel editar, conta inexistente. document=123');
    });
  });
});
