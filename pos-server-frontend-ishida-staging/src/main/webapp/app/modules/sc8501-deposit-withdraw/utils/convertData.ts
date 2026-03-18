export const convertData = (data: any) => {
  return data.reduce(
    (
      acc: {
        entities: { [x: string]: any };
        originEntities: { [x: string]: any };
        listRecordId: any[];
        change: boolean;
        listCode: any[];
      },
      item: {
        deposit_withdrawal_code: string;
        deposit_withdrawal_name: string;
        deposit_withdrawal_type: number;
        record_id: number;
        currentStatus: string;
        prevStatus: string;
      }
    ) => {
      acc.entities[item.record_id] = {
        deposit_withdrawal_code: item.deposit_withdrawal_code,
        deposit_withdrawal_name: item.deposit_withdrawal_name,
        deposit_withdrawal_type: item.deposit_withdrawal_type,
        record_id: item.record_id,
        currentStatus: item.currentStatus ?? 'old',
        prevStatus: item.prevStatus ?? 'old',
      };
      acc.originEntities[item.record_id] = {
        deposit_withdrawal_code: item.deposit_withdrawal_code,
        deposit_withdrawal_name: item.deposit_withdrawal_name,
        deposit_withdrawal_type: item.deposit_withdrawal_type,
        record_id: item.record_id,
        currentStatus: item.currentStatus ?? 'old',
        prevStatus: item.prevStatus ?? 'old',
      };
      acc.listRecordId.push(item.record_id);
      acc.change = false;
      acc.listCode.push(item.deposit_withdrawal_code);

      return acc;
    },
    { entities: {}, originEntities: {}, listRecordId: [], change: false, listCode: [] }
  );
};

