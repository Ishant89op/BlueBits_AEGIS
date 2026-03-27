'use client';

interface AlertBannerProps
{
  message: string;
  level?: string;
}

export default function AlertBanner({
  message,
  level = 'OMEGA-4',
}: AlertBannerProps)
{
  return (
    <div className="w-full bg-aegis-danger text-white px-4 py-2 flex items-center
      justify-between border-y border-white/10
      shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
      <div className="flex items-center gap-3">
        <span
          className="material-symbols-outlined text-lg"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          warning
        </span>
        <span className="font-mono font-bold tracking-[0.2em] text-sm">
          {message}
        </span>
      </div>
      <span className="font-mono text-[10px] tracking-tighter">
        SEC_LVL: {level}
      </span>
    </div>
  );
}
