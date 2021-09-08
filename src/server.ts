import * as inputData from '../input.json';
import Account from './models/Account';
import * as accountManagement from './service/accountManagement';

const contas = new Map<string, Account>();
console.log(inputData);

const result = [];

inputData.default.forEach(item => {
  switch (item.type) {
    case 'CREATE_ACCOUNT': {
      let message: string;
      try {
        accountManagement.createAccount(contas, item.document, item.balance);
        message = 'ok.';
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
    case 'DEPOSIT': {
      let message: string;
      try {
        accountManagement.makeDeposit(contas, item.document, item.amount);
        message = 'ok.';
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
    case 'WITHDRAW': {
      let message: string;
      try {
        accountManagement.makeWithdraw(contas, item.document, item.amount);
        message = 'ok.';
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
    case 'TRANSFER': {
      let message: string;
      try {
        accountManagement.transfer(
          contas,
          item.transaction?.id,
          item.transaction?.payer,
          item.transaction?.receiver,
          item.transaction?.amount,
        );
        message = 'ok.';
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
    case 'EXTRACT': {
      let message: string;
      try {
        message = accountManagement.getExtract(contas, item.document).join();
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
    case 'BALANCE': {
      let message: string;
      try {
        message = accountManagement
          .getBalance(contas, item.document)
          .toString();
      } catch (e) {
        message = (e as Error).message;
      }
      result.push([item, message]);
      break;
    }
  }
});

console.log(result);
console.log(contas);
