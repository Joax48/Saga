interface OtherProductionsDetailPageProps {
  params: { id: string };
}

export default function OtherProductionsDetailPage({
  params,
}: OtherProductionsDetailPageProps) {
  return (
    <main>
      <h1>Other Production Detail</h1>
      <p>ID: {params.id}</p>
      <p>Other production detail page placeholder.</p>
    </main>
  );
}
