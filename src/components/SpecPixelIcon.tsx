import PixelIcon from '@/components/PixelIcon';

interface SpecPixelIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function SpecPixelIcon({ name, size = 48, className }: SpecPixelIconProps) {
  return <PixelIcon name={name} size={size} className={className} />;
}
