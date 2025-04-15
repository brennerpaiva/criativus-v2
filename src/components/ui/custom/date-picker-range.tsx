"use client";

import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale"; // <- Import da localidade PT-BR
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

  const getButtonLabel = () => {
    if (!selectedRange?.from) {
      return "Selecionar data";
    } else if (selectedRange.from && !selectedRange.to) {
      return format(selectedRange.from, "dd MMM, yyyy", { locale: ptBR });
    } else {
      return `${format(selectedRange.from, "dd MMM, yyyy", { locale: ptBR })} - 
              ${format(selectedRange.to!, "dd MMM, yyyy", { locale: ptBR })}`;
    }
  };

  const handleApply = () => {
    setSelectedRange(tempRange);
    setOpen(false);
    onChange?.(tempRange);
  };

  const handleCancel = () => {
    setTempRange(selectedRange);
    setOpen(false);
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
          <div className="p-4">
            <Calendar
              initialFocus
              mode="range"
              locale={ptBR}
              defaultMonth={tempRange?.from}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button size={"sm"} variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button size={"sm"} variant="default" onClick={handleApply}>
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
