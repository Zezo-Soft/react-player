import { useEffect } from "react";
import Hls from "hls.js";
import * as dashjs from "dashjs";
import { useVideoStore } from "../../store/VideoState";
import { getExtensionFromUrl } from "../utils";
import { StreamType } from "../utils/qualityManager";
import { useShallow } from "zustand/react/shallow";

export const useVideoSource = (
  trackSrc: string,
  type?: "hls" | "mp4" | "dash" | "other" | "youtube" | undefined
) => {
  const {
    videoRef,
    setQualityLevels,
    setHlsInstance,
    setDashInstance,
    setStreamType,
  } = useVideoStore(
    useShallow((state) => ({
      videoRef: state.videoRef,
      setQualityLevels: state.setQualityLevels,
      setHlsInstance: state.setHlsInstance,
      setDashInstance: state.setDashInstance,
      setStreamType: state.setStreamType,
    }))
  );

  useEffect(() => {
    if (!videoRef) return;

    const getVideoExtension = getExtensionFromUrl(trackSrc);
    const contentType = type || getVideoExtension;
    let teardown: (() => void) | undefined;

    setStreamType(contentType as StreamType);

    const ensureFallbackSrc = () => {
      if (!videoRef.src) {
        videoRef.src = trackSrc;
      }
    };

    if (contentType === "mp4" || contentType === "other") {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    } else if (contentType === "hls") {
      if (videoRef.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.src = trackSrc;

        const handleLoadedMetadata = () => {
          const videoElement = videoRef as any;
          if (videoElement.videoTracks && videoElement.videoTracks.length > 0) {
            const tracks = Array.from(videoElement.videoTracks).map(
              (track: any, index: number) => ({
                height: track.height || 720,
                bitrate: track.bandwidth || 0,
                originalIndex: index,
              })
            );
            setQualityLevels(tracks);
          } else {
            setQualityLevels([
              { height: 360, bitrate: 800000, originalIndex: 0 },
              { height: 480, bitrate: 1400000, originalIndex: 1 },
              { height: 720, bitrate: 2800000, originalIndex: 2 },
              { height: 1080, bitrate: 5000000, originalIndex: 3 },
            ]);
          }

          setHlsInstance(null as any);
        };

        videoRef.addEventListener("loadedmetadata", handleLoadedMetadata);
        teardown = () => {
          videoRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(trackSrc);
        hls.attachMedia(videoRef as HTMLMediaElement);
        setHlsInstance(hls);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels.map((level, index) => ({
            height: level.height,
            bitrate: level.bitrate,
            originalIndex: index,
          }));
          setQualityLevels(levels);
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data?.fatal) return;
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHlsInstance(null as any);
              videoRef.src = trackSrc;
              break;
          }
        });

        teardown = () => {
          hls.destroy();
          setHlsInstance(null as any);
        };
      } else {
        videoRef.src = trackSrc;
        setHlsInstance(null as any);
        setQualityLevels([
          { height: 360, bitrate: 800000, originalIndex: 0 },
          { height: 480, bitrate: 1400000, originalIndex: 1 },
          { height: 720, bitrate: 2800000, originalIndex: 2 },
          { height: 1080, bitrate: 5000000, originalIndex: 3 },
        ]);
      }
    } else if (contentType === "dash") {
      if (dashjs.supportsMediaSource()) {
        const player = dashjs.MediaPlayer().create();

        player.updateSettings({
          streaming: {
            buffer: {
              fastSwitchEnabled: true,
              bufferTimeAtTopQuality: 30,
              bufferTimeAtTopQualityLongForm: 60,
            },
          },
        });

        player.initialize(videoRef as HTMLMediaElement, trackSrc, true);
        setDashInstance(player);

        const handleManifestLoaded = () => {
          try {
            const representations = (player as any).getRepresentationsByType(
              "video"
            );
            if (representations && representations.length > 0) {
              const levels = representations.map((rep: any, index: number) => ({
                height: rep.height || Math.round(rep.bandwidth / 1000) || 0,
                bitrate: rep.bandwidth,
                originalIndex: index,
                id: rep.id,
              }));
              setQualityLevels(levels);
            } else {
              setQualityLevels([]);
            }
          } catch (error) {
            setQualityLevels([]);
          }
        };

        player.on("manifestLoaded" as any, handleManifestLoaded);

        player.on("error" as any, () => {
          player.reset();
          setDashInstance(undefined as any);
          videoRef.src = trackSrc;
        });

        teardown = () => {
          player.off("manifestLoaded" as any, handleManifestLoaded);
          player.reset();
          setDashInstance(undefined as any);
        };
      } else {
        videoRef.src = trackSrc;
        setDashInstance(undefined as any);
        setQualityLevels([]);
      }
    } else {
      videoRef.src = trackSrc;
      setQualityLevels([]);
    }

    ensureFallbackSrc();

    return () => {
      teardown?.();
      videoRef.pause();
      videoRef.removeAttribute("src");
      videoRef.load();
      const { setIsPlaying, setBufferedProgress } = useVideoStore.getState();
      setIsPlaying(false);
      setBufferedProgress(0);
    };
  }, [
    trackSrc,
    videoRef,
    type,
    setQualityLevels,
    setHlsInstance,
    setDashInstance,
    setStreamType,
  ]);
};
