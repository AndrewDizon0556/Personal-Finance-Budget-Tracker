export interface SplitBill {
  id: string;
  title: string;
  totalAmount: number;
  memberCount: number;
  amountPerMember: number;
  shareMessage: string;
  createdAt: string;
}

export interface SplitBillPayload {
  title: string;
  totalAmount: number;
  memberCount: number;
}
