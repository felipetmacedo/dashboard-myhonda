---
trigger: always_on
---

# Guia de Componentes - Dashboard MyHonda SFS

## 📋 Índice
1. [Tipos de Componentes](#tipos-de-componentes)
2. [Componentes UI Base (shadcn/ui)](#componentes-ui-base)
3. [Componentes de Dashboard](#componentes-de-dashboard)
4. [Componentes de Tabela](#componentes-de-tabela)
5. [Componentes de Gráficos](#componentes-de-gráficos)
6. [Componentes de Controle](#componentes-de-controle)
7. [Como Criar Novos Componentes](#como-criar-novos-componentes)

---

## 🎯 Tipos de Componentes

### Hierarquia de Componentes

```
┌─────────────────────────────────────────┐
│  UI Base (shadcn/ui)                    │
│  - Button, Card, Input, Table, etc      │
└─────────────────────────────────────────┘
              ↓ usado por
┌─────────────────────────────────────────┐
│  Componentes de Apresentação            │
│  - StatsCards, ExportButtons, etc       │
└─────────────────────────────────────────┘
              ↓ usado por
┌─────────────────────────────────────────┐
│  Componentes de Negócio                 │
│  - PropostasTable, ChartsGrid, etc      │
└─────────────────────────────────────────┘
              ↓ usado por
┌─────────────────────────────────────────┐
│  Componentes de Dashboard               │
│  - AdimplenciaDashboard, etc            │
└─────────────────────────────────────────┘
              ↓ usado por
┌─────────────────────────────────────────┐
│  Páginas                                │
│  - Index, Adimplencia, etc              │
└─────────────────────────────────────────┘
```

---

## 🧩 Componentes UI Base

### Componentes shadcn/ui Disponíveis

#### **Formulários e Inputs**
- `Button` - Botões com variantes
- `Input` - Campos de texto
- `Textarea` - Área de texto
- `Select` - Seleção dropdown
- `Checkbox` - Caixas de seleção
- `Radio Group` - Grupos de rádio
- `Switch` - Interruptores
- `Slider` - Controles deslizantes
- `Calendar` - Seletor de data
- `Date Picker` - Seletor de data completo
- `Form` - Formulários com validação

#### **Layout**
- `Card` - Cartões de conteúdo
- `Separator` - Separadores
- `Tabs` - Abas
- `Accordion` - Acordeões
- `Collapsible` - Conteúdo recolhível
- `Resizable` - Painéis redimensionáveis
- `Scroll Area` - Área com scroll customizado
- `Sheet` - Painéis laterais
- `Sidebar` - Barra lateral

#### **Navegação**
- `Navigation Menu` - Menu de navegação
- `Menubar` - Barra de menu
- `Breadcrumb` - Navegação breadcrumb
- `Pagination` - Paginação

#### **Feedback**
- `Alert` - Alertas
- `Alert Dialog` - Diálogos de alerta
- `Dialog` - Diálogos modais
- `Drawer` - Gavetas deslizantes
- `Toast` / `Sonner` - Notificações
- `Progress` - Barras de progresso
- `Skeleton` - Placeholders de carregamento

#### **Dados**
- `Table` - Tabelas
- `Chart` - Gráficos (Recharts)
- `Badge` - Badges
- `Avatar` - Avatares

#### **Overlays**
- `Tooltip` - Dicas de ferramentas
- `Popover` - Popovers
- `Hover Card` - Cartões ao passar o mouse
- `Context Menu` - Menu de contexto
- `Dropdown Menu` - Menu dropdown

#### **Outros**
- `Command` - Paleta de comandos
- `Toggle` - Botões de alternância
- `Toggle Group` - Grupos de alternância
- `Aspect Ratio` - Proporção de aspecto
- `Input OTP` - Input de código OTP

### Como Usar Componentes shadcn/ui

```typescript
// 1. Import do componente
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 2. Uso básico
<Button>Click me</Button>

// 3. Com variantes
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// 4. Com tamanhos
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// 5. Composição de componentes
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Conteúdo do card</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>
```

---

## 📊 Componentes de Dashboard

### Estrutura Padrão de Dashboard

```typescript
// src/components/[Feature]Dashboard.tsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Imports de componentes
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/[Feature]StatsCards';
import { [Feature]Table } from '@/components/[Feature]Table';
import { [Feature]ChartsGrid } from '@/components/[Feature]ChartsGrid';
import { [Feature]ParametersControl } from '@/components/[Feature]ParametersControl';
import { ExportButtons } from '@/components/ExportButtons';

// Imports de serviços
import { fetch[Feature]Data } from '@/services/[feature]Api';
import { [Feature]Data } from '@/services/[feature]Types';

export const [Feature]Dashboard = () => {
  // 1. Estado local
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({});
  
  // 2. Contextos
  const { getCodhdaList } = useAuth();
  
  // 3. Queries
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['feature', dateRange, filters],
    queryFn: () => fetch[Feature]Data({ ...dateRange, ...filters }),
    staleTime: 5 * 60 * 1000,
  });
  
  // 4. Handlers
  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
  };
  
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  // 5. Loading e Error states
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados</div>;
  
  // 6. Render
  return (
    <div className="space-y-4 p-4">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Controles</CardTitle>
        </CardHeader>
        <CardContent>
          <[Feature]ParametersControl
            onDateChange={handleDateChange}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>
      
      {/* Estatísticas */}
      <StatsCards data={data} />
      
      {/* Gráficos */}
      <[Feature]ChartsGrid data={data} />
      
      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dados Detalhados</CardTitle>
          <ExportButtons data={data} filename="[feature]-export" />
        </CardHeader>
        <CardContent>
          <[Feature]Table data={data} />
        </CardContent>
      </Card>
    </div>
  );
};
```

### Dashboards Existentes

#### **AdimplenciaDashboard**
```typescript
// src/components/AdimplenciaDashboard.tsx
- Exibe dados de adimplência
- Filtros por data e loja
- Cards de estatísticas
- Tabela de detalhes
- Exportação de dados
```

#### **LanceDashboard**
```typescript
// src/components/LanceDashboard.tsx
- Análise de lances
- Filtros por período
- Gráficos de tendências
- Tabela de lances
- Resumo de totais
```

#### **PropostasDashboard**
```typescript
// src/components/PropostasDashboard.tsx
- Dashboard de propostas
- Filtros avançados
- Cards de KPIs
- Gráficos de status
- Tabela de propostas
```

#### **RetencaoDashboard**
```typescript
// src/components/RetencaoDashboard.tsx
- Dados de retenção
- Análise de churn
- Gráficos de retenção
- Tabela de clientes
```

---

## 📋 Componentes de Tabela

### Estrutura Padrão de Tabela

```typescript
// src/components/[Feature]Table.tsx

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface [Feature]TableProps {
  data: [Feature]Data[];
}

export const [Feature]Table = ({ data }: [Feature]TableProps) => {
  // 1. Estado de ordenação
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // 2. Função de ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // 3. Dados ordenados
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // 4. Render
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('column1')}
                className="flex items-center gap-2"
              >
                Coluna 1
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Coluna 2</TableHead>
            <TableHead>Coluna 3</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.column1}</TableCell>
              <TableCell>{row.column2}</TableCell>
              <TableCell>{row.column3}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

### Recursos Comuns em Tabelas

#### **Paginação**
```typescript
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const paginatedData = sortedData.slice(
  (page - 1) * pageSize,
  page * pageSize
);

// Componente de paginação
<Pagination
  currentPage={page}
  totalPages={Math.ceil(data.length / pageSize)}
  onPageChange={setPage}
/>
```

#### **Filtros**
```typescript
const [searchTerm, setSearchTerm] = useState('');

const filteredData = data.filter(row =>
  Object.values(row).some(value =>
    String(value).toLowerCase().includes(searchTerm.toLowerCase())
  )
);
```

#### **Seleção de Linhas**
```typescript
const [selectedRows, setSelectedRows] = useState<string[]>([]);

const handleSelectRow = (id: string) => {
  setSelectedRows(prev =>
    prev.includes(id)
      ? prev.filter(rowId => rowId !== id)
      : [...prev, id]
  );
};

// Checkbox na tabela
<Checkbox
  checked={selectedRows.includes(row.id)}
  onCheckedChange={() => handleSelectRow(row.id)}
/>
```

---

## 📈 Componentes de Gráficos

### Estrutura Padrão de Gráficos

```typescript
// src/components/[Feature]ChartsGrid.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartsGridProps {
  data: ChartData[];
}

export const [Feature]ChartsGrid = ({ data }: ChartsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Gráfico de Linha */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Gráfico de Pizza */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
```

### Tipos de Gráficos Disponíveis

- **LineChart** - Gráficos de linha (tendências)
- **BarChart** - Gráficos de barras (comparações)
- **PieChart** - Gráficos de pizza (distribuições)
- **AreaChart** - Gráficos de área
- **ScatterChart** - Gráficos de dispersão
- **RadarChart** - Gráficos de radar
- **ComposedChart** - Gráficos compostos

---

## 🎛️ Componentes de Controle

### Estrutura de Controles de Parâmetros

```typescript
// src/components/[Feature]ParametersControl.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface ParametersControlProps {
  onDateChange: (range: DateRange) => void;
  onFilterChange: (filters: Filters) => void;
  onRefresh: () => void;
}

export const [Feature]ParametersControl = ({
  onDateChange,
  onFilterChange,
  onRefresh,
}: ParametersControlProps) => {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Seletor de Data */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">
          Período
        </label>
        <DateRangePicker onChange={onDateChange} />
      </div>
      
      {/* Filtros */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">
          Status
        </label>
        <Select onValueChange={(value) => onFilterChange({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Botão de Atualizar */}
      <Button onClick={onRefresh} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
    </div>
  );
};
```

### Componentes de Controle Existentes

- **DateRangePicker** - Seletor de intervalo de datas
- **AutoRefreshControl** - Controle de atualização automática
- **ColumnConfiguration** - Configuração de colunas visíveis
- **ApiParametersControl** - Controles de parâmetros de API

---

## 🆕 Como Criar Novos Componentes

### 1. Componente de Apresentação Simples

```typescript
// src/components/MyNewComponent.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MyNewComponentProps {
  title: string;
  data: string[];
}

export const MyNewComponent = ({ title, data }: MyNewComponentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="text-sm">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
```

### 2. Componente com Estado

```typescript
// src/components/MyStatefulComponent.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const MyStatefulComponent = () => {
  const [value, setValue] = useState('');
  const [items, setItems] = useState<string[]>([]);
  
  const handleAdd = () => {
    if (value.trim()) {
      setItems([...items, value]);
      setValue('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite algo..."
        />
        <Button onClick={handleAdd}>Adicionar</Button>
      </div>
      
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 3. Componente com API

```typescript
// src/components/MyApiComponent.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMyData } from '@/services/myApi';
import { MyData } from '@/services/myTypes';

export const MyApiComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: fetchMyData,
  });
  
  if (isLoading) {
    return <div>Carregando...</div>;
  }
  
  if (error) {
    return <div>Erro ao carregar dados</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Dados</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.map((item: MyData) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </CardContent>
    </Card>
  );
};
```

### Checklist para Novos Componentes

- [ ] Nome em PascalCase
- [ ] Props interface definida
- [ ] TypeScript tipado
- [ ] Imports organizados
- [ ] Usa componentes shadcn/ui quando possível
- [ ] Tailwind CSS para estilização
- [ ] Responsivo (mobile-first)
- [ ] Loading e error states
- [ ] Comentários quando necessário
- [ ] Export nomeado
- [ ] Testável (props claras, lógica separada)
