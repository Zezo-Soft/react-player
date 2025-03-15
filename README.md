# Zezo React Player

## Installation

To install the `zezo-react-player` package, use the following command:

```sh
npm install zezo-react-player
```

## Usage

Import and use the `VideoPlayer` component in your React project:

```tsx
import { useCallback, useRef } from "react";
import { VideoPlayer } from "zezo-react-player";

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
    // FIND AND RETURN LOADED!!! VIDEO PREVIEW ACCORDING TO the hoverTime TIME
    updatePreviewImage(hoverTime);
    return previewImage.current;
  }, []);

  return (
    <div className="w-[720px]">
      <VideoPlayer
        trackPoster="https://i.ytimg.com/vi/Uh60VDKg348/maxresdefault.jpg"
        trackSrc="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
        trackTitle="Mehmaan"
        isTrailer={false}
        width="120px"
        height="180px"
        timeCodes={[
          {
            fromMs: 0,
            description: "This is a very long first part label you could use",
          },
          { fromMs: 130000, description: "This is the second part" },
          { fromMs: 270000, description: "One more part label" },
          { fromMs: 440000, description: "Final battle" },
          { fromMs: 600000, description: "Cast" },
        ]}
        getPreviewScreenUrl={handleGettingPreview}
      />
    </div>
  );
}

export default App;
```

## Props

| Prop Name             | Type                                             | Description                                             |
| --------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `trackPoster`         | `string`                                         | URL of the video poster image.                          |
| `trackSrc`            | `string`                                         | Video source URL (MP4, HLS, etc.).                      |
| `trackTitle`          | `string`                                         | Title of the video.                                     |
| `isTrailer`           | `boolean`                                        | Specifies if the video is a trailer.                    |
| `width`               | `string`                                         | Width of the video player.                              |
| `height`              | `string`                                         | Height of the video player.                             |
| `timeCodes`           | `Array<{ fromMs: number, description: string }>` | List of time-based markers with descriptions.           |
| `getPreviewScreenUrl` | `(timeMs: number) => string`                     | Function to generate preview screen URLs based on time. |

## Example

```tsx
<VideoPlayer
  trackPoster="https://example.com/poster.jpg"
  trackSrc="https://example.com/video.mp4"
  trackTitle="Sample Video"
  isTrailer={true}
  width="640px"
  height="360px"
  timeCodes={[
    { fromMs: 0, description: "Intro" },
    { fromMs: 60000, description: "Main Scene" },
  ]}
  getPreviewScreenUrl={(timeMs) => `https://example.com/preview?time=${timeMs}`}
/>
```

## License

MIT License.
