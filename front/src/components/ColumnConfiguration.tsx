import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
  width?: string;
}

interface ColumnConfigurationProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export const ColumnConfiguration = ({ columns, onColumnsChange }: ColumnConfigurationProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toggleColumnVisibility = (columnKey: string) => {
    const updatedColumns = columns.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newColumns = [...columns];
    const draggedColumn = newColumns[draggedIndex];
    
    // Remove o item arrastado
    newColumns.splice(draggedIndex, 1);
    
    // Insere no novo local
    newColumns.splice(dropIndex, 0, draggedColumn);
    
    // Atualiza a ordem
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index
    }));

    onColumnsChange(reorderedColumns);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const showAllColumns = () => {
    const updatedColumns = columns.map(col => ({ ...col, visible: true }));
    onColumnsChange(updatedColumns);
  };

  const hideAllColumns = () => {
    const updatedColumns = columns.map(col => ({ ...col, visible: false }));
    onColumnsChange(updatedColumns);
  };

  const resetToDefault = () => {
    const defaultColumns = [...columns].sort((a, b) => a.order - b.order).map((col, index) => ({
      ...col,
      visible: true,
      order: index
    }));
    onColumnsChange(defaultColumns);
  };

  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurar Colunas
          <Badge variant="secondary" className="ml-2">
            {visibleCount}/{totalCount}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Colunas
          </SheetTitle>
          <SheetDescription>
            Selecione as colunas que deseja exibir e arraste para reordenar
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          {/* Controles rápidos */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={showAllColumns}>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Todas
            </Button>
            <Button variant="outline" size="sm" onClick={hideAllColumns}>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Todas
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              Resetar Padrão
            </Button>
          </div>

          {/* Lista de colunas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Colunas Disponíveis ({visibleCount} de {totalCount} visíveis)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {columns.map((column, index) => (
                <div
                  key={column.key}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move
                    ${dragOverIndex === index ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    ${draggedIndex === index ? 'opacity-50' : ''}
                  `}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  
                  <Checkbox
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                    className="flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${column.visible ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {column.label}
                      </span>
                      <Badge variant={column.visible ? "default" : "secondary"} className="ml-2">
                        {column.order + 1}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resumo */}
          <div className="text-sm text-muted-foreground">
            <p>💡 <strong>Dica:</strong> Arraste as colunas para reordenar e use as caixas de seleção para mostrar/ocultar</p>
            <p>🔄 Use "Resetar Padrão" para voltar à configuração original</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};