
import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

const getPresetRanges = () => {
  const today = new Date()
  const yesterday = addDays(today, -1)
  const lastWeek = addDays(today, -7)
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  const currentYear = new Date(today.getFullYear(), 0, 1)
  const lastYear = new Date(today.getFullYear() - 1, 0, 1)
  const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return [
    { label: "Hoje", range: { from: today, to: today } },
    { label: "Ontem", range: { from: yesterday, to: yesterday } },
    { label: "Últimos 7 dias", range: { from: lastWeek, to: today } },
    { label: "Mês atual", range: { from: currentMonth, to: currentMonthEnd } },
    { label: "Mês passado", range: { from: lastMonth, to: lastMonthEnd } },
    { label: "Próximo mês", range: { from: nextMonth, to: nextMonthEnd } },
    { label: "Este ano", range: { from: currentYear, to: today } },
    { label: "Ano passado", range: { from: lastYear, to: lastYearEnd } },
  ]
}

const getCurrentMonthRange = (): DateRange => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { from: firstDay, to: lastDay }
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Selecione um período",
  disabled = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value || getCurrentMonthRange())
  const [open, setOpen] = React.useState(false)
  const presetRanges = getPresetRanges()

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      onChange?.(range)
    }
  }

  const handlePresetClick = (range: DateRange) => {
    setDate(range)
    onChange?.(range)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            type="button"
            variant={"outline"}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !date && "text-muted-foreground",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b">
            <h4 className="font-medium text-sm">Selecione o período</h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-row sm:flex-col border-b sm:border-b-0 sm:border-r overflow-x-auto sm:overflow-x-visible">
              <div className="flex flex-row sm:flex-col p-2 gap-1">
                {presetRanges.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    className="justify-start text-sm h-8 whitespace-nowrap"
                    onClick={() => handlePresetClick(preset.range)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleCalendarSelect}
                numberOfMonths={2}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
