import AccountRepositoryImpl from '../../../main/adapter/out/AccountRepositoryImpl';
import { SingleTableModel } from '../../../main/adapter/out/dto/SingleTableModel';
import Account, { ACCOUNT_ENTITY_NAME } from '../../../main/domain/Account';

const TENANT = 'tenant';

function spyReturningAccountFromDB(
  tenant: string,
  document: string,
  balance: number,
): void {
  const fromDB = {
    pk: `${tenant}#${ACCOUNT_ENTITY_NAME}#${document}`,
    sk: `${ACCOUNT_ENTITY_NAME}#${document}`,
    balance: balance,
  } as SingleTableModel;

  jest
    .spyOn(AccountRepositoryImpl.prototype, 'getByPartitionKeyAndSortKey')
    .mockResolvedValueOnce(fromDB);
}

describe('AccountRepositoryImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAccount', () => {
    test('findAccount when account not exists', async () => {
      const repository = new AccountRepositoryImpl();
      jest
        .spyOn(AccountRepositoryImpl.prototype, 'getByPartitionKeyAndSortKey')
        .mockResolvedValueOnce(undefined);

      const result = await repository.findAccount(TENANT, '123');

      expect(result).toBeUndefined();
    });

    test('findAccount when account exists', async () => {
      const repository = new AccountRepositoryImpl();
      spyReturningAccountFromDB(TENANT, '123', 0);

      const result = await repository.findAccount(TENANT, '123');

      expect(result).toBeDefined();
      expect(result?.tenant).toBe(TENANT);
      expect(result?.document).toBe('123');
      expect(result?.balance).toBe(0);
    });
  });

  describe('findAccountValid', () => {
    test('findAccountValid when account not exists => should throw', async () => {
      const repository = new AccountRepositoryImpl();
      jest
        .spyOn(AccountRepositoryImpl.prototype, 'getByPartitionKeyAndSortKey')
        .mockResolvedValueOnce(undefined);

      await expect(repository.findAccountValid(TENANT, '123')).rejects.toThrow(
        'conta inexistente. tenant=tenant , document=123',
      );
    });

    test('findAccountValid when account exists', async () => {
      const repository = new AccountRepositoryImpl();
      spyReturningAccountFromDB(TENANT, '123', 0);

      const result = await repository.findAccountValid(TENANT, '123');

      expect(result).toBeDefined();
      expect(result?.tenant).toBe(TENANT);
      expect(result?.document).toBe('123');
      expect(result?.balance).toBe(0);
    });
  });

  describe('createAccount', () => {
    test('createAccount success', async () => {
      const repository = new AccountRepositoryImpl();
      const account = new Account(TENANT, '123', 0);

      const result = await repository.createAccount(account);

      expect(result).toBeDefined();
      expect(result).toBe(account);
    });
  });

  describe('updateAccount', () => {
    test('updateAccount when account already exists', async () => {
      const repository = new AccountRepositoryImpl();
      const account = new Account(TENANT, '123', 100);
      jest
        .spyOn(AccountRepositoryImpl.prototype, 'findAccount')
        .mockResolvedValueOnce(account);
      const updateMethod = jest
        .spyOn(
          AccountRepositoryImpl.prototype,
          'updateBalanceByPartitionKeyAndSortKey',
        )
        .mockResolvedValueOnce(undefined);

      const result = await repository.updateAccount(account);

      expect(result).toBeDefined();
      expect(result).toBe(account);
      expect(updateMethod).toHaveBeenCalled();
    });

    test('updateAccount when account not exists => should throw', async () => {
      const repository = new AccountRepositoryImpl();
      jest
        .spyOn(AccountRepositoryImpl.prototype, 'getByPartitionKeyAndSortKey')
        .mockResolvedValueOnce(undefined);

      const account = new Account(TENANT, '123', 0);

      await expect(repository.updateAccount(account)).rejects.toThrow(
        'nao foi possivel editar, conta inexistente. tenant=tenant , document=123',
      );
    });
  });
});
