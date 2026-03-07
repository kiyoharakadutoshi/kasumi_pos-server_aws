import React, { useEffect } from 'react';
import { localizeString } from 'app/helpers/utils';
import './cash-pagination.scss';

// Define the type for the direction of pagination
type DirectionType = 'prev' | 'next' | 'first' | 'last';

// Constants for pagination directions and default values
const FIRST = 'first';
const LAST = 'last';
const PREV = 'prev';
const NEXT = 'next';
const DEFAULT_PAGE = 1;

const CashPagination = ({ setCurrentPage, currentPage, totalPage, totalRecord, isShowTable }) => {
  // Helper function to check if the current page is the first page
  const isFirstPage = (page: number) => page === DEFAULT_PAGE || isShowTable === false;

  // Helper function to check if the current page is the last page
  const isLastPage = (page: number, total: number) => page === total || isShowTable === false;

  // Conditions to disable pagination buttons
  const DISABLED_CONDITION = {
    BUTTON_FIRST: isFirstPage(currentPage),
    BUTTON_LAST: isLastPage(currentPage, totalPage),
    BUTTON_PREV: isFirstPage(currentPage),
    BUTTON_NEXT: isLastPage(currentPage, totalPage),
  };

  // Function to handle page change based on the direction
  const handleOnChangePage = (direction: DirectionType): void => {
    const onChangeMethod = {
      prev() {
        setCurrentPage(currentPage - DEFAULT_PAGE);
      },
      next() {
        setCurrentPage(currentPage + DEFAULT_PAGE);
      },
      first() {
        setCurrentPage(DEFAULT_PAGE);
      },
      last() {
        setCurrentPage(totalPage);
      },
    };
    return onChangeMethod[direction]();
  };

  // Effect to handle keyboard shortcuts for pagination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyDownLogic = {
        F1() {
          if (DISABLED_CONDITION.BUTTON_PREV) return;
          handleOnChangePage(PREV);
        },
        F2() {
          if (DISABLED_CONDITION.BUTTON_NEXT) return;
          handleOnChangePage(NEXT);
        },
        F3() {
          if (DISABLED_CONDITION.BUTTON_FIRST) return;
          handleOnChangePage(FIRST);
        },
        F4() {
          if (DISABLED_CONDITION.BUTTON_LAST) return;
          handleOnChangePage(LAST);
        },
      };
      keyDownLogic[e.key] ? keyDownLogic[e.key]() : null;
    };

    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      // Remove event listener on cleanup
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPage]);

  return (
    <section id="cash-pagination-29">
      <div className='pagination-container'>
        {totalPage > 0 && (
          <div className="bottom-button__label-page-container label_paging">
            <span className="bottom-button__label-page">
              {totalRecord ?? ''}
              {localizeString('pagingTable.in')}
            </span>
            {currentPage > 1 && (
              <span className="bottom-button__label-page">
                1～{currentPage}
                {localizeString('pagingTable.item')}
              </span>
            )}
          </div>
        )}

        <div className="group-button-pagination">
          <button
            className="button-pagination button-normal__blue"
            onClick={() => handleOnChangePage(FIRST)}
            disabled={DISABLED_CONDITION.BUTTON_FIRST}
          >
            {localizeString('pagingTable.firstRow')}
          </button>

          <button
            className="button-pagination"
            onClick={() => handleOnChangePage(LAST)}
            disabled={DISABLED_CONDITION.BUTTON_LAST}
          >
            {localizeString('pagingTable.lastRow')}
          </button>
          <button
            className="button-pagination"
            onClick={() => handleOnChangePage(PREV)}
            disabled={DISABLED_CONDITION.BUTTON_PREV}
          >
            {localizeString('pagingTable.prevPage')}
          </button>
          <button
            className="button-pagination"
            onClick={() => handleOnChangePage(NEXT)}
            disabled={DISABLED_CONDITION.BUTTON_NEXT}
          >
            {localizeString('pagingTable.nextPage')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CashPagination;
