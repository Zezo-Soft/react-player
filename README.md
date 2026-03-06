# @zezosoft/react-player 🎬

A React video player by Zezosoft supporting HLS, MP4, DASH, preview thumbnails, tracking, subtitles, episode playback, and ads.

## ✨ Features

- ✅ **Formats** — HLS, MP4, DASH (via hls.js and dash.js)
- 🖼️ **Preview thumbnails** — Hover over seek bar for scrubbing previews
- 📊 **Event tracking** — Views, watch time, user interactions
- 💬 **Subtitles** — WebVTT with customizable styling
- ⏭️ **Intro skip** — Skip intro button with configurable time range
- 📺 **Episodes** — Next episode auto-play and playlist
- 📢 **Ads** — Pre-roll, mid-roll, post-roll video ads
- 📚 **Watch history** — Resume playback, progress tracking

## 📦 Installation

```sh
npm install @zezosoft/react-player
# or
pnpm add @zezosoft/react-player
# or
yarn add @zezosoft/react-player
```

**Peer dependencies:** `react`, `react-dom`, `hls.js`, `lucide-react`, `zustand`

## 🚀 Quick Start

```tsx
import { VideoPlayer } from "@zezosoft/react-player";

function App() {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
      <VideoPlayer
        video={{
          src: "https://example.com/playlist.m3u8",
          title: "My Video",
          poster: "https://example.com/poster.jpg",
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
```

## 📖 Props

The player accepts four props: `video` (required), `style`, `events`, and `features`.

### `video` (required)

| Prop           | Type      | Default   | Description                              |
| -------------- | --------- | --------- | ---------------------------------------- |
| `src`         | `string`  | required  | Video URL (HLS, DASH, MP4)               |
| `title`       | `string`  | `""`      | Title shown in header                    |
| `poster`      | `string`  | `""`      | Poster image URL                         |
| `type`        | `string`  | auto      | `"hls"` \| `"dash"` \| `"mp4"` \| `"other"` |
| `isTrailer`   | `boolean` | `false`   | Trailer mode (hides ads)                 |
| `showControls`| `boolean` | `true`    | Show/hide controls                       |
| `isMute`      | `boolean` | `false`   | Start muted                              |
| `startFrom`   | `number`  | `0`       | Start time in seconds                    |
| `isLive`      | `boolean` | `false`   | Live stream mode                         |

### `style`

| Prop            | Type                  | Description                                      |
| --------------- | --------------------- | ------------------------------------------------ |
| `className`     | `string`              | Custom class for video element                   |
| `width`         | `string`              | Player width (e.g. `"100%"`, `"720px"`)          |
| `height`        | `string`              | Player height (e.g. `"400px"`, `"auto"`)         |
| `subtitleStyle` | `SubtitleStyleConfig` | Subtitle styling                                 |
| `qualityConfig` | `VideoQualityConfig`  | `defaultQuality`, `showInSettings`               |
| `seekBarConfig` | `SeekBarConfig`       | `trackColor`, `bufferColor`, `getPreviewScreenUrl`, etc. |
| `playPauseButtonConfig` | `PlayPauseButtonConfig` | `backgroundColor`, `borderRadius`, `padding` |

**SubtitleStyleConfig:** `fontSize`, `backgroundColor`, `textColor`, `position` (`"top"` \| `"center"` \| `"bottom"`), `borderRadius`, `padding`, `maxWidth`

### `events`

| Prop                   | Type     | Description                              |
| ---------------------- | -------- | ---------------------------------------- |
| `onEnded`              | `(e) => void` | When video ends                       |
| `onError`              | `(e?) => void` | On error (retry available)            |
| `onClose`              | `() => void`  | When close button is clicked          |
| `onWatchHistoryUpdate` | `(data: WatchHistoryData) => void` | On close, with progress data |

**WatchHistoryData:** `{ currentTime, duration, progress, isCompleted, watchedAt }`

### `features`

| Prop                    | Type     | Description                                      |
| ----------------------- | -------- | ------------------------------------------------ |
| `timeCodes`             | `Array<{ fromMs, description }>` | Chapter markers (ms)          |
| `getPreviewScreenUrl`   | `(hoverTimeValue: number) => string` | Preview thumbnail URL     |
| `tracking`              | `{ onViewed?, onWatchTimeUpdated? }` | Tracking callbacks    |
| `subtitles`             | `Array<{ lang, label, url }>` | WebVTT subtitle tracks          |
| `episodeList`           | `Array<{ id, title, url }>` | Episodes for playlist              |
| `currentEpisodeIndex`   | `number` | Active episode index (default `0`)                |
| `intro`                 | `{ start, end }` | Intro skip range (seconds)               |
| `nextEpisodeConfig`     | `{ showAtTime?, showAtEnd? }` | Next episode button              |
| `ads`                   | `AdConfig` | Pre-roll, mid-roll, post-roll ads              |

### Ads (`AdConfig`)

```typescript
{
  preRoll?: AdBreak;
  midRoll?: AdBreak[];
  postRoll?: AdBreak;
  onAdStart?: (adBreak: AdBreak) => void;
  onAdEnd?: (adBreak: AdBreak) => void;
  onAdSkip?: (adBreak: AdBreak) => void;
  onAdError?: (adBreak: AdBreak, error: Error) => void;
}

// AdBreak
{
  id: string;
  type: "pre-roll" | "mid-roll" | "post-roll";
  time: number;        // seconds (0 for pre-roll)
  adUrl: string;
  skipable?: boolean;
  skipAfter?: number;  // seconds before skip button
  duration?: number;   // optional fixed duration
  sponsoredUrl?: string;
}
```

## 📋 Examples

### 📺 HLS with poster

```tsx
<VideoPlayer
  video={{
    src: "https://example.com/playlist.m3u8",
    type: "hls",
    poster: "https://example.com/poster.jpg",
    title: "Streaming Video",
  }}
  style={{ width: "100%", height: "450px" }}
/>
```

### 🖼️ Preview thumbnails

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    getPreviewScreenUrl: (ms) =>
      `https://example.com/thumbs/${Math.floor(ms / 1000)}.jpg`,
  }}
/>
```

### 📑 Chapters

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    timeCodes: [
      { fromMs: 0, description: "Intro" },
      { fromMs: 60000, description: "Chapter 1" },
      { fromMs: 120000, description: "Chapter 2" },
    ],
  }}
/>
```

### 💬 Subtitles

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    subtitles: [
      { lang: "en", label: "English", url: "https://example.com/en.vtt" },
      { lang: "es", label: "Spanish", url: "https://example.com/es.vtt" },
    ],
  }}
  style={{
    subtitleStyle: {
      fontSize: "1.25rem",
      backgroundColor: "rgba(0,0,0,0.75)",
      textColor: "#fff",
      position: "bottom",
    },
  }}
/>
```

### ⏭️ Intro skip

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
    intro: { start: 10, end: 45 },
  }}
/>
```

### 📺 Episodes

```tsx
const episodes = [
  { id: 1, title: "Episode 1", url: "https://example.com/ep1.m3u8" },
  { id: 2, title: "Episode 2", url: "https://example.com/ep2.m3u8" },
];

<VideoPlayer
  video={{
    src: episodes[0].url,
    title: episodes[0].title,
  }}
  features={{
    episodeList: episodes,
    currentEpisodeIndex: 0,
    nextEpisodeConfig: { showAtTime: 300, showAtEnd: true },
  }}
/>
```

### 📢 Ads

```tsx
<VideoPlayer
  video={{ src: "https://example.com/video.mp4" }}
  features={{
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
      onAdStart: (ad) => console.log("Ad started", ad.id),
      onAdEnd: (ad) => console.log("Ad ended", ad.id),
    },
  }}
/>
```

### ▶️ Resume playback

```tsx
const [savedTime, setSavedTime] = useState(0);

<VideoPlayer
  video={{
    src: "https://example.com/video.mp4",
    startFrom: savedTime,
  }}
  events={{
    onWatchHistoryUpdate: (data) => {
      setSavedTime(data.currentTime);
      // or save to backend
    },
  }}
/>
```

## 📤 Exports

```ts
import {
  VideoPlayer,
  useVideoStore,
} from "@zezosoft/react-player";

import type {
  VideoPlayerProps,
  Episode,
  SubtitleTrack,
  IntroConfig,
  NextEpisodeConfig,
  WatchHistoryData,
  SubtitleStyleConfig,
  VideoQualityConfig,
  SeekBarConfig,
  PlayPauseButtonConfig,
} from "@zezosoft/react-player";
```

## 🔧 Troubleshooting

**Video not playing**
- Use a valid, accessible URL
- Set `type: "hls"` or `type: "dash"` explicitly for streaming
- Check CORS for external sources

**Subtitles not showing**
- Ensure WebVTT URLs are accessible
- Verify CORS for subtitle files

**Preview thumbnails**
- `getPreviewScreenUrl` must return a valid image URL
- URL is called with `hoverTimeValue` in milliseconds

## 📄 License

MIT · [Zezosoft](https://zezosoft.com)

## 🙌 Credits

Seek bar inspired by [react-video-seek-slider](https://www.npmjs.com/package/react-video-seek-slider).
