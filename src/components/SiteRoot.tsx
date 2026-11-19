import { AudioProvider } from "@/audio/AudioProvider";
import SiteApp from "@/components/SiteApp";

// The whole site is a browser-only window (hash links, audio, window scaling),
// so it is loaded after hydration from the index route.
export default function SiteRoot() {
  return (
    <AudioProvider>
      <SiteApp />
    </AudioProvider>
  );
}
