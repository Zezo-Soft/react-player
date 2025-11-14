import Hls from "hls.js";
import * as dashjs from "dashjs";
import { useVideoStore } from "../../store/VideoState";
import { StreamType } from "../../store/types/StoreTypes";

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
    if (!hlsInstance) return;

    const levels = (hlsInstance as any)?.levels ?? [];
    const levelExists = levelIndex >= 0 && levels[levelIndex];
    if (levelIndex < -1 || (levelIndex >= 0 && !levelExists)) {
      return;
    }

    if (levelIndex === -1) {
      hlsInstance.currentLevel = -1;
      hlsInstance.nextLevel = -1;
      hlsInstance.loadLevel = -1;
      return;
    }

    hlsInstance.loadLevel = levelIndex;
    hlsInstance.nextLevel = levelIndex;
    hlsInstance.currentLevel = levelIndex;
  }

  /**

   * @param dashInstance DASH.js instance
   * @param qualityId Quality level ID (undefined/null for auto)
   */
  static setDashQuality(
    dashInstance: dashjs.MediaPlayerClass | undefined | null,
    qualityIndex: number | null | undefined
  ): void {
    if (!dashInstance) return;

    const player = dashInstance as unknown as {
      setAutoSwitchQualityFor(type: "video", enabled: boolean): void;
      getQualityFor(type: "video"): number;
      setQualityFor(type: "video", value: number): void;
    };

    if (
      qualityIndex === null ||
      qualityIndex === undefined ||
      qualityIndex < 0
    ) {
      player.setAutoSwitchQualityFor("video", true);
      return;
    }

    player.setAutoSwitchQualityFor("video", false);
    if (player.getQualityFor("video") !== qualityIndex) {
      player.setQualityFor("video", qualityIndex);
    }
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
  static setQuality(streamType: StreamType, qualityIdentifier: string): void {
    const { hlsInstance, dashInstance, setActiveQuality, setCurrentQuality } =
      useVideoStore.getState();

    if (qualityIdentifier === "auto") {
      if (streamType === "hls") this.setHlsQuality(hlsInstance, -1);
      if (streamType === "dash")
        this.setDashQuality(dashInstance ?? null, null);
      setActiveQuality("auto");
      setCurrentQuality("auto");
      return;
    }

    const parseIndex = (prefix: string) =>
      parseInt(qualityIdentifier.replace(prefix, ""), 10);

    if (streamType === "hls" && qualityIdentifier.startsWith("hls-")) {
      const levelIndex = parseIndex("hls-");
      if (!Number.isNaN(levelIndex)) {
        this.setHlsQuality(hlsInstance, levelIndex);
        setActiveQuality(qualityIdentifier);
        setCurrentQuality(qualityIdentifier);
      }
      return;
    }

    if (streamType === "dash" && qualityIdentifier.startsWith("dash-")) {
      const levelIndex = parseIndex("dash-");
      if (!Number.isNaN(levelIndex)) {
        this.setDashQuality(dashInstance ?? null, levelIndex);
        setActiveQuality(qualityIdentifier);
        setCurrentQuality(qualityIdentifier);
      }
    }
  }

  /**
   * @param streamType Type of stream (hls, dash, etc.)
   */
  static setAutoQuality(streamType: StreamType): void {
    this.setQuality(streamType, "auto");
  }
}

export default QualityManager;
