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
    <div className="retro-theme relative flex min-h-dvh items-center justify-center overflow-hidden bg-lavender px-4 py-8 text-wine">
      <PixelBackdrop />
      <main className="relative z-10 w-full max-w-2xl">
        <section className="r-window pixel-frame overflow-hidden">
          <header className="r-titlebar flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-pixel text-[8px] uppercase tracking-[0.12em] sm:text-[9px]">
              ✦ novOS // system message
            </span>
            <span className="shrink-0 font-pixel text-[7px] uppercase tracking-[0.1em] text-rose sm:text-[8px]">
              signal lost
            </span>
          </header>

          <div className="bg-cool-white px-5 py-8 text-center sm:px-10 sm:py-10">
            <div className="mb-5 flex items-center justify-center gap-4" aria-hidden="true">
              <span className="font-body text-3xl text-lavender">✦</span>
              <span
                className="font-pixel text-[clamp(3.5rem,15vw,6.5rem)] leading-none text-wine"
                style={{ textShadow: '5px 5px 0 var(--rose)' }}
              >
                404
              </span>
              <span className="font-body text-3xl text-lavender">✦</span>
            </div>

            <h1 className="font-pixel text-[11px] leading-[1.8] sm:text-sm">
              PAGE NOT FOUND
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-[21px] leading-[1.25] text-wine sm:text-[24px]">
              oopsie! this page wandered off on a little side quest.
            </p>
            <p className="mt-2 font-body text-[18px] text-lavender sm:text-[20px]">
              let&apos;s get you back somewhere cozy. ^.^
            </p>

            <div className="mx-auto my-7 max-w-lg border-2 border-rose bg-[#F3E6F0] px-4 py-3 text-left font-body text-[19px] leading-[1.35] sm:text-[21px]">
              <p>
                <span className="mr-2 bg-wine px-2 py-0.5 font-pixel text-[8px] text-cool-white">ERR</span>
                error 404: page.exe not found
              </p>
              <p className="mt-1 text-lavender">hint: home is only one click away...</p>
            </div>

            <a href="/#main" className="r-btn">
              <span aria-hidden="true">↶</span> back to main page
            </a>
          </div>

          <footer className="r-titlebar flex items-center justify-between gap-3 px-4 py-2 font-pixel text-[7px] uppercase tracking-[0.1em] sm:text-[8px]">
            <span>novoumy terminal</span>
            <span className="text-rose">status: online</span>
          </footer>
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
