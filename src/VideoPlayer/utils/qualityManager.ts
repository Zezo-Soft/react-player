import Hls from "hls.js";
import * as dashjs from "dashjs";
import { useVideoStore } from "../../store/VideoState";

export type StreamType = "hls" | "dash" | "mp4" | "other";

export class QualityManager {
  /**
   * Set video quality for HLS streams with OTT-grade smoothness
   *
   * Best practices implemented:
   * 1. Use currentLevel for immediate quality change
   * 2. Use autoLevelCapping to prevent ABR from switching back
   * 3. Use nextLevel to ensure next segment uses selected quality
   * 4. Handle edge cases and errors gracefully
   *
   * @param hlsInstance HLS.js instance (null for native HLS, undefined when not available)
   * @param levelIndex Quality level index (-1 for auto)
   */
  static setHlsQuality(
    hlsInstance: Hls | null | undefined,
    levelIndex: number
  ): void {
    if (hlsInstance === undefined) {
      return;
    }

    if (hlsInstance === null) {
      return;
    }

    try {
      if (
        levelIndex < -1 ||
        (levelIndex >= 0 && !(hlsInstance as any).levels?.[levelIndex])
      ) {
        return;
      }

      if (levelIndex === -1) {
        hlsInstance.currentLevel = -1;
        hlsInstance.autoLevelCapping = -1;
        hlsInstance.nextLevel = -1;
      } else {
        hlsInstance.currentLevel = levelIndex;
        hlsInstance.autoLevelCapping = levelIndex;
        hlsInstance.nextLevel = levelIndex;
      }
    } catch (_error) {}
  }

  /**

   * @param dashInstance DASH.js instance
   * @param qualityId Quality level ID (undefined/null for auto)
   */
  static setDashQuality(
    dashInstance: dashjs.MediaPlayerClass,
    qualityId: string | null | undefined
  ): void {
    if (!dashInstance) {
      return;
    }

    try {
      if (!qualityId) {
        dashInstance.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: { audio: true, video: true },
            },
          },
        });
      } else {
        dashInstance.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: { audio: true, video: false },
            },
          },
        });

        const representations = (dashInstance as any).getRepresentationsByType(
          "video"
        );
        if (!representations || !representations.length) {
          return;
        }

        const targetRepresentation = representations.find(
          (rep: any) => rep.id === qualityId
        );
        if (!targetRepresentation) {
          return;
        }

        (dashInstance as any).setRepresentationForTypeById(
          "video",
          targetRepresentation.id
        );
      }
    } catch (_error) {}
  }

  /**
   * @param hlsInstance HLS.js instance
   * @returns Array of quality level objects
   */
  static getHlsQualityLevels(
    hlsInstance: Hls
  ): Array<{ height: number; bitrate?: number; originalIndex: number }> {
    if (!hlsInstance || !(hlsInstance as any).levels) {
      return [];
    }

    try {
      return (hlsInstance as any).levels.map((level: any, index: number) => ({
        height: level.height || 0,
        bitrate: level.bitrate || 0,
        originalIndex: index,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * @param dashInstance DASH.js instance
   * @returns Array of quality level objects
   */
  static getDashQualityLevels(
    dashInstance: dashjs.MediaPlayerClass
  ): Array<{ height: number; bitrate?: number; id: string }> {
    if (!dashInstance) {
      return [];
    }

    try {
      const representations = (dashInstance as any).getRepresentationsByType(
        "video"
      );
      if (!representations || !representations.length) {
        return [];
      }

      return representations.map((rep: any) => ({
        height: rep.height || Math.round(rep.bandwidth / 1000) || 0,
        bitrate: rep.bandwidth,
        id: rep.id,
      }));
    } catch (_error) {
      return [];
    }
  }

  /**
   * @param streamType Type of stream (hls, dash, etc.)
   * @param qualityIdentifier Quality level identifier (index for HLS, ID for DASH)
   */
  static setQuality(
    streamType: StreamType,
    qualityIdentifier: string | number
  ): void {
    const { hlsInstance, dashInstance, setActiveQuality } =
      useVideoStore.getState();

    try {
      switch (streamType) {
        case "hls":
          if (typeof qualityIdentifier === "string") {
            const levelIndex =
              qualityIdentifier === "auto"
                ? -1
                : parseInt(qualityIdentifier, 10);
            if (!isNaN(levelIndex)) {
              this.setHlsQuality(hlsInstance, levelIndex);
              setActiveQuality(qualityIdentifier);
            }
          } else if (typeof qualityIdentifier === "number") {
            this.setHlsQuality(hlsInstance, qualityIdentifier);
            setActiveQuality(
              qualityIdentifier === -1 ? "auto" : qualityIdentifier.toString()
            );
          }
          break;

        case "dash":
          if (typeof qualityIdentifier === "string") {
            this.setDashQuality(
              dashInstance!,
              qualityIdentifier === "auto" ? null : qualityIdentifier
            );
            setActiveQuality(qualityIdentifier);
          } else if (typeof qualityIdentifier === "number") {
            this.setDashQuality(dashInstance!, null);
            setActiveQuality("auto");
          }
          break;

        default:
          return;
      }
    } catch (_error) {}
  }

  /**
   * @param streamType Type of stream (hls, dash, etc.)
   */
  static setAutoQuality(streamType: StreamType): void {
    this.setQuality(streamType, "auto");
  }
}

export default QualityManager;
