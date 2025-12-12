import { useEffect, useState, useRef } from "react";
import { useVideoStore } from "../../store/VideoState";

interface NetworkSpeedInfo {
  speed: number; // in Mbps
  quality: "slow" | "medium" | "fast" | "unknown";
  message: string;
}

const SPEED_THRESHOLDS = {
  slow: 2, // Mbps
  medium: 5, // Mbps
  fast: 10, // Mbps
};

export const useNetworkSpeed = () => {
  const { videoRef, streamType } = useVideoStore();
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeedInfo | null>(null);
  const measurementRef = useRef<{ startTime: number; bytesLoaded: number } | null>(null);
  const lastSpeedRef = useRef<number>(0);

  useEffect(() => {
    if (!videoRef || streamType === "mp4" || streamType === "other") {
      return;
    }

    const measureNetworkSpeed = () => {
      if (!videoRef.buffered.length) return;

      const buffered = videoRef.buffered;
      const currentTime = videoRef.currentTime;
      
      // Find the buffered range that contains current time
      let bufferedEnd = 0;
      for (let i = 0; i < buffered.length; i++) {
        if (currentTime >= buffered.start(i) && currentTime <= buffered.end(i)) {
          bufferedEnd = buffered.end(i);
          break;
        }
      }

      if (bufferedEnd === 0 && buffered.length > 0) {
        bufferedEnd = buffered.end(buffered.length - 1);
      }

      const now = Date.now();
      
      if (!measurementRef.current) {
        // Start new measurement
        measurementRef.current = {
          startTime: now,
          bytesLoaded: 0,
        };
        return;
      }

      // Estimate bytes loaded (rough approximation)
      // This is a simplified calculation - actual implementation would need
      // more accurate measurement from the video element or network API
      const timeDiff = (now - measurementRef.current.startTime) / 1000; // seconds
      const timeBuffered = bufferedEnd - currentTime; // seconds
      
      if (timeDiff > 0.5 && timeBuffered > 0) {
        // Rough estimate: assume average bitrate of 2 Mbps for calculation
        // In production, you'd want to get actual bitrate from HLS/DASH
        const estimatedBytes = (timeBuffered * 2 * 1_000_000) / 8; // bytes
        const speedMbps = (estimatedBytes * 8) / (timeDiff * 1_000_000);
        
        // Smooth the speed reading
        const smoothedSpeed = lastSpeedRef.current 
          ? (lastSpeedRef.current * 0.7 + speedMbps * 0.3)
          : speedMbps;
        
        lastSpeedRef.current = smoothedSpeed;

        let quality: NetworkSpeedInfo["quality"] = "unknown";
        let message = "";

        if (smoothedSpeed < SPEED_THRESHOLDS.slow) {
          quality = "slow";
          message = "Slow connection";
        } else if (smoothedSpeed < SPEED_THRESHOLDS.medium) {
          quality = "medium";
          message = "Moderate connection";
        } else if (smoothedSpeed < SPEED_THRESHOLDS.fast) {
          quality = "fast";
          message = "Good connection";
        } else {
          quality = "fast";
          message = "Excellent connection";
        }

        setNetworkSpeed({
          speed: smoothedSpeed,
          quality,
          message,
        });

        // Reset measurement
        measurementRef.current = {
          startTime: now,
          bytesLoaded: estimatedBytes,
        };
      }
    };

    const interval = setInterval(measureNetworkSpeed, 2000);

    return () => {
      clearInterval(interval);
      measurementRef.current = null;
    };
  }, [videoRef, streamType]);

  return networkSpeed;
};

