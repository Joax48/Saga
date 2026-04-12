'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from '@/components/Card';
import Button from '@/components/Button';
import DetailNavbar from '@/components/DetailNavbar';
import { Category } from '@/components/DetailNavbar';
import {
  ChevronLeft,
  Globe,
  Phone,
  Mail,
  User,
  Users,
  BookOpen,
  Briefcase,
  Scroll,
} from 'lucide-react';

interface UnitData {
  id: string;
  name: string;
  description: string;
  email?: string;
  phone?: string;
  website?: string;
}

interface UnitsDetailPageProps {
  params: { id: string };
}

export default function UnitsDetailPage({ params }: UnitsDetailPageProps) {
  const router = useRouter();
  const [unit, setUnit] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profiles');

  const categories: Category[] = [
    {
      id: 'profiles',
      name: 'Perfiles asociados',
      icon: <User size={18} />,
    },
    {
      id: 'networks',
      name: 'Redes de colaboración',
      icon: <Users size={18} />,
    },
    {
      id: 'scientific_production',
      name: 'Producción científica',
      icon: <BookOpen size={18} />,
    },
    {
      id: 'projects',
      name: 'Proyectos',
      icon: <Briefcase size={18} />,
    },
    {
      id: 'other_productions',
      name: 'Otras producciones',
      icon: <Scroll size={18} />,
    },
  ];

  /*Fetch default data*/
  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        setLoading(true);
        setError('El endpoint de detalle de unidades aún no está implementado en la API. Por favor, vuelva a la lista de unidades.');
      } catch (err) {
        setError('Error loading unit details. Please try again.');
        console.error('Error fetching unit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [params.id]);

  /*Show loading page */
  if (loading) {
    return (
      <main className="min-h-screen bg-base-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="skeleton h-10 w-48 mb-6"></div>
          <div className="skeleton h-96 w-full mb-6"></div>
        </div>
      </main>
    );
  }

  /*Show error page */
  if (error || !unit) {
    return (
      <main className="min-h-screen bg-base-100 p-6">
      </main>
    );
  }

  return (
    /*Show unit detailed information page */
    <main className="min-h-screen bg-base-100 py-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[{ label: 'Unidades', href: '/units' }, { label: unit.name }]}
        />

        {/* Header and information section */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-12">
          {/* Unit Header */}
          <header className="lg:col-span-3">
            <h1
              className="mb-5 mt-9"
              style={{ fontSize: 'var(--text-h2)', color: 'var(--color-neutral)' }}
            >
              {unit.name}
            </h1>
            <p className="text-lg leading-relaxed text-neutral-600">{unit.description}</p>
          </header>

          {/* Unit information */}
          <div className="space-y-8 lg:col-span-1">
            {/* Links section */}
            {unit.website && (
              <div>
                <h3
                  className="mb-2 mt-9"
                  style={{ fontSize: 'var(--text-h3)', color: 'var(--color-neutral)' }}
                >
                  Enlaces
                </h3>
                <a
                  href={unit.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-800 break-all"
                >
                  <Globe size={18} style={{ color: 'var(--color-azul-700)' }} />
                  {unit.website}
                </a>
              </div>
            )}

            {/* Contact section */}
            <div>
              <h3
                className="mb-2"
                style={{ fontSize: 'var(--text-h3)', color: 'var(--color-neutral)' }}
              >
                Contacto
              </h3>
              {unit.phone && (
                <div className="mb-4">
                  <a
                    href={`tel:${unit.phone}`}
                    className="inline-flex items-center gap-2 text-neutral-600"
                  >
                    <Phone size={18} style={{ color: 'var(--color-azul-800)' }} />
                    {unit.phone}
                  </a>
                </div>
              )}

              <div className="space-y-3">
                {unit.email && (
                  <div>
                    <a
                      href={`mailto:${unit.email}`}
                      className="inline-flex items-center gap-2 text-neutral-600 hover:text-blue-800 break-all"
                    >
                      <Mail size={18} style={{ color: 'var(--color-azul-700)' }} />
                      {unit.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Detail Navigation */}
      <DetailNavbar
        categories={categories}
        defaultActive={activeTab}
        onCategoryChange={(id) => setActiveTab(id)}
        backgroundColor="#F2F2F2"
      />

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === 'profiles' && <div></div>}

        {activeTab === 'networks' && <div></div>}

        {activeTab === 'scientific_production' && <div></div>}

        {activeTab === 'projects' && <div></div>}

        {activeTab === 'other_productions' && <div></div>}
      </div>
    </main>
  );
}
