import Hls from 'hls.js';
import * as dashjs from 'dashjs';
import { useVideoStore } from '../../store/VideoState';

export type StreamType = 'hls' | 'dash' | 'mp4' | 'other';

/**
 * Video Quality Management Utility
 * Provides a unified interface for quality switching across HLS.js and DASH.js
 * 
 * This utility follows OTT-grade best practices for smooth quality switching:
 * - Immediate quality changes without playback interruption
 * - Proper ABR (Adaptive Bitrate) control
 * - Error handling and fallback mechanisms
 * - Support for both manual and auto quality modes
 */
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
  static setHlsQuality(hlsInstance: Hls | null | undefined, levelIndex: number): void {
    // If hlsInstance is undefined, it means it's not available
    if (hlsInstance === undefined) {
      console.warn('HLS instance not available for quality setting');
      return;
    }
    
    // For native HLS, we can't control quality directly
    // In a real implementation, you would need to provide different HLS streams
    // For now, we'll log that quality switching isn't supported for native HLS
    if (hlsInstance === null) {
      console.warn('⚠️ Quality switching not supported for native HLS. Provide separate HLS streams for different qualities.');
      return;
    }
    
    try {
      // Validate level index
      if (levelIndex < -1 || (levelIndex >= 0 && !(hlsInstance as any).levels?.[levelIndex])) {
        console.warn('Invalid HLS quality level index:', levelIndex);
        return;
      }
      
      // For auto quality, enable ABR and reset capping
      if (levelIndex === -1) {
        hlsInstance.currentLevel = -1;
        hlsInstance.autoLevelCapping = -1;
        hlsInstance.nextLevel = -1;
        console.log('✅ HLS quality set to auto (ABR enabled)');
      } else {
        // For manual quality, set the level and cap ABR to prevent switching
        // This ensures the selected quality is maintained
        hlsInstance.currentLevel = levelIndex;
        hlsInstance.autoLevelCapping = levelIndex;
        hlsInstance.nextLevel = levelIndex;
        console.log('✅ HLS quality set to level:', levelIndex, (hlsInstance as any).levels?.[levelIndex]);
      }
    } catch (error) {
      console.error('❌ Error setting HLS quality:', error);
    }
  }

  /**
   * Set video quality for DASH streams with OTT-grade smoothness
   * 
   * Best practices implemented:
   * 1. Use autoSwitchBitrate settings to control ABR behavior
   * 2. Use setRepresentationForTypeById for immediate quality change
   * 3. Handle representation discovery and selection properly
   * 4. Provide visual feedback through console logs
   * 
   * @param dashInstance DASH.js instance
   * @param qualityId Quality level ID (undefined/null for auto)
   */
  static setDashQuality(dashInstance: dashjs.MediaPlayerClass, qualityId: string | null | undefined): void {
    if (!dashInstance) {
      console.warn('DASH instance not available for quality setting');
      return;
    }
    
    try {
      // Enable auto quality switching (ABR)
      if (!qualityId) {
        dashInstance.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: { audio: true, video: true }
            }
          }
        });
        console.log('✅ DASH quality set to auto (ABR enabled)');
      } else {
        // Disable auto switching for video and set specific quality
        dashInstance.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: { audio: true, video: false }
            }
          }
        });
        
        // Get available representations and find the target one
        const representations = (dashInstance as any).getRepresentationsByType('video');
        if (!representations || !representations.length) {
          console.warn('No DASH video representations available');
          return;
        }
        
        const targetRepresentation = representations.find((rep: any) => rep.id === qualityId);
        if (!targetRepresentation) {
          console.warn('Target DASH representation not found:', qualityId);
          return;
        }
        
        // Set the specific quality representation
        (dashInstance as any).setRepresentationForTypeById('video', targetRepresentation.id);
        console.log('✅ DASH quality set to representation:', targetRepresentation.id, targetRepresentation);
      }
    } catch (error) {
      console.error('❌ Error setting DASH quality:', error);
    }
  }

  /**
   * Get available quality levels for HLS with proper error handling
   * 
   * @param hlsInstance HLS.js instance
   * @returns Array of quality level objects
   */
  static getHlsQualityLevels(hlsInstance: Hls): Array<{ height: number; bitrate?: number; originalIndex: number }> {
    if (!hlsInstance || !(hlsInstance as any).levels) {
      return [];
    }
    
    try {
      return (hlsInstance as any).levels.map((level: any, index: number) => ({
        height: level.height || 0,
        bitrate: level.bitrate || 0,
        originalIndex: index
      }));
    } catch (error) {
      console.error('Error getting HLS quality levels:', error);
      return [];
    }
  }

  /**
   * Get available quality levels for DASH with proper error handling
   * 
   * @param dashInstance DASH.js instance
   * @returns Array of quality level objects
   */
  static getDashQualityLevels(dashInstance: dashjs.MediaPlayerClass): Array<{ height: number; bitrate?: number; id: string }> {
    if (!dashInstance) {
      return [];
    }
    
    try {
      const representations = (dashInstance as any).getRepresentationsByType('video');
      if (!representations || !representations.length) {
        return [];
      }
      
      return representations.map((rep: any) => ({
        height: rep.height || Math.round(rep.bandwidth / 1000) || 0, // Approximate height from bitrate
        bitrate: rep.bandwidth,
        id: rep.id
      }));
    } catch (error) {
      console.error('Error getting DASH quality levels:', error);
      return [];
    }
  }

  /**
   * Unified quality setting function that works with both HLS and DASH
   * Provides a single interface for quality management across streaming technologies
   * 
   * @param streamType Type of stream (hls, dash, etc.)
   * @param qualityIdentifier Quality level identifier (index for HLS, ID for DASH)
   */
  static setQuality(streamType: StreamType, qualityIdentifier: string | number): void {
    const { hlsInstance, dashInstance, setActiveQuality } = useVideoStore.getState();
    
    try {
      switch (streamType) {
        case 'hls':
          if (typeof qualityIdentifier === 'string') {
            const levelIndex = qualityIdentifier === 'auto' ? -1 : parseInt(qualityIdentifier, 10);
            if (!isNaN(levelIndex)) {
              this.setHlsQuality(hlsInstance, levelIndex);
              setActiveQuality(qualityIdentifier);
            }
          } else if (typeof qualityIdentifier === 'number') {
            this.setHlsQuality(hlsInstance, qualityIdentifier);
            setActiveQuality(qualityIdentifier === -1 ? 'auto' : qualityIdentifier.toString());
          }
          break;
          
        case 'dash':
          if (typeof qualityIdentifier === 'string') {
            this.setDashQuality(dashInstance!, qualityIdentifier === 'auto' ? null : qualityIdentifier);
            setActiveQuality(qualityIdentifier);
          } else if (typeof qualityIdentifier === 'number') {
            // For DASH, we should use string IDs, but handle numbers as auto
            this.setDashQuality(dashInstance!, null);
            setActiveQuality('auto');
          }
          break;
          
        default:
          console.warn('Unsupported stream type for quality setting:', streamType);
      }
    } catch (error) {
      console.error('Error setting video quality:', error);
    }
  }

  /**
   * Enable auto quality switching for the current stream type
   * 
   * @param streamType Type of stream (hls, dash, etc.)
   */
  static setAutoQuality(streamType: StreamType): void {
    this.setQuality(streamType, 'auto');
  }
}

export default QualityManager;