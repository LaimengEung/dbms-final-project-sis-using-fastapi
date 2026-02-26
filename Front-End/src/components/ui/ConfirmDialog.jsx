import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  size = 'sm'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size}>
      <Modal.Header>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </Modal.Header>
      
      <Modal.Body>
        <p className="text-gray-600">{message}</p>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button 
          variant={confirmVariant} 
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;