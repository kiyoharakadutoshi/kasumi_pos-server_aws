/* eslint-disable no-unsafe-optional-chaining */
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import React from 'react';
import { IMasterCategory } from './master-category-interface';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { Row } from '@tanstack/react-table';
import { isNullOrEmpty } from '@/helpers/utils';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { getDetailDiscountCategory } from '@/services/master-category-service';
import _ from 'lodash';
import { StatusLabels } from './data-default';

const MasterCategoryModal = ({ setOpenModal }) => {
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  const formConfig = useForm();
  const { getValues, watch, reset, setValue } = useFormContext();
  const listDiscountCategory = watch('listDiscountCategory');

  const dispatch = useAppDispatch();
  const handleCancelAction = () => {
    setOpenModal(false);
  };

  const addClassNameRow = (row: Row<IMasterCategory>) => {
    return { className: row.original.status === 0 ? 'proceed' : '' };
  };

  const handleGetDetailDiscountCategory = (record_id) => {
    dispatch(
      getDetailDiscountCategory({
        selected_store: selectedStores[0],
        record_id,
      })
    )
      .unwrap()
      .then((res) => {
        if (res?.data?.data) {
          setValue('itemDetailDiscount', [res?.data?.data]);
        }
      })
      .then(() => {
        setOpenModal(false);
      });
  };
  const columns = React.useMemo<TableColumnDef<IMasterCategory>[]>(
    () => [
      {
        accessorKey: 'choice',
        header: 'masterCategory.table.choice',
        size: 10,
        type: 'button',
        buttonInput: {
          name: 'modalCategoryProduct.table.button_choose',
          onClick(row, _) {
            handleGetDetailDiscountCategory(row?.record_id);
          },
        },
      },
      {
        accessorKey: 'status',
        header: 'masterCategory.table.status',
        size: 7,
        textAlign: 'left',
        type: 'text',
        option(props) {
          const statusRecord = props.row.original.status;
          return {
            value: StatusLabels[statusRecord],
          };
        },
      },
      {
        accessorKey: 'md_hierarchy_code',
        header: 'masterCategory.table.codesAndNames',
        size: 34,
        textAlign: 'left',
        type: 'text',
        option(props) {
          if (props.row.original.md_hierarchy_code) {
            return {
              value: `${props.row.original.md_hierarchy_code} : ${props.row.original.description}`,
            };
          }
        },
      },
      {
        accessorKey: 'type_time_service',
        header: 'masterCategory.table.timeService',
        type: 'text',
        size: 18,
        textAlign: 'left',

        option(props) {
          if (props.row.original.type_time_service === 0) {
            return {
              value: `${props.row.original.type_time_service} : 通常`,
            };
          } else if (props.row.original.type_time_service === 1) {
            return {
              value: `${props.row.original.type_time_service} : タイムサービス`,
            };
          }
        },
      },
      {
        accessorKey: 'start_date_time',
        header: 'masterCategory.table.startDateAndTime',
        size: 13,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'end_date_time',
        header: 'masterCategory.table.endDateAndTime',
        size: 13,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'discount_type_code',
        header: 'masterCategory.table.discountTypesAndAmounts',
        size: 15,
        type: 'text',
        textAlign: 'left',
        option(props) {
          if (Number(props.row.original.discount_type_code) === 1) {
            return {
              value: `値引: ${_.toString(Number(props.row.original.discount_value))?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}円`,
            };
          } else if (Number(props.row.original.discount_type_code) === 2) {
            return {
              value: `値引: ${Number(props.row.original.discount_value)}%`,
            };
          }
        },
      },
    ],
    []
  );
  return (
    <FormProvider {...formConfig}>
      <div className="container-category-modal">
        <DefaultModal
          titleModal="masterCategory.titleModal"
          headerType={ModalMode.Add}
          cancelAction={handleCancelAction}
          confirmAction={() => {}}
          hasBottomButton={false}
        >
          <TableData<IMasterCategory>
            enableSelectRow={false}
            columns={columns}
            data={(listDiscountCategory && listDiscountCategory) || []}
            rowConfig={addClassNameRow}
            fieldSelectedRowsName="selectedItemInModal"
            showNoData={listDiscountCategory?.length === 0}
          />
        </DefaultModal>
      </div>
    </FormProvider>
  );
};

export default MasterCategoryModal;
