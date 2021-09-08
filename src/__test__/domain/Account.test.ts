import { v4 as uuidv4 } from 'uuid';
import Account from '../../main/domain/Account';
import AccountTransaction from '../../main/domain/AccountTransaction';
import TransactionType from '../../main/domain/TransactionType';

describe('Account', () => {
  describe('constructor', () => {
    test('constructor when balance is 0', () => {
      const account = new Account('123', 0);

      expect(account).toBeDefined();
      expect(account.extract.length).toBe(0);
    });

    test('constructor when balance greater than 0', () => {
      const account = new Account('123', 100);

      expect(account).toBeDefined();
      expect(account.extract.length).toBe(1);
    });
  });

  describe('doTransaction', () => {
    test('doTransaction when deposit', () => {
      const account = new Account('123', 100);
      const transaction = new AccountTransaction(
        uuidv4(),
        100,
        TransactionType.DEPOSIT,
      );
      account.doTransaction(transaction.amount, transaction);

      expect(account).toBeDefined();
      expect(account.extract.length).toBe(2);
      expect(account.balance).toBe(200);
      expect(account.extract[1]).toBe(transaction);
    });
  });
});
