import { v4 as uuidv4 } from 'uuid';
import AccountRepositoryImpl from '../adapter/out/AccountRepositoryImpl';
import Account from '../domain/Account';
import AccountTransaction from '../domain/AccountTransaction';
import TransactionType from '../domain/TransactionType';
import AccountManager from './port/in/AccountManager';
import AccountRepository from './port/out/AccountRepository';

function createDepositTransaction(
  amount: number,
  receiver: string,
): AccountTransaction {
  return new AccountTransaction(
    uuidv4(),
    amount,
    TransactionType.DEPOSIT,
    undefined,
    receiver,
  );
}

class AccountManagerImpl implements AccountManager {
  private repository: AccountRepository;

  constructor(repository: AccountRepository = new AccountRepositoryImpl()) {
    this.repository = repository;
  }

  async createAccount(document: string, balance: number): Promise<Account> {
    const account = new Account(document, balance);
    const result = await this.repository.findAccount(account.document);
    if (result) {
      throw new Error(`conta ja existe. document=${account.document}`);
    }
    const initialDeposit = createDepositTransaction(balance, document);
    const resultAccount = await this.repository.createAccount(account);
    await this.repository.createAccountTransaction(initialDeposit);
    return resultAccount;
  }

  async makeDeposit(document: string, amount: number): Promise<Account> {
    if (amount < 1) {
      throw new Error(
        `valor do deposito precisa ser positivo. document:${document}, amount:${amount}`,
      );
    }
    const contaExistente: Account = await this.repository.findAccountValid(
      document,
    );
    contaExistente.balance += amount;

    const deposit = createDepositTransaction(amount, document);
    await this.repository.createAccountTransaction(deposit);
    return await this.repository.updateAccount(contaExistente);
  }

  async makeWithdraw(document: string, amount: number): Promise<Account> {
    if (amount < 1) {
      throw new Error(
        `valor do saque precisa ser positivo. document:${document}, amount:${amount}`,
      );
    }
    const contaExistente: Account = await this.repository.findAccountValid(
      document,
    );

    if (contaExistente.balance - amount < 0) {
      throw new Error(
        `saldo insuficiente para saque. document=${document}, amount:${amount}`,
      );
    }
    contaExistente.balance -= amount;

    const withdraw = new AccountTransaction(
      uuidv4(),
      amount,
      TransactionType.WITHDRAW,
      document,
    );
    await this.repository.createAccountTransaction(withdraw);
    return await this.repository.updateAccount(contaExistente);
  }

  async transfer(
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): Promise<[Account, Account]> {
    if (payer === receiver) {
      throw new Error('conta pagadora e recebedora n podem ser iguais');
    }
    if (amount < 1) {
      throw new Error(
        `valor da transferencia precisa ser positivo. amount:${amount}, payer:${payer}, receiver:${receiver}`,
      );
    }
    const contaPagadora: Account = await this.repository.findAccountValid(
      payer,
    );

    const contaRecebedora: Account = await this.repository.findAccountValid(
      receiver,
    );

    if (contaPagadora.balance - amount < 0) {
      throw new Error(`saldo insuficiente para transferir. document=${payer}`);
    }

    contaPagadora.balance -= amount;
    contaRecebedora.balance += amount;

    const transferencia = new AccountTransaction(
      id,
      amount,
      TransactionType.TRANSFER,
      payer,
      receiver,
    );

    await this.repository.createAccountTransaction(transferencia);
    const contaPagadoraSalva = await this.repository.updateAccount(
      contaPagadora,
    );
    const contaRecebedoraSalva = await this.repository.updateAccount(
      contaRecebedora,
    );
    return [contaPagadoraSalva, contaRecebedoraSalva];
  }

  async getExtract(document: string): Promise<AccountTransaction[]> {
    const result = await this.repository.findAccountTransactions(document);
    return result;
  }

  async getBalance(document: string): Promise<number> {
    const contaExistente: Account = await this.repository.findAccountValid(
      document,
    );

    return contaExistente.balance;
  }
}

export default AccountManagerImpl;
