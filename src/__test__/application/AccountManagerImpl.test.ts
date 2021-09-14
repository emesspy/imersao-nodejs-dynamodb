import { v4 as uuidv4 } from 'uuid';
import { OperationType } from '../../main/adapter/in/dto/operation';
import AccountRepositoryImpl from '../../main/adapter/out/AccountRepositoryImpl';
import AccountManagerImpl from '../../main/application/AccountManagerImpl';
import Account from '../../main/domain/Account';
import AccountTransaction from '../../main/domain/AccountTransaction';
import TransactionType from '../../main/domain/TransactionType';

jest.mock('../../main/adapter/out/AccountRepositoryImpl');

const TENANT = 'tenant';

describe('AccountManagerImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    test('createAccount when account not exists', async () => {
      const accountMock = new Account(TENANT, '123', 0);
      (
        AccountRepositoryImpl.prototype.createAccount as jest.Mock
      ).mockReturnValueOnce(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.createAccount(TENANT, '123', 0);

      expect(result).toBeDefined();
      expect(result).toBe(accountMock);
    });

    test('createAccount when account already exists', async () => {
      const accountMock = new Account(TENANT, '123', 0);
      (
        AccountRepositoryImpl.prototype.findAccount as jest.Mock
      ).mockResolvedValueOnce(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.createAccount(TENANT, '123', 0)).rejects.toThrow(
        'conta ja existe. tenant=tenant , document=123',
      );
    });
  });

  describe('makeDeposit', () => {
    test('makeDeposit when account not exists', async () => {
      mockFindAccountValidThrowingError(TENANT, '123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.makeDeposit(TENANT, '123', 1)).rejects.toThrow(
        'conta inexistente. tenant=tenant , document=123',
      );
    });

    test('makeDeposit when value is not positive', async () => {
      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.makeDeposit(TENANT, '123', 0)).rejects.toThrow(
        'valor do deposito precisa ser positivo. tenant=tenant , document=123 , amount=0',
      );
    });

    test('makeDeposit when success', async () => {
      const accountMock = new Account(TENANT, '123', 0);

      mockFindAccountValid(accountMock);
      mockUpdateAccount(accountMock);
      const createTransactionMock = AccountRepositoryImpl.prototype
        .createAccountTransaction as jest.Mock;

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.makeDeposit(TENANT, '123', 100);

      expect(result).toBeDefined();
      expect(result.balance).toBe(100);
      expect(createTransactionMock).toHaveBeenCalled();
      const transaction = createTransactionMock.mock.calls[0][0];
      expect(transaction.tenant).toBe(TENANT);
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(OperationType.DEPOSIT);
      expect(transaction.receiver).toBe('123');
    });
  });

  describe('makeWithdraw', () => {
    test('makeWithdraw when account not exists', async () => {
      mockFindAccountValidThrowingError(TENANT, '123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.makeWithdraw(TENANT, '123', 1)).rejects.toThrow(
        'conta inexistente. tenant=tenant , document=123',
      );
    });

    test('makeWithdraw when value is not positive', async () => {
      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.makeWithdraw(TENANT, '123', 0)).rejects.toThrow(
        'valor do saque precisa ser positivo. tenant=tenant , document=123 , amount=0',
      );
    });

    test('makeWithdraw when account hasnt enough balance', async () => {
      const accountMock = new Account(TENANT, '123', 0);
      mockFindAccountValid(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.makeWithdraw(TENANT, '123', 100)).rejects.toThrow(
        'saldo insuficiente para saque. tenant=tenant , document=123 , amount=100',
      );
    });

    test('makeWithdraw when account exists and has balance', async () => {
      const accountMock = new Account(TENANT, '123', 100);
      mockFindAccountValid(accountMock);
      mockUpdateAccount(accountMock);
      const createTransactionMock = AccountRepositoryImpl.prototype
        .createAccountTransaction as jest.Mock;

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.makeWithdraw(TENANT, '123', 100);

      expect(result).toBeDefined();
      expect(result.balance).toBe(0);
      expect(createTransactionMock).toHaveBeenCalled();
      const transaction = createTransactionMock.mock.calls[0][0];
      expect(transaction.tenant).toBe(TENANT);
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(OperationType.WITHDRAW);
      expect(transaction.payer).toBe('123');
    });
  });

  describe('transfer', () => {
    test('transfer when value is not positive', async () => {
      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(
        sut.transfer(TENANT, 'id', '123', '1234', 0),
      ).rejects.toThrow(
        'valor da transferencia precisa ser positivo. tenant=tenant , amount=0 , payer=123 , receiver=1234',
      );
    });

    test('transfer when payer account not exists', async () => {
      mockFindAccountValidThrowingError(TENANT, '123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(
        sut.transfer(TENANT, 'id', '123', '1234', 1),
      ).rejects.toThrow('conta inexistente. tenant=tenant , document=123');
    });

    test('transfer when receiver account not exists', async () => {
      const accountMock = new Account(TENANT, '123', 1);
      mockFindAccountValid(accountMock);
      mockFindAccountValidThrowingError(TENANT, '1234');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(
        sut.transfer(TENANT, 'id', '123', '1234', 1),
      ).rejects.toThrow('conta inexistente. tenant=tenant , document=1234');
    });

    test('transfer when receiver and payer are the same', async () => {
      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.transfer(TENANT, 'id', '123', '123', 0)).rejects.toThrow(
        'conta pagadora e recebedora n podem ser iguais',
      );
    });

    test('transfer when payer account hasnt enough balance', async () => {
      const payerAccountMock = new Account(TENANT, '123', 0);
      mockFindAccountValid(payerAccountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(
        sut.transfer(TENANT, 'id', '123', '1234', 1),
      ).rejects.toThrow(
        'saldo insuficiente para transferir. tenant=tenant , document=123 , balance=0',
      );
    });

    test('transfer when accounts exists and payer has balance', async () => {
      const payerAccountMock = new Account(TENANT, '321', 100);
      mockFindAccountValid(payerAccountMock);
      mockUpdateAccount(payerAccountMock);
      const receiverAccountMock = new Account(TENANT, '1234', 0);
      mockFindAccountValid(receiverAccountMock);
      mockUpdateAccount(receiverAccountMock);
      const createTransactionMock = AccountRepositoryImpl.prototype
        .createAccountTransaction as jest.Mock;

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.transfer(TENANT, 'id', '321', '1234', 100);

      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
      expect(result[0].balance).toBe(0);
      expect(result[1].balance).toBe(100);
      const transaction = createTransactionMock.mock.calls[0][0];
      expect(transaction.tenant).toBe(TENANT);
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(OperationType.TRANSFER);
      expect(transaction.payer).toBe('321');
      expect(transaction.receiver).toBe('1234');
    });
  });

  describe('getExtract', () => {
    test('getExtract when theres no transactions', async () => {
      mockFindTransactions([]);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.getExtract(TENANT, '123');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    test('getExtract when there is transaction', async () => {
      const accountTransaction = new AccountTransaction(
        TENANT,
        uuidv4(),
        100,
        TransactionType.DEPOSIT,
        undefined,
        '123',
      );
      mockFindTransactions([accountTransaction]);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.getExtract(TENANT, '123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0]).toBe(accountTransaction);
    });
  });

  describe('getBalance', () => {
    test('getBalance when account not exists', async () => {
      mockFindAccountValidThrowingError(TENANT, '123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      await expect(sut.getBalance(TENANT, '123')).rejects.toThrow(
        'conta inexistente. tenant=tenant , document=123',
      );
    });

    test('getBalance when account exists', async () => {
      const accountMock = new Account(TENANT, '123', 100);
      mockFindAccountValid(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = await sut.getBalance(TENANT, '123');

      expect(result).toBeDefined();
      expect(result).toBe(accountMock.balance);
    });
  });
});

function mockFindAccountValid(account: Account) {
  (
    AccountRepositoryImpl.prototype.findAccountValid as jest.Mock
  ).mockResolvedValueOnce(account);
}

function mockFindAccountValidThrowingError(tenant: string, document: string) {
  (
    AccountRepositoryImpl.prototype.findAccountValid as jest.Mock
  ).mockImplementationOnce(async () => {
    throw new Error(
      `conta inexistente. tenant=${tenant} , document=${document}`,
    );
  });
}

function mockUpdateAccount(account: Account) {
  (
    AccountRepositoryImpl.prototype.updateAccount as jest.Mock
  ).mockResolvedValueOnce(account);
}

function mockFindTransactions(transactions: AccountTransaction[]) {
  (
    AccountRepositoryImpl.prototype.findAccountTransactions as jest.Mock
  ).mockResolvedValueOnce(transactions);
}
