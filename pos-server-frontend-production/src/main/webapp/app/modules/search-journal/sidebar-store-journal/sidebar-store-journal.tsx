import './sidebar-store-journal.scss';
import React from 'react';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import SidebarStoreDefault from 'app/components/sidebar-store-default/sidebar-store-default';

const SidebarSoreJournal = ({ handleSearchJournal, dataSearchChange }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <div className={`sidebar-store-journal ${isExpanded ? 'sidebar-store-journal__expanded' : ''}`}>
      <SidebarStoreDefault
        onClickSearch={handleSearchJournal}
        hiddenSearch={false}
        dataSearchChange={dataSearchChange}
        selectMultiple={true}
      />
      <ButtonPrimary
        onClick={() => setIsExpanded(!isExpanded)}
        className="sidebar-store-journal__expand-button"
        icon={
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 256 256"
            enableBackground="new 0 0 256 256"
            xmlSpace="preserve"
          >
            <g>
              <g>
                <g>
                  <path
                    fill="#000000"
                    d="M70.4,11.2c-3.8,1.7-7.7,6.4-8.4,10.2c-1.5,8.3-3.2,6.3,48.8,58.3l48.1,48.2L110.8,176c-52.1,52.3-50.3,50.1-48.7,58.5c0.8,4.5,6.4,10,10.9,10.9c8.6,1.7,5.6,4.1,65.4-55.6c48.6-48.7,55.1-55.4,55.6-58.5c1.6-8.6,4-5.7-54.7-64.6c-31.1-31.2-55.4-54.8-57.1-55.5C78.5,9.6,74,9.6,70.4,11.2z"
                  />
                </g>
              </g>
            </g>
          </svg>
        }
      />
    </div>
  );
};

export default SidebarSoreJournal;
