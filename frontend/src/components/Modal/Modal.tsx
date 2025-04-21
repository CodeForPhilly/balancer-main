import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: React.MouseEventHandler<SVGElement>;
  children: ReactNode;
}

function Modal ({ isOpen, onClose, children }: ModalProps) {
  return (
    <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50`}>
      <div className="relative top-20 mx-auto p-5 border w-[90%] shadow-lg rounded-md bg-white">
        <div className="flex justify-end hover:text-blue-500">
          <FaTimes onClick={onClose} />
        </div>
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;