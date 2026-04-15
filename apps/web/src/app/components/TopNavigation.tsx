import Link from 'next/link';
import {
  User,
  Building2,
  FileText,
  FolderKanban,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';

type TopNavItem = {
  label: string;
  href: string;
  count: number;
  icon: LucideIcon;
};

export default function TopNavigation() {
  const items: TopNavItem[] = [
    { label: 'Perfiles', href: '/researchers', count: 202, icon: User },
    { label: 'Unidades', href: '/units', count: 50, icon: Building2 },
    {
      label: 'Producción Científica',
      href: '/scientific-productions',
      count: 3470,
      icon: FileText,
    },
    { label: 'Proyectos', href: '/projects', count: 406, icon: FolderKanban },
    {
      label: 'Otras producciones',
      href: '/other-productions',
      count: 203,
      icon: Lightbulb,
    },
  ];

  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 text-center md:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[var(--color-bg-neutral-secondary)]"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-neutral-secondary)]">
              <item.icon
                size={22}
                strokeWidth={1.9}
                className="text-[var(--color-icon-neutral-primary)]"
              />
              <span className="absolute -top-2 -right-3 rounded-full border border-[var(--color-gray-300)] bg-white px-2 py-[1px] text-[11px] font-semibold leading-none text-[var(--color-text-neutral-primary)]">
                {item.count.toLocaleString('es-CR')}
              </span>
            </div>

            <span className="text-sm text-center text-[var(--color-text-neutral-primary)] group-hover:text-[var(--color-text-brand-primary)]">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
