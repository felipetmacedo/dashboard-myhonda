
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";

interface ApiParametersProps {
  onParametersChange: (params: {
    codhda: string;
    dataInicio: string;
    dataFinal: string;
    parcela?: string;
  }) => void;
}

export const ApiParametersControl = ({ onParametersChange }: ApiParametersProps) => {
  const [codhda, setCodhda] = useState("1777135");
  const [dataInicio, setDataInicio] = useState("2025-05-01");
  const [dataFinal, setDataFinal] = useState("2025-05-31");
  const [parcela, setParcela] = useState("");

  const handleApplyParameters = () => {
    onParametersChange({
      codhda,
      dataInicio,
      dataFinal,
      parcela: parcela || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Parâmetros da Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="codhda">CODHDA</Label>
            <Input
              id="codhda"
              value={codhda}
              onChange={(e) => setCodhda(e.target.value)}
              placeholder="Ex: 1777135"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataFinal">Data Final</Label>
            <Input
              id="dataFinal"
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parcela">Parcela (opcional)</Label>
            <Input
              id="parcela"
              value={parcela}
              onChange={(e) => setParcela(e.target.value)}
              placeholder="Ex: 1, 2, 3..."
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleApplyParameters} className="w-full md:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Consulta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
