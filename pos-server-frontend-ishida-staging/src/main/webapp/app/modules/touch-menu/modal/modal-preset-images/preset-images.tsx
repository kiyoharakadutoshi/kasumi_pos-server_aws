import React, { useEffect, useState } from 'react';
import './preset-image.scss';
import { PresetImage } from '../../detail/reducer/preset-reducer';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { NegativeButton, NormalButton } from 'app/components/button/flat-button/flat-button';
import PopoverText from 'app/components/popover/popover';
import { localizeString } from 'app/helpers/utils';

interface ModalPresetImages {
  presetImages?: PresetImage[];
  closeModal?: (presetImage?: PresetImage) => void;
}

export const ModalPresetImage: React.FC<ModalPresetImages> = ({ presetImages, closeModal }) => {
  const [selectedImage, setSelectedImage] = useState<PresetImage | null>(null);

  const handleImageClick = (image: PresetImage) => {
    setSelectedImage(image);
  };

  const handleKeyPress = (event: React.KeyboardEvent, image: PresetImage) => {
    if (event.key === ' ') {
      event.preventDefault();
      handleImageClick(image);
    }
  };

  const handleDecide = () => {
    closeModal(selectedImage);
  };



  return (
    <DefaultModal
      headerType={ModalMode.Add}
      addHorizontalPadding={false}
      scrollModal={false}
      confirmAction={handleDecide}
      cancelAction={closeModal}
      confirmTitle={localizeString('action.decide')}
      titleModal={"画像選択"}
    >
      <div className={'modal-preset-image'}>
        <div className={'modal-preset-image__list-image'}>
          {presetImages?.map((image, index) => (
            <div
              key={index}
              className={`modal-preset-image__image-container ${selectedImage === image ? 'modal-preset-image__image-selected' : ''}`}
              onClick={() => handleImageClick(image)}
              onKeyDown={(event) => handleKeyPress(event, image)}
              tabIndex={3}
            >
              <div className="modal-preset-image__image-item">
                <a target="_blank" rel="noopener noreferrer">
                  <img src={image.image_url} alt={image.file_name} className="modal-preset-image__image-item__image" />
                </a>
              </div>
              <PopoverText text={image.file_name} lineLimit={2} lineHeight={35} />
            </div>
          ))}
        </div>
      </div>
    </DefaultModal>
  );
};

export default ModalPresetImage;
