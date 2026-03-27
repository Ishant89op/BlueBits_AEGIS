'use client';

interface StatCardProps
{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  borderColor: string;
  valueColor?: string;
  glowColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  borderColor,
  valueColor = 'text-aegis-text',
  glowColor,
}: StatCardProps)
{
  return (
    <div
      className={`
        bg-aegis-surface p-5 border-l-4 ${borderColor}
        transition-all hover:brightness-110 group
        ${glowColor ? `shadow-[inset_0_0_15px_${glowColor}]` : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-aegis-muted tracking-widest uppercase font-body">
          {title}
        </span>
        <span className="material-symbols-outlined text-aegis-muted group-hover:text-aegis-text text-sm">
          {icon}
        </span>
      </div>
      <div className={`text-3xl font-mono font-bold ${valueColor}`}>
        {value}
      </div>
      {subtitle && (
        <div className="mt-2 text-[10px] font-mono text-aegis-muted">
          {subtitle}
        </div>
      )}
    </div>
  );
}
