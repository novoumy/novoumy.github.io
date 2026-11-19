import { lazy, Suspense } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

const SiteRoot = lazy(() => import("@/components/SiteRoot"));

const TITLE = "novoumy";
const DESCRIPTION =
  "I like spending way too much time on my pc.. soo I made this website to share my favorite media, games, songs and quotes. ^.^";
const OG_IMAGE = "https://novoumy.com/og-image.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: Index,
});

function Backdrop() {
  return <div className="h-dvh bg-lavender" />;
}

function Index() {
  return (
    <ClientOnly fallback={<Backdrop />}>
      <Suspense fallback={<Backdrop />}>
        <SiteRoot />
      </Suspense>
    </ClientOnly>
  );
}
