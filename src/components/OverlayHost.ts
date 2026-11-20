import { createContext } from 'react';

// The element inside the main window that folder views render into (instead of a page-wide overlay).
export const OverlayHostContext = createContext<HTMLElement | null>(null);
