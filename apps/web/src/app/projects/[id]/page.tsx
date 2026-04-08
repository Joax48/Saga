interface ProjectsDetailPageProps {
  params: { id: string };
}

export default function ProjectsDetailPage({ params }: ProjectsDetailPageProps) {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Detail</h1>
      <p className="text-gray-600">ID: {params.id}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold">Project Alpha</h2>
          <p className="text-gray-500 text-sm mt-2">
            This is a description for Project Alpha.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold">Project Beta</h2>
          <p className="text-gray-500 text-sm mt-2">
            This is a description for Project Beta.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-xl transition">
          <h2 className="text-lg font-semibold">Project Gamma</h2>
          <p className="text-gray-500 text-sm mt-2">
            This is a description for Project Gamma.
          </p>
        </div>

      </div>
    </main>
  );
}