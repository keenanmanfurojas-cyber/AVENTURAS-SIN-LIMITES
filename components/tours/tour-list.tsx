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
            className="mt-[0.7rem] size-1.5 shrink-0 rotate-45 rounded-[1px] bg-[#b9ff4a] shadow-[0_0_10px_rgba(185,255,74,0.3)]"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
