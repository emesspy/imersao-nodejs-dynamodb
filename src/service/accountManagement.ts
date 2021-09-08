import { v4 as uuidv4 } from 'uuid';
import Account from '../models/Account';
import AccountTransaction from '../models/AccountTransaction';
import TransactionType from '../models/TransactionType';

function findAccount(
  contas: Map<string, Account>,
  document: string,
): Account | undefined {
  return contas.get(document);
}

function findAccountValid(
  contas: Map<string, Account>,
  document: string,
): Account {
  const contaExistente: Account | undefined = contas.get(document);
  if (!contaExistente) {
    throw new Error('conta inexistente!');
  }
  return contaExistente;
}

export function createAccount(
  contas: Map<string, Account>,
  document: string,
  amount: number,
): void {
  const contaExistente: Account | undefined = findAccount(contas, document);

  if (!contaExistente) {
    contas.set(document, new Account(document, amount));
  }
}

export function makeDeposit(
  contas: Map<string, Account>,
  document: string,
  amount: number,
): void {
  const contaExistente: Account = findAccountValid(contas, document);

  const deposit = new AccountTransaction(
    uuidv4(),
    amount,
    TransactionType.DEPOSIT,
  );
  contaExistente.doTransaction(amount, deposit);
}

export function makeWithdraw(
  contas: Map<string, Account>,
  document: string,
  amount: number,
): void {
  const contaExistente: Account = findAccountValid(contas, document);

  if (contaExistente.balance - amount < 0) {
    throw new Error('saldo insuficiente');
  }

  const withdraw = new AccountTransaction(
    uuidv4(),
    amount,
    TransactionType.WITHDRAW,
  );
  contaExistente.doTransaction(-amount, withdraw);
}

export function transfer(
  contas: Map<string, Account>,
  id: string,
  payer: string,
  receiver: string,
  amount: number,
): void {
  if (payer === receiver) {
    throw new Error('conta pagadora e recebedora n podem ser iguais');
  }
  const contaPagante: Account = findAccountValid(contas, payer);

  const contaRecebedora: Account = findAccountValid(contas, receiver);

  if (contaPagante.balance - amount < 0) {
    throw new Error('saldo insuficiente para transferir');
  }

  const transferencia = new AccountTransaction(
    id,
    amount,
    TransactionType.TRANSFER,
    payer,
    receiver,
  );
  contaPagante.doTransaction(-amount, transferencia);
  contaRecebedora.doTransaction(amount, transferencia);
}

export function getExtract(
  contas: Map<string, Account>,
  document: string,
): AccountTransaction[] {
  const contaExistente: Account = findAccountValid(contas, document);

  return contaExistente.extract;
}

export function getBalance(
  contas: Map<string, Account>,
  document: string,
): number {
  const contaExistente: Account = findAccountValid(contas, document);

  return contaExistente.balance;
}
