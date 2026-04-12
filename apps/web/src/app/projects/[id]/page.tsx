import Breadcrumb from '@/components/Breadcrumb';

interface ProjectsDetailPageProps {
  params: { id: string };
}

export default function ProjectsDetailPage({ params }: ProjectsDetailPageProps) {
  return (
    <main className="bg-[var(--color-bg-neutral-secondary)] min-h-screen">
      <section className="px-6 lg:px-10 pt-10 pb-12">
        <div className="max-w-[1280px] mx-auto space-y-8">
          <Breadcrumb
            items={[{ label: 'Proyectos', href: '/projects' }, { label: params.id }]}
          />

          <div className="max-w-[760px] space-y-4">
            <h1 className="text-[40px] leading-[1.15] font-normal text-[var(--color-text-neutral-primary)]">
              Project Detail
            </h1>

            <p className="text-[18px] leading-[1.6] text-[var(--color-text-neutral-secondary)]">
              ID: {params.id}
            </p>

            <p className="text-[18px] leading-[1.7] text-[var(--color-text-neutral-secondary)]">
              Project detail page placeholder.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
