import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface AutoRefreshControlProps {
  onRefresh: () => void;
  className?: string;
}

const intervalOptions = [
  { value: 30, label: '30 segundos' },
  { value: 60, label: '1 minuto' },
  { value: 120, label: '2 minutos' },
  { value: 300, label: '5 minutos' },
  { value: 600, label: '10 minutos' },
];

export const AutoRefreshControl = ({ onRefresh, className }: AutoRefreshControlProps) => {
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(60); // Default to 1 minute

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
    <Card className={`h-full ${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Atualização Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-refresh" className="text-sm">
            Ativada
          </Label>
          <Switch
            id="auto-refresh"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        
        <div className="space-y-2">
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
      </CardContent>
    </Card>
  );
};