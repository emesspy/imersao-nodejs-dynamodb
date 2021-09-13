export interface SingleTableModel {
  pk: string;
  sk: string;
  balance?: number;
  payer?: string;
  receiver?: string;
  amount?: number;
  type?: string;
}
