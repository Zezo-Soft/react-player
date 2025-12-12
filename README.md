# @zezosoft/react-player 🎬

A powerful and flexible **React video player** by **Zezosoft**, supporting HLS, MP4, DASH, YouTube, preview thumbnails, tracking, subtitles, episode playback, ads, and advanced controls.

---

## 🚀 Features

✅ **Multiple Video Formats** - HLS, MP4, DASH, YouTube  
✅ **Preview Thumbnails on Hover** - Show video previews while scrubbing  
✅ **Event Tracking** - Track views, watch time, and user interactions  
✅ **Customizable Player Size & Controls** - Full control over player appearance  
✅ **Time-Stamped Labels** - Video chapters with time markers  
✅ **Subtitles (WebVTT)** - Multi-language subtitle support with custom styling  
✅ **Intro Skipping** - Automatic skip intro button  
✅ **Episode Playback** - Next episode auto-play and playlist support  
✅ **Ad Support** - Pre-roll, mid-roll, post-roll, and overlay ads  
✅ **Watch History** - Track user progress and resume playback

---

## 📦 Installation

Install the package using **npm** or **yarn**:

```sh
npm install @zezosoft/react-player
```

or

```sh
yarn add @zezosoft/react-player
```

---

## 🛠️ Quick Start

Here's a simple example to get you started:

```tsx
import { VideoPlayer } from "@zezosoft/react-player";

function App() {
  return (
    <VideoPlayer
      video={{
        src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
        title: "My Video",
        poster: "https://example.com/poster.jpg",
      }}
      style={{
        width: "100%",
        height: "auto",
      }}
    />
  );
}
```

---

## 📖 Complete Example

Here's a comprehensive example showing all available features:

```tsx
import { useCallback, useRef } from "react";
import { VideoPlayer } from "@zezosoft/react-player";

function App() {
  const previewImage = useRef("");

  const updatePreviewImage = (hoverTime: number) => {
    const url = `https://fakeimg.pl/720x405?text=${hoverTime}`;
    const image = document.createElement("img");
    image.src = url;
    image.onload = () => {
      previewImage.current = url;
    };
  };

  const handleGettingPreview = useCallback((hoverTime: number) => {
    updatePreviewImage(hoverTime);
    return previewImage.current;
  }, []);

  return (
    <div style={{ width: "720px", margin: "0 auto" }}>
      <VideoPlayer
        video={{
          src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
          title: "Mehmaan",
          poster: "https://i.ytimg.com/vi/VAUfyxw-Yvk/maxresdefault.jpg",
          type: "hls",
          isTrailer: false,
          showControls: true,
          isMute: false,
          startFrom: 0,
        }}
        style={{
          width: "720px",
          height: "405px",
          className: "my-video-player",
          subtitleStyle: {
            fontSize: "1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            textColor: "#ffffff",
            position: "bottom",
            borderRadius: "8px",
            padding: "8px 16px",
            maxWidth: "80%",
          },
        }}
        events={{
          onEnded: (e) => console.log("Video ended", e),
          onError: (e) => console.error("Video error", e),
          onClose: () => console.log("Player closed"),
          onWatchHistoryUpdate: (data) => {
            console.log("Watch history:", data);
            // Save to your backend
          },
        }}
        features={{
          timeCodes: [
            { fromMs: 0, description: "Introduction" },
            { fromMs: 130000, description: "Exciting Scene" },
            { fromMs: 270000, description: "Climax" },
          ],
          getPreviewScreenUrl: handleGettingPreview,
          tracking: {
            onViewed: () => console.log("Video Viewed"),
            onWatchTimeUpdated: (e) => {
              console.log("Watch Time Updated", {
                watchTime: e.watchTime,
                currentTime: e.currentTime,
                duration: e.duration,
              });
            },
          },
          subtitles: [
            {
              lang: "en",
              label: "English",
              url: "https://example.com/subtitles-en.vtt",
            },
            {
              lang: "hi",
              label: "Hindi",
              url: "https://example.com/subtitles-hi.vtt",
            },
          ],
          episodeList: [
            { id: 1, title: "Episode 1", url: "https://example.com/ep1.m3u8" },
            { id: 2, title: "Episode 2", url: "https://example.com/ep2.m3u8" },
          ],
          currentEpisodeIndex: 0,
          intro: { start: 5, end: 20 },
          nextEpisodeConfig: { showAtTime: 300, showAtEnd: true },
          ads: {
            preRoll: {
              id: "preroll-1",
              type: "pre-roll",
              time: 0,
              adUrl: "https://example.com/ad.mp4",
              skipable: true,
              skipAfter: 5,
            },
            midRoll: [
              {
                id: "midroll-1",
                type: "mid-roll",
                time: 120,
                adUrl: "https://example.com/mid-ad.mp4",
                skipable: false,
              },
            ],
            onAdStart: (adBreak) => console.log("Ad started", adBreak),
            onAdEnd: (adBreak) => console.log("Ad ended", adBreak),
          },
        }}
      />
    </div>
  );
}

export default App;
```

---

## 📚 Props Reference

The `VideoPlayer` component accepts four main prop objects:

### `video` (Required)

Video source and basic configuration.

| Prop           | Type                                               | Default      | Description                                             |
| -------------- | -------------------------------------------------- | ------------ | ------------------------------------------------------- |
| `src`          | `string`                                           | **Required** | Video source URL (MP4, HLS, DASH, YouTube, etc.)        |
| `title`        | `string`                                           | `""`         | Title of the video displayed in the player header       |
| `poster`       | `string`                                           | `""`         | URL of the poster/thumbnail image shown before playback |
| `type`         | `"hls" \| "dash" \| "mp4" \| "youtube" \| "other"` | `undefined`  | Video format type (auto-detected if not provided)       |
| `isTrailer`    | `boolean`                                          | `false`      | If `true`, shows trailer-specific UI elements           |
| `showControls` | `boolean`                                          | `true`       | Show/hide player controls                               |
| `isMute`       | `boolean`                                          | `false`      | Start video muted                                       |
| `startFrom`    | `number`                                           | `0`          | Start playback from specific time in seconds            |

### `style` (Optional)

Styling and appearance configuration.

| Prop            | Type                  | Default     | Description                                    |
| --------------- | --------------------- | ----------- | ---------------------------------------------- |
| `className`     | `string`              | `undefined` | Custom CSS class name for the player container |
| `width`         | `string`              | `"100%"`    | Player width (e.g., `"720px"`, `"100%"`)       |
| `height`        | `string`              | `"auto"`    | Player height (e.g., `"405px"`, `"auto"`)      |
| `subtitleStyle` | `SubtitleStyleConfig` | `undefined` | Custom styling for subtitles (see below)       |

**SubtitleStyleConfig:**

| Prop              | Type                            | Default                                       | Description                        |
| ----------------- | ------------------------------- | --------------------------------------------- | ---------------------------------- |
| `fontSize`        | `string`                        | `"1.75rem"`                                   | Subtitle font size                 |
| `backgroundColor` | `string`                        | `"linear-gradient(135deg, #fbbf24, #f59e0b)"` | Subtitle background color/gradient |
| `textColor`       | `string`                        | `"#000000"`                                   | Subtitle text color                |
| `position`        | `"top" \| "center" \| "bottom"` | `"bottom"`                                    | Vertical position of subtitles     |
| `borderRadius`    | `string`                        | `"12px"`                                      | Border radius of subtitle box      |
| `padding`         | `string`                        | `"12px 20px"`                                 | Padding inside subtitle box        |
| `maxWidth`        | `string`                        | `"80%"`                                       | Maximum width of subtitle box      |

### `events` (Optional)

Event callbacks for player lifecycle.

| Prop                   | Type                                                          | Description                                        |
| ---------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `onEnded`              | `(e: React.SyntheticEvent<HTMLVideoElement>) => void`         | Called when video playback ends                    |
| `onError`              | `(e?: React.SyntheticEvent<HTMLVideoElement, Event>) => void` | Called when video encounters an error              |
| `onClose`              | `() => void`                                                  | Called when player is closed                       |
| `onWatchHistoryUpdate` | `(data: WatchHistoryData) => void`                            | Called when player closes with watch progress data |

**WatchHistoryData:**

```typescript
{
  currentTime: number; // Current playback time in seconds
  duration: number; // Total video duration in seconds
  progress: number; // Progress percentage (0-100)
  isCompleted: boolean; // Whether video was fully watched
  watchedAt: number; // Timestamp when watch session ended
}
```

### `features` (Optional)

Advanced features and functionality.

| Prop                  | Type                                             | Default     | Description                                                              |
| --------------------- | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------ |
| `timeCodes`           | `Array<{ fromMs: number, description: string }>` | `[]`        | Time-based chapter markers (in milliseconds)                             |
| `getPreviewScreenUrl` | `(hoverTimeValue: number) => string`             | `undefined` | Function to generate preview thumbnail URLs while hovering over seek bar |
| `tracking`            | `TrackingConfig`                                 | `undefined` | Event tracking configuration (see below)                                 |
| `subtitles`           | `Array<SubtitleTrack>`                           | `[]`        | Subtitle tracks in WebVTT format                                         |
| `episodeList`         | `Array<Episode>`                                 | `[]`        | List of episodes for playlist/autoplay                                   |
| `currentEpisodeIndex` | `number`                                         | `0`         | Index of currently playing episode                                       |
| `intro`               | `{ start: number, end: number }`                 | `undefined` | Intro skip configuration (times in seconds)                              |
| `nextEpisodeConfig`   | `{ showAtTime?: number, showAtEnd?: boolean }`   | `undefined` | Configuration for next episode button                                    |
| `ads`                 | `AdConfig`                                       | `undefined` | Advertisement configuration (see below)                                  |

**TrackingConfig:**

```typescript
{
  onViewed?: () => void;
  onWatchTimeUpdated?: (e: {
    watchTime?: number;    // Total watch time in seconds
    currentTime: number;   // Current playback position
    duration: number;      // Total video duration
  }) => void;
}
```

**SubtitleTrack:**

```typescript
{
  lang: string; // Language code (e.g., "en", "hi", "fr")
  label: string; // Display label (e.g., "English", "Hindi")
  url: string; // URL to WebVTT subtitle file
}
```

**Episode:**

```typescript
{
  id: number; // Unique episode identifier
  title: string; // Episode title
  url: string; // Episode video URL
}
```

**AdConfig:**

```typescript
{
  preRoll?: AdBreak;                    // Pre-roll ad (plays before video)
  midRoll?: AdBreak[];                  // Mid-roll ads (plays during video)
  postRoll?: AdBreak;                   // Post-roll ad (plays after video)
  overlay?: {                           // Overlay ad (image overlay)
    imageUrl: string;
    clickUrl?: string;
    showDuration: number;
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
  smartPlacement?: {                    // Smart ad placement
    enabled: boolean;
    minVideoDuration?: number;
    minGapBetweenAds?: number;
    avoidNearEnd?: number;
    preferNaturalBreaks?: boolean;
  };
  onAdStart?: (adBreak: AdBreak) => void;
  onAdEnd?: (adBreak: AdBreak) => void;
  onAdSkip?: (adBreak: AdBreak) => void;
  onAdError?: (adBreak: AdBreak, error: Error) => void;
}
```

**AdBreak:**

```typescript
{
  id: string;                    // Unique ad identifier
  type: "pre-roll" | "mid-roll" | "post-roll" | "overlay";
  time: number;                  // Time in seconds when ad should play
  adUrl: string;                 // URL to ad video
  skipable?: boolean;            // Whether ad can be skipped
  skipAfter?: number;            // Seconds before skip button appears
  duration?: number;             // Ad duration in seconds
  sponsoredUrl?: string;         // URL for sponsored content
  title?: string;                // Ad title
  description?: string;          // Ad description
  relevance?: "high" | "medium" | "low";
}
```

---

## 🎯 Usage Examples

### Basic Video Player

```tsx
<VideoPlayer
  video={{
    src: "https://example.com/video.mp4",
    title: "My Video",
  }}
/>
```

### HLS Video with Poster

```tsx
<VideoPlayer
  video={{
    src: "https://example.com/playlist.m3u8",
    type: "hls",
    poster: "https://example.com/poster.jpg",
    title: "Streaming Video",
  }}
  style={{
    width: "100%",
    height: "450px",
  }}
/>
```

### Video with Preview Thumbnails

```tsx
const getPreview = (hoverTime: number) => {
  // Generate thumbnail URL based on hover time
  return `https://example.com/thumbnails/${Math.floor(hoverTime)}.jpg`;
};

<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    getPreviewScreenUrl: getPreview,
  }}
/>;
```

### Video with Chapters

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    timeCodes: [
      { fromMs: 0, description: "Introduction" },
      { fromMs: 60000, description: "Chapter 1" },
      { fromMs: 120000, description: "Chapter 2" },
      { fromMs: 180000, description: "Conclusion" },
    ],
  }}
/>
```

### Video with Subtitles

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    subtitles: [
      {
        lang: "en",
        label: "English",
        url: "https://example.com/subtitles-en.vtt",
      },
      {
        lang: "es",
        label: "Spanish",
        url: "https://example.com/subtitles-es.vtt",
      },
    ],
  }}
  style={{
    subtitleStyle: {
      fontSize: "1.25rem",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      textColor: "#ffffff",
      position: "bottom",
    },
  }}
/>
```

### Video with Intro Skip

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    intro: {
      start: 10, // Intro starts at 10 seconds
      end: 45, // Intro ends at 45 seconds
    },
  }}
/>
```

### Episode Playlist

```tsx
const [currentEpisode, setCurrentEpisode] = useState(0);

const episodes = [
  { id: 1, title: "Episode 1", url: "https://example.com/ep1.m3u8" },
  { id: 2, title: "Episode 2", url: "https://example.com/ep2.m3u8" },
  { id: 3, title: "Episode 3", url: "https://example.com/ep3.m3u8" },
];

<VideoPlayer
  video={{
    src: episodes[currentEpisode].url,
    title: episodes[currentEpisode].title,
  }}
  features={{
    episodeList: episodes,
    currentEpisodeIndex: currentEpisode,
    nextEpisodeConfig: {
      showAtTime: 300, // Show next episode button 5 minutes before end
      showAtEnd: true, // Also show at video end
    },
  }}
  events={{
    onEnded: () => {
      if (currentEpisode < episodes.length - 1) {
        setCurrentEpisode(currentEpisode + 1);
      }
    },
  }}
/>;
```

### Video with Tracking

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    tracking: {
      onViewed: () => {
        // Track video view
        analytics.track("video_viewed", { videoId: "123" });
      },
      onWatchTimeUpdated: ({ watchTime, currentTime, duration }) => {
        // Track watch time
        analytics.track("watch_time_updated", {
          watchTime,
          progress: (currentTime / duration) * 100,
        });
      },
    },
  }}
/>
```

### Video with Watch History

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  events={{
    onWatchHistoryUpdate: async (data) => {
      // Save watch history to backend
      await fetch("/api/watch-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: "123",
          currentTime: data.currentTime,
          duration: data.duration,
          progress: data.progress,
          isCompleted: data.isCompleted,
        }),
      });
    },
  }}
/>
```

### Video with Ads

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    ads: {
      preRoll: {
        id: "preroll-1",
        type: "pre-roll",
        time: 0,
        adUrl: "https://example.com/pre-roll-ad.mp4",
        skipable: true,
        skipAfter: 5,
      },
      midRoll: [
        {
          id: "midroll-1",
          type: "mid-roll",
          time: 120,
          adUrl: "https://example.com/mid-roll-ad.mp4",
          skipable: false,
        },
      ],
      onAdStart: (adBreak) => {
        console.log("Ad started:", adBreak.id);
      },
      onAdEnd: (adBreak) => {
        console.log("Ad ended:", adBreak.id);
      },
    },
  }}
/>
```

### Resume from Last Position

```tsx
const [watchHistory, setWatchHistory] = useState(null);

// Load watch history on mount
useEffect(() => {
  fetch("/api/watch-history/123")
    .then((res) => res.json())
    .then((data) => setWatchHistory(data));
}, []);

<VideoPlayer
  video={{
    src: "https://example.com/video.mp4",
    startFrom: watchHistory?.currentTime || 0,
  }}
  events={{
    onWatchHistoryUpdate: (data) => {
      // Save progress
      setWatchHistory(data);
    },
  }}
/>;
```

---

## ❓ Troubleshooting

### Video Not Playing?

- **Check the video URL**: Ensure `video.src` is a valid, accessible URL
- **Check video format**: Verify the video format is supported (HLS, MP4, DASH, YouTube)
- **CORS issues**: If using HLS or external sources, ensure CORS headers are properly configured
- **Specify video type**: Try explicitly setting `video.type` to help with format detection

```tsx
<VideoPlayer
  video={{
    src: "https://example.com/video.m3u8",
    type: "hls", // Explicitly specify type
  }}
/>
```

### Subtitles Not Showing?

- **Check VTT file URL**: Ensure subtitle URLs are publicly accessible
- **Verify VTT format**: Ensure WebVTT files are properly formatted
- **Check CORS**: Subtitle files must be accessible from your domain
- **Test subtitle URL**: Open the subtitle URL directly in a browser to verify it loads

### Preview Thumbnails Not Loading?

- **Verify function returns URL**: Ensure `getPreviewScreenUrl` returns a valid image URL
- **Check image loading**: The function should return a URL that loads successfully
- **Use browser console**: Check for image loading errors in the browser console (F12)

### Player Not Responsive?

- **Use percentage widths**: Set `style.width` to `"100%"` for responsive behavior
- **Container styling**: Wrap the player in a container with appropriate CSS
- **Height auto**: Use `style.height: "auto"` to maintain aspect ratio

```tsx
<div style={{ maxWidth: "1200px", margin: "0 auto" }}>
  <VideoPlayer
    video={{ src: "https://example.com/video.mp4" }}
    style={{
      width: "100%",
      height: "auto",
    }}
  />
</div>
```

### Ads Not Playing?

- **Check ad URLs**: Ensure ad video URLs are valid and accessible
- **Verify ad timing**: For mid-roll ads, ensure `time` is less than video duration
- **Check ad format**: Ad videos should be in supported formats (MP4, HLS)

---

## 🔗 Related Links

- 📚 [Official Documentation](https://github.com/zezosoft/react-player)
- 🛠 [Issues & Support](https://github.com/zezosoft/react-player/issues)

---

## 📝 License

Licensed under the MIT License.  
Developed by [Zezosoft](https://zezosoft.com). 🚀

---

## 🙌 Credits

This project includes modifications of the seek bar functionality inspired by [`react-video-seek-slider`](https://www.npmjs.com/package/react-video-seek-slider).

---

# 🌟 Enjoy seamless video playback with @zezosoft/react-player! 🎥
