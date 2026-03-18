import { createElement } from 'react';

export const renderPDF = async (props: any) => {
  const { pdf } = await import('@react-pdf/renderer');
  const { SearchJournalPdf } = await import('../../modules/search-journal/search-journal-pdf');
  // @ts-ignore
  return pdf(createElement(SearchJournalPdf, props)).toBlob();
};
