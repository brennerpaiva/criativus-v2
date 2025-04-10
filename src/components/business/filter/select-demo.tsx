import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectGenericProps {
  label: string;
  items: { value: string, label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  defaultValue?: string; // Propriedade adicionada
}

export function SelectGeneric({
  label,
  items,
  placeholder = "Select an option",
  onValueChange,
  className,
  defaultValue,
}: SelectGenericProps) {
  return (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className={`shadcn-select-trigger ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
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
