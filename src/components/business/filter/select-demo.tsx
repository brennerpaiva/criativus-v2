import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectGenericProps {
  label: string;
  items: SelectOption[];
  icon?: React.ReactNode;                 // ⬅️ NOVO: ícone fixo
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  value?: string;
}

export function SelectGeneric({
  label,
  items,
  icon,
  placeholder = "Select an option",
  onValueChange,
  className,
  value,
}: SelectGenericProps) {
  const selected = items.find((i) => i.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      {/* ───── Trigger ───── */}
      <SelectTrigger className={`shadcn-select-trigger ${className}`}>
        <SelectValue asChild>
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0">{icon}</span>}
            {selected ? (
              <span className="truncate">{selected.label}</span>
            ) : (
              <span className="text-muted-foreground truncate">
                {placeholder}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>

      {/* ───── Lista ───── */}
      <SelectContent className="shadcn-select-content">
        <SelectGroup>
          <SelectLabel className="shadcn-select-label">{label}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value} className="shadcn-select-item">
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
