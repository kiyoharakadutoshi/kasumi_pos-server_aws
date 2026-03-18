import React, { useEffect, useRef, useState } from 'react';

// Components
import DefaultModal from '@/components/modal/default-modal/default-modal';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import InputControl from '@/components/control-form/input-control';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { ModalMode } from '@/components/modal/default-modal/default-enum';

// Hooks and Utilities
import { useFormContext } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/config/store';

// Types and Interfaces
import {
  ProductList,
  FormDataRevenue,
  ModalProductListResponseItems,
} from 'app/modules/sc3201-product-revenue-pos/product-revenue-pos-interface';

// Services
import { getProductList } from '@/services/product-revenue-pos-service';

// Styles
import './styles.scss';
import { getGroupProductCode, isNullOrEmpty } from 'app/helpers/utils';
import { fullDateToSortDate } from 'app/helpers/date-utils';

interface ProductListModalProps {
  isShowModal: boolean;
  handleCloseModal: (data?: ModalProductListResponseItems) => void;
}

const ProductListModal = ({ isShowModal, handleCloseModal }: ProductListModalProps) => {
  const dispatch = useAppDispatch();
  const [searchResult, setSearchResult] = useState<ModalProductListResponseItems[]>([]);
  const { getValues, setValue } = useFormContext<FormDataRevenue>();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);

  /**
   * Reset data, message MSG_ERR_001 table product when show modal
   */
  useEffect(() => {
    setValue('showNoDataModal', false);
    setValue('descriptionSearch', '');
    setSearchResult([]);
  }, [isShowModal]);

  const handleClickSearch = () => {
    const param: ProductList = {
      selected_store: selectedStores?.[0],
      description: getValues('descriptionSearch'),
    };
    dispatch(getProductList(param))
      .unwrap()
      .then((res) => {
        const items = res?.data?.data?.items;
        setSearchResult(items);
        setValue('showNoDataModal', isNullOrEmpty(items));
      })
      .catch(() => {
        setValue('showNoDataModal', true);
      });
  };

  const columns = React.useMemo<TableColumnDef<ModalProductListResponseItems>[]>(
    () => [
      {
        header: 'productList.button_choose',
        size: 7,
        type: 'button',
        textAlign: 'center',
        keyItem: 'isChose',
        buttonInput: {
          name: '選択',
          onClick: handleCloseModal,
        },
      },
      {
        accessorKey: 'my_company_code',
        textAlign: 'left',
        header: 'productList.productCode',
        option(props) {
          return { value: getGroupProductCode(props?.row?.original?.my_company_code) };
        },
        type: 'text',
        size: 14,
      },
      {
        accessorKey: 'item_code',
        textAlign: 'left',
        header: 'productList.pluCode',
        type: 'text',
        size: 14,
      },
      {
        accessorKey: 'description',
        textAlign: 'left',
        header: 'productList.productName',
        type: 'text',
        size: 47,
      },
      {
        accessorKey: 'unit_price',
        textAlign: 'right',
        header: 'productList.unitPrice',
        type: 'text',
        formatNumber: true,
        size: 9,
      },
      {
        accessorKey: 'apply_date',
        textAlign: 'left',
        header: 'productList.applyDate',
        type: 'text',
        option(props) {
          return { value: fullDateToSortDate(props?.row?.original?.apply_date) };
        },
        size: 9,
      },
    ],
    [searchResult]
  );

  return (
    <>
      {isShowModal && (
        <DefaultModal
          headerType={ModalMode.Add}
          titleModal="productList.title"
          tabEnterListener={true}
          cancelAction={() => handleCloseModal()}
          className="modal-product-list"
        >
          <div className="modal-product-list__search">
            <InputControl
              name="descriptionSearch"
              className="modal-product-name"
              labelText="productList.productName"
              width="100%"
              ref={inputRef}
              maxLength={50}
            />
            <ButtonPrimary onClick={handleClickSearch} text="label.search" />
          </div>

          <TableData<ModalProductListResponseItems>
            showNoDataNameForm='showNoDataModal'
            columns={columns}
            data={searchResult}
            enableSelectRow={false}
          />
        </DefaultModal>
      )}
    </>
  );
};

export default ProductListModal;
