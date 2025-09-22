# @zezosoft/react-player 🎬

A powerful and flexible **React video player** by **Zezosoft**, supporting HLS, MP4, preview thumbnails, tracking, subtitles, episode playback, and advanced controls.

---

## 🚀 Features

✅ **Supports HLS, MP4**  
✅ **Preview Thumbnails on Hover**  
✅ **Event Tracking (Views, Watch Time, etc.)**  
✅ **Customizable Player Size & Controls**  
✅ **Time-Stamped Labels for Video Chapters**  
✅ **Subtitles (WebVTT)**  
✅ **Intro Skipping**  
✅ **Next Episode Auto Play and Button**

---

## 📦 Installation

Install the package using **npm**

```sh
npm install @zezosoft/react-player
```

---

## 🛠️ Basic Usage

Import and use the `VideoPlayer` component in your React project:

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
    <div className="w-[720px]">
      <VideoPlayer
        trackPoster="https://i.ytimg.com/vi/VAUfyxw-Yvk/maxresdefault.jpg"
        trackSrc="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
        trackTitle="Mehmaan"
        width="720px"
        height="405px"
        timeCodes={[
          { fromMs: 0, description: "Introduction" },
          { fromMs: 130000, description: "Exciting Scene" },
          { fromMs: 270000, description: "Climax" },
        ]}
        getPreviewScreenUrl={handleGettingPreview}
        tracking={{
          onViewed: () => console.log("Video Viewed"),
          onWatchTimeUpdated: (e) => console.log("Watch Time Updated", e),
        }}
        subtitles={[
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
        ]}
        episodeList={[
          { id: 1, title: "Episode 1", url: "https://example.com/ep1.m3u8" },
          { id: 2, title: "Episode 2", url: "https://example.com/ep2.m3u8" },
        ]}
        currentEpisodeIndex={0}
        intro={{ start: 5, end: 20 }}
        nextEpisodeConfig={{ showAtTime: 300, showAtEnd: true }}
      />
    </div>
  );
}

export default App;
```

---

## 🎨 Props Reference

| Prop Name             | Type                                                  | Default     | Description                                                |
| --------------------- | ----------------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `trackPoster`         | `string`                                              | `""`        | URL of the video poster image.                             |
| `trackSrc`            | `string`                                              | `""`        | Video source URL (MP4, HLS, etc.).                         |
| `trackTitle`          | `string`                                              | `""`        | Title of the video.                                        |
| `isTrailer`           | `boolean`                                             | `false`     | Specifies if the video is a trailer.                       |
| `width`               | `string`                                              | `"100%"`    | Width of the video player.                                 |
| `height`              | `string`                                              | `"auto"`    | Height of the video player.                                |
| `timeCodes`           | `Array<{ fromMs: number, description: string }>`      | `[]`        | List of time-based markers with descriptions.              |
| `getPreviewScreenUrl` | `(timeMs: number) => string`                          | `null`      | Function to generate preview screen URLs based on time.    |
| `tracking`            | `object`                                              | `{}`        | Tracking event callbacks.                                  |
| `subtitles`           | `Array<{ lang: string; label: string; url: string }>` | `[]`        | Subtitle tracks in WebVTT format.                          |
| `episodeList`         | `Array<{ id: number; title: string; url: string }>`   | `[]`        | List of episodes to support autoplay/playlist.             |
| `currentEpisodeIndex` | `number`                                              | `0`         | Index of currently playing episode.                        |
| `intro`               | `{ start: number; end: number }`                      | `undefined` | Defines intro duration in seconds.                         |
| `nextEpisodeConfig`   | `{ showAtTime?: number; showAtEnd?: boolean }`        | `undefined` | When to show next episode UI — at specific time or at end. |
|                       |

---

## 📢 Tracking Events

| Event Name           | Description                                      |
| -------------------- | ------------------------------------------------ |
| `onViewed`           | Triggered when the video starts playing.         |
| `onWatchTimeUpdated` | Triggered when user leaves with >30s watch time. |

#### Example usage:

```tsx
tracking={{
  onViewed: () => console.log("Viewed!"),
  onWatchTimeUpdated: ({ watchTime }) =>
    console.log("Total watch time (sec):", watchTime),
}}
```

---

## 🎨 Customization & Styling

🔹 Change Player Dimensions

Modify `width` and `height`:

```tsx
<VideoPlayer width="800px" height="450px" />
```

🔹 Custom Preview Thumbnails

Dynamically generate preview images:

```tsx
const getPreviewImage = (hoverTime) =>
  `https://fakeimg.pl/720x405?text=${hoverTime}`;
<VideoPlayer getPreviewScreenUrl={getPreviewImage} />;
```

🔹 Time-Stamps for Video Sections

Mark important video sections:

```tsx
<VideoPlayer
  timeCodes={[
    { fromMs: 0, description: "Intro" },
    { fromMs: 120000, description: "Main Scene" },
  ]}
/>
```

🔹 Subtitles Support

Add support for multiple subtitle tracks in .vtt format:

```tsx
subtitles={[
  {
    lang: "en",
    label: "English",
    url: "https://example.com/subtitles-en.vtt",
  },
  {
    lang: "fr",
    label: "French",
    url: "https://example.com/subtitles-fr.vtt",
  },
]}
```

🔹 Skip Intro Button

Automatically show a "Skip Intro" button between a specific start and end time

```tsx
<VideoPlayer intro={{ start: 5, end: 20 }} />
```

🔹 Next Episode Playback

Automatically show "Next Episode" option when video ends or reaches a set time

```tsx
<VideoPlayer
  nextEpisodeConfig={{
    showAtTime: 300,
    showAtEnd: true,
  }}
/>
```

🔹 Episode Playlist Support

Pass a playlist of episodes and control which one plays currently

```tsx
<VideoPlayer
  episodeList={[
    { id: 1, title: "Episode 1", url: "https://example.com/ep1.m3u8" },
    { id: 2, title: "Episode 2", url: "https://example.com/ep2.m3u8" },
  ]}
  currentEpisodeIndex={0}
/>
```

🔹 Tracking Events

Track when the video is viewed or how much time was watched

```tsx
<VideoPlayer
  tracking={{
    onViewed: () => console.log("User viewed the video."),
    onWatchTimeUpdated: ({ watchTime }) =>
      console.log("Total watch time in seconds:", watchTime),
  }}
/>
```

---

## ❓ Troubleshooting

#### ❌ Video not playing?

- Check if the `trackSrc` URL is correct.
- Ensure the video format (MP4, HLS) is supported.
- If using HLS, ensure you're serving files correctly (CORS issues may block playback).

#### ❌ Subtitles not showing?

- Check that .vtt files are correctly hosted and publicly accessible.
- Ensure the subtitles prop includes proper lang, label, and url.

#### ❌ Preview thumbnails not loading?

- Confirm `getPreviewScreenUrl` is returning a valid image URL.
- Use the browser console (F12) to check errors.

#### ❌ Player not responsive?

- Make sure you're setting `width="100%"` for fluid responsiveness
- Wrap the player inside a `div` with CSS styles

---

## 🔗 Related Links

- 📚 [Official Documentation](https://github.com/zezosoft/react-player)
- 🛠 [Issues & Support](https://github.com/zezosoft/react-player)

---

## 📝 License

Licensed under the MIT License.
Developed by [Zezosoft](https://zezosoft.com). 🚀

---

## 🙌 Credits

This project includes modifications of the seek bar functionality inspired by [`react-video-seek-slider`](https://www.npmjs.com/package/react-video-seek-slider).

---

# 🌟 Enjoy seamless video playback with @zezosoft/react-player! 🎥
