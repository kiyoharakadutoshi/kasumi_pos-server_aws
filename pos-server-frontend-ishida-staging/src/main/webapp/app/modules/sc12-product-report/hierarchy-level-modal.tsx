import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import React, { useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { IHierarchyLevel } from './product-report-interface';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { CollapseIcon, ExpandIcon } from '@/components/icons';

const listLevel = {
  code_level_one: 1,
  code_level_two: 3,
  code_level_three: 3,
  code_level_four: 3,
};

const HierarchyLevelModal = ({ setOpenModal, selectedItem, handleSetMaxLength }) => {
  const { watch } = useFormContext();
  const productHierarchies = watch('productHierarchies');

  const formConfig = useForm({ defaultValues: null });

  const handleCancelAction = () => {
    setOpenModal(false);
  };

  // Handle space and tab
  const [changeSpace, setChangeSpace] = useState(false);
  const handleOnKeyDownExpand = (e, row) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      row.getToggleExpandedHandler()();
      setChangeSpace(!changeSpace);
    }
  };

  elementChangeKeyListener(changeSpace);

  const columns = React.useMemo<TableColumnDef<IHierarchyLevel>[]>(
    () => [
      {
        accessorKey: '',
        header: ' ',
        size: 5,
        cell: ({ row }) => (
          <div className="button-expanding" tabIndex={0} onKeyDown={(e) => handleOnKeyDownExpand(e, row)}>
            <div>
              {row.getCanExpand() && (
                <div onClick={row.getToggleExpandedHandler()}>
                  {!row.getIsExpanded() ? <ExpandIcon /> : <CollapseIcon />}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'code_level_one',
        header: 'productReport.modal.department',
        size: 8,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'code_level_two',
        header: 'productReport.modal.group',
        type: 'text',
        size: 10,
        textAlign: 'left',
      },
      {
        accessorKey: 'code_level_three',
        header: 'productReport.modal.kind',
        size: 10,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'code_level_four',
        header: 'productReport.modal.classification',
        size: 10,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'description',
        header: 'productReport.modal.name',
        size: 47,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'choice',
        header: 'productReport.modal.choice',
        size: 10,
        type: 'button',
        buttonInput: {
          name: 'productReport.modal.choice',
          onClick(row) {
            selectedItem(row);
            setOpenModal(false);
            const listKey = Object.keys(row);
            handleSetMaxLength(listLevel[listKey[0]]);
          },
        },
      },
    ],
    []
  );

  return (
    <FormProvider {...formConfig}>
      <div className="container-product-modal">
        <DefaultModal
          titleModal="productReport.modal.title"
          headerType={ModalMode.Add}
          cancelAction={handleCancelAction}
          confirmAction={() => {}}
          hasBottomButton={false}
        >
          <TableData<IHierarchyLevel>
            columns={columns}
            data={(productHierarchies && productHierarchies) || []}
            enableSelectRow={false}
            showNoData={true}
          />
        </DefaultModal>
      </div>
    </FormProvider>
  );
};

export default HierarchyLevelModal;
