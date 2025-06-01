import React, {ReactNode} from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: React.MouseEventHandler<HTMLDivElement>;
    children: ReactNode;
}

function Modal({isOpen, onClose, children}: ModalProps) {
    return (
        <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50`}>
            <div className="relative top-20 mx-auto p-5 border w-[90%] shadow-lg rounded-md bg-white">
                <div className="flex justify-end hover:text-blue-500">
                    <div
                        className="text-2xl text-black bg-transparent -my-[10px] cursor-pointer"
                        onClick={onClose}>
                        &times;
                    </div>
                </div>
                <div className="mt-3">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;