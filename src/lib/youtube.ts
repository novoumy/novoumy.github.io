// Thin wrapper around the official YouTube IFrame Player API
// (https://developers.google.com/youtube/iframe_api_reference).

export const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

export interface YTPlayer {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width: number | string;
      height: number | string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: (event: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

// Loads https://www.youtube.com/iframe_api once and resolves with window.YT.
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null; // allow a retry next time the library opens
      reject(new Error('YouTube API failed to load'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

// Error codes from the player: 2 invalid id, 5 HTML5 error, 100 not found/private,
// 101 and 150 embedding disabled by the video owner.
export const YT_ERROR_TEXT: Record<number, string> = {
  2: 'Invalid YouTube video ID.',
  5: 'The player hit an error. Try again.',
  100: 'This video was removed or is private.',
  101: 'The owner disabled embedding for this video.',
  150: 'The owner disabled embedding for this video.',
};
