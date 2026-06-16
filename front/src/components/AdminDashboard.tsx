import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Settings, Store, Users, Loader2, Pencil, KeyRound, Eye, EyeOff, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  fetchStores, fetchCompanies, createStore, updateStore, deleteStore,
  fetchUsers, createUser, deleteUser,
  fetchUserPermissions, updateUserPermissions, fetchPermissionModules,
  resetUserPassword,
  type UserItem, type StoreItem, type CompanyItem,
} from "@/services/adminApi";

// ─── Reset Password Modal ─────────────────────────────────────────────────────

const ResetPasswordModal = ({ user, open, onClose }: { user: UserItem | null; open: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) { setNewPassword(""); setShow(false); }
  }, [open]);

  const handleSave = async () => {
    if (!user || newPassword.length < 6) return;
    setSaving(true);
    try {
      await resetUserPassword(user.id, newPassword);
      toast({ title: "Senha redefinida!", description: `Nova senha definida para ${user.name}.` });
      onClose();
    } catch (e: any) {
      toast({ title: "Erro ao redefinir senha", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Redefinir Senha
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Nova senha *</Label>
            <div className="relative mt-1">
              <Input
                type={show ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
                disabled={saving}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(s => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-destructive mt-1">Mínimo de 6 caracteres</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || newPassword.length < 6}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Store Form Modal ─────────────────────────────────────────────────────────

interface StoreFormModalProps {
  open: boolean;
  onClose: () => void;
  editStore?: StoreItem | null;
  companies: CompanyItem[];
  loadingCompanies: boolean;
}

const StoreFormModal = ({ open, onClose, editStore, companies, loadingCompanies }: StoreFormModalProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [storeName, setStoreName] = useState("");
  const [selectedCodhdas, setSelectedCodhdas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editStore) {
      setStoreName(editStore.name);
      setSelectedCodhdas((editStore.companies ?? []).map(c => c.codhda));
    } else {
      setStoreName("");
      setSelectedCodhdas([]);
    }
  }, [editStore, open]);

  const toggleCodhda = (codhda: string) => {
    setSelectedCodhdas(prev =>
      prev.includes(codhda) ? prev.filter(c => c !== codhda) : [...prev, codhda]
    );
  };

  const handleSave = async () => {
    if (!storeName) return;
    setSaving(true);
    try {
      if (editStore) {
        await updateStore(editStore.id, storeName, selectedCodhdas);
        toast({ title: "Loja atualizada!" });
      } else {
        await createStore(storeName, selectedCodhdas);
        toast({ title: "Loja criada com sucesso!" });
      }
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
      onClose();
    } catch (e: any) {
      toast({ title: "Erro ao salvar loja", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editStore ? "Editar Loja" : "Nova Loja"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Nome do agrupamento *</Label>
            <Input
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              placeholder="Ex: Honda SP"
            />
          </div>
          <div>
            <Label>Empresas IHS</Label>
            <p className="text-xs text-muted-foreground mb-2">Selecione as empresas deste agrupamento</p>
            {loadingCompanies ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
                {companies.map(c => (
                  <div
                    key={c.codhda}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer select-none"
                    onClick={() => toggleCodhda(c.codhda)}
                  >
                    <Checkbox checked={selectedCodhdas.includes(c.codhda)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{c.empresa || c.ihscompany_name}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">({c.codhda})</span>
                    </div>
                    {c.sigla_loja && <Badge variant="outline" className="text-xs shrink-0">{c.sigla_loja}</Badge>}
                  </div>
                ))}
                {companies.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma empresa disponível</p>
                )}
              </div>
            )}
            {selectedCodhdas.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{selectedCodhdas.length} empresa(s) selecionada(s)</p>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!storeName || saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {editStore ? "Salvar Alterações" : "Cadastrar Loja"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Stores Tab ───────────────────────────────────────────────────────────────

const StoresTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [search, setSearch] = useState("");

  const { data: storesData, isLoading: loadingStores } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: fetchStores,
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: fetchCompanies,
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteStore(id);
      toast({ title: "Loja removida." });
      qc.invalidateQueries({ queryKey: ["admin-stores"] });
    } catch (e: any) {
      toast({ title: "Erro ao remover loja", description: e.message, variant: "destructive" });
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingStore(null);
  };

  const allStores = storesData?.items ?? [];
  const q = search.trim().toLowerCase();
  const stores = q
    ? allStores.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.companies ?? []).some(sc =>
          sc.codhda.toLowerCase().includes(q) ||
          sc.company?.empresa?.toLowerCase().includes(q) ||
          sc.company?.sigla_loja?.toLowerCase().includes(q)
        )
      )
    : allStores;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {q ? `${stores.length} de ${allStores.length}` : `${allStores.length}`} loja(s)
        </p>
        <Button size="sm" onClick={() => { setEditingStore(null); setModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nova Loja
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, codhda ou empresa..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loadingStores ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Store className="h-12 w-12 opacity-20" />
          <p>{q ? `Nenhuma loja encontrada para "${search}"` : "Nenhuma loja cadastrada"}</p>
          {!q && (
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Criar primeira loja
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {stores.map((s: StoreItem) => (
            <Card key={s.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-sm">{s.name}</h3>
                      <Badge variant="secondary" className="text-xs">{(s.companies ?? []).length} empresa(s)</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(s.companies ?? []).map(sc => (
                        <div key={sc.codhda} className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                          <span className="font-mono text-xs font-medium">{sc.codhda}</span>
                          {sc.company?.sigla_loja && (
                            <span className="text-xs text-muted-foreground">· {sc.company.sigla_loja}</span>
                          )}
                          {sc.company?.empresa && (
                            <span className="text-xs text-muted-foreground truncate max-w-32">· {sc.company.empresa}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingStore(s); setModalOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StoreFormModal
        open={modalOpen}
        onClose={handleClose}
        editStore={editingStore}
        companies={companies}
        loadingCompanies={loadingCompanies}
      />
    </>
  );
};

// ─── Permissions Modal ────────────────────────────────────────────────────────

const PermissionsModal = ({ user, open, onClose }: { user: UserItem | null; open: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const { data: modules = [] } = useQuery({
    queryKey: ["permission-modules"],
    queryFn: fetchPermissionModules,
  });

  const { data: userPermissions } = useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: () => fetchUserPermissions(user!.id),
    enabled: open && !!user,
  });

  useEffect(() => {
    if (!open || !user) { setSelected([]); return; }
    if (userPermissions === undefined) return;
    setSelected(userPermissions.map(p => (p.module?.toLowerCase?.() ?? p.module) as string));
  }, [open, user, userPermissions]);

  const toggle = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const permissions = selected.map(k => ({ module: k.toUpperCase(), name: "READ" }));
      await updateUserPermissions(user.id, permissions);
      toast({ title: "Permissões atualizadas!" });
      onClose();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Permissões</DialogTitle>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </DialogHeader>
        <div className="space-y-2 py-1">
          {modules.map(mod => (
            <div key={mod.key} className="flex items-center gap-3 py-1">
              <Checkbox id={`perm-${mod.key}`} checked={selected.includes(mod.key)} onCheckedChange={() => toggle(mod.key)} />
              <Label htmlFor={`perm-${mod.key}`} className="cursor-pointer text-sm">{mod.name}</Label>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum módulo cadastrado</p>
          )}
        </div>
        <Button className="w-full mt-2" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          Salvar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [permUser, setPermUser] = useState<UserItem | null>(null);
  const [resetPwUser, setResetPwUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone_number: "", store_id: "" });
  const [search, setSearch] = useState("");

  const { data: usersData, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const { data: storesData } = useQuery({ queryKey: ["admin-stores"], queryFn: fetchStores });

  const allUsers = usersData?.items ?? [];
  const stores = storesData?.items ?? [];
  const q = search.trim().toLowerCase();
  const users = q
    ? allUsers.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone_number ?? "").toLowerCase().includes(q)
      )
    : allUsers;

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password || !form.store_id) return;
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined,
        store_id: Number(form.store_id),
      });
      toast({ title: "Usuário criado com sucesso!" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setCreateOpen(false);
      setForm({ name: "", email: "", password: "", phone_number: "", store_id: "" });
    } catch (e: any) {
      toast({ title: "Erro ao criar usuário", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      toast({ title: "Usuário removido." });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {q ? `${users.length} de ${allUsers.length}` : `${allUsers.length}`} usuário(s)
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Usuário
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou e-mail..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u: UserItem) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.phone_number ?? "-"}</TableCell>
                  <TableCell>
                    {u.isAdmin
                      ? <Badge className="text-xs">Admin</Badge>
                      : <Badge variant="outline" className="text-xs">Usuário</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Permissões" onClick={() => setPermUser(u)}>
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Redefinir senha" onClick={() => setResetPwUser(u)}>
                        <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                      </Button>
                      {!u.isAdmin && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    {q ? `Nenhum usuário encontrado para "${search}"` : "Nenhum usuário cadastrado"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <Label>E-mail *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Senha *</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <Label>Loja *</Label>
              <Select value={form.store_id} onValueChange={v => setForm(f => ({ ...f, store_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a loja..." /></SelectTrigger>
                <SelectContent>
                  {stores.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={!form.name || !form.email || !form.password || !form.store_id}
            >
              Criar Usuário
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PermissionsModal user={permUser} open={!!permUser} onClose={() => setPermUser(null)} />
      <ResetPasswordModal user={resetPwUser} open={!!resetPwUser} onClose={() => setResetPwUser(null)} />
    </>
  );
};

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export const AdminDashboard = () => (
  <div className="p-6 space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Administração</h1>
      <p className="text-muted-foreground text-sm">Gerencie lojas, usuários e permissões</p>
    </div>

    <Tabs defaultValue="stores">
      <TabsList>
        <TabsTrigger value="stores" className="gap-1.5">
          <Store className="h-4 w-4" /> Lojas
        </TabsTrigger>
        <TabsTrigger value="users" className="gap-1.5">
          <Users className="h-4 w-4" /> Usuários
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stores" className="mt-4">
        <StoresTab />
      </TabsContent>

      <TabsContent value="users" className="mt-4">
        <UsersTab />
      </TabsContent>
    </Tabs>
  </div>
);
