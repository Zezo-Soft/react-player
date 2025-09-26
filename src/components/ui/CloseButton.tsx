import React from "react";
import { IoMdClose } from "react-icons/io";
import Tooltip from "../../components/ui/tooltip";

interface CloseButtonProps {
  onClose: () => void;
  iconClassName: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClose,
  iconClassName,
}) => {
  return (
    <>
      <div className="w-[2px] h-10 bg-gray-500 hover:bg-gray-300 transition-colors duration-200 mx-2" />
      <div onClick={onClose}>
        <Tooltip title="Close">
          <IoMdClose className={iconClassName} />
        </Tooltip>
      </div>
    </>
  );
};

export default CloseButton;
