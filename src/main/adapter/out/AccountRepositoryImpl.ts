import AWS from 'aws-sdk';
import {
  GetItemInput,
  PutItemInput,
  QueryInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import AccountRepository from '../../application/port/out/AccountRepository';
import Account, { ACCOUNT_ENTITY_NAME } from '../../domain/Account';
import AccountTransaction, {
  ACCOUNT_TRANSACTION_ENTITY_NAME,
} from '../../domain/AccountTransaction';
import { SingleTableModel } from './dto/SingleTableModel';
import TransactionType from '../../domain/TransactionType';

const TABLE_NAME = 'BankManager';

AWS.config.update({
  accessKeyId: '5lj26r',
  secretAccessKey: 'f3gvsy',
  region: 'us-west-2',
  endpoint: 'http://localhost:8000',
} as ServiceConfigurationOptions);
class AccountRepositoryImpl implements AccountRepository {
  private docClient: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'http://localhost:8000',
    });
  }

  async getByPartitionKeyAndSortKey(
    pk: string,
    sk: string,
  ): Promise<SingleTableModel | undefined> {
    const result = await this.docClient
      .get({
        TableName: TABLE_NAME,
        Key: {
          pk: pk,
          sk: sk,
        },
      } as GetItemInput)
      .promise();
    if (result.Item && result.Item.pk) {
      return result.Item as SingleTableModel;
    }
  }

  async updateBalanceByPartitionKeyAndSortKey(
    pk: string,
    sk: string,
    balance: number,
  ): Promise<void> {
    await this.docClient
      .update({
        TableName: TABLE_NAME,
        Key: {
          pk: pk,
          sk: sk,
        },
        UpdateExpression: 'set balance = :balance',
        ExpressionAttributeValues: {
          ':balance': balance,
        },
      } as UpdateItemInput)
      .promise();
  }

  async getByPartitionKeyAndQuerySortKey(
    pk: string,
    sk: string,
  ): Promise<SingleTableModel[]> {
    const result = await this.docClient
      .query({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': pk,
          ':sk': sk,
        },
      } as QueryInput)
      .promise();
    if (!result || !result.Items) {
      return [];
    }
    return result.Items.map(item => item as SingleTableModel);
  }

  async putItem(item: SingleTableModel): Promise<void> {
    await this.docClient
      .put({
        TableName: TABLE_NAME,
        Item: {
          ...item,
        },
      } as PutItemInput)
      .promise();
  }

  async findAccount(
    tenant: string,
    document: string,
  ): Promise<Account | undefined> {
    const pk = `${tenant}#${ACCOUNT_ENTITY_NAME}#${document}`;
    const sk = `${ACCOUNT_ENTITY_NAME}#${document}`;
    const result = await this.getByPartitionKeyAndSortKey(pk, sk);
    if (result && result.balance !== undefined) {
      return new Account(
        tenant,
        result.sk.split(`${ACCOUNT_ENTITY_NAME}#`)[1],
        result.balance,
      );
    }
  }

  async findAccountValid(tenant: string, document: string): Promise<Account> {
    const pk = `${tenant}#${ACCOUNT_ENTITY_NAME}#${document}`;
    const sk = `${ACCOUNT_ENTITY_NAME}#${document}`;
    const result = await this.getByPartitionKeyAndSortKey(pk, sk);
    if (!result || result.balance === undefined) {
      throw new Error(
        `conta inexistente. tenant=${tenant} , document=${document}`,
      );
    }
    return new Account(
      tenant,
      result.sk.split(`${ACCOUNT_ENTITY_NAME}#`)[1],
      result.balance,
    );
  }

  async createAccount(account: Account): Promise<Account> {
    this.putItem({
      pk: `${account.tenant}#${ACCOUNT_ENTITY_NAME}#${account.document}`,
      sk: `${ACCOUNT_ENTITY_NAME}#${account.document}`,
      balance: account.balance,
    });
    return account;
  }

  async updateAccount(account: Account): Promise<Account> {
    const result = await this.findAccount(account.tenant, account.document);
    if (!result || result.balance === undefined) {
      throw new Error(
        `nao foi possivel editar, conta inexistente. tenant=${account.tenant} , document=${account.document}`,
      );
    }
    this.updateBalanceByPartitionKeyAndSortKey(
      `${account.tenant}#${ACCOUNT_ENTITY_NAME}#${account.document}`,
      `${ACCOUNT_ENTITY_NAME}#${account.document}`,
      account.balance,
    );
    return account;
  }

  async createAccountTransaction(
    transaction: AccountTransaction,
  ): Promise<AccountTransaction> {
    const payer = transaction.payer;
    const receiver = transaction.receiver;
    if (payer) {
      this.putItem(
        this.createTransactionInputItem(transaction.tenant, payer, transaction),
      );
    }
    if (receiver) {
      this.putItem(
        this.createTransactionInputItem(
          transaction.tenant,
          receiver,
          transaction,
        ),
      );
    }
    return transaction;
  }

  async findAccountTransactions(
    tenant: string,
    document: string,
  ): Promise<AccountTransaction[]> {
    const pk = `${tenant}#${ACCOUNT_ENTITY_NAME}#${document}`;
    const sk = `${ACCOUNT_TRANSACTION_ENTITY_NAME}#`;
    const results = await this.getByPartitionKeyAndQuerySortKey(pk, sk);
    if (results) {
      const transactions = results
        .filter(item => {
          return item.amount && item.type;
        })
        .map(transaction => {
          return new AccountTransaction(
            tenant,
            transaction.sk.split(`${ACCOUNT_TRANSACTION_ENTITY_NAME}#`)[1],
            transaction.amount!,
            transaction.type! as TransactionType,
            transaction.payer,
            transaction.receiver,
          );
        });
      return transactions;
    }
    return [];
  }

  private createTransactionInputItem(
    tenant: string,
    account: string,
    transaction: AccountTransaction,
  ): SingleTableModel {
    return {
      pk: `${tenant}#${ACCOUNT_ENTITY_NAME}#${account}`,
      sk: `${ACCOUNT_TRANSACTION_ENTITY_NAME}#${transaction.id}`,
      amount: transaction.amount,
      type: transaction.type,
      payer: transaction.payer,
      receiver: transaction.receiver,
    };
  }
}

export default AccountRepositoryImpl;
