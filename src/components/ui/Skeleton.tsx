// FinLens — 通用骨架屏
export default function Skeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-finlens-bg-alt rounded-md ${className}`}
        />
      ))}
    </>
  );
}
