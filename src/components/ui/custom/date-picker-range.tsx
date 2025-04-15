"use client";

import { addDays, format, startOfMonth, startOfWeek } from "date-fns";
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

// Array de presets para mapear dinamicamente
const PRESETS = [
  { key: "hoje", label: "Hoje" },
  { key: "ontem", label: "Ontem" },
  { key: "essa-semana", label: "Essa semana" },
  { key: "esse-mes", label: "Esse mês" },
  { key: "ultimos-7", label: "Últimos 7 dias" },
  { key: "ultimos-14", label: "Últimos 14 dias" },
  { key: "ultimos-30", label: "Últimos 30 dias" },
];

interface DatePickerWithRangeProps {
  className?: string;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
}: DatePickerWithRangeProps) {
  // "selectedRange" é o valor efetivo que de fato refletirá no botão (e no app)
  // mas quem realmente controla se isso muda ou não ao "Apply" é o "tempRange"
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(
    value || {
      from: new Date(2022, 0, 20),
      to: addDays(new Date(2022, 0, 20), 20),
    }
  );

  // "tempRange" é o estado temporário que muda conforme o usuário clica no calendário
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(selectedRange);

  // Controla se o popover está aberto ou fechado
  const [open, setOpen] = React.useState(false);

  // Se as props externas mudarem, atualiza o estado interno (opcional, se for fully controlled)
  React.useEffect(() => {
    if (value) {
      setSelectedRange(value);
      setTempRange(value);
    }
  }, [value]);


  function getPresetRange(presetKey: string): DateRange {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let from = new Date(today);
    let to = new Date(today);

    switch (presetKey) {
      case "hoje":
        break;

      case "ontem":
        from = new Date(today);
        from.setDate(from.getDate() - 1);
        to = from;
        break;

      case "essa-semana":
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = today;
        break;

      case "esse-mes":
        from = startOfMonth(today);
        to = today;
        break;

      case "ultimos-7":
        from = new Date(today);
        from.setDate(from.getDate() - 6);
        break;

      case "ultimos-14":
        from = new Date(today);
        from.setDate(from.getDate() - 13);
        break;

      case "ultimos-30":
        from = new Date(today);
        from.setDate(from.getDate() - 29);
        break;
    }

    // Novamente, zera horas para garantir comparações corretas
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    return { from, to };
  }

  // ---------------------------------------
  // 2) Funções auxiliares para comparar datas e ranges:
  // ---------------------------------------
  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function isSameRange(range1: DateRange | undefined, range2: DateRange) {
    if (!range1?.from || !range1?.to) {
      return false
    }
    if (!range2.from || !range2.to) {
      return false
    }
    if (!range1?.from || !range1?.to) return false;
    return (
      isSameDay(range1.from, range2.from) && isSameDay(range1.to, range2.to)
    );
  }

  // ---------------------------------------
  // 3) Lógica dos presets e do datepicker
  // ---------------------------------------
  function handlePresetRange(presetKey: string) {
    const newRange = getPresetRange(presetKey);
    setTempRange(newRange);
  }

  const handleApply = () => {
    setSelectedRange(tempRange);
    setOpen(false);
    onChange?.(tempRange);
  };
  
  const handleCancel = () => {
    setTempRange(selectedRange);
    setOpen(false);
  };

  // Formata a data em PT-BR
  const getButtonLabel = () => {
    if (!selectedRange?.from) {
      return "Selecionar data";
    } else if (selectedRange.from && !selectedRange.to) {
      return format(selectedRange.from, "dd MMM, yyyy", { locale: ptBR });
    } else {
      return `${format(selectedRange.from, "dd MMM, yyyy", { locale: ptBR })} 
              - 
              ${format(selectedRange.to!, "dd MMM, yyyy", { locale: ptBR })}`;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonLabel()}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 flex space-x-4">
            <div className="flex flex-col space-y-2">
              {PRESETS.map((preset) => {
                const presetRange = getPresetRange(preset.key);
                const isActive = isSameRange(tempRange, presetRange);

                return (
                  <Button
                    key={preset.key}
                    className="justify-start"
                    variant={isActive ? "ghost_primary" : "ghost"}
                    onClick={() => handlePresetRange(preset.key)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <Calendar
              initialFocus
              mode="range"
              showOutsideDays={false}
              fixedWeeks
              locale={ptBR}
              defaultMonth={tempRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
              classNames={{
                cell: "w-[36px]" 
              }}
            />
          </div>

          <div className="mt-4 flex justify-end space-x-2 px-4 pb-4">
            <Button size={"sm"} variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size={"sm"} variant="default" onClick={handleApply}>
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
