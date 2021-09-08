import inputData from '../../../input/input.json';
import Account from '../../domain/Account';
import AccountManager from '../../application/port/in/AccountManager';
import AccountManagerImpl from '../../application/AccountManagerImpl';
import { OperationType, Transaction } from './dto/operation';
import AccountTransaction from '../../domain/AccountTransaction';

const accountManager: AccountManager = new AccountManagerImpl();

for (const command of inputData) {
  switch (command.type) {
    case OperationType.CREATE_ACCOUNT: {
      try {
        const account: Account = accountManager.createAccount(
          command.document,
          command.balance,
        );
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.DEPOSIT: {
      try {
        const account: Account = accountManager.makeDeposit(
          command.document,
          command.amount,
        );
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.WITHDRAW: {
      try {
        const account: Account = accountManager.makeWithdraw(
          command.document,
          command.amount,
        );
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.TRANSFER: {
      try {
        const transaction: Transaction = command.transaction;
        const accounts = accountManager.transfer(
          transaction.id,
          transaction.payer,
          transaction.receiver,
          transaction.amount,
        );
        console.log(
          `${JSON.stringify(command)} => ${JSON.stringify(accounts)}`,
        );
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.EXTRACT: {
      try {
        const extract: AccountTransaction[] = accountManager.getExtract(
          command.document,
        );
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(extract)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.BALANCE: {
      let message: string;
      try {
        const balance: number = accountManager.getBalance(command.document);
        console.log(`${JSON.stringify(command)} => ${balance}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
    }
  }
}
