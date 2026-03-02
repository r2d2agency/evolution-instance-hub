import { useState } from "react";
import { EvolutionInstance, InstanceGroup } from "@/types/evolution";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/hooks/useGroups";
import { useInstances } from "@/hooks/useInstances";

export default function Groups() {
  const { toast } = useToast();
  const { data: apiGroups } = useGroups();
  const { data: apiInstances } = useInstances();

  const groups: InstanceGroup[] = apiGroups || [];
  const instances: EvolutionInstance[] = apiInstances || [];

  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<InstanceGroup | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#22c55e");
  const [description, setDescription] = useState("");

  const openEdit = (group: InstanceGroup) => {
    setEditGroup(group);
    setName(group.name);
    setColor(group.color);
    setDescription(group.description || "");
  };

  const handleSave = () => {
    const data = { name, color, description: description || undefined };
    if (editGroup) {
      updateMutation.mutate(
        { id: editGroup.id, data },
        {
          onSuccess: () => {
            toast({ title: "Grupo atualizado" });
            setEditGroup(null);
          },
          onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast({ title: "Grupo criado", description: `${name} salvo com sucesso.` });
          setCreateOpen(false);
          setName("");
          setColor("#22c55e");
          setDescription("");
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (group: InstanceGroup) => {
    deleteMutation.mutate(group.id, {
      onSuccess: () => toast({ title: "Grupo removido", description: `${group.name} foi excluído.`, variant: "destructive" }),
      onError: (err) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
    });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grupos</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize suas instâncias em grupos</p>
        </div>
        <Button
          onClick={() => {
            setEditGroup(null);
            setName("");
            setColor("#22c55e");
            setDescription("");
            setCreateOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => {
          const count = instances.filter((i) => i.groupId === group.id).length;
          return (
            <Card key={group.id} className="bg-card border-border/50 p-5 group hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                    <h3 className="font-semibold text-foreground">{group.name}</h3>
                  </div>
                  {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
                  <Badge variant="outline" className="border-border/50 text-muted-foreground gap-1">
                    <Server className="h-3 w-3" />
                    {count} instância{count !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(group)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen || !!editGroup} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditGroup(null); } }}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader><DialogTitle>{editGroup ? "Editar Grupo" : "Novo Grupo"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-muted border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border border-border/50 bg-muted cursor-pointer" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono bg-muted border-border/50 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-muted border-border/50" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditGroup(null); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!name.trim() || isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
