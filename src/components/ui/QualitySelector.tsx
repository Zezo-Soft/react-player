import Hls, { Level } from "hls.js";
import React from "react";
import { FaCheck } from "react-icons/fa";

export interface QualitySelectorProps {
  qualityLevels?: Level[];
  activeQuality: string;
  setActiveQuality: (quality: string) => void;
  hlsInstance: Hls;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
  qualityLevels,
  activeQuality,
  setActiveQuality,
  hlsInstance,
}) => {
  return (
    <div>
      <p className="font-semibold mb-1 px-3 py-1 text-gray-700">Quality</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => {
            if (hlsInstance) {
              hlsInstance.currentLevel = -1;
              setActiveQuality("auto");
            }
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
            activeQuality === "auto" ? "bg-green-100 font-semibold" : ""
          }`}
        >
          {activeQuality === "auto" && <FaCheck className="text-green-500" />}
          Auto
        </button>

        {qualityLevels
          ?.filter((level) => level.height > 0)
          .map((level, index) => (
            <button
              key={index}
              onClick={() => {
                if (hlsInstance) {
                  hlsInstance.currentLevel = index;
                  setActiveQuality(String(level.height));
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
                activeQuality === String(level.height)
                  ? "bg-green-100 font-semibold"
                  : ""
              }`}
            >
              {activeQuality === String(level.height) && (
                <FaCheck className="text-green-500" />
              )}
              {level.height}p
            </button>
          ))
          .reverse()}
      </div>
    </div>
  );
};

export default QualitySelector;
