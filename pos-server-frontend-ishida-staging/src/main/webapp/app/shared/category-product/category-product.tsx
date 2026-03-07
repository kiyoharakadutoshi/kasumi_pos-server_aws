import './category-product.scss';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from 'app/config/store';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { getHierarchyLevel, IHierarchyLevel, IHierarchyLevelInfo } from 'app/services/hierarchy-level-service';
import { LIMIT_RECORD } from 'app/constants/constants';
import TableCommon from 'app/components/table/table-common';
import { clearHierarchyLevel } from 'app/reducers/hierarchy-level-reducer';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { isInageyaHook } from 'app/hooks/hook-utils';
import { isNullOrEmpty } from 'app/helpers/utils';

interface ModalListCategoryProductProps {
  showModal: boolean;
  store_code?: string;
  closeModal?: (categoryProduct?: IHierarchyLevelInfo) => void;
}

const TableCategory = ({
  items,
  selectedItem,
  total_count,
  showNoData,
}: {
  items: IHierarchyLevelInfo[];
  total_count: number;
  selectedItem: (category?: IHierarchyLevelInfo) => void;
  showNoData?: boolean;
}) => {
  const isInageya = isInageyaHook();

  return (
    <TableCommon<IHierarchyLevelInfo>
      canShowNoData={showNoData}
      bodyItems={items ?? []}
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
          keyItem: isInageya ? 'code_level_two' : 'code_level_three',
        },
        {
          width: 30,
          title: 'modalCategoryProduct.table.col_name_product',
          keyItem: 'description',
        },
        {
          width: 10,
          title: 'modalCategoryProduct.table.col_date',
          keyItem: 'apply_date',
        },
      ]}
    />
  );
};

export const ModalListCategoryProduct: React.FC<ModalListCategoryProductProps> = ({ showModal, closeModal }) => {
  const dispatch = useAppDispatch();
  const isInageya = isInageyaHook();
  const [category, setCategory] = useState<IHierarchyLevel>();
  const [showNoData, setShowNoData] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [filterName, setFilterName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    dispatch(
      getHierarchyLevel({
        level: isInageya ? 2 : 3,
        filter_type: 2,
        filter_name: filterName,
        limit: LIMIT_RECORD,
      })
    )
      .unwrap()
      .then((response) => {
        setCategory(response.data?.data);
        setShowNoData(isNullOrEmpty(response?.data?.data?.items));
      })
      .catch(() => {
        setCategory(null);
        setShowNoData(true);
      });
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
    setCategory(null);
    setShowNoData(false);
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
                labelText="modalCategoryProduct.name_search"
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

          <TableCategory
            items={category?.items}
            selectedItem={handleCloseModal}
            total_count={category?.total_count}
            showNoData={showNoData}
          />
        </DefaultModal>
      )}
    </>
  );
};

export default ModalListCategoryProduct;
