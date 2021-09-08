import { v4 as uuidv4 } from 'uuid';
import AccountRepositoryImpl from '../adapter/out/AccountRepositoryImpl';
import Account from '../domain/Account';
import AccountTransaction from '../domain/AccountTransaction';
import TransactionType from '../domain/TransactionType';
import AccountManager from './port/in/AccountManager';
import AccountRepository from './port/out/AccountRepository';

class AccountManagerImpl implements AccountManager {
  private repository: AccountRepository;

  constructor(repository: AccountRepository = AccountRepositoryImpl) {
    this.repository = repository;
  }

  createAccount(document: string, balance: number): Account {
    const account = new Account(document, balance);
    return this.repository.createAccount(account);
  }

  makeDeposit(document: string, amount: number): Account {
    const contaExistente: Account = this.repository.findAccountValid(document);

    const deposit = new AccountTransaction(
      uuidv4(),
      amount,
      TransactionType.DEPOSIT,
    );
    contaExistente.doTransaction(amount, deposit);
    return this.repository.updateAccount(contaExistente);
  }

  makeWithdraw(document: string, amount: number): Account {
    const contaExistente: Account = this.repository.findAccountValid(document);

    if (contaExistente.balance - amount < 0) {
      throw new Error(`saldo insuficiente para saque. document:${document}`);
    }

    const withdraw = new AccountTransaction(
      uuidv4(),
      amount,
      TransactionType.WITHDRAW,
    );
    contaExistente.doTransaction(-amount, withdraw);
    return this.repository.updateAccount(contaExistente);
  }

  transfer(
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): [Account, Account] {
    if (payer === receiver) {
      throw new Error('conta pagadora e recebedora n podem ser iguais');
    }
    const contaPagadora: Account = this.repository.findAccountValid(payer);

    const contaRecebedora: Account = this.repository.findAccountValid(receiver);

    if (contaPagadora.balance - amount < 0) {
      throw new Error(`saldo insuficiente para transferir. document:${payer}`);
    }

    const transferencia = new AccountTransaction(
      id,
      amount,
      TransactionType.TRANSFER,
      payer,
      receiver,
    );
    contaPagadora.doTransaction(-amount, transferencia);
    this.repository.updateAccount(contaPagadora);
    contaRecebedora.doTransaction(amount, transferencia);
    this.repository.updateAccount(contaRecebedora);
    return [contaPagadora, contaRecebedora];
  }

  getExtract(document: string): AccountTransaction[] {
    const contaExistente: Account = this.repository.findAccountValid(document);
    return contaExistente.extract;
  }
  getBalance(document: string): number {
    const contaExistente: Account = this.repository.findAccountValid(document);

    return contaExistente.balance;
  }
}

export default AccountManagerImpl;
