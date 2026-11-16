interface Props {
  size?: number;
  className?: string;
  withPlate?: boolean;
}

export function Taegeuk({ size = 40, className, withPlate = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Taegeuk roundel"
    >
      {withPlate && <rect x="0" y="0" width="100" height="100" rx="22" fill="#f6efe3" />}
      <circle cx="50" cy="50" r="40" fill="#c8393f" />
      <path d="M10,50 A40 40 0 0 0 90,50 Z" fill="#2e5e8c" />
      <path d="M50,10 A20 20 0 0 1 50,50 Z" fill="#2e5e8c" />
      <path d="M50,50 A20 20 0 0 0 50,90 Z" fill="#c8393f" />
    </svg>
  );
}
