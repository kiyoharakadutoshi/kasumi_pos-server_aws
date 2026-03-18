import React from 'react';
import { Page, Text, Document, StyleSheet, View } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import { toDateString } from '@/helpers/date-utils';
import { SERVER_DATETIME_FORMAT } from '@/constants/date-constants';
import { transformData } from './transformData';

type Journal = {
  id: number;
  record_id: number;
  transaction_date: Date;
  cash_register_code: string;
  receipt_no: string;
  journal_no: string;
  journal_data: string;
  journal_receipt_data?: string;
  imagePdf: any;
  journal_settlement: string;
};

export const SearchJournalPdf = (journals: Journal[]) => {
  const dataJournals = Object.values(journals);
  Font.register({
    family: 'MSGoThic',
    src: 'content/fonts/MSGothic/MSGothic.ttf',
    onFontError: (error) => console.error('Font error: ', error),
  });

  const styles = StyleSheet.create({
    section: {
      backgroundColor: '#ffffff',
      padding: '0 50px',
      display: 'flex',
      gap: '6px',
      flexDirection: 'row',
    },
    viewHeaderPage: {
      width: '90%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: '4px',
      marginBottom: '4px',
    },
    viewItem: {
      display: 'flex',
      flexDirection: 'column',
      width: '31.5%',
    },
    viewWrapContent: {
      border: '1px solid black',
      paddingBottom: '5px',
    },
    text: {
      textAlign: 'right',
      fontFamily: 'MSGoThic',
      fontSize: '8px',
      width: '100%',
      padding: '0 5px',
      display: 'flex',
      justifyContent: 'center',
      paddingRight: '15px',
    },
    page: {
      backgroundColor: '#ffffff',
      fontFamily: 'MSGoThic',
      paddingTop: '10px',
      paddingBottom: '25px ',
    },
    textHeader: {
      fontFamily: 'MSGoThic',
      display: 'flex',
      textAlign: 'left',
      fontSize: '8px',
      width: '100%',
      padding: '0 10px',
      paddingLeft: '20px',
      justifyContent: 'center',
    },
    textPageNumber: {
      fontSize: '8px',
      position: 'absolute',
      bottom: '10px',
      right: '15px',
    },
  });
  const formattedDate = toDateString(new Date(), SERVER_DATETIME_FORMAT);
  const dataTransform = dataJournals.flatMap(transformData);
  const getMaxNewLineCount = (array) => {
    return array.reduce((max, item) => {
      const count = (item.journal_data.match(/\\n/g) || []).length;
      return Math.max(max, count);
    }, 0);
  };

  const maxLineIntoPage = 88;

  return (
    <Document>
      <Page wrap style={styles.page} orientation="portrait" size="A4">
        <View style={styles.viewHeaderPage} fixed>
          <Text style={styles.textHeader}>{formattedDate}</Text>
          <Text style={styles.textHeader}>ジャーナル検索</Text>
        </View>
        {(() => {
          const arrJournal = [...dataTransform];
          const views = [];
          let currentLines = 0;

          while (arrJournal.length > 0) {
            const newArrAfterSlice = arrJournal.splice(0, 3);
            const maxLines = getMaxNewLineCount(newArrAfterSlice) + 1; // +1 because marginBottom 10px like 1 line
            const shouldBreak = currentLines + maxLines > maxLineIntoPage;

            if (shouldBreak) {
              currentLines = maxLines % maxLineIntoPage;
            } else {
              currentLines += maxLines;
            }

            views.push(
              <View
                break={shouldBreak && views.length !== 0 ? true : false}
                style={{ marginBottom: '10px' }}
                key={views.length}
              >
                <View style={styles.section}>
                  {newArrAfterSlice.map((journal, index) => {
                    const journalData = journal?.journal_data?.replace(/\\n/g, '\n')?.replace(/\\r/g, '');
                    return (
                      <View style={{ ...styles.viewItem }} key={index}>
                        <View style={{ ...styles.viewWrapContent }}>
                          <Text key={index} style={{ ...styles.text }}>
                            {journalData}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          }

          return views;
        })()}
        <Text
          style={styles.textPageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};
