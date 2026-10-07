import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ConditionArticle } from "@/components/conditions/condition-article";
import { ConditionSkeleton } from "@/components/conditions/condition-skeleton";
import { conditionIds, getCondition } from "@/lib/conditions/catalog";

type Params = PageProps<"/condizioni/[id]">["params"];

/** Le schede sono contenuti fissi: vengono generate tutte in fase di build */
export function generateStaticParams() {
  return conditionIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/condizioni/[id]">): Promise<Metadata> {
  const { id } = await params;
  const condition = getCondition(id);
  if (!condition) return { title: "Condizione non trovata", robots: { index: false } };
  return { title: condition.name, description: condition.overview };
}

export default function ConditionPage({ params }: PageProps<"/condizioni/[id]">) {
  // Durante la navigazione compare subito lo scheletro, poi la scheda già pronta
  return (
    <Suspense fallback={<ConditionSkeleton />}>
      <ConditionContent params={params} />
    </Suspense>
  );
}

async function ConditionContent({ params }: { params: Params }) {
  const { id } = await params;
  const condition = getCondition(id);
  if (!condition) notFound();
  return <ConditionArticle condition={condition} />;
}
