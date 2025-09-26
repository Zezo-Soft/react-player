import React from "react";
import { FaCheck } from "react-icons/fa";

interface SpeedSelectorProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  speed,
  onSpeedChange,
}) => {
  return (
    <div>
      <p className="font-semibold mb-1 px-3 py-1 text-gray-700">Speed</p>
      <div className="flex flex-col gap-1">
        {[0.5, 1, 1.5, 2].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
              speed === s ? "bg-green-100 font-semibold" : ""
            }`}
          >
            {speed === s && <FaCheck className="text-green-500" />}
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedSelector;
