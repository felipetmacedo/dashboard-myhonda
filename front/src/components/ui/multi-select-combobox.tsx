import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado.",
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const allSelected = selected.length === options.length && options.length > 0;

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === options.length
      ? `Todas selecionadas (${selected.length})`
      : `${selected.length} de ${options.length} selecionada${selected.length > 1 ? "s" : ""}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 font-normal min-w-0",
            className
          )}
        >
          <span className="truncate text-left flex-1 min-w-0">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command filter={(value, search) => {
          if (value.toLowerCase().includes(search.toLowerCase())) return 1;
          return 0;
        }}>
          <div className="flex items-center gap-2 p-2 border-b">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm flex-1"
              onClick={handleSelectAll}
            >
              Marcar Todas
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-sm flex-1"
              onClick={handleDeselectAll}
            >
              Limpar Seleção
            </Button>
            <Badge variant="secondary" className="text-xs shrink-0">
              {selected.length}/{options.length}
            </Badge>
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isChecked = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={isChecked}
                      className="pointer-events-none shrink-0"
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
