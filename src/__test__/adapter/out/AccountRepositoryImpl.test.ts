import { v4 as uuidv4 } from 'uuid';
import AccountRepositoryImpl from '../../../main/adapter/out/AccountRepositoryImpl';
import { SingleTableModel } from '../../../main/adapter/out/dto/SingleTableModel';
import Account, { ACCOUNT_ENTITY_NAME } from '../../../main/domain/Account';
import AccountTransaction, {
  ACCOUNT_TRANSACTION_ENTITY_NAME,
} from '../../../main/domain/AccountTransaction';
import TransactionType from '../../../main/domain/TransactionType';

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
      const putItemMethod = jest
        .spyOn(AccountRepositoryImpl.prototype, 'putItem')
        .mockResolvedValueOnce(undefined);
      const account = new Account(TENANT, '123', 0);

      const result = await repository.createAccount(account);

      expect(result).toBeDefined();
      expect(result).toBe(account);
      expect(putItemMethod).toHaveBeenCalled();
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

  describe('createAccountTransaction', () => {
    test('createAccountTransaction when have receiver only', async () => {
      const repository = new AccountRepositoryImpl();
      const putItemMethod = jest
        .spyOn(AccountRepositoryImpl.prototype, 'putItem')
        .mockResolvedValueOnce(undefined);

      const accountTransaction = new AccountTransaction(
        TENANT,
        uuidv4(),
        100,
        TransactionType.DEPOSIT,
        undefined,
        '123',
      );

      const result = await repository.createAccountTransaction(
        accountTransaction,
      );

      expect(result).toBeDefined();
      expect(result).toBe(accountTransaction);
      expect(putItemMethod).toHaveBeenCalledTimes(1);
    });

    test('createAccountTransaction when have receiver and payer', async () => {
      const repository = new AccountRepositoryImpl();
      const putItemMethod = jest
        .spyOn(AccountRepositoryImpl.prototype, 'putItem')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const accountTransaction = new AccountTransaction(
        TENANT,
        uuidv4(),
        100,
        TransactionType.TRANSFER,
        '321',
        '123',
      );

      const result = await repository.createAccountTransaction(
        accountTransaction,
      );

      expect(result).toBeDefined();
      expect(result).toBe(accountTransaction);
      expect(putItemMethod).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAccountTransactions', () => {
    test('findAccountTransactions when account doesnt have transactions', async () => {
      const repository = new AccountRepositoryImpl();
      jest
        .spyOn(
          AccountRepositoryImpl.prototype,
          'getByPartitionKeyAndQuerySortKey',
        )
        .mockResolvedValueOnce([]);

      const result = await repository.findAccountTransactions(TENANT, '123');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    test('findAccountTransactions when account have a transaction', async () => {
      const repository = new AccountRepositoryImpl();

      const fromDB = {
        pk: `${TENANT}#${ACCOUNT_ENTITY_NAME}#123`,
        sk: `${ACCOUNT_TRANSACTION_ENTITY_NAME}#123Transaction`,
        amount: 100,
        type: TransactionType.TRANSFER,
        payer: '123',
        receiver: '321',
      } as SingleTableModel;

      jest
        .spyOn(
          AccountRepositoryImpl.prototype,
          'getByPartitionKeyAndQuerySortKey',
        )
        .mockResolvedValueOnce([fromDB]);

      const result = await repository.findAccountTransactions(TENANT, '123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].tenant).toBe(TENANT);
      expect(result[0].id).toBe('123Transaction');
      expect(result[0].amount).toBe(100);
      expect(result[0].type).toBe(TransactionType.TRANSFER);
      expect(result[0].payer).toBe('123');
      expect(result[0].receiver).toBe('321');
    });
  });
});
