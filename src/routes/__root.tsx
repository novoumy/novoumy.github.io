import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import PixelBackdrop from "@/components/PixelBackdrop";

function NotFoundComponent() {
  return (
    <div className="relative grid h-dvh min-h-0 place-items-center overflow-hidden bg-lavender px-4 py-4 text-wine">
      <PixelBackdrop />
      <main className="relative z-10 max-h-full w-full max-w-2xl">
        <section className="pixel-frame bg-cool-white p-2">
          <div className="flex min-h-[210px] flex-col items-center justify-center gap-6 border-y-2 border-rose px-4 py-6 text-center sm:min-h-[340px] sm:gap-8 sm:px-5 sm:py-12">
            <h1 className="font-pixel text-[clamp(52px,13vw,104px)] leading-none [text-shadow:5px_5px_0_var(--rose),10px_10px_0_rgba(107,45,57,.16)]">
              404
            </h1>
            <p className="font-pixel text-[clamp(10px,2.5vw,16px)] tracking-widest">NOT FOUND</p>
            <a
              href="https://novoumy.com/"
              className="pixel-btn inline-flex min-h-12 items-center justify-center border-2 border-wine px-6 py-3 shadow-[5px_5px_0_0_var(--rose),8px_8px_0_0_var(--wine)]"
            >
              GO BACK
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Page title, description and share previews live in each route's own head().
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
