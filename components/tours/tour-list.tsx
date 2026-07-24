type TourListProps = Readonly<{
  emptyLabel?: string;
  items: string[];
}>;

export function TourList({
  emptyLabel = "No se especificaron elementos adicionales.",
  items,
}: TourListProps) {
  if (items.length === 0) {
    return <p className="text-stone-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li className="flex gap-4" key={item}>
          <span
            aria-hidden="true"
            className="mt-[0.72rem] size-1 shrink-0 rotate-45 bg-sand"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
