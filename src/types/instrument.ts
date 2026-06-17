export type OrderStatus = 'pending' | 'sealed' | 'received' | 'washing' | 'sterilizing' | 'completed' | 'delivering' | 'signed' | 'returned';

export type BatchStatus = 'received' | 'washing' | 'sterilizing' | 'completed' | 'returned';

export type DeliveryStatus = 'pending' | 'delivering' | 'signed' | 'rechecked';

export interface InstrumentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  sterilizeMethod: string;
}

export interface Order {
  id: string;
  orderNo: string;
  clinicName: string;
  clinicId: string;
  instrumentCount: number;
  instruments: InstrumentItem[];
  status: OrderStatus;
  sealedPhotos: string[];
  createdAt: string;
  receivedAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  signedAt?: string;
  batchNo?: string;
  remark?: string;
  recheckResult?: 'pass' | 'mismatch';
  recheckRemark?: string;
  actualCount?: number;
}

export interface Batch {
  id: string;
  batchNo: string;
  orderNos: string[];
  instrumentCount: number;
  status: BatchStatus;
  washStartedAt?: string;
  washCompletedAt?: string;
  sterilizeStartedAt?: string;
  sterilizeCompletedAt?: string;
  completedAt?: string;
  operatorName: string;
  remark?: string;
  isSplit: boolean;
  isMerged: boolean;
  parentBatchNo?: string;
}

export interface Delivery {
  id: string;
  deliveryNo: string;
  batchNos: string[];
  fromCenter: string;
  toClinic: string;
  status: DeliveryStatus;
  instrumentCount: number;
  driverName: string;
  dispatchedAt?: string;
  signedAt?: string;
  recheckedAt?: string;
  route: string;
  signedBy?: string;
  recheckBy?: string;
  recheckResult?: 'pass' | 'mismatch';
}

export interface SterilePack {
  id: string;
  packNo: string;
  batchNo: string;
  instrumentName: string;
  sterilizeMethod: string;
  sterilizeDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired' | 'used';
  usedBy?: string;
  usedAt?: string;
  patientName?: string;
}

export interface MonthlyReconciliation {
  id: string;
  month: string;
  clinicName: string;
  clinicId: string;
  totalOrders: number;
  totalInstruments: number;
  totalAmount: number;
  status: 'pending' | 'confirmed';
  generatedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'clinic' | 'center';
  clinicName?: string;
  centerName?: string;
  avatar: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, string> = {
  pending: '待封箱',
  sealed: '已封箱',
  received: '已入库',
  washing: '清洗中',
  sterilizing: '灭菌中',
  completed: '处理完成',
  delivering: '配送中',
  signed: '已签收',
  returned: '异常退回'
};

export const BATCH_STATUS_MAP: Record<BatchStatus, string> = {
  received: '已入库',
  washing: '清洗中',
  sterilizing: '灭菌中',
  completed: '已完成',
  returned: '异常退回'
};

export const DELIVERY_STATUS_MAP: Record<DeliveryStatus, string> = {
  pending: '待配送',
  delivering: '配送中',
  signed: '已签收',
  rechecked: '已复点'
};
