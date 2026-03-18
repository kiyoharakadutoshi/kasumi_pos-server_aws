import { isNullOrEmpty } from '@/helpers/utils';

export const transformData = (item) => {
  const result = [
    {
      journal_data: item?.journal_data,
      record_id: item?.record_id,
    },
  ];

  if (!isNullOrEmpty(item?.journal_settlement)) {
    result.push({
      journal_data: item.journal_settlement,
      record_id: item.record_id,
    });
  }

  return result;
};
