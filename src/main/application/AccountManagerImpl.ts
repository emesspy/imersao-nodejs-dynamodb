import { v4 as uuidv4 } from 'uuid';
import AccountRepositoryImpl from '../adapter/out/AccountRepositoryImpl';
import Account from '../domain/Account';
import AccountTransaction from '../domain/AccountTransaction';
import TransactionType from '../domain/TransactionType';
import AccountManager from './port/in/AccountManager';
import AccountRepository from './port/out/AccountRepository';

function createDepositTransaction(
  tenant: string,
  amount: number,
  receiver: string,
): AccountTransaction {
  return new AccountTransaction(
    tenant,
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

  async createAccount(
    tenant: string,
    document: string,
    balance: number,
  ): Promise<Account> {
    const result = await this.repository.findAccount(tenant, document);
    if (result) {
      throw new Error(
        `conta ja existe. tenant=${tenant} , document=${document}`,
      );
    }

    const account = new Account(tenant, document, balance);
    const initialDeposit = createDepositTransaction(tenant, balance, document);
    const resultAccount = await this.repository.createAccount(account);
    await this.repository.createAccountTransaction(initialDeposit);
    return resultAccount;
  }

  async makeDeposit(
    tenant: string,
    document: string,
    amount: number,
  ): Promise<Account> {
    if (amount < 1) {
      throw new Error(
        `valor do deposito precisa ser positivo. tenant=${tenant} , document=${document} , amount=${amount}`,
      );
    }
    const contaExistente: Account = await this.repository.findAccountValid(
      tenant,
      document,
    );
    contaExistente.balance += amount;

    const deposit = createDepositTransaction(tenant, amount, document);
    await this.repository.createAccountTransaction(deposit);
    return await this.repository.updateAccount(contaExistente);
  }

  async makeWithdraw(
    tenant: string,
    document: string,
    amount: number,
  ): Promise<Account> {
    if (amount < 1) {
      throw new Error(
        `valor do saque precisa ser positivo. tenant=${tenant} , document=${document} , amount=${amount}`,
      );
    }
    const contaExistente: Account = await this.repository.findAccountValid(
      tenant,
      document,
    );

    if (contaExistente.balance - amount < 0) {
      throw new Error(
        `saldo insuficiente para saque. tenant=${tenant} , document=${document} , amount:${amount}`,
      );
    }
    contaExistente.balance -= amount;

    const withdraw = new AccountTransaction(
      tenant,
      uuidv4(),
      amount,
      TransactionType.WITHDRAW,
      document,
    );
    await this.repository.createAccountTransaction(withdraw);
    return await this.repository.updateAccount(contaExistente);
  }

  async transfer(
    tenant: string,
    id: string,
    payer: string,
    receiver: string,
    amount: number,
  ): Promise<[Account, Account]> {
    if (payer === receiver) {
      throw new Error(
        'para transferencias, conta pagadora e recebedora n podem ser iguais',
      );
    }
    if (amount < 1) {
      throw new Error(
        `valor da transferencia precisa ser positivo. tenant=${tenant} , amount=${amount} , payer=${payer} , receiver=${receiver}`,
      );
    }

    const contaPagadora: Account = await this.repository.findAccountValid(
      tenant,
      payer,
    );

    if (contaPagadora.balance - amount < 0) {
      throw new Error(
        `saldo insuficiente para transferir. tenant=${tenant} , document=${payer}`,
      );
    }

    const contaRecebedora: Account = await this.repository.findAccountValid(
      tenant,
      receiver,
    );

    contaPagadora.balance -= amount;
    contaRecebedora.balance += amount;

    const transferencia = new AccountTransaction(
      tenant,
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

  async getExtract(
    tenant: string,
    document: string,
  ): Promise<AccountTransaction[]> {
    const result = await this.repository.findAccountTransactions(
      tenant,
      document,
    );
    return result;
  }

  async getBalance(tenant: string, document: string): Promise<number> {
    const contaExistente: Account = await this.repository.findAccountValid(
      tenant,
      document,
    );

    return contaExistente.balance;
  }
}

export default AccountManagerImpl;
