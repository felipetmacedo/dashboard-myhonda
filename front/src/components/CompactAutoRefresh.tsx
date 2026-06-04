import { useState } from "react";
import { RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface CompactAutoRefreshProps {
  onRefresh: () => void;
}

const intervalOptions = [
  { value: 30, label: "30 segundos" },
  { value: 60, label: "1 minuto" },
  { value: 120, label: "2 minutos" },
  { value: 300, label: "5 minutos" },
  { value: 600, label: "10 minutos" },
];

export const CompactAutoRefresh = ({ onRefresh }: CompactAutoRefreshProps) => {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(60);

  const { timeRemaining } = useAutoRefresh({
    enabled,
    interval,
    onRefresh,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <RotateCcw className={`h-4 w-4 ${enabled ? "animate-spin" : ""}`} style={enabled ? { animationDuration: "3s" } : undefined} />
          <span className="hidden sm:inline text-sm">Atualização Automática</span>
          {enabled && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Atualização Automática
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh-compact" className="text-sm">
              Ativada
            </Label>
            <Switch
              id="auto-refresh-compact"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Intervalo</Label>
            <Select
              value={interval.toString()}
              onValueChange={(value) => setInterval(Number(value))}
              disabled={!enabled}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {enabled && (
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Próxima atualização:</span>
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="w-full h-8"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Atualizar Agora
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
