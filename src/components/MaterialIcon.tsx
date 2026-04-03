import React from 'react';
import { cn } from '../design-system';

interface MaterialIconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 24,
  className,
  fill = false,
  style,
}) => (
  <span
    className={cn('material-symbols-outlined select-none leading-none', className)}
    style={{
      fontSize: size,
      fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      ...style,
    }}
    aria-hidden="true"
  >
    {name}
  </span>
);

export default MaterialIcon;
