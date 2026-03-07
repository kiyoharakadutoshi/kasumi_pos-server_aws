import _ from 'lodash';

// format number to xxx,xxx
// forceDecimal = true format with number.0
export const formatNumberWithCommas = (number, forceDecimal = false) => {
  if (number == null || isNaN(number)) return '';
  const roundedNumber = Math.round(Number(number) * 10) / 10;
  const formattedNumber = forceDecimal
    ? roundedNumber.toFixed(1)
    : roundedNumber % 1 === 0
      ? roundedNumber
      : roundedNumber.toFixed(1);
  return _.toString(formattedNumber)?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
