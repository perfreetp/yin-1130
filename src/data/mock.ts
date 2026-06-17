import { Order, Batch, Delivery, SterilePack, MonthlyReconciliation } from '@/types/instrument';

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'XD20260617090001',
    clinicName: '阳光口腔门诊',
    clinicId: 'c1',
    instrumentCount: 15,
    instruments: [
      { id: 'i1', name: '口镜', category: '检查器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i2', name: '探针', category: '检查器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i3', name: '镊子', category: '检查器械', quantity: 5, sterilizeMethod: '高温高压' }
    ],
    status: 'signed',
    sealedPhotos: ['https://picsum.photos/id/3/200/200', 'https://picsum.photos/id/6/200/200'],
    createdAt: '2026-06-15 09:00:00',
    receivedAt: '2026-06-15 11:30:00',
    completedAt: '2026-06-15 18:00:00',
    deliveredAt: '2026-06-16 08:30:00',
    signedAt: '2026-06-16 09:15:00',
    batchNo: 'PC20260615110001',
    remark: ''
  },
  {
    id: '2',
    orderNo: 'XD20260617090002',
    clinicName: '康贝齿科',
    clinicId: 'c2',
    instrumentCount: 22,
    instruments: [
      { id: 'i4', name: '种植手术包', category: '手术器械', quantity: 2, sterilizeMethod: '高温高压' },
      { id: 'i5', name: '拔牙钳', category: '手术器械', quantity: 4, sterilizeMethod: '高温高压' },
      { id: 'i6', name: '刮治器', category: '牙周器械', quantity: 8, sterilizeMethod: '高温高压' },
      { id: 'i7', name: '车针', category: '修复器械', quantity: 8, sterilizeMethod: '环氧乙烷' }
    ],
    status: 'sterilizing',
    sealedPhotos: ['https://picsum.photos/id/8/200/200'],
    createdAt: '2026-06-17 08:30:00',
    receivedAt: '2026-06-17 10:00:00',
    batchNo: 'PC20260617100003',
    remark: '种植包需特别注意灭菌参数'
  },
  {
    id: '3',
    orderNo: 'XD20260617090003',
    clinicName: '微笑牙科',
    clinicId: 'c3',
    instrumentCount: 8,
    instruments: [
      { id: 'i8', name: '正畸钳', category: '正畸器械', quantity: 4, sterilizeMethod: '高温高压' },
      { id: 'i9', name: '托盘', category: '修复器械', quantity: 4, sterilizeMethod: '高温高压' }
    ],
    status: 'sealed',
    sealedPhotos: ['https://picsum.photos/id/9/200/200', 'https://picsum.photos/id/1/200/200'],
    createdAt: '2026-06-17 10:15:00',
    remark: ''
  },
  {
    id: '4',
    orderNo: 'XD20260617090004',
    clinicName: '爱齿社区门诊',
    clinicId: 'c4',
    instrumentCount: 30,
    instruments: [
      { id: 'i10', name: '根管锉', category: '根管器械', quantity: 10, sterilizeMethod: '高温高压' },
      { id: 'i11', name: '充填器', category: '修复器械', quantity: 10, sterilizeMethod: '高温高压' },
      { id: 'i12', name: '抛光轮', category: '修复器械', quantity: 10, sterilizeMethod: '环氧乙烷' }
    ],
    status: 'washing',
    sealedPhotos: ['https://picsum.photos/id/2/200/200'],
    createdAt: '2026-06-17 07:45:00',
    receivedAt: '2026-06-17 09:20:00',
    batchNo: 'PC20260617090004',
    remark: ''
  },
  {
    id: '5',
    orderNo: 'XD20260617090005',
    clinicName: '仁爱口腔',
    clinicId: 'c5',
    instrumentCount: 12,
    instruments: [
      { id: 'i13', name: '印模托盘', category: '修复器械', quantity: 6, sterilizeMethod: '高温高压' },
      { id: 'i14', name: '咬合架', category: '修复器械', quantity: 6, sterilizeMethod: '高温高压' }
    ],
    status: 'pending',
    sealedPhotos: [],
    createdAt: '2026-06-17 11:00:00',
    remark: '急件，请优先处理'
  },
  {
    id: '6',
    orderNo: 'XD20260617090006',
    clinicName: '阳光口腔门诊',
    clinicId: 'c1',
    instrumentCount: 18,
    instruments: [
      { id: 'i15', name: '超声洁治器', category: '牙周器械', quantity: 3, sterilizeMethod: '高温高压' },
      { id: 'i16', name: '牙周刮治器', category: '牙周器械', quantity: 6, sterilizeMethod: '高温高压' },
      { id: 'i17', name: '光固化灯头', category: '修复器械', quantity: 9, sterilizeMethod: '环氧乙烷' }
    ],
    status: 'delivering',
    sealedPhotos: ['https://picsum.photos/id/119/200/200'],
    createdAt: '2026-06-14 15:00:00',
    receivedAt: '2026-06-14 17:00:00',
    completedAt: '2026-06-15 10:00:00',
    batchNo: 'PC20260614170006',
    remark: ''
  },
  {
    id: '7',
    orderNo: 'XD20260617090007',
    clinicName: '康贝齿科',
    clinicId: 'c2',
    instrumentCount: 6,
    instruments: [
      { id: 'i18', name: '种植导板', category: '手术器械', quantity: 2, sterilizeMethod: '环氧乙烷' },
      { id: 'i19', name: '缝合包', category: '手术器械', quantity: 4, sterilizeMethod: '高温高压' }
    ],
    status: 'returned',
    sealedPhotos: ['https://picsum.photos/id/160/200/200'],
    createdAt: '2026-06-16 14:00:00',
    receivedAt: '2026-06-16 16:00:00',
    batchNo: 'PC20260616160007',
    remark: '包装破损，需重新封包'
  },
  {
    id: '8',
    orderNo: 'XD20260617090008',
    clinicName: '微笑牙科',
    clinicId: 'c3',
    instrumentCount: 20,
    instruments: [
      { id: 'i20', name: '正畸带环', category: '正畸器械', quantity: 10, sterilizeMethod: '高温高压' },
      { id: 'i21', name: '正畸托槽', category: '正畸器械', quantity: 10, sterilizeMethod: '高温高压' }
    ],
    status: 'completed',
    sealedPhotos: ['https://picsum.photos/id/201/200/200'],
    createdAt: '2026-06-16 09:30:00',
    receivedAt: '2026-06-16 11:00:00',
    completedAt: '2026-06-16 17:30:00',
    batchNo: 'PC20260616110008',
    remark: ''
  },
  {
    id: '9',
    orderNo: 'XD20260617090009',
    clinicName: '爱齿社区门诊',
    clinicId: 'c4',
    instrumentCount: 10,
    instruments: [
      { id: 'i22', name: '高速手机', category: '修复器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i23', name: '低速弯机', category: '修复器械', quantity: 5, sterilizeMethod: '高温高压' }
    ],
    status: 'received',
    sealedPhotos: ['https://picsum.photos/id/6/200/200'],
    createdAt: '2026-06-17 06:30:00',
    receivedAt: '2026-06-17 08:45:00',
    remark: ''
  },
  {
    id: '10',
    orderNo: 'XD20260617090010',
    clinicName: '仁爱口腔',
    clinicId: 'c5',
    instrumentCount: 25,
    instruments: [
      { id: 'i24', name: '拔牙钳套装', category: '手术器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i25', name: '牙挺', category: '手术器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i26', name: '骨凿', category: '手术器械', quantity: 5, sterilizeMethod: '高温高压' },
      { id: 'i27', name: '手术刀柄', category: '手术器械', quantity: 10, sterilizeMethod: '高温高压' }
    ],
    status: 'pending',
    sealedPhotos: [],
    createdAt: '2026-06-17 12:00:00',
    remark: ''
  }
];

export const mockBatches: Batch[] = [
  {
    id: '1',
    batchNo: 'PC20260615110001',
    orderNos: ['XD20260617090001'],
    instrumentCount: 15,
    status: 'completed',
    washStartedAt: '2026-06-15 13:00:00',
    washCompletedAt: '2026-06-15 14:30:00',
    sterilizeStartedAt: '2026-06-15 15:00:00',
    sterilizeCompletedAt: '2026-06-15 17:00:00',
    completedAt: '2026-06-15 18:00:00',
    operatorName: '张师傅',
    isSplit: false,
    isMerged: false
  },
  {
    id: '2',
    batchNo: 'PC20260617100003',
    orderNos: ['XD20260617090002'],
    instrumentCount: 22,
    status: 'sterilizing',
    washStartedAt: '2026-06-17 11:00:00',
    washCompletedAt: '2026-06-17 12:30:00',
    sterilizeStartedAt: '2026-06-17 13:00:00',
    operatorName: '李师傅',
    isSplit: false,
    isMerged: false,
    remark: '种植包特殊灭菌程序'
  },
  {
    id: '3',
    batchNo: 'PC20260617090004',
    orderNos: ['XD20260617090004'],
    instrumentCount: 30,
    status: 'washing',
    washStartedAt: '2026-06-17 10:00:00',
    operatorName: '王师傅',
    isSplit: false,
    isMerged: false
  },
  {
    id: '4',
    batchNo: 'PC20260614170006',
    orderNos: ['XD20260617090006'],
    instrumentCount: 18,
    status: 'completed',
    washStartedAt: '2026-06-14 18:00:00',
    washCompletedAt: '2026-06-14 19:30:00',
    sterilizeStartedAt: '2026-06-14 20:00:00',
    sterilizeCompletedAt: '2026-06-14 22:00:00',
    completedAt: '2026-06-15 10:00:00',
    operatorName: '张师傅',
    isSplit: false,
    isMerged: false
  },
  {
    id: '5',
    batchNo: 'PC20260616160007',
    orderNos: ['XD20260617090007'],
    instrumentCount: 6,
    status: 'returned',
    washStartedAt: '2026-06-16 17:00:00',
    washCompletedAt: '2026-06-16 18:00:00',
    operatorName: '李师傅',
    isSplit: false,
    isMerged: false,
    remark: '包装破损，退回重新封包'
  },
  {
    id: '6',
    batchNo: 'PC20260616110008',
    orderNos: ['XD20260617090008'],
    instrumentCount: 20,
    status: 'completed',
    washStartedAt: '2026-06-16 12:00:00',
    washCompletedAt: '2026-06-16 13:30:00',
    sterilizeStartedAt: '2026-06-16 14:00:00',
    sterilizeCompletedAt: '2026-06-16 16:30:00',
    completedAt: '2026-06-16 17:30:00',
    operatorName: '王师傅',
    isSplit: false,
    isMerged: false
  }
];

export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    deliveryNo: 'PS20260616080001',
    batchNos: ['PC20260615110001'],
    fromCenter: '区域口腔消毒供应中心',
    toClinic: '阳光口腔门诊',
    status: 'rechecked',
    instrumentCount: 15,
    driverName: '赵师傅',
    dispatchedAt: '2026-06-16 08:00:00',
    signedAt: '2026-06-16 09:15:00',
    recheckedAt: '2026-06-16 09:30:00',
    route: '中心→阳光口腔',
    signedBy: '刘护士',
    recheckBy: '刘护士',
    recheckResult: 'pass'
  },
  {
    id: '2',
    deliveryNo: 'PS20260617080002',
    batchNos: ['PC20260614170006'],
    fromCenter: '区域口腔消毒供应中心',
    toClinic: '阳光口腔门诊',
    status: 'delivering',
    instrumentCount: 18,
    driverName: '赵师傅',
    dispatchedAt: '2026-06-17 08:00:00',
    route: '中心→阳光口腔→康贝齿科'
  },
  {
    id: '3',
    deliveryNo: 'PS20260616080003',
    batchNos: ['PC20260616110008'],
    fromCenter: '区域口腔消毒供应中心',
    toClinic: '微笑牙科',
    status: 'signed',
    instrumentCount: 20,
    driverName: '钱师傅',
    dispatchedAt: '2026-06-16 14:00:00',
    signedAt: '2026-06-16 15:30:00',
    route: '中心→微笑牙科',
    signedBy: '陈医生'
  },
  {
    id: '4',
    deliveryNo: 'PS20260617080004',
    batchNos: ['PC20260616160007'],
    fromCenter: '区域口腔消毒供应中心',
    toClinic: '康贝齿科',
    status: 'pending',
    instrumentCount: 6,
    driverName: '钱师傅',
    route: '中心→康贝齿科',
    remark: '异常退回件，需重新处理'
  },
  {
    id: '5',
    deliveryNo: 'PS20260617080005',
    batchNos: ['PC20260617090004'],
    fromCenter: '区域口腔消毒供应中心',
    toClinic: '爱齿社区门诊',
    status: 'pending',
    instrumentCount: 30,
    driverName: '赵师傅',
    route: '中心→爱齿社区→仁爱口腔'
  }
];

export const mockSterilePacks: SterilePack[] = [
  {
    id: '1',
    packNo: 'WP20260615001',
    batchNo: 'PC20260615110001',
    instrumentName: '口镜×5',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-15',
    expiryDate: '2026-06-29',
    status: 'valid'
  },
  {
    id: '2',
    packNo: 'WP20260615002',
    batchNo: 'PC20260615110001',
    instrumentName: '探针×5',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-15',
    expiryDate: '2026-06-22',
    status: 'expiring'
  },
  {
    id: '3',
    packNo: 'WP20260614001',
    batchNo: 'PC20260614170006',
    instrumentName: '超声洁治器×3',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-14',
    expiryDate: '2026-06-20',
    status: 'expiring'
  },
  {
    id: '4',
    packNo: 'WP20260616001',
    batchNo: 'PC20260616110008',
    instrumentName: '正畸带环×10',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-16',
    expiryDate: '2026-06-30',
    status: 'used',
    usedAt: '2026-06-17 09:00:00',
    patientName: '张xx'
  },
  {
    id: '5',
    packNo: 'WP20260616002',
    batchNo: 'PC20260616110008',
    instrumentName: '正畸托槽×10',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-16',
    expiryDate: '2026-06-30',
    status: 'valid'
  },
  {
    id: '6',
    packNo: 'WP20260613001',
    batchNo: 'PC20260613110009',
    instrumentName: '高速手机×3',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-13',
    expiryDate: '2026-06-20',
    status: 'expired'
  },
  {
    id: '7',
    packNo: 'WP20260615003',
    batchNo: 'PC20260615110001',
    instrumentName: '镊子×5',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-15',
    expiryDate: '2026-06-29',
    status: 'valid'
  },
  {
    id: '8',
    packNo: 'WP20260614002',
    batchNo: 'PC20260614170006',
    instrumentName: '光固化灯头×9',
    sterilizeMethod: '环氧乙烷',
    sterilizeDate: '2026-06-14',
    expiryDate: '2026-07-14',
    status: 'valid'
  },
  {
    id: '9',
    packNo: 'WP20260616003',
    batchNo: 'PC20260616110008',
    instrumentName: '正畸钳×4',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-16',
    expiryDate: '2026-06-30',
    status: 'valid'
  },
  {
    id: '10',
    packNo: 'WP20260616004',
    batchNo: 'PC20260616110008',
    instrumentName: '托盘×4',
    sterilizeMethod: '高温高压',
    sterilizeDate: '2026-06-16',
    expiryDate: '2026-06-23',
    status: 'expiring'
  }
];

export const mockReconciliations: MonthlyReconciliation[] = [
  {
    id: '1',
    month: '2026-06',
    clinicName: '阳光口腔门诊',
    clinicId: 'c1',
    totalOrders: 12,
    totalInstruments: 186,
    totalAmount: 3720,
    status: 'confirmed',
    generatedAt: '2026-06-01 09:00:00'
  },
  {
    id: '2',
    month: '2026-06',
    clinicName: '康贝齿科',
    clinicId: 'c2',
    totalOrders: 8,
    totalInstruments: 124,
    totalAmount: 2480,
    status: 'confirmed',
    generatedAt: '2026-06-01 09:00:00'
  },
  {
    id: '3',
    month: '2026-06',
    clinicName: '微笑牙科',
    clinicId: 'c3',
    totalOrders: 6,
    totalInstruments: 88,
    totalAmount: 1760,
    status: 'pending',
    generatedAt: '2026-06-01 09:00:00'
  },
  {
    id: '4',
    month: '2026-05',
    clinicName: '阳光口腔门诊',
    clinicId: 'c1',
    totalOrders: 15,
    totalInstruments: 230,
    totalAmount: 4600,
    status: 'confirmed',
    generatedAt: '2026-05-01 09:00:00'
  },
  {
    id: '5',
    month: '2026-05',
    clinicName: '康贝齿科',
    clinicId: 'c2',
    totalOrders: 10,
    totalInstruments: 156,
    totalAmount: 3120,
    status: 'confirmed',
    generatedAt: '2026-05-01 09:00:00'
  },
  {
    id: '6',
    month: '2026-05',
    clinicName: '爱齿社区门诊',
    clinicId: 'c4',
    totalOrders: 7,
    totalInstruments: 98,
    totalAmount: 1960,
    status: 'confirmed',
    generatedAt: '2026-05-01 09:00:00'
  },
  {
    id: '7',
    month: '2026-05',
    clinicName: '微笑牙科',
    clinicId: 'c3',
    totalOrders: 5,
    totalInstruments: 72,
    totalAmount: 1440,
    status: 'confirmed',
    generatedAt: '2026-05-01 09:00:00'
  },
  {
    id: '8',
    month: '2026-05',
    clinicName: '仁爱口腔',
    clinicId: 'c5',
    totalOrders: 9,
    totalInstruments: 145,
    totalAmount: 2900,
    status: 'confirmed',
    generatedAt: '2026-05-01 09:00:00'
  },
  {
    id: '9',
    month: '2026-04',
    clinicName: '阳光口腔门诊',
    clinicId: 'c1',
    totalOrders: 13,
    totalInstruments: 198,
    totalAmount: 3960,
    status: 'confirmed',
    generatedAt: '2026-04-01 09:00:00'
  },
  {
    id: '10',
    month: '2026-04',
    clinicName: '康贝齿科',
    clinicId: 'c2',
    totalOrders: 11,
    totalInstruments: 167,
    totalAmount: 3340,
    status: 'confirmed',
    generatedAt: '2026-04-01 09:00:00'
  }
];

export const mockUser = {
  id: 'u1',
  name: '刘护士',
  phone: '138****5678',
  role: 'clinic' as const,
  clinicName: '阳光口腔门诊',
  avatar: 'https://picsum.photos/id/64/200/200'
};
