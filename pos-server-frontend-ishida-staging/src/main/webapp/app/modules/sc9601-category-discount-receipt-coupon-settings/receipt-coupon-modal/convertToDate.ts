import moment from 'moment';
// convert String to Date
export const parseDateString = (dateStr) => {
  const [year, month, day] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month - 1, day);
};

// convert Date to format yy/mm/dd
export const convertDateFormat = (inputDate) => {
  if (inputDate) {
    return moment(inputDate, 'YYYY/MM/DD').format('YY/MM/DD');
  }
};
