import React, { useState } from 'react';
import './pagination.scss';
import { translate } from 'react-jhipster';
import { NormalButton, NormalIconButton } from '../button/flat-button/flat-button';

interface PaginationProps {
  recordNumber?: number;
  recordTotal?: number;
  pageCurrently?: number;
  pageTotal?: number;
  action: () => void;
}

const Pagination = (props: PaginationProps) => {
  const { recordNumber, recordTotal, pageCurrently, pageTotal, action } = props;
  const [textButton, setTextButton] = useState('action.F08:商品コード切替');

  function handleText() {
    setTextButton(textButton === 'action.F08:商品コード切替' ? 'action.F08:PLUコード切替' : 'action.F08:商品コード切替');
    action();
  }

  return (
    <div className="wrap-pagination">
      <div className={'wrap-pagination-item'}>
        <NormalIconButton text={textButton} onClick={handleText} />
      </div>
      <div className={'wrap-pagination-item'}>
        <div className="paginationItem">
          <div className="currently-page">
            {pageCurrently || 1}
            {translate('paging.currentlyPage')}
          </div>
        </div>
        <div className="paginationItem">
          <div className="recordNumber">
            {recordNumber || 0} ~ {recordTotal || 0} {translate('paging.recordNumber')}
          </div>
        </div>
        <div className="paginationItem">
          <div className="btn-fist-row">
            <NormalIconButton text={translate('paging.firstRow')} />
          </div>
        </div>
        <div className="paginationItem">
          <div className="btn-last-row">
            <NormalIconButton text={translate('paging.lastRow')} />
          </div>
        </div>
        <div className="paginationItem">
          <div className="btn-previous-page">
            <NormalIconButton text={translate('paging.previousPage')} />
          </div>
        </div>
        <div className="paginationItem">
          <div className="btn-next-page">
            <NormalIconButton text={translate('paging.nextPage')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
