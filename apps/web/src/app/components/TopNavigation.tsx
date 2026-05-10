import Link from 'next/link';
import Image from 'next/image';

type TopNavItem = {
  label: string;
  href: string;
  image: string;
};

export default function TopNavigation() {
  const items: TopNavItem[] = [
    {
      label: 'Investigadores',
      href: '/researchers',
      image: '/icons/icon_researchers_lightblue.png',
    },
    { label: 'Unidades', href: '/units', image: '/icons/icon_units_lightblue.png' },
    {
      label: 'Producción Científica',
      href: '/scientific-productions',
      image: '/icons/icon_productions_lightblue.png',
    },
    {
      label: 'Proyectos',
      href: '/projects',
      image: '/icons/icon_projects_lightblue.png',
    },
  ];

  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 text-center md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex flex-col items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[var(--color-bg-neutral-secondary)]"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full">
              <Image
                src={item.image}
                alt={item.label}
                width={70}
                height={70}
                className="object-contain transition-transform duration-200 group-hover:scale-110"
              />
            </div>

            <span className="text-sm text-center text-[var(--color-secondary)] group-hover:scale-110">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
