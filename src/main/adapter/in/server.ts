import inputData from '../../../input/input_with_tenant.json';
import { Operation, OperationType, Transaction } from './dto/operation';
import AccountManager from '../../application/port/in/AccountManager';
import AccountManagerImpl from '../../application/AccountManagerImpl';

const accountManager: AccountManager = new AccountManagerImpl();

readOperations();

async function readOperations(): Promise<void> {
  for await (const operation of inputData) {
    await executeOperation(operation as Operation);
  }
}

async function executeOperation(operation: Operation): Promise<void> {
  switch (operation.type) {
    case OperationType.CREATE_ACCOUNT: {
      const document = getDocument(operation);
      const balance = getBalance(operation);
      await accountManager
        .createAccount(operation.organization, document, balance)
        .then(account =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(account)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
      break;
    }
    case OperationType.DEPOSIT: {
      const document = getDocument(<Operation>operation);
      const amount = getAmount(<Operation>operation);
      await accountManager
        .makeDeposit(operation.organization, document, amount)
        .then(account =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(account)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
      break;
    }
    case OperationType.WITHDRAW: {
      const document = getDocument(<Operation>operation);
      const amount = getAmount(<Operation>operation);
      await accountManager
        .makeWithdraw(operation.organization, document, amount)
        .then(account =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(account)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
      break;
    }
    case OperationType.TRANSFER: {
      const transaction: Transaction = getTransaction(<Operation>operation);
      await accountManager
        .transfer(
          operation.organization,
          transaction.id,
          transaction.payer,
          transaction.receiver,
          transaction.amount,
        )
        .then(accounts =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(accounts)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
      break;
    }
    case OperationType.EXTRACT: {
      const document = getDocument(<Operation>operation);
      await accountManager
        .getExtract(operation.organization, document)
        .then(extract =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(extract)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
      break;
    }
    case OperationType.BALANCE: {
      const document = getDocument(<Operation>operation);
      await accountManager
        .getBalance(operation.organization, document)
        .then(balance =>
          console.log(
            `${JSON.stringify(operation)} => ${JSON.stringify(balance)}`,
          ),
        )
        .catch(e => {
          console.log(`${JSON.stringify(operation)} => ${(<Error>e).message}`);
        });
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
