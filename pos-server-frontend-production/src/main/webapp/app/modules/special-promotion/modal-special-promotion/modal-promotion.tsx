import './modal-promotion.scss';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import React, { useEffect, useRef, useState } from 'react';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { clearListPromotion, IPromotionState } from 'app/reducers/promotion-reducer';
import { getListPromotion, IPromotionDetail } from 'app/services/promotion-service';
import { formatNumber, isNullOrEmpty, localizeString } from 'app/helpers/utils';
import SpecialPromotionTable from 'app/modules/special-promotion/special-promotion-table/special-promotion-table';
import { IProduct, KeyProduct } from 'app/services/product-service';
import { LIMIT_RECORD } from 'app/constants/constants';
import PopoverText from 'app/components/popover/popover';

interface IModalListPromotionProps {
  showModal: boolean;
  store_code?: string;
  closeModal?: (item?: IPromotionDetail) => void;
  product?: IProduct;
}

interface ITableProductStyle {
  key: KeyProduct;
  isNumber?: boolean;
  width?: number;
  textAlign?: 'start' | 'center' | 'end';
}

const columns: ITableProductStyle[] = [
  { key: 'my_company_code' },
  { key: 'item_code' },
  { key: 'description', width: 50 },
  { key: 'unit_price', isNumber: true, width: 12, textAlign: 'end' },
];

const TablePromotion = ({
  items,
  selectedItem,
  isExceedRecords,
}: {
  items: IPromotionDetail[];
  isExceedRecords: boolean;
  selectedItem: (item?: IPromotionDetail) => void;
}) => {
  const promotionState: IPromotionState = useAppSelector((state) => state.promotionReducer);

  return (
    <SpecialPromotionTable<IPromotionDetail>
      canShowNoData={promotionState.noResult}
      bodyItems={items}
      height={400}
      disableSelect={true}
      isExceedRecords={isExceedRecords}
      columns={[
        {
          title: 'modalCategoryProduct.table.col_title',
          keyItem: 'operation_type',
          type: 'button',
          width: '7%',
          buttonInput: {
            name: 'modalCategoryProduct.table.button_choose',
            onClick(row) {
              selectedItem(row);
            },
          },
        },
        {
          width: '10%',
          title: 'modalPromotion.promotionCode',
          keyItem: 'code',
        },
        {
          width: '30%',
          title: 'modalPromotion.promotionName',
          keyItem: 'name',
        },
        {
          width: '10%',
          title: 'modalPromotion.startDate',
          keyItem: 'start_date_time',
        },
        {
          width: '10%',
          title: 'modalPromotion.endDate',
          keyItem: 'end_date_time',
        },
      ]}
    />
  );
};

export const ModalPromotion: React.FC<IModalListPromotionProps> = ({ showModal, store_code, closeModal, product }) => {
  const dispatch = useAppDispatch();
  const promotionState: IPromotionState = useAppSelector((state) => state.promotionReducer);
  const [isModalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setModalVisible(showModal);
    if (showModal) {
      setTimeout(() => {
        codeRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

  const handleSearch = () => {
    const query = { store_code, code, limit: LIMIT_RECORD };
    if (isNullOrEmpty(query.code)) {
      delete query.code;
    }
    dispatch(getListPromotion(query));
  };

  const handleCloseModal = (item?: IPromotionDetail) => {
    setModalVisible(false);
    setCode('');
    dispatch(clearListPromotion());
    closeModal && closeModal(item);
  };

  return (
    <>
      {isModalVisible && (
        <DefaultModal
          headerType={ModalMode.Add}
          titleModal="modalPromotion.title"
          tabEnterListener={promotionState?.promotions?.length}
          cancelAction={() => handleCloseModal()}
          className="modal-promotion"
        >
          {product && <ProductView product={product} />}
          <div className="modal-promotion__search-promtion">
            <InputTextCustom
              inputRef={codeRef}
              labelText={'modalPromotion.codeTitle'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type={'number'}
              maxLength={5}
              onBlur={(e) => {
                if (isNullOrEmpty(e.target.value)) return;
                setCode(e.target.value.padStart(5, '0'));
              }}
            />
            <ButtonPrimary onClick={handleSearch} text="modalCategoryProduct.button.search" />
          </div>
          <TablePromotion
            items={promotionState?.promotions}
            selectedItem={handleCloseModal}
            isExceedRecords={promotionState?.isExceedRecords}
          />
        </DefaultModal>
      )}
    </>
  );
};

const ProductView = ({ product }: { product: IProduct }) => {
  return (
    <div className="modal-promotion__table-product-container">
      <table className="table table-responsive modal-promotion__table-product">
        <thead>
          <tr className="table-row">
            {columns.map((column: ITableProductStyle, index: number) => (
              <th className="table-cell" key={index}>
                {localizeString(`specialPromotion.${column.key}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="table-row">
            {columns.map((column: ITableProductStyle, index: number) => {
              const value = product[column.key];
              return (
                <td className="table-cell" key={index} width={column.width ? `${column.width}%` : null}>
                  <PopoverText
                    lineHeight={null}
                    textAlign={column.textAlign ?? "start"}
                    text={column.isNumber ? formatNumber(value) : value}
                    lineLimit={1}
                    height={null}
                  />
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ModalPromotion;
