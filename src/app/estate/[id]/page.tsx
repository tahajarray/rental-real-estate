import { EstateDetailClient } from "@/components/EstateDetailClient";

export default async function EstateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EstateDetailClient id={id} />;
}
