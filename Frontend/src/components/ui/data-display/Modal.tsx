import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // if (isOpen) {
    //   document.addEventListener('keydown', handleEscape);
    //   document.body.style.overflow = 'hidden';
    // }

    // return () => {
    //   document.removeEventListener('keydown', handleEscape);
    //   document.body.style.overflow = 'unset';
    // };

    if (!isOpen) {
      return;
    }

    document.addEventListener('keydown', handleEscape);

    // Preserve previous styles to restore exactly on close
    const bodyStyle = document.body.style;
    const previousOverflow = bodyStyle.overflow;
    const previousPaddingRight = bodyStyle.paddingRight;

    // Compensate for disappearing scrollbar to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    bodyStyle.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      bodyStyle.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      bodyStyle.overflow = previousOverflow;
      bodyStyle.paddingRight = previousPaddingRight;
    };

  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden`}
      >
        {/* Nội dung có thể cuộn */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>

  );

};

export default Modal;
