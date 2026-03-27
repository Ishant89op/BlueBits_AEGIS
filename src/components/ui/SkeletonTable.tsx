'use client';

interface SkeletonTableProps
{
  rows?: number;
  cols?: number;
}

export default function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps)
{
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex gap-4 px-2 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-aegis-border rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 px-2 py-3 border-t border-aegis-border/30">
          {Array.from({ length: cols }).map((_, col) => (
            <div key={col} className="flex-1 h-3 bg-aegis-border/50 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
