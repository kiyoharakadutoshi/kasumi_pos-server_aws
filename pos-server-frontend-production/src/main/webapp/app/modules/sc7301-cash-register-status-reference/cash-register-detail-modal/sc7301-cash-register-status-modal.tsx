import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

// Component imports
import ModalCommon, { IModalInfo } from '@/components/modal/modal-common';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import { ModalMode } from '@/components/modal/default-modal/default-enum';

// Utility functions
import { isEqual, localizeString } from '@/helpers/utils';
import { PopoverLabelText } from '@/components/popover/popover';

// Styles
import './sc7301-cash-register-status-modal.scss';

// Component imports
import CashStatus from '@/modules/sc7301-cash-register-status-reference/CashStatus';
import { detailCashRegisterStatusType } from '@/modules/sc7301-cash-register-status-reference/CashRegisterDataType';

// Constants
import {
  AUTO_CHARGE_STATUS,
  CARD_READER_STATUS,
  DATA_MASTER_STATUS,
  FAILURE_STATUS,
  PRINTER_STATUS,
  SCANNER_STATUS,
  SECOD_DISPLAY_STATUS,
  WEBCAM_STATUS,
} from '@/modules/sc7301-cash-register-status-reference/constant';
import { isNullOrEmpty } from 'app/helpers/utils';

interface DefaultModalProps {
  isEdit?: boolean;
  closeModal?: () => void;
  showModal?: boolean;
  detailCashRegisterStatus?: detailCashRegisterStatusType;
}

/**
 * Cash Register Modal Component
 *
 * @param param0
 * @returns {ReactElement} The modal for cash register status details
 */
const CashRegisterModal: React.FC<DefaultModalProps> = ({
  closeModal,
  isEdit,
  showModal,
  detailCashRegisterStatus,
}): ReactElement => {
  const [modalInfo] = useState<IModalInfo>({ isShow: false });
  const { getValues, watch } = useFormContext();
  const dataEditDefault = getValues('editDefault');

  /**
   * In case is highlight field data master status => set color text 事故: red
   */
  useEffect(() => {
    if (showModal && detailCashRegisterStatus?.isHighlight) {
      const masterStatusElement = document.querySelector('.detail-data-master-status .popover-text__content');
      if (masterStatusElement) {
        const makerValue = localizeString('cashRegisterStatus.accidentModal');
        masterStatusElement.innerHTML = masterStatusElement.innerHTML.replace(
          makerValue,
          `<span class="data-master-highlight">${makerValue}</span>`
        );
      }
    }
  }, [showModal]);

  // Determine if the update button should be disabled
  const disableUpdate = useMemo(() => {
    const item = getValues('edit');
    return (
      isEdit &&
      isEqual(item?.employeeName, dataEditDefault?.employeeName) &&
      isEqual(item?.description, dataEditDefault?.description)
    );
  }, [watch('edit.employeeName'), watch('edit.description')]);

  const convertDateFormat = (dateStr: string) => {
    if (isNullOrEmpty(dateStr)) return '';

    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土']; // Japanese weekdays
    const [year, month, day] = dateStr.split('/').map(Number);

    // Create a Date object (Note: '20' + year assumes 21st century dates)
    const date = new Date(2000 + year, month - 1, day);

    // Get the day of the week
    const dayOfWeek = daysOfWeek[date.getDay()];

    return `${dateStr}(${dayOfWeek})`;
  };

  // Function to render text based on field name
  const renderText = (item: detailCashRegisterStatusType, fieldName: string) => {
    const calcTextMethod = {
      storeCodeAndName: item?.storeCode + '：' + item?.storeName,
      dataMasterAndApplyMasterTime: `${item.applyMasterTime ?? ''} ${localizeString(
        DATA_MASTER_STATUS[item?.dataMasterStatus]?.name
      )}${item.isHighlight ? `${localizeString('cashRegisterStatus.accidentModal')}` : ''}`.trim(),
      transactionDate: convertDateFormat(item?.transactionDate),
      failureStatus: localizeString(FAILURE_STATUS[item?.failureStatus]?.name),
      autoChargeStatus: localizeString(AUTO_CHARGE_STATUS[item?.autoChargeStatus]?.name),
      scannerStatus: localizeString(SCANNER_STATUS[item?.scannerStatus]?.name),
      secondDisplayStatus: localizeString(SECOD_DISPLAY_STATUS[item?.secondDisplayStatus]?.name),
      printerStatus: localizeString(PRINTER_STATUS[item?.printerStatus]?.name),
      webcamStatus: localizeString(WEBCAM_STATUS[item?.webcamStatus]?.name),
      cardReaderStatus: localizeString(CARD_READER_STATUS[item?.cardReaderStatus]?.name),
      appliedMasterTime: item?.appliedMasterTime?.slice(0, item?.appliedMasterTime?.length - 3),
      downloadedMasterTime: item?.downloadedMasterTime?.slice(0, item?.downloadedMasterTime.length - 3),
      applyMasterTime: item?.applyMasterTime,
      downloadAppTime: item?.downloadAppTime?.slice(0, item?.downloadAppTime.length - 3),
      appliedAppTime: item?.appliedAppTime?.slice(0, item?.appliedAppTime.length - 3),
    };
    return calcTextMethod[fieldName] ?? '';
  };

  const getColorTextFailure = (type: number) => {
    const calcColorMethod = {
      0: 'success',
      1: 'warning',
    };
    return calcColorMethod[type];
  };

  const getColorText = (type: number) => {
    const calcColorMethod = {
      0: 'warning',
      1: 'success',
    };
    return calcColorMethod[type];
  };

  return (
    showModal &&
    detailCashRegisterStatus && (
      <DefaultModal
        disableConfirm={disableUpdate}
        headerType={ModalMode.Edit}
        titleModal={'label.detail'}
        cancelAction={closeModal}
      >
        <ModalCommon modalInfo={modalInfo} />

        <div className="box-container-modal">
          <div className="box-container-modal__item box-container-modal__item-left">
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.store')} // 店舗
              text={renderText(detailCashRegisterStatus, 'storeCodeAndName')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.registerNumber')} // レジ番号
              text={detailCashRegisterStatus.cashRegisterCode}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.cashRegisterType')} // レジ種別
              text={detailCashRegisterStatus.cashRegisterTypeName}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.ip')} // IP
              text={detailCashRegisterStatus.ipAddress}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.parentIP')} // 親レジIP
              text={detailCashRegisterStatus.parentIpAddress}
            />
            <PopoverLabelText
              className="detail-data-master-status"
              label={`${localizeString('cashRegisterStatus.masterDateTime')}／${localizeString('cashRegisterStatus.dataMasterStatus')}`} // マスタ更新日時／マスタ反映状況
              text={renderText(detailCashRegisterStatus, 'dataMasterAndApplyMasterTime')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.businessDate')} // 営業日
              text={renderText(detailCashRegisterStatus, 'transactionDate')}
            />
            <PopoverLabelText
              className={getColorTextFailure(detailCashRegisterStatus.failureStatus)}
              label={localizeString('cashRegisterStatus.deviceFailureStatus')} // 各周辺機器接続
              text={renderText(detailCashRegisterStatus, 'failureStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.autoChargeStatus)}`}
              label={localizeString('cashRegisterStatus.autoChangeStatus')} // 自動釣銭機接続確認
              text={renderText(detailCashRegisterStatus, 'autoChargeStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.scannerStatus)}`}
              label={localizeString('cashRegisterStatus.scannerStatus')} // スキャナー接続確認
              text={renderText(detailCashRegisterStatus, 'scannerStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.secondDisplayStatus)}`}
              label={localizeString('cashRegisterStatus.secondDisplayStatus')} // セカンドディスプレイ接続確認
              text={renderText(detailCashRegisterStatus, 'secondDisplayStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.printerStatus)}`}
              label={localizeString('cashRegisterStatus.printerStatus')} // プリンタ接続確認
              text={renderText(detailCashRegisterStatus, 'printerStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.webcamStatus)}`}
              label={localizeString('cashRegisterStatus.webcamStatus')} // ウェブカメラ接続確認
              text={renderText(detailCashRegisterStatus, 'webcamStatus')}
            />
            <PopoverLabelText
              className={`sub-label ${getColorText(detailCashRegisterStatus.cardReaderStatus)}`}
              label={localizeString('cashRegisterStatus.cardReaderStatus')} // 磁気カードリーダー接続確認
              text={renderText(detailCashRegisterStatus, 'cardReaderStatus')}
            />
          </div>
          <div className="box-container-modal__item box-container-modal__item-right">
            <div className="special-content-box">
              <span className="popover-text-label__lable">
                {localizeString('cashRegisterStatus.cashRegisterStatus')}
              </span>
              <CashStatus status={detailCashRegisterStatus.cashRegisterStatus} />
            </div>
            <div className="special-content-box">
              <span className="popover-text-label__lable">{localizeString('cashRegisterStatus.parentStatus')}</span>
              <CashStatus status={detailCashRegisterStatus.parentStatus} />
            </div>
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.startupCount')} // 起動回数
              text={detailCashRegisterStatus.startupCount}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.openCount')} // 開設回数
              text={detailCashRegisterStatus.openCount}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.lastTransactionId')} // 取引番号
              text={detailCashRegisterStatus.lastTransactionId}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.appliedMasterTime')} // 最終更新日時
              text={renderText(detailCashRegisterStatus, 'appliedMasterTime')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.downloadedMasterTime')} // マスターダウンロード日時
              text={renderText(detailCashRegisterStatus, 'downloadedMasterTime')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.downloadedMasterVersion')} // ダウンロードマスターバージョン
              text={detailCashRegisterStatus.downloadedMasterVersion}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.applyMasterTime')} // マスタ更新日時
              text={renderText(detailCashRegisterStatus, 'applyMasterTime')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.appliedMasterVersion')} // 反映済みマスターバージョン
              text={detailCashRegisterStatus.appliedMasterVersion}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.downloadedAppVersion')} // ダウンロードモジュールバージョン
              text={detailCashRegisterStatus.downloadedAppVersion}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.downloadAppTime')} // モジュールダウンロード日時
              text={renderText(detailCashRegisterStatus, 'downloadAppTime')}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.appliedAppVersion')}
              text={detailCashRegisterStatus.appliedAppVersion}
            />
            <PopoverLabelText
              label={localizeString('cashRegisterStatus.appliedAppTime')} // モジュールアップデート日時
              text={renderText(detailCashRegisterStatus, 'appliedAppTime')}
            />
          </div>
        </div>
      </DefaultModal>
    )
  );
};

export default CashRegisterModal;
