import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { transformData } from './transformData';

const JournalList = ({ journals }) => {
  const dataSelected = journals && journals.filter((item) => item?.selected === true);
  const checkColor = dataSelected.length;

  const dataTransform = dataSelected.flatMap(transformData);
  return (
    <div className={`journal-list ${dataSelected && dataSelected.length > 0 ? 'journal-list-active' : ''}`}>
      <div className="wrap-journal-item">
        <div className="journal-item journal-item-none">
          <div className="journal-details">
            <pre className="journal-data">Data</pre>
          </div>
        </div>
        <Virtuoso
          tabIndex={-1}
          increaseViewportBy={999999999999999}
          className={`virtuoso-journal-list ${!checkColor ? 'backgroundDefault' : ''}`}
          data={dataTransform}
          itemContent={(index, journal) => {
            const journalData = journal?.journal_data?.replace(/\\n/g, '\n').replace(/\\r/g, '');
            return (
              <div className="journal-item" key={journal?.record_id}>
                <div className="journal-details">
                  <div className="wrap-horizontal-data">
                    <pre className="journal-data">{journalData}</pre>
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default JournalList;
