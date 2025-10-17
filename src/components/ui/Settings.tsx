import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import Popover from "../ui/Popover";
import { Settings as SettingsIcon } from "lucide-react";
import Tooltip from "../ui/tooltip";
import { useVideoStore } from "../../store/VideoState";

interface SettingsProps {
  iconClassName: string;
}

const Settings: React.FC<SettingsProps> = ({ iconClassName }) => {
  const {
    qualityLevels,
    hlsInstance,
    setActiveQuality,
    activeQuality,
    subtitles,
    activeSubtitle,
    setActiveSubtitle,
    videoRef,
  } = useVideoStore();

  const [speed, setSpeed] = React.useState(1);
  const [activeMenu, setActiveMenu] = React.useState<
    "main" | "quality" | "subtitles" | "speed"
  >("main");

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef) {
      videoRef.playbackRate = newSpeed;
    }
  };

  const uniqueQualityLevels = React.useMemo(() => {
    if (!qualityLevels)
      return [] as Array<{
        height: number;
        bitrate?: number;
        originalIndex: number;
      }>;
    const seenHeights = new Set<number>();
    const unique: Array<{
      height: number;
      bitrate?: number;
      originalIndex: number;
    }> = [];
    qualityLevels.forEach((level, originalIndex) => {
      if (seenHeights.has(level.height)) return;
      seenHeights.add(level.height);
      unique.push({
        height: level.height,
        bitrate: level.bitrate,
        originalIndex,
      });
    });
    return unique;
  }, [qualityLevels]);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const handleBack = () => setActiveMenu("main");

  // Get quality label for display
  const getQualityLabel = () => {
    if (activeQuality === "auto") return "Auto";
    const level = uniqueQualityLevels.find(
      (l) => String(l.height) === activeQuality
    );
    return level ? `${level.height}p` : "Auto";
  };

  // Get quality label: show explicit resolution to avoid duplicates
  const getQualityName = (height: number) => {
    if (!height || height <= 0) return "Auto";
    return `${height}p`;
  };

  // Get estimated data usage using bitrate when available
  const getDataUsage = (height: number, bitrate?: number) => {
    // bitrate in bits/sec -> GB/hour
    if (bitrate && bitrate > 0) {
      const gbPerHour = (bitrate * 3600) / 8 / 1e9;
      const rounded = gbPerHour.toFixed(2);
      return `Uses about ${rounded} GB per hour`;
    }
    // Fallback by resolution when bitrate missing
    if (height >= 2160) return "Uses about 7.00 GB per hour";
    if (height >= 1440) return "Uses about 3.50 GB per hour";
    if (height >= 1080) return "Uses about 2.50 GB per hour";
    if (height >= 720) return "Uses about 1.00 GB per hour";
    if (height >= 480) return "Uses about 0.70 GB per hour";
    if (height >= 360) return "Uses about 0.50 GB per hour";
    return "Uses about 0.30 GB per hour";
  };

  return (
    <Tooltip title="Settings">
      <Popover
        button={<SettingsIcon className={iconClassName} />}
        align="center"
      >
        <div className="bg-[#3a4049] text-white rounded-[7px] w-80 overflow-hidden">
          {/* Main Menu */}
          {activeMenu === "main" && (
            <div className="p-4">
              <h3 className="text-white font-bold text-xl mb-4">Settings</h3>
              <p className="text-gray-300 text-sm mb-4">Customize playback</p>

              <div className="space-y-0 border-t border-gray-600">
                {/* Quality Option */}
                <button
                  onClick={() => setActiveMenu("quality")}
                  className="w-full flex items-center justify-between py-4 border-b border-gray-600 rounded-[5px] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">Quality</div>
                      <div className="text-gray-400 text-sm">
                        {getQualityLabel()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                {/* Subtitles Option */}
                <button
                  onClick={() => setActiveMenu("subtitles")}
                  className="w-full flex items-center justify-between py-4 border-b border-gray-600 rounded-[5px] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">Subtitles</div>
                      <div className="text-gray-400 text-sm">
                        {!activeSubtitle ? "Off" : activeSubtitle.label}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                {/* Speed Option */}
                <button
                  onClick={() => setActiveMenu("speed")}
                  className="w-full flex items-center justify-between py-4 rounded-[5px] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">Speed</div>
                      <div className="text-gray-400 text-sm">{speed}x</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Quality Menu */}
          {activeMenu === "quality" && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-md transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white rotate-180" />
                </button>
                <h3 className="text-white font-bold text-xl">Video Quality</h3>
              </div>

              <div className="space-y-3">
                {/* Auto Quality */}
                <button
                  onClick={() => {
                    if (hlsInstance) {
                      hlsInstance.currentLevel = -1;
                      setActiveQuality("auto");
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all ${
                    activeQuality === "auto"
                      ? "bg-white/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold text-lg mb-1">
                        Auto
                      </div>
                      <div className="text-gray-400 text-sm">
                        Adjust to your connection
                      </div>
                    </div>
                    {activeQuality === "auto" && (
                      <Check className="w-6 h-6 text-white mt-1" />
                    )}
                  </div>
                </button>

                {/* Quality Levels */}
                {uniqueQualityLevels
                  .map((level) => (
                    <button
                      key={level.originalIndex}
                      onClick={() => {
                        if (hlsInstance) {
                          hlsInstance.currentLevel = level.originalIndex;
                          setActiveQuality(String(level.height));
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-md transition-all ${
                        activeQuality === String(level.height)
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-semibold text-lg mb-1">
                            {getQualityName(level.height)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {getDataUsage(level.height, level.bitrate)}
                          </div>
                        </div>
                        {activeQuality === String(level.height) && (
                          <Check className="w-6 h-6 text-white mt-1" />
                        )}
                      </div>
                    </button>
                  ))
                  .reverse()}
              </div>
            </div>
          )}

          {/* Subtitles Menu */}
          {activeMenu === "subtitles" && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white rotate-180" />
                </button>
                <h3 className="text-white font-bold text-xl">Subtitles</h3>
              </div>

              <div className="space-y-3">
                {/* Off Option */}
                <button
                  onClick={() => setActiveSubtitle(null)}
                  className={`w-full text-left px-4 py-3 rounded-[5px] transition-all flex items-center justify-between ${
                    !activeSubtitle ? "bg-[#454545]" : ""
                  }`}
                >
                  <span className="text-white font-semibold text-lg">Off</span>
                  {!activeSubtitle && <Check className="w-6 h-6 text-white" />}
                </button>

                {/* Subtitle Options */}
                {subtitles?.map((subtitle, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSubtitle(subtitle)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all flex items-center justify-between ${
                      activeSubtitle?.label === subtitle.label
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className="text-white font-semibold text-lg">
                      {subtitle.label}
                    </span>
                    {activeSubtitle?.label === subtitle.label && (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speed Menu */}
          {activeMenu === "speed" && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white rotate-180" />
                </button>
                <h3 className="text-white font-bold text-xl">Playback Speed</h3>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`w-full text-left px-4 py-3 rounded-[5px] transition-all flex items-center justify-between ${
                      speed === s ? "bg-[#454545]" : ""
                    }`}
                  >
                    <span className="text-white font-semibold text-lg">
                      {s === 1 ? "Normal" : `${s}x`}
                    </span>
                    {speed === s && <Check className="w-6 h-6 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Popover>
    </Tooltip>
  );
};

export default Settings;
