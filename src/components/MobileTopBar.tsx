import { ReactNode } from 'react';

interface MobileTopBarProps {
  title: string;
  headerAction?: ReactNode;
}

export default function MobileTopBar({ title, headerAction }: MobileTopBarProps) {
  return (
    <div className="flex items-center justify-between h-16 px-6 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 shrink-0 sticky top-0 z-40 md:hidden">
      <h1 className="text-xl font-black font-display text-zinc-100 tracking-tighter uppercase italic">{title}</h1>
      <div>{headerAction}</div>
    </div>
  );
}
