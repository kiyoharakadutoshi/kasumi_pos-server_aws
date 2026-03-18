import React from 'react';
import { Page, Text, Document, StyleSheet, View } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

type Journal = {
  id: number;
  record_id: number;
  transaction_date: Date;
  cash_register_code: string;
  receipt_no: string;
  journal_no: string;
  journal_data: string;
};

export const SearchJournalPdf = (journals: Journal[]) => {
  const dataJournals = Object.values(journals);
  Font.register({
    family: 'MSGoThic',
    src: 'content/fonts/MSGothic/MS Gothic.ttf',
    onFontError: (error) => console.error('Font error: ', error),
  });

  const styles = StyleSheet.create({
    section: {
      backgroundColor: '#ffffff',
      padding: '0 20px',
      display: 'flex',
      gap: '20px',
      flexDirection: 'row',
    },
    viewItem: {
      display: 'flex',
      flexDirection: 'column',
      width: '31%',
    },
    viewWrapContent: {
      border: '1px solid black',
    },
    text: {
      textAlign: 'right',
      fontFamily: 'MSGoThic',
      fontSize: '8px',
      width: '100%',
      padding: '0 10px',
      display: 'flex',
      justifyContent: 'center',
      paddingRight: '20px',
    },
    page: {
      backgroundColor: '#ffffff',
      fontFamily: 'MSGoThic',
    },
  });

  return (
    <Document>
      <Page style={styles.page} orientation="portrait" size="A4">
        {(() => {
          const arrJournal = [...dataJournals];
          const views = [];
          while (arrJournal.length > 0) {
            const newArrAfterSlice = arrJournal.splice(0, 3);
            views.push(
              <View style={{ marginTop: views?.length === 0 ? 0 : '10px' }} key={views.length}>
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
      </Page>
    </Document>
  );
};
