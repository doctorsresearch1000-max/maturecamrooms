import { ModelCard } from "@/components/cams/ModelCard";
import type { CamModel } from "@/lib/models/types";

type ModelGridProps = {
  models: CamModel[];
  emptyMessage?: string;
};

export function ModelGrid({
  models,
  emptyMessage = "No models match your filters right now.",
}: ModelGridProps) {
  if (models.length === 0) {
    return (
      <p className="rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-text-secondary">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      role="list"
    >
      {models.map((model, index) => (
        <li key={model.id}>
          <ModelCard model={model} priority={index < 4} />
        </li>
      ))}
    </ul>
  );
}
