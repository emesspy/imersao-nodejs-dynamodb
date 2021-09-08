import inputData from '../../../input/input.json';
import { Operation, OperationType, Transaction } from './dto/operation';
import Account from '../../domain/Account';
import AccountTransaction from '../../domain/AccountTransaction';
import AccountManager from '../../application/port/in/AccountManager';
import AccountManagerImpl from '../../application/AccountManagerImpl';

const accountManager: AccountManager = new AccountManagerImpl();

for (const command of inputData) {
  switch (command.type) {
    case OperationType.CREATE_ACCOUNT: {
      try {
        const document = getDocument(<Operation>command);
        const balance = getBalance(<Operation>command);
        const account: Account = accountManager.createAccount(
          document,
          balance,
        );
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.DEPOSIT: {
      try {
        const document = getDocument(<Operation>command);
        const amount = getAmount(<Operation>command);
        const account: Account = accountManager.makeDeposit(document, amount);
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.WITHDRAW: {
      try {
        const document = getDocument(<Operation>command);
        const amount = getAmount(<Operation>command);
        const account: Account = accountManager.makeWithdraw(document, amount);
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(account)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.TRANSFER: {
      try {
        const transaction: Transaction = getTransaction(<Operation>command);
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
        const document = getDocument(<Operation>command);
        const extract: AccountTransaction[] =
          accountManager.getExtract(document);
        console.log(`${JSON.stringify(command)} => ${JSON.stringify(extract)}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
      break;
    }
    case OperationType.BALANCE: {
      try {
        const document = getDocument(<Operation>command);
        const balance: number = accountManager.getBalance(document);
        console.log(`${JSON.stringify(command)} => ${balance}`);
      } catch (e) {
        console.log(`${JSON.stringify(command)} => ${(<Error>e).message}`);
      }
    }
  }
}

function getDocument(command: Operation): string {
  const document: string | undefined = command.document;
  if (!document) {
    throw new Error('document eh obrigatorio');
  }
  return document;
}

function getBalance(command: Operation): number {
  const balance: number | undefined = command.balance;
  if (!balance) {
    throw new Error('balance eh obrigatorio');
  }
  return balance;
}

function getAmount(command: Operation): number {
  const amount: number | undefined = command.amount;
  if (!amount) {
    throw new Error('amount eh obrigatorio');
  }
  return amount;
}

function getTransaction(command: Operation): Transaction {
  const transaction: Transaction | undefined = command.transaction;
  if (!transaction) {
    throw new Error('amount eh obrigatorio');
  }
  return transaction;
}
