import { ModelCard } from "@/components/cams/ModelCard";
import type { CamModel } from "@/lib/models/types";

type ModelGridProps = {
  models: CamModel[];
};

export function ModelGrid({ models }: ModelGridProps) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
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
