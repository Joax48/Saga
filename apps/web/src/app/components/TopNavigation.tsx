import Link from 'next/link';

export default function TopNavigation() {
  const items = [
    { label: 'Perfiles', href: '/researchers', count: 202, icon: '👤' },
    { label: 'Unidades', href: '/units', count: 50, icon: '🏢' },
    { label: 'Producción Científica', href: '/scientific-productions', count: 3470, icon: '📄' },
    { label: 'Proyectos', href: '/projects', count: 406, icon: '📦' },
    { label: 'Otras producciones', href: '/other-productions', count: 203, icon: '💡' },
  ];

  return (
    <div className="bg-white py-10">
      <div className="max-w-6xl mx-auto px-0 flex justify-between text-center">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-2 underline-offset-0"
          >
            <div className="relative text-2xl">
              <span>{item.icon}</span>
              <span className="badge badge-sm absolute -top-2 -right-3">
                {item.count}
              </span>
            </div>

            <span className="text-sm text-center"> {item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
