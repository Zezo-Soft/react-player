import React from "react";
import { FaCheck } from "react-icons/fa";

export interface Subtitle {
  label: string;
  lang: string;
  url: string;
}

interface SubtitleSelectorProps {
  subtitles: Subtitle[];
  activeSubtitle: Subtitle | null;
  setActiveSubtitle: (subtitle: Subtitle | null) => void;
}

const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles,
  activeSubtitle,
  setActiveSubtitle,
}) => {
  return (
    <div>
      <p className="font-semibold mb-1 px-3 py-1 text-gray-700">Subtitles</p>
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setActiveSubtitle(null)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
            !activeSubtitle ? "bg-green-100 font-semibold" : ""
          }`}
        >
          {!activeSubtitle && <FaCheck className="text-green-500" />}
          Off
        </button>
        {subtitles?.map((subtitle, index) => (
          <button
            key={index}
            onClick={() => setActiveSubtitle(subtitle)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors ${
              activeSubtitle?.label === subtitle.label
                ? "bg-green-100 font-semibold"
                : ""
            }`}
          >
            {activeSubtitle?.label === subtitle.label && (
              <FaCheck className="text-green-500" />
            )}
            {subtitle.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubtitleSelector;
