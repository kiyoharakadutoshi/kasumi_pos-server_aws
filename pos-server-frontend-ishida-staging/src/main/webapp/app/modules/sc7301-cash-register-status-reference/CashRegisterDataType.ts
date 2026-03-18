export type itemCashRegisterStatusType = {
  storeCode: string;
  storeName: string;
  cashRegisterCode: string;
  cashRegisterTypeCode: number;
  cashRegisterTypeName: string;
  ipAddress: string;
  parentIpAddress: string;
  dataMasterStatus: number;
  applyMasterTime: string;
  cashRegisterStatus: number;
  parentStatus: number;
  failureStatus: number;
  transactionDate: string;
};

export type FormData = {
  businessDate: string;
  cashRegisterType: number | null;
  dataMasterStatus: number | null;
  cashRegisterStatus: number | null;
  failureStatus: number | null;
  dataTable?: itemCashRegisterStatusType[];
  registerNumber: string;
  storeMachineCode: number;
};

export type detailCashRegisterStatusType = {
  storeCode: string;
  storeName: string;
  cashRegisterCode: string;
  cashRegisterTypeCode: number | null;
  cashRegisterTypeName: string;
  ipAddress: string;
  parentIpAddress: string;
  dataMasterStatus: number | null;
  applyMasterTime: string;
  cashRegisterStatus: number | null;
  parentStatus: number | null;
  transactionDate: string;
  autoChargeStatus: number | null;
  scannerStatus: number | null;
  secondDisplayStatus: number | null;
  printerStatus: number | null;
  webcamStatus: number | null;
  cardReaderStatus: number | null;
  checkNetwork: number | null;
  startupCount: number | null;
  openCount: number | null;
  lastTransactionId: string;
  appliedMasterTime: string;
  downloadedMasterTime: string;
  downloadedMasterVersion: string;
  appliedMasterVersion: string;
  downloadedAppVersion: string;
  downloadAppTime: string;
  appliedAppTime: string;
  appliedAppVersion: string;
};
