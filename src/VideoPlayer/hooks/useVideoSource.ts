import { useEffect } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { useVideoStore } from "../../store/VideoState";
import { getExtensionFromUrl } from "../utils";
import { StreamType } from "../utils/qualityManager";

/**
 * Video Source Hook
 * 
 * Manages video source loading and streaming technology detection
 * Supports HLS.js, DASH.js, and native HTML5 video
 * 
 * Features:
 * - Automatic stream type detection
 * - HLS.js fallback for older browsers
 * - DASH.js support with proper initialization
 * - Quality level extraction for all stream types
 * - Error handling and cleanup
 */
export const useVideoSource = (
  trackSrc: string,
  type?: "hls" | "mp4" | "dash" | "other" | "youtube" | undefined
) => {
  const { videoRef, setQualityLevels, setHlsInstance, setDashInstance, setStreamType } = useVideoStore();

  useEffect(() => {
    if (!videoRef) return;

    const getVideoExtension = getExtensionFromUrl(trackSrc);
    const contentType = type || getVideoExtension;

    // Set stream type in store for quality manager
    setStreamType(contentType as StreamType);

    // Handle MP4 and other simple formats
    if (contentType === "mp4" || contentType === "other") {
      videoRef.src = trackSrc;
      setQualityLevels([]);
      return;
    }

    // Handle HLS streams
    if (contentType === "hls") {
      // Native HLS support (Safari/iOS)
      if (videoRef?.canPlayType("application/vnd.apple.mpegurl")) {
        console.log('📱 Using native HLS support');
        videoRef.src = trackSrc;
        
        // For native HLS, we can't control quality directly, but we can still extract info
        const handleLoadedMetadata = () => {
          const videoElement = videoRef as any;
          if (videoElement.videoTracks && videoElement.videoTracks.length > 0) {
            // Extract quality levels from native HLS
            const tracks = Array.from(videoElement.videoTracks).map((track: any, index: number) => ({
              height: track.height || 720,
              bitrate: track.bandwidth || 0,
              originalIndex: index
            }));
            setQualityLevels(tracks);
            console.log('✅ Native HLS quality levels:', tracks);
          } else {
            // Fallback quality levels for native HLS
            const defaultLevels = [
              { height: 360, bitrate: 800000, originalIndex: 0 },
              { height: 480, bitrate: 1400000, originalIndex: 1 },
              { height: 720, bitrate: 2800000, originalIndex: 2 },
              { height: 1080, bitrate: 5000000, originalIndex: 3 },
            ];
            setQualityLevels(defaultLevels);
            console.log('✅ Native HLS fallback quality levels:', defaultLevels);
          }
          
          // Even for native HLS, set a mock HLS instance to indicate it's HLS
          // This allows the quality manager to know we're dealing with HLS
          setHlsInstance(null as any); // null indicates native HLS, not HLS.js
        };

        videoRef.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        return () => {
          videoRef.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
      } 
      // HLS.js support (Chrome/Firefox/etc)
      else if (Hls.isSupported()) {
        console.log('🔧 Using HLS.js for HLS streaming');
        const hls = new Hls({
          // HLS.js configuration for optimal performance
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hls.loadSource(trackSrc);
        hls.attachMedia(videoRef as HTMLMediaElement);
        console.log('✅ HLS.js instance created and attached');
        setHlsInstance(hls);
        
        // Extract quality levels when manifest is parsed
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({
            height: level.height,
            bitrate: level.bitrate,
            originalIndex: index
          }));
          setQualityLevels(levels);
          console.log('✅ HLS.js quality levels:', levels);
        });
        
        // Log level switches for debugging
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log('🔄 HLS level switched to:', data.level, hls.levels?.[data.level]);
        });
        
        // Error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('❌ HLS.js error:', data);
        });

        // Cleanup
        return () => {
          hls.destroy();
          console.log('🧹 HLS.js instance destroyed');
        };
      } else {
        // Fallback when HLS.js is not supported
        console.log('📱 Using fallback HLS (direct src)');
        videoRef.src = trackSrc;
        setHlsInstance(null as any); // null indicates native HLS fallback
        
        // Set fallback quality levels
        const defaultLevels = [
          { height: 360, bitrate: 800000, originalIndex: 0 },
          { height: 480, bitrate: 1400000, originalIndex: 1 },
          { height: 720, bitrate: 2800000, originalIndex: 2 },
          { height: 1080, bitrate: 5000000, originalIndex: 3 },
        ];
        setQualityLevels(defaultLevels);
        console.log('✅ HLS fallback quality levels:', defaultLevels);
      }
    } 
    // Handle DASH streams
    else if (contentType === "dash") {
      // DASH.js support
      if (dashjs.supportsMediaSource()) {
        console.log('🔧 Using DASH.js for DASH streaming');
        const player = dashjs.MediaPlayer().create();
        
        // DASH.js configuration for optimal performance
        player.updateSettings({
          streaming: {
            buffer: {
              fastSwitchEnabled: true, // Enable fast quality switching
              bufferTimeAtTopQuality: 30, // Buffer 30s at top quality
              bufferTimeAtTopQualityLongForm: 60 // Buffer 60s for long content
            },
            // Note: Some ABR settings may vary by DASH.js version
            // Check documentation for your specific version
          }
        });
        
        player.initialize(videoRef as HTMLMediaElement, trackSrc, true);
        console.log('✅ DASH.js instance created and initialized');
        setDashInstance(player);
        
        // Extract quality levels when manifest is loaded
        const handleManifestLoaded = () => {
          try {
            const representations = (player as any).getRepresentationsByType('video');
            if (representations && representations.length > 0) {
              const levels = representations.map((rep: any, index: number) => ({
                height: rep.height || Math.round(rep.bandwidth / 1000) || 0,
                bitrate: rep.bandwidth,
                originalIndex: index,
                id: rep.id
              }));
              setQualityLevels(levels);
              console.log('✅ DASH.js quality levels:', levels);
            } else {
              console.warn('⚠️ No DASH video representations found');
              setQualityLevels([]);
            }
          } catch (error) {
            console.error('❌ Error getting DASH quality levels:', error);
            setQualityLevels([]);
          }
        };
        
        // Listen for manifest loaded event
        player.on('manifestLoaded' as any, handleManifestLoaded);
        
        // Log quality changes for debugging
        player.on('qualityChange' as any, (e: any) => {
          console.log('🔄 DASH quality changed to:', e.newQuality, e);
        });
        
        // Error handling
        player.on('error' as any, (e: any) => {
          console.error('❌ DASH.js error:', e);
        });
        
        // Cleanup
        return () => {
          player.reset();
          console.log('🧹 DASH.js instance reset');
        };
      } else {
        console.warn('⚠️ DASH.js not supported in this browser');
      }
    }
    
    // Fallback for unsupported formats
    videoRef.src = trackSrc;
    setQualityLevels([]);
  }, [trackSrc, videoRef, type, setQualityLevels, setHlsInstance, setDashInstance, setStreamType]);
};