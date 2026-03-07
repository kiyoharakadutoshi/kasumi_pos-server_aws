export const generateRecords = (n) => {
  const generateDataReport = () => {
    const reports = [];
    for (let time_no = 1; time_no <= 24; time_no++) {
      reports.push({
        time_no: time_no <= 20 ? time_no : null, // Example: null for time_no > 20
        sale_amount: 100 * time_no,
        number_customers: time_no,
        number_products: time_no,
        ratio: parseFloat((time_no * 4.77).toFixed(2)),
        is_highlight: time_no % 2 === 0, // Example: highlight for even time_no
      });
    }
    return reports;
  };

  return Array.from({ length: n }, (_, index) => ({
    cash_register_code: index === length ? null : (190 + index).toString(),
    rate_customer_excluded: parseFloat((Math.random() * 100).toFixed(2)), // Random value
    data_report: generateDataReport(),
  }));
}
