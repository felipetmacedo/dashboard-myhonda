import React from "react";
import { CompactAutoRefresh } from "./CompactAutoRefresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  showAutoRefresh?: boolean;
}

export const PageHeader = ({
  title,
  children,
  actions,
  onRefresh,
  showAutoRefresh = false,
}: PageHeaderProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {actions}
          {showAutoRefresh && onRefresh && (
            <CompactAutoRefresh onRefresh={onRefresh} />
          )}
        </div>
      </div>
      {children && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1.2fr)_1fr_auto] items-end gap-4">
              {children}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
