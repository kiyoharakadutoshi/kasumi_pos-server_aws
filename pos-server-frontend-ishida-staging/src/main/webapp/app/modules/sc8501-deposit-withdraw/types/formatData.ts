type status = 'edit' | 'new' | 'old' | 'delete';
type listCode = string[];
type listRecordId = number[];

export interface entities {
  currentStatus: status;
  deposit_withdrawal_code: string;
  deposit_withdrawal_name: string;
  deposit_withdrawal_type: number;
  prevStatus: status;
  record_id: number;
}

export interface originEntities extends entities {}

export interface IRawData {
  entities: entities;
  originEntities: originEntities;
  listCode: listCode;
  listRecordId: listRecordId;
  change: boolean;
}
