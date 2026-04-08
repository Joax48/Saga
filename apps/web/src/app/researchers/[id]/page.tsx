interface ResearchersDetailPageProps {
  params: { id: string };
}

export default function ResearchersDetailPage({ params }: ResearchersDetailPageProps) {
  return (
    <main>
      <h1>Researcher Detail</h1>
      <p>ID: {params.id}</p>
      <p>Researcher detail page placeholder.</p>
    </main>
  );
}
