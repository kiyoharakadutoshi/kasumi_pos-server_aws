/* eslint-disable object-shorthand */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react/no-unknown-property */
import { CollapseIcon, ExpandIcon } from '@/components/icons';
import { hideLoading, showLoading } from '@/components/loading/loading-reducer';
import { setError } from '@/reducers/error';
import { getHierarchyLevel } from '@/services/hierarchy-level-service';
import {
  deleteDiscountCategory,
  getListDiscountCategory,
  saveDiscountCategory,
} from '@/services/master-category-service';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TooltipDatePicker from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import Dropdown from 'app/components/dropdown/dropdown';
import Header from 'app/components/header/header';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import TooltipTimePicker, { ITimeProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { translate } from 'react-jhipster';
import { parseDateString } from './category-function/convertToDate';
import {
  getAllWithChoiceFalse,
  getAllWithChoiceTrue,
  getDataForModeChecked,
} from './category-function/getDataSelected';
import { transformData } from './category-function/transformData';
import { setStatusChoiceAll, updateChoices } from './category-function/updateStatusChoice';
import { validateForm } from './category-function/validate';
import { headerConditionDefault, MasterCategoryDefault, TIME_SERVICE } from './data-default';
import { IHeaderCondition, IMasterCategory } from './master-category-interface';
import MasterCategoryModal from './master-category-modal';
import './master-category-style.scss';
import WrapBottomButton from './wrap-bottom-button';
import { fullDateToSortDate } from 'app/helpers/date-utils';
import { END_HOURS_DEFAULT, START_HOURS_DEFAULT } from '@/constants/constants';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

const MasterCategory = () => {
  const dispatch = useAppDispatch();
  const formConfig = useForm({ defaultValues: MasterCategoryDefault });
  const { getValues, watch, reset, setValue, control } = formConfig;
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  const searchCondition = watch('headerCondition');
  const listHierarchyLevel = watch('listHierarchyLevel');
  const listHierarchyLevelIsChecked = watch('listHierarchyLevelIsChecked');
  const [openModal, setOpenModal] = useState(false);
  const selectedItem = watch('selectedItemInModal');
  const disableSearchCondition = watch('disableSearchCondition');
  const [initialDiscountPercent, setInitialDiscountPercent] = useState<string>('');
  const [initialDiscountCash, setInitialDiscountCash] = useState<string>('');
  const [initialSearch, setInitialSearch] = useState<IHeaderCondition>(headerConditionDefault);
  const [detailDiscountData, setDetailDiscountData] = useState(null);
  const [onlyDataSelected, setOnlyDataSelected] = useState(false);
  const [statusChoice, setStatusChoice] = useState(false);

  const confirmAction = () => {
    const discountCash = watch('headerCondition.discountCash');
    const discountPercent = watch('headerCondition.discountPercent');
    const isPassValidate = validateForm(discountPercent, discountCash, dispatch, watch);
    if (isPassValidate) {
      const newListHierarchyLevel = !onlyDataSelected
        ? getAllWithChoiceTrue(listHierarchyLevel)?.filter((item) => item?.choice)
        : getAllWithChoiceTrue(listHierarchyLevelIsChecked)?.filter((item) => item?.choice);
      const newItemIntoModal = watch('itemDetailDiscount');
      const newItemDetailDiscount = newItemIntoModal?.length > 0 ? newItemIntoModal : newListHierarchyLevel;
      // handle action submit with data
      let arrDataHierarchyLevel = null;
      if (newItemDetailDiscount && newItemDetailDiscount.length > 0) {
        arrDataHierarchyLevel = newItemDetailDiscount.map((item: IMasterCategory) => {
          const hierarchy = getHierarchy(item);
          return {
            selected_store: selectedStores[0],
            discount_md_hierarchy_code: item?.discount_md_hierarchy_code ? item?.discount_md_hierarchy_code : null,
            md_hierarchy_code: hierarchy.code,
            md_hierarchy_level: hierarchy.level,
            // if update mode edit => apply date follow item
            apply_date:
              newItemIntoModal?.length > 0
                ? fullDateToSortDate(item.apply_date)
                : moment(searchCondition?.start_date_time).format('YY/MM/DD'),
            discount_type_code: discountCash ? 1 : 2,
            // data from header condition
            start_date_time: moment(searchCondition?.start_date_time).format('YY/MM/DD'),
            end_date_time: moment(searchCondition?.end_date_time).format('YY/MM/DD'),
            start_service_time: searchCondition?.start_service_time,
            end_service_time: searchCondition?.end_service_time,
            time_service: Number(searchCondition?.time_service),
            discount_value: Number(discountCash) ? Number(discountCash) : Number(discountPercent),
          };
        });
      }
      // after convert data, will call api
      if (arrDataHierarchyLevel) {
        try {
          dispatch(saveDiscountCategory({ discount_categories: arrDataHierarchyLevel }))
            .unwrap()
            .then(() => {
              handleClearData();
            })
            .catch((error) => {
              console.log('Error when saving discount:', error);
            });
        } catch (error) {
          console.log('err when save discount', error);
        }
      }
    }
  };

  const getHierarchy = (item: IMasterCategory): { code: string; level: number } => {
    if (item.md_hierarchy_code) return { code: item.md_hierarchy_code, level: Number(item.md_hierarchy_level) };
    if (item.code_level_four) return { code: item.code_level_four, level: 4 };
    if (item.code_level_three) return { code: item.code_level_three, level: 3 };
    if (item.code_level_two) return { code: item.code_level_two, level: 2 };
    return { code: item.code_level_one, level: 1 };
  };

  const handleClearData = () => {
    reset();
    // handle update time

    // reset discount
    setInitialDiscountPercent('');
    setInitialDiscountCash('');

    // reset detail discount
    setDetailDiscountData(null);
    // update time
    setValue('headerCondition.start_service_time', START_HOURS_DEFAULT);
    setValue('headerCondition.end_service_time', END_HOURS_DEFAULT);
    // set mode show table
    setOnlyDataSelected(false);
  };

  const handleGetListHierachy = () => {
    if (isNullOrEmpty(watch('headerCondition.code_level_one'))) {
      dispatch(setError(localizeFormat('MSG_VAL_001', 'masterCategory.conditionSearchLabel.category')));
      return;
    }
    // clear data in table and mode table before search
    setValue('listHierarchyLevel', null);
    setValue('listHierarchyLevelIsChecked', null);
    setOnlyDataSelected(false);
    // reset expanding for table
    setValue('isResetExpanded', !watch('isResetExpanded'));

    // handle dispatch get list
    try {
      dispatch(showLoading('get list hierachy'));
      dispatch(
        getHierarchyLevel({
          level: 1,
          filter_type: 1,
          filter_code: searchCondition.code_level_one,
        })
      )
        .unwrap()
        .then((res) => {
          const hierarchyLevelData = res?.data?.data;

          if (hierarchyLevelData?.items && hierarchyLevelData?.items?.length > 0) {
            setValue('listHierarchyLevel', transformData(hierarchyLevelData?.items));
          } else {
            setValue('listHierarchyLevel', []);
          }
        })
        .then(() => {
          setValue('isShowTable', true);
        })
        .catch((error) => {
          console.log('Error when get list hierachy:', error);
          dispatch(hideLoading('get list hierachy'));
        });
    } catch (error) {
      console.log(error);
      dispatch(hideLoading('get list hierachy'));
    }
  };
  // get data for modal
  const handleGetListDiscountCategory = () => {
    dispatch(getListDiscountCategory({ selected_store: selectedStores[0] }))
      .unwrap()
      .then((res) => {
        const listDiscountCategory = res?.data?.data;
        if (listDiscountCategory && listDiscountCategory?.items) {
          setValue('listDiscountCategory', listDiscountCategory?.items || []);
        }
      })
      .then(() => {
        setOpenModal(true);
      })
      .catch(() => { });
  };
  // / handle delete
  const handleDelete = () => {
    const isDelete = watch('itemDetailDiscount')?.length > 0;

    if (isDelete) {
      const dataDelete = watch('itemDetailDiscount')?.[0];

      try {
        dispatch(
          deleteDiscountCategory({
            selected_store: selectedStores[0],
            apply_date: dataDelete.apply_date,
            discount_md_hierarchy_code: dataDelete.discount_md_hierarchy_code,
            md_hierarchy_code: dataDelete.md_hierarchy_code,
            md_hierarchy_level: dataDelete.md_hierarchy_level,
          })
        )
          .unwrap()
          .then(() => {
            handleClearData();
          })
          .then(() => {
            setOpenModal(false);
          });
      } catch (error) {
        console.log('err when delete', error);
      }
    }
  };

  // get all item have selected
  const handleShowItemIsSelected = () => {
    const dataSelected = getDataForModeChecked(getValues('listHierarchyLevel'));
    if (!onlyDataSelected) {
      setValue('listHierarchyLevelIsChecked', dataSelected);
    } else if (onlyDataSelected) {
      const newData = updateChoices(
        getValues('listHierarchyLevel'),
        getAllWithChoiceFalse(getValues('listHierarchyLevelIsChecked'))
      );

      setValue('listHierarchyLevel', newData);
    }
    // update mode show data
    setOnlyDataSelected(!onlyDataSelected);
  };

  // handle space and tab
  // const [changeSpace, setChangeSpace] = useState(false);
  const handleOnKeyDownExpand = (e, row) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      row.getToggleExpandedHandler()();
      // setChangeSpace(!changeSpace);
    }
  };

  // elementChangeKeyListener(changeSpace);

  const columns = React.useMemo<TableColumnDef<IMasterCategory>[]>(
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
        accessorKey: `${watch('itemDetailDiscount')?.length > 0 ? 'code_level_one' : ''}`,
        header: 'masterCategory.conditionSearchLabel.category',
        size: 10,
        type: 'text',
        textAlign: 'right',
        option(props) {
          // three option (1 detail item =>follow accessorKey , onlyDataSelected or onlyDataSelected ! return value )
          const codeLevel = props?.row?.original;
          if (props?.row?.depth === 0 && !onlyDataSelected) {
            return {
              value: codeLevel.code_level_one,
            };
          } else if (onlyDataSelected) {
            return {
              value: codeLevel.code_level_one,
            };
          }
        },
      },
      {
        accessorKey: `${watch('itemDetailDiscount')?.length > 0 ? 'code_level_two' : ''}`,
        header: 'masterCategory.table.group',
        size: 10,
        type: 'text',
        textAlign: 'right',
        option(props) {
          // three option (1 detail item =>follow accessorKey , onlyDataSelected or onlyDataSelected ! return value )
          const codeLevel = props?.row?.original;
          if (props?.row?.depth === 1 && !onlyDataSelected) {
            return {
              value: codeLevel.code_level_two,
            };
          } else if (onlyDataSelected) {
            return {
              value: codeLevel.code_level_two,
            };
          }
        },
      },
      {
        accessorKey: `${watch('itemDetailDiscount')?.length > 0 ? 'code_level_three' : ''}`,
        header: 'masterCategory.table.kind',
        size: 10,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const codeLevel = props?.row?.original;
          if (props?.row?.depth === 2 && !onlyDataSelected) {
            return {
              value: codeLevel.code_level_three,
            };
          } else if (onlyDataSelected) {
            return {
              value: codeLevel.code_level_three,
            };
          }
        },
      },
      {
        accessorKey: `${watch('itemDetailDiscount')?.length > 0 ? 'code_level_four' : ''}`,
        header: 'masterCategory.table.classification',
        type: 'text',
        size: 10,
        textAlign: 'right',
        option(props) {
          const codeLevel = props?.row?.original;
          if (props?.row?.depth === 3 && !onlyDataSelected) {
            return {
              value: codeLevel.code_level_four,
            };
          } else if (onlyDataSelected) {
            return {
              value: codeLevel.code_level_four,
            };
          }
        },
      },
      {
        accessorKey: 'description',
        header: 'masterCategory.table.name',
        size: 55,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const dataDescription = props?.row?.original;
          if (dataDescription?.description_level_four) {
            return {
              value: dataDescription?.description_level_four,
            };
          } else if (dataDescription?.description_level_three) {
            return {
              value: dataDescription?.description_level_three,
            };
          } else if (dataDescription?.description_level_two) {
            return {
              value: dataDescription?.description_level_two,
            };
          } else if (dataDescription?.description_level_one) {
            return {
              value: dataDescription?.description_level_one,
            };
          } else {
            return {
              value: dataDescription?.description,
            };
          }
        },
      },
      {
        accessorKey: 'choice',
        header: 'masterCategory.table.choice',
        size: 10,
        type: 'checkbox-expanding',
        disabled: watch('isShowTableDetail'),
      },
    ],
    [watch('isShowTableDetail'), onlyDataSelected]
  );

  useEffect(() => {
    if (selectedItem && selectedItem?.length > 0) {
      // match selected into table
      // if selected item enable search condition
      setValue('disableSearchCondition', false);
      // setDisableClear(false);
      setValue('disabledClear', false);
    }
  }, [selectedItem]);

  // handle button confirm
  useEffect(() => {
    const checkDisableConfirm = () => {
      const discountCash = watch('headerCondition.discountCash');
      const discountPercent = watch('headerCondition.discountPercent');
      if (listHierarchyLevel && listHierarchyLevel?.length > 0) {
        const isSelected = getAllWithChoiceTrue(listHierarchyLevel)?.some((item) => item?.choice);
        if (
          (initialDiscountCash !== discountCash && isSelected) ||
          (initialDiscountPercent !== discountPercent && isSelected)
        ) {
          // setDisableConfirm(false);
          setValue('disableConfirm', false);
        } else {
          setValue('disableConfirm', true);
        }
      } else if (watch('itemDetailDiscount') && watch('itemDetailDiscount')?.length > 0) {
        // case btn confirm for item detail
        if (
          !_.isEqual(initialSearch, watch('headerCondition')) ||
          initialDiscountCash !== discountCash ||
          initialDiscountPercent !== discountPercent
        ) {
          setValue('disableConfirm', false);
        } else {
          setValue('disableConfirm', true);
        }
      }
    };
    checkDisableConfirm();
  }, [
    useWatch({ control, name: 'itemDetailDiscount' }),
    useWatch({ control, name: 'listHierarchyLevel' }),
    useWatch({ control, name: 'headerCondition' }),
  ]);

  // fill data of item detail discount when click button in modal
  useEffect(() => {
    const dataDetail = getValues('itemDetailDiscount')?.[0];
    if (dataDetail) {
      setDetailDiscountData([dataDetail]);
      setValue('isShowTableDetail', true);
      setValue('isShowTable', false);
      // set headerCondition
      const newHeaderCondition: IHeaderCondition = {
        code_level_one: dataDetail.code_level_one,
        start_date_time: new Date(parseDateString(dataDetail.start_date_time)),
        end_date_time: new Date(parseDateString(dataDetail.end_date_time)),
        start_service_time: dataDetail.start_service_time || '00:00',
        end_service_time: dataDetail.end_service_time || '23:59',
        time_service: Number(dataDetail.time_service),
      };
      const discountValue = Number(dataDetail.discount_value);

      setValue('headerCondition', { ...newHeaderCondition });
      setInitialSearch({ ...newHeaderCondition }); // set initial search for case mode edit
      Number(dataDetail.discount_type_code) === 1
        ? setValue('headerCondition.discountCash', _.toString(discountValue))
        : setValue('headerCondition.discountPercent', _.toString(discountValue));
      setValue('disableSearchCondition', false);
      setValue('disabledClear', false);

      // update initial cash
      Number(dataDetail.discount_type_code) === 1
        ? setInitialDiscountCash(_.toString(discountValue))
        : setInitialDiscountPercent(_.toString(discountValue));
    } else {
      setDetailDiscountData([]);
    }
  }, [watch('itemDetailDiscount')]);

  // update time service
  useEffect(() => {
    setValue('headerCondition.start_service_time', START_HOURS_DEFAULT);
    setValue('headerCondition.end_service_time', END_HOURS_DEFAULT);
  }, [selectedStores]);

  elementChangeKeyListener([openModal, disableSearchCondition, detailDiscountData?.length]);

  return (
    <FormProvider {...formConfig}>
      <div className="master-category">
        <Header
          title="masterCategory.headerTitle"
          csv={{
            disabled: true,
          }}
          printer={{ disabled: true }}
          hasESC={true}
          confirmBack={!watch('disableConfirm')}
        />
        {/* Modal UI */}
        {openModal && <MasterCategoryModal setOpenModal={setOpenModal} />}
        {/* side bar */}
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={() => { }}
          actionConfirm={handleClearData}
          clearData={handleClearData}
          hasData={listHierarchyLevel?.length > 0 || watch('itemDetailDiscount')?.length > 0}
        />
        {/* condition search */}
        <div className="master-category__conditions-search">
          <div className='conditions-search-container'>
            <div className="conditions-search-item ">
              <div className="wrapButton">
                <span className="explantText">
                  {localizeString('masterCategory.conditionSearchLabel.categoryDiscount')}
                </span>
                <ButtonPrimary
                  onClick={() => {
                    setValue('disableSearchCondition', false);
                    setValue('disabledClear', false);
                  }}
                  text="action.addMain"
                  disabled={!disableSearchCondition}
                />

                <FuncKeyDirtyCheckButton
                  className="search-btn"
                  text="action.search"
                  funcKey={null}
                  disabled={!disableSearchCondition}
                  onClickAction={handleGetListDiscountCategory}
                  // dirtyCheck={dirtyCheck}
                  okDirtyCheckAction={() => { }}
                />
              </div>
            </div>

            <div className="conditions-search-item conditions-search-date margin-fit-layout">
              <TooltipDatePicker
                initValue={searchCondition.start_date_time as Date}
                labelText="masterCategory.conditionSearchLabel.period"
                onChange={(date) => {
                  setValue('headerCondition.start_date_time', date);
                }}
                isShortDate={true}
                inputClassName="date-time-start-end__start-date"
                keyError={'masterCategory.start_date'}
                disabled={disableSearchCondition}
                checkEmpty={true}
              />

              <TooltipDatePicker
                initValue={searchCondition.end_date_time as Date}
                required={true}
                onChange={(date) => {
                  setValue('headerCondition.end_date_time', date);
                }}
                isShortDate={true}
                inputClassName="date-time-start-end__start-date"
                keyError={'masterCategory.end_date'}
                checkEmpty={true}
                disabled={disableSearchCondition}
              />

              <TooltipTimePicker
                initValue={searchCondition.start_service_time}
                onChange={(_time: ITimeProps, timeStr: string) => {
                  setValue('headerCondition.start_service_time', timeStr);
                }}
                disabled={disableSearchCondition}
                keyError={'masterCategory.start_time'}
                checkEmpty={true}
              />
              <TooltipTimePicker
                initValue={searchCondition.end_service_time}
                onChange={(_time: ITimeProps, timeStr: string) => {
                  setValue('headerCondition.end_service_time', timeStr);
                }}
                disabled={disableSearchCondition}
                keyError={'masterCategory.end_time'}
                checkEmpty={true}
              />
            </div>

            <div className="conditions-search-item time-service">
              <Dropdown
                value={searchCondition.time_service}
                label={translate('masterCategory.timeService')}
                items={TIME_SERVICE && TIME_SERVICE}
                onChange={(item) => {
                  setValue('headerCondition.time_service', Number(item.value));
                }}
                disabled={disableSearchCondition}
              />
            </div>
          </div>

          <div className='conditions-search-container'>
            <div className="conditions-search-item conditions-search-date">
              <div className="wrap-input-unit unit-percent">
                <InputTextCustom
                  labelText="masterCategory.conditionSearchLabel.discountRate"
                  value={watch('headerCondition.discountPercent')}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    if (parseInt(inputValue, 10) === 0) {
                      setValue('headerCondition.discountPercent', '');
                      return;
                    }
                    setValue('headerCondition.discountPercent', inputValue);
                  }}
                  type="text"
                  maxLength={2}
                  disabled={disableSearchCondition}
                />
                <span className="unitText">%</span>
              </div>

              <div className="wrap-input-unit input-unit-custom">
                <InputTextCustom
                  labelText="masterCategory.conditionSearchLabel.deductionAmount"
                  maxLength={7}
                  disabled={disableSearchCondition}
                  value={watch('headerCondition.discountCash')?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  type="text"
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    if (parseInt(inputValue, 10) === 0) {
                      setValue('headerCondition.discountCash', '');
                      return;
                    }
                    setValue('headerCondition.discountCash', inputValue);
                  }}
                />
                <span className="unitText">{localizeString('masterCategory.unit')}</span>
              </div>
            </div>

            <div className="conditions-search-item">
              <div className="wrap-input-unit unit-percent ">
                <InputTextCustom
                  className="input-category"
                  labelText="masterCategory.conditionSearchLabel.category"
                  type="text"
                  disabled={disableSearchCondition || watch('isShowTableDetail')}
                  value={_.toString(searchCondition.code_level_one)}
                  maxLength={2}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    setValue('headerCondition.code_level_one', inputValue);
                  }}
                  onBlur={(e: any) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, '');
                    setValue(
                      'headerCondition.code_level_one',
                      inputValue ? e.target.value.padStart(2, '0') : inputValue
                    );
                  }}
                />
                <ButtonPrimary
                  className="hierarchicalView-btn"
                  onClick={handleGetListHierachy}
                  text="masterCategory.button.hierarchicalView"
                  disabled={disableSearchCondition || watch('isShowTableDetail')}
                />
              </div>
            </div>
          </div>
        </div>
        {watch('isShowTable') && (
          <div className="wrap-button-selected">
            <ButtonPrimary
              text={!onlyDataSelected ? `masterCategory.button.filterCheckBox` : `masterCategory.button.displayAll`}
              onClick={handleShowItemIsSelected}
              disabled={!getAllWithChoiceTrue(listHierarchyLevel)?.some((item) => item?.choice) && !onlyDataSelected}
            />
            <ButtonPrimary
              text="masterCategory.button.checkBoxAll"
              onClick={() => {
                const dataUpdate = setStatusChoiceAll(getValues('listHierarchyLevel'), !statusChoice);
                setValue('listHierarchyLevel', dataUpdate);
                // set status for item is checked and table is mode show item is checked
                const dataUpdateModeShowChecked =
                  getValues('listHierarchyLevelIsChecked') &&
                  getValues('listHierarchyLevelIsChecked')?.map((item) => {
                    return { ...item, choice: !statusChoice };
                  });
                setValue('listHierarchyLevelIsChecked', dataUpdateModeShowChecked || []);
                setStatusChoice(!statusChoice);
              }}
            />
          </div>
        )}

        {/* Table master category */}
        {watch('isShowTable') && (
          <TableData<IMasterCategory>
            columns={columns}
            data={(listHierarchyLevel && !onlyDataSelected ? listHierarchyLevel : listHierarchyLevelIsChecked) || []}
            enableSelectRow={false}
            showNoData={listHierarchyLevel?.length === 0 || listHierarchyLevelIsChecked?.length === 0}
            tableKey={!onlyDataSelected ? 'listHierarchyLevel' : 'listHierarchyLevelIsChecked'}
            resetExpanded={watch('isResetExpanded')}
          />
        )}
        {/* Table detail */}
        {watch('isShowTableDetail') && (
          <TableData<IMasterCategory>
            columns={columns}
            data={(watch('itemDetailDiscount') && watch('itemDetailDiscount')) || []}
            enableSelectRow={false}
            showNoData={detailDiscountData?.length === 0}
            tableKey="itemDetailDiscount"
          />
        )}
        <div className="master-category-container">
          <WrapBottomButton confirmAction={confirmAction} clearAction={handleClearData} deleteAction={handleDelete} />
        </div>
      </div>
    </FormProvider>
  );
};

export default MasterCategory;
