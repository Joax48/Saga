interface ScientificProductionsDetailPageProps {
  params: { id: string };
}

export default function ScientificProductionsDetailPage({
  params,
}: ScientificProductionsDetailPageProps) {
  return (
    <main>
      <h1>Scientific Production Detail</h1>
      <p>ID: {params.id}</p>
      <p>Scientific production detail page placeholder.</p>
    </main>
  );
}
