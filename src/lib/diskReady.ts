// The "reading disk" pop stays up while a folder is loading and is dismissed the moment
// the folder reports that its content is ready (see RetroOverlay `ready`).
export const DISK_READY_EVENT = 'novoumy:disk-ready';

export function diskReady() {
  window.dispatchEvent(new Event(DISK_READY_EVENT));
}
