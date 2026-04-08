interface UnitsDetailPageProps {
  params: { id: string };
}

export default function UnitsDetailPage({ params }: UnitsDetailPageProps) {
  return (
    <main>
      <h1>Unit Detail</h1>
      <p>ID: {params.id}</p>
      <p>Unit detail page placeholder.</p>
    </main>
  );
}
