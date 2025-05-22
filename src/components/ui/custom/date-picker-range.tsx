/* ------------------------------------------------------------------
 * src/components/ui/custom/date-picker-range.tsx
 * ------------------------------------------------------------------
 * Date-range picker com presets e suporte a “single-day range”.
 * Se o usuário clicar apenas em uma data e escolher “Aplicar”,
 * o componente envia { from, to } com o mesmo dia.
 * ----------------------------------------------------------------*/
"use client";

import {
  addDays,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Configuração                                                        */
/* ------------------------------------------------------------------ */
export type SimpleRange = { from?: string; to?: string | null };
const DATE_FMT = "yyyy-MM-dd"; // ← backend trabalha nesse formato

const PRESETS = [
  { key: "hoje",        label: "Hoje" },
  { key: "ontem",       label: "Ontem" },
  { key: "essa-semana", label: "Essa semana" },
  { key: "esse-mes",    label: "Esse mês" },
  { key: "ultimos-7",   label: "Últimos 7 dias" },
  { key: "ultimos-14",  label: "Últimos 14 dias" },
  { key: "ultimos-30",  label: "Últimos 30 dias" },
] as const;
type PresetKey = (typeof PRESETS)[number]["key"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const toYMD = (d?: Date): string | undefined =>
  d ? format(d, DATE_FMT) : undefined;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameRange(r1: DateRange | undefined, r2: DateRange) {
  if (!r1?.from || !r1?.to || !r2.from || !r2.to) return false;
  return isSameDay(r1.from, r2.from) && isSameDay(r1.to, r2.to);
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  value?: SimpleRange;
  onChange?: (r: SimpleRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({ value, onChange, className }: Props) {
  /* ---------------- estado interno (Date) -------------------------- */
  const initial: DateRange = value?.from && value?.to
    ? {
        from: parse(value.from, DATE_FMT, new Date()),
        to:   parse(value.to,   DATE_FMT, new Date()),
      }
    : {
        from: new Date(2022, 0, 20),
        to:   addDays(new Date(2022, 0, 20), 20),
      };

  const [selectedRange, setSelectedRange] =
    React.useState<DateRange | undefined>(initial);
  const [tempRange, setTempRange] =
    React.useState<DateRange | undefined>(initial);
  const [open, setOpen] = React.useState(false);

  /* ---------------- sincroniza value → estado ---------------------- */
  React.useEffect(() => {
    if (value?.from && value?.to) {
      const ext = {
        from: parse(value.from, DATE_FMT, new Date()),
        to:   parse(value.to,   DATE_FMT, new Date()),
      };
      setSelectedRange(ext);
      setTempRange(ext);
    }
  }, [value?.from, value?.to]);

  /* ---------------- presets ---------------------------------------- */
  function getPresetRange(key: PresetKey): DateRange {
    const today = new Date(); today.setHours(0,0,0,0);
    let from = new Date(today);
    let to   = new Date(today);

    switch (key) {
      case "ontem":       from.setDate(from.getDate() - 1); to = from; break;
      case "essa-semana": from = startOfWeek(today, { weekStartsOn: 1 }); break;
      case "esse-mes":    from = startOfMonth(today);                   break;
      case "ultimos-7":   from.setDate(from.getDate() - 6);             break;
      case "ultimos-14":  from.setDate(from.getDate() - 13);            break;
      case "ultimos-30":  from.setDate(from.getDate() - 29);            break;
    }
    return { from, to };
  }

  /* ---------------- handlers --------------------------------------- */
  // Se o usuário escolher apenas um dia, duplica-se em to.
  const normalizeRange = (r?: DateRange): DateRange | undefined =>
    r?.from && !r?.to ? { from: r.from, to: r.from } : r;

  const handlePresetRange = (key: PresetKey) =>
    setTempRange(getPresetRange(key));

  const handleApply = () => {
    const normalized = normalizeRange(tempRange);

    setSelectedRange(normalized);
    setTempRange(normalized);
    setOpen(false);

    onChange?.(
      normalized
        ? { from: toYMD(normalized.from), to: toYMD(normalized.to) }
        : undefined,
    );
  };

  const handleCancel = () => {
    setTempRange(selectedRange);
    setOpen(false);
  };

  /* ---------------- label com validação ---------------------------- */
  const label = React.useMemo(() => {
    if (!selectedRange?.from || !isValid(selectedRange.from)) {
      return "Selecionar data";
    }
    const fromStr = format(selectedRange.from, "dd MMM, yyyy", { locale: ptBR });

    if (!selectedRange.to || !isValid(selectedRange.to)) {
      return fromStr;
    }
    const toStr = format(selectedRange.to, "dd MMM, yyyy", { locale: ptBR });
    return `${fromStr} - ${toStr}`;
  }, [selectedRange]);

  /* ------------------------------------------------------------------
   * Render
   * ----------------------------------------------------------------*/
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 flex space-x-4">
            {/* Presets */}
            <div className="flex flex-col space-y-2">
              {PRESETS.map(({ key, label }) => {
                const active = isSameRange(tempRange, getPresetRange(key));
                return (
                  <Button
                    key={key}
                    variant={active ? "ghost_primary" : "ghost"}
                    className="justify-start"
                    onClick={() => handlePresetRange(key)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>

            {/* Calendário */}
            <Calendar
              initialFocus
              mode="range"
              fixedWeeks
              locale={ptBR}
              defaultMonth={tempRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
              classNames={{ cell: "w-[36px]" }}
            />
          </div>

          {/* Ações */}
          <div className="mt-4 flex justify-end space-x-2 px-4 pb-4">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" variant="default" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
