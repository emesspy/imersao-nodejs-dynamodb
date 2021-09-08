import { OperationType } from '../../main/adapter/in/dto/operation';
import AccountRepositoryImpl from '../../main/adapter/out/AccountRepositoryImpl';
import AccountManagerImpl from '../../main/application/AccountManagerImpl';
import Account from '../../main/domain/Account';

jest.mock('../../main/adapter/out/AccountRepositoryImpl');

describe('AccountManagerImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    test('createAccount when account not exists', () => {
      const accountMock = new Account('123', 0);
      (
        AccountRepositoryImpl.prototype.createAccount as jest.Mock
      ).mockReturnValueOnce(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.createAccount('123', 0);

      expect(result).toBeDefined();
      expect(result).toBe(accountMock);
    });

    test('createAccount when account already exists', () => {
      (
        AccountRepositoryImpl.prototype.createAccount as jest.Mock
      ).mockImplementationOnce(() => {
        throw new Error('conta ja existe. document=123');
      });

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.createAccount('123', 0);
      }).toThrow('conta ja existe. document=123');
    });
  });

  describe('makeDeposit', () => {
    test('makeDeposit when account not exists', () => {
      mockFindAccountValidThrowingError('123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.makeDeposit('123', 0);
      }).toThrow('conta inexistente. document=123');
    });

    test('makeDeposit when account exists', () => {
      const accountMock = new Account('123', 0);

      mockFindAccountValid(accountMock);
      mockUpdateAccount(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.makeDeposit('123', 100);

      expect(result).toBeDefined();
      expect(result.balance).toBe(100);
      expect(result.extract.length).toBe(1);
      const transaction = result.extract[0];
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(OperationType.DEPOSIT);
    });
  });

  describe('makeWithdraw', () => {
    test('makeWithdraw when account not exists', () => {
      mockFindAccountValidThrowingError('123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.makeWithdraw('123', 0);
      }).toThrow('conta inexistente. document=123');
    });

    test('makeWithdraw when account hasnt enough balance', () => {
      const accountMock = new Account('123', 0);
      mockFindAccountValid(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.makeWithdraw('123', 100);
      }).toThrow('saldo insuficiente para saque. document=123');
    });

    test('makeWithdraw when account exists and has balance', () => {
      const accountMock = new Account('123', 100);
      mockFindAccountValid(accountMock);
      mockUpdateAccount(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.makeWithdraw('123', 100);

      expect(result).toBeDefined();
      expect(result.balance).toBe(0);
      expect(result.extract.length).toBe(2);
      const transaction = result.extract[1];
      expect(transaction.id).toBeDefined();
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(OperationType.WITHDRAW);
    });
  });

  describe('transfer', () => {
    test('transfer when payer account not exists', () => {
      mockFindAccountValidThrowingError('123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.transfer('id', '123', '1234', 0);
      }).toThrow('conta inexistente. document=123');
    });

    test('transfer when receiver account not exists', () => {
      const accountMock = new Account('123', 0);
      mockFindAccountValid(accountMock);
      mockFindAccountValidThrowingError('1234');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.transfer('id', '123', '1234', 0);
      }).toThrow('conta inexistente. document=1234');
    });

    test('transfer when receiver and payer are the same', () => {
      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.transfer('id', '123', '123', 0);
      }).toThrow('conta pagadora e recebedora n podem ser iguais');
    });

    test('transfer when payer account hasnt enough balance', () => {
      const payerAccountMock = new Account('123', 0);
      mockFindAccountValid(payerAccountMock);
      const receiverAccountMock = new Account('1234', 0);
      mockFindAccountValid(receiverAccountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.transfer('id', '123', '1234', 1);
      }).toThrow('saldo insuficiente para transferir. document=123');
    });

    test('transfer when accounts exists and payer has balance', () => {
      const payerAccountMock = new Account('123', 100);
      mockFindAccountValid(payerAccountMock);
      mockUpdateAccount(payerAccountMock);
      const receiverAccountMock = new Account('1234', 0);
      mockFindAccountValid(receiverAccountMock);
      mockUpdateAccount(receiverAccountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.transfer('id', '123', '1234', 100);

      expect(result[0]).toBeDefined();
      expect(result[1]).toBeDefined();
      expect(result[0].balance).toBe(0);
      expect(result[1].balance).toBe(100);
      expect(result[0].extract.length).toBe(2);
      expect(result[1].extract.length).toBe(1);
      const transactionPayer = result[0].extract[1];
      expect(transactionPayer.id).toBeDefined();
      expect(transactionPayer.amount).toBe(100);
      expect(transactionPayer.type).toBe(OperationType.TRANSFER);
      expect(transactionPayer.payer).toBe('123');
      expect(transactionPayer.receiver).toBe('1234');
      const transactionReceiver = result[1].extract[0];
      expect(transactionReceiver).toBe(transactionPayer);
    });
  });

  describe('getExtract', () => {
    test('getExtract when account not exists', () => {
      mockFindAccountValidThrowingError('123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.getExtract('123');
      }).toThrow('conta inexistente. document=123');
    });

    test('getExtract when account exists', () => {
      const accountMock = new Account('123', 100);
      mockFindAccountValid(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.getExtract('123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result).toBe(accountMock.extract);
    });
  });

  describe('getBalance', () => {
    test('getBalance when account not exists', () => {
      mockFindAccountValidThrowingError('123');

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      expect(() => {
        sut.getBalance('123');
      }).toThrow('conta inexistente. document=123');
    });

    test('getBalance when account exists', () => {
      const accountMock = new Account('123', 100);
      mockFindAccountValid(accountMock);

      const sut = new AccountManagerImpl(new AccountRepositoryImpl());

      const result = sut.getBalance('123');

      expect(result).toBeDefined();
      expect(result).toBe(accountMock.balance);
    });
  });
});

function mockFindAccountValid(account: Account) {
  (
    AccountRepositoryImpl.prototype.findAccountValid as jest.Mock
  ).mockReturnValueOnce(account);
}

function mockFindAccountValidThrowingError(document: string) {
  (
    AccountRepositoryImpl.prototype.findAccountValid as jest.Mock
  ).mockImplementationOnce(() => {
    throw new Error(`conta inexistente. document=${document}`);
  });
}

function mockUpdateAccount(account: Account) {
  (
    AccountRepositoryImpl.prototype.updateAccount as jest.Mock
  ).mockReturnValueOnce(account);
}
