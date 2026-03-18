import './category-product.scss';
import {Translate } from 'react-jhipster';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { getHierarchyLevel, IHierarchyLevel, IHierarchyLevelInfo } from 'app/services/hierarchy-level-service';
import { LIMIT_RECORD } from 'app/constants/constants';
import TableCommon from 'app/components/table/table-common';
import { clearHierarchyLevel } from 'app/reducers/hierarchy-level-reducer';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';

interface ModalListCategoryProductProps {
  showModal: boolean;
  store_code?: string;
  closeModal?: (categoryProduct?: IHierarchyLevelInfo) => void;
}

const TableCategory = ({
                         items,
                         selectedItem,
                         total_count,
                       }: {
  items: IHierarchyLevelInfo[];
  total_count: number;
  selectedItem: (category?: IHierarchyLevelInfo) => void;
}) => {
  const hierarchyLevelState = useAppSelector(state => state.hierarchyLevelReducer);

  return (
    <TableCommon<IHierarchyLevelInfo>
      canShowNoData={hierarchyLevelState.noResult}
      bodyItems={items}
      height={300}
      width={1000}
      disableSelect={true}
      totalCount={total_count}
      columns={[
        {
          title: 'modalCategoryProduct.table.col_title',
          keyItem: 'operation_type',
          type: 'button',
          width: 5,
          buttonInput: {
            name: 'modalCategoryProduct.table.button_choose',
            onClick(row) {
              selectedItem(row);
            },
          },
        },
        {
          width: 20,
          title: 'modalCategoryProduct.table.col_group_product',
          keyItem: 'code_level_three',
        },
        {
          width: 30,
          title: 'modalCategoryProduct.table.col_name_product',
          keyItem: 'description_level_three',
        },
        {
          width: 10,
          title: 'modalCategoryProduct.table.col_date',
          keyItem: 'apply_date_level_three',
        },
      ]}
    />
  );
};

export const ModalListCategoryProduct: React.FC<ModalListCategoryProductProps> = ({ showModal, store_code, closeModal }) => {
  const dispatch = useAppDispatch();
  const category: IHierarchyLevel = useAppSelector(state => state.hierarchyLevelReducer.hierarchyLevel);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filterName, setFilterName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    dispatch(getHierarchyLevel({ store_code, level: 3, filter_name: filterName, limit: LIMIT_RECORD }));
  };

  const handleCloseModal = (item?: IHierarchyLevelInfo) => {
    setModalVisible(false);
    setFilterName('');
    closeModal && closeModal(item);
  };

  useEffect(() => {
    setModalVisible(showModal);
    setFilterName('');
    dispatch(clearHierarchyLevel());
  }, [showModal]);

  return (
    <>
      {isModalVisible && (
        <DefaultModal
          headerType={ModalMode.Add}
          tabEnterListener={category?.items?.length}
          titleModal="modalCategoryProduct.title"
          cancelAction={() => handleCloseModal()}
        >
          <div className="group-button-header-content">
            <div className="input-wrapper">
              <InputTextCustom
                hasTrim
                labelText='modalCategoryProduct.name_search'
                value={filterName}
                widthInput="500px"
                onChange={(e: { target: { value: React.SetStateAction<string> } }) => setFilterName(e.target.value)}
                focusIn={true}
                autoFocus={true}
                className={'input-category-product'}
                dataType={'input-category-product'}
                inputRef={inputRef}
                tabIndex={0}
              />
            </div>
            <div className="button-wrapper button-normal">
              <ButtonPrimary onClick={handleSearch} text="modalCategoryProduct.button.search" tabIndex={0} />
            </div>
          </div>

          <TableCategory items={category?.items} selectedItem={handleCloseModal} total_count={category?.total_count} />
        </DefaultModal>
      )}
    </>
  );
};

export default ModalListCategoryProduct;
