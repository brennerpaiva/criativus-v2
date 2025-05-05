import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    MouseSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import React, { useState } from "react";

/* ================= tipos ================= */
export type MetricKey =
  | "spend"
  | "impressions"
  | "clicks"
  | "ctr"
  | "ctrLinkClick"
  | "cpm"
  | "cpcLinkClick"
  | "costPerLandingPageView"
  | "siteArrivalRate"
  | "tumbstock"
  | "clickToPurchase"
  | "costSitePurchase"
  | "purchaseRoas"
  | "roasCustom"
  | "landingPageViews";

interface MetricOption {
  key: MetricKey;
  label: string;
  invert?: boolean;
}

export const METRIC_OPTIONS: MetricOption[] = [
    { key: "spend", label: "Gasto (Spend)", invert: true },
    { key: "impressions", label: "Impressões" },
    { key: "clicks", label: "Cliques" },
    { key: "ctr", label: "CTR" },
    { key: "ctrLinkClick", label: "CTR (link click)" },
    { key: "cpm", label: "CPM", invert: true },
    { key: "cpcLinkClick", label: "CPC", invert: true },
    { key: "costPerLandingPageView", label: "Custo por LPV", invert: true },
    { key: "siteArrivalRate", label: "Taxa de Chegada" },
    { key: "tumbstock", label: "Thumb‑stop" },
    { key: "clickToPurchase", label: "Click to Purchase" },
    { key: "costSitePurchase", label: "Custo por Compra", invert: true },
    { key: "purchaseRoas", label: "Purchase ROAS" },
    { key: "roasCustom", label: "ROAS Custom" },
    { key: "landingPageViews", label: "Landing Page Views" },
]

export interface MetricChip {
  id: MetricKey;
  label: string;
  invert?: boolean;
}

interface MetricChipsBarProps {
  value: MetricChip[];
  onChange: (chips: MetricChip[]) => void;
  /** Máx. chips permitidos (default 6) */
  maxItems?: number;
  /** Mín. chips (default 1) */
  minItems?: number;
}

/* ================= componente principal =============== */
export function MetricChipsBar({ value, onChange, maxItems = 6, minItems = 1 }: MetricChipsBarProps) {
  /* sensores */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragEnd = (evt: DragEndEvent) => {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((c) => c.id === active.id);
    const newIndex = value.findIndex((c) => c.id === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  /* adicionar / remover */
  const [pickerOpen, setPickerOpen] = useState(false);
  const addMetric = (key: MetricKey) => {
    const opt = METRIC_OPTIONS.find((o) => o.key === key);
    if (!opt) return;
    if (value.some((c) => c.id === key)) return;
    if (value.length >= maxItems) return; // max 6
    onChange([...value, { id: opt.key, label: opt.label, invert: opt.invert }]);
    setPickerOpen(false);
  };
  const removeMetric = (id: MetricKey) => {
    if (value.length <= minItems) return; // sempre deixa pelo menos 1
    onChange(value.filter((c) => c.id !== id));
  };

  /* ui */
  const reachedMax = value.length >= maxItems;
  const reachedMin = value.length <= minItems;

  return (
    <div className="flex items-center gap-2 overflow-hidden flex-wrap">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
          {value.map((chip, idx) => (
            <SortableChip
              key={chip.id}
              id={chip.id}
              index={idx}
              label={chip.label}
              onRemove={() => removeMetric(chip.id)}
              disableRemove={reachedMin && value.length === 1}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* add metric */}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 shrink-0" disabled={reachedMax}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar métrica
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-56">
          <Command>
            <CommandList>
              {METRIC_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.key}
                  onSelect={() => addMetric(opt.key)}
                  disabled={value.some((c) => c.id === opt.key) || reachedMax}
                >
                  {opt.label}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ================= chip sortável ================= */
interface SortableChipProps {
  id: MetricKey;
  index: number;
  label: string;
  onRemove: () => void;
  disableRemove?: boolean;
}

function SortableChip({ id, index, label, onRemove, disableRemove }: SortableChipProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef as React.Ref<HTMLDivElement>}
      className="flex items-center gap-1 cursor-default select-none py-1.5 px-2.5 rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 text-sm whitespace-nowrap"
      style={style}
    >
      {/* drag handle */}
      <span
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 mr-1" />
      </span>
      <span>{index + 1}. {label}</span>
      <button
        type="button"
        className="ml-1 p-0.5 rounded hover:bg-foreground/10 focus:outline-none disabled:opacity-40"
        onClick={(e) => {
          e.stopPropagation();
          if (!disableRemove) onRemove();
        }}
        disabled={disableRemove}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
