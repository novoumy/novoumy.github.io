export default function Equalizer({ live = false }: { live?: boolean }) {
  return (
    <span aria-hidden="true" className={`eq-bars flex h-5 shrink-0 items-end gap-[3px] ${live ? 'eq-live' : ''}`}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
