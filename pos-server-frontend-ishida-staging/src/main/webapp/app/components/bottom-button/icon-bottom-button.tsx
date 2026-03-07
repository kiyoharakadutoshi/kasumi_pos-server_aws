import React from 'react';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';

export const ClearButton = ({ disabledClear, clearAction }: { disabledClear?: boolean; clearAction?: () => void }) => (
  <ButtonPrimary
    onClick={clearAction}
    disabled={disabledClear}
    text="action.f08Clear"
    className="button-normal__blue"
  />
);

export const FirstRowButton = ({ disabledFirstRow, firstRowAction }: { disabledFirstRow?: boolean; firstRowAction?: () => void }) => (
  <ButtonPrimary
    onClick={firstRowAction}
    disabled={disabledFirstRow}
    text="pagingTable.firstRow"
    className="button-normal__blue"
  />
);

export const LastRowButton = ({ disabledLastRow, lastRowAction }: { disabledLastRow?: boolean; lastRowAction?: () => void }) => (
  <ButtonPrimary
    onClick={lastRowAction}
    disabled={disabledLastRow}
    text="pagingTable.lastRow"
    className="button-normal__blue"
  />
);

export const PrevPageButton = ({ disabledPrevPage, prevPageAction }: { disabledPrevPage?: boolean; prevPageAction?: () => void }) => (
  <ButtonPrimary
    onClick={prevPageAction}
    disabled={disabledPrevPage}
    text="pagingTable.prevPage"
    className="button-normal__blue"
  />
);

export const NextPageButton = ({ disabledNextPage, nextPageAction }: { disabledNextPage?: boolean; nextPageAction?: () => void }) => (
  <ButtonPrimary
    onClick={nextPageAction}
    disabled={disabledNextPage}
    text="pagingTable.nextPage"
    className="button-normal__blue"
  />
);
