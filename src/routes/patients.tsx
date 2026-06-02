import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Activity, Trash2, Printer, Search, Phone, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/patients")({
  component: () => <AuthGate><AppLayout><Patients /></AppLayout></AuthGate>,
});

type Patient = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  notes: string | null;
  clinical_indication: string | null;
  created_at: string;
};

const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const formatPhone = (s: string | null | undefined) => {
  const d = onlyDigits(s ?? "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return s ?? "";
};

function Patients() {
  const { user } = useAuth();
  const [list, setList] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "", notes: "", clinical_indication: "" });
  const [editing, setEditing] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "", phone: "", notes: "", clinical_indication: "" });

  const load = async () => {
    const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setList((data ?? []) as Patient[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return list;
    const qd = onlyDigits(q);
    return list.filter((p) => {
      const pd = onlyDigits(p.phone ?? "");
      const byPhone = qd.length >= 3 && pd.includes(qd);
      const byName = p.name.toLowerCase().includes(q.toLowerCase());
      return byPhone || byName;
    });
  }, [list, query]);

  const create = async () => {
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    const phoneDigits = onlyDigits(form.phone);
    if (!phoneDigits || phoneDigits.length < 10) return toast.error("Telefone obrigatório (com DDD)");
    // duplicidade por telefone + nome (permite mesmo telefone para nomes diferentes)
    const { data: dups } = await supabase.from("patients").select("id,name").eq("phone", phoneDigits);
    const sameName = (dups ?? []).find((d) => d.name.trim().toLowerCase() === form.name.trim().toLowerCase());
    if (sameName) return toast.error(`Já existe paciente com este nome e telefone: ${sameName.name}`);

    const { error } = await supabase.from("patients").insert({
      therapist_id: user!.id,
      name: form.name.trim(),
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      phone: phoneDigits,
      notes: form.notes || null,
      clinical_indication: form.clinical_indication || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Paciente cadastrado");
    setOpen(false);
    setForm({ name: "", age: "", gender: "", phone: "", notes: "", clinical_indication: "" });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Paciente removido");
    load();
  };

  const printCadastro = (p: Patient) => {
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
      <title>Cadastro — ${p.name}</title>
      <style>
        *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;padding:32px;max-width:720px;margin:auto}
        h1{margin:0 0 4px;font-size:22px} .sub{color:#666;font-size:12px;margin-bottom:24px}
        .row{display:grid;grid-template-columns:160px 1fr;gap:8px;padding:10px 0;border-bottom:1px solid #eee}
        .label{color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
        .val{font-size:14px}
        .foot{margin-top:32px;font-size:11px;color:#888;text-align:center}
        @media print {.no-print{display:none}}
      </style></head><body>
      <h1>Ficha de Cadastro do Paciente</h1>
      <div class="sub">Mentor ND · Consultório Dra. Nádia Bara · Emitido em ${new Date().toLocaleString("pt-BR")}</div>
      <div class="row"><div class="label">Nome</div><div class="val">${p.name}</div></div>
      <div class="row"><div class="label">Telefone</div><div class="val">${formatPhone(p.phone) || "—"}</div></div>
      <div class="row"><div class="label">Idade</div><div class="val">${p.age ?? "—"}</div></div>
      <div class="row"><div class="label">Gênero</div><div class="val">${p.gender ?? "—"}</div></div>
      <div class="row"><div class="label">Cadastrado em</div><div class="val">${new Date(p.created_at).toLocaleDateString("pt-BR")}</div></div>
      <div class="row"><div class="label">Queixas do Paciente</div><div class="val" style="white-space:pre-wrap">${(p.clinical_indication ?? "—").replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div></div>
      <div class="row"><div class="label">Medicamentos que Usa</div><div class="val" style="white-space:pre-wrap">${(p.notes ?? "—").replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div></div>
      <div style="margin-top:24px;padding:16px;border:1px solid #ddd;border-radius:8px;background:#fafafa">
        <h2 style="font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Termo de Ciência e Integração Clínica</h2>
        <p style="font-size:12px;line-height:1.55;margin:0 0 8px;text-align:justify">O Mentor ND é uma plataforma tecnológica de suporte vibracional e biofeedback, desenvolvida para auxiliar na harmonização energética e na expansão da consciência. É imperativo ressaltar que o uso desta ferramenta <strong>COMPLEMENTA</strong>, mas de forma alguma <strong>SUBSTITUI</strong>, o atendimento médico convencional, as consultas presenciais, os exames diagnósticos ou os tratamentos farmacológicos e terapêuticos prescritos por profissionais de saúde devidamente habilitados.</p>
        <p style="font-size:12px;line-height:1.55;margin:0;text-align:justify">O usuário deve manter rigorosamente seu acompanhamento médico regular e seguir todas as orientações clínicas recebidas de seus assistentes de saúde. O Mentor ND atua como um transceptor auxiliar de integridade noosférica, visando a otimização do bem-estar subjetivo e a coerência biológica, não devendo ser utilizado como base única para decisões de saúde de natureza crítica ou emergencial. A utilização ética e profissional desta tecnologia pressupõe a integração harmônica entre os avanços da medicina integrativa e os protocolos da medicina alopática tradicional.</p>
      </div>
      <div class="foot">Documento confidencial — uso exclusivo do consultório</div>
      </body></html>`;
    const printHtml = html.replace("</body>", `<script>window.onload=()=>{setTimeout(()=>{window.print();},400);};window.onafterprint=()=>window.close();<\/script></body>`);
    const w = window.open("", "_blank");
    if (!w) { toast.error("Permita pop-ups para gerar o PDF"); return; }
    w.document.open();
    w.document.write(printHtml);
    w.document.close();
    toast.success("Use 'Salvar como PDF' na janela de impressão");
  };



  const openEdit = (p: Patient) => {
    setEditing(p);
    setEditForm({
      name: p.name ?? "",
      age: p.age != null ? String(p.age) : "",
      gender: p.gender ?? "",
      phone: formatPhone(p.phone) || (p.phone ?? ""),
      notes: p.notes ?? "",
      clinical_indication: p.clinical_indication ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editForm.name.trim()) return toast.error("Nome obrigatório");
    const phoneDigits = onlyDigits(editForm.phone);
    if (!phoneDigits || phoneDigits.length < 10) return toast.error("Telefone obrigatório (com DDD)");
    const { error } = await supabase.from("patients").update({
      name: editForm.name.trim(),
      age: editForm.age ? Number(editForm.age) : null,
      gender: editForm.gender || null,
      phone: phoneDigits,
      notes: editForm.notes || null,
      clinical_indication: editForm.clinical_indication || null,
    }).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Ficha atualizada");
    setEditing(null);
    void load();
  };

  const exportList = (fmt: "json" | "csv") => {
    if (list.length === 0) { toast.error("Nenhum paciente para exportar"); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    let blob: Blob, filename: string;
    if (fmt === "json") {
      blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
      filename = `pacientes-${stamp}.json`;
    } else {
      const cols = ["name","phone","age","gender","clinical_indication","notes","created_at"] as const;
      const esc = (v: unknown) => {
        const s = v == null ? "" : String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = [cols.join(";"), ...list.map((p) => cols.map((c) => esc((p as any)[c])).join(";"))];
      blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
      filename = `pacientes-${stamp}.csv`;
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exportado: ${filename}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Selecione um paciente para iniciar a sessão.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => exportList("csv")}>Exportar CSV</Button>
          <Button variant="outline" size="sm" onClick={() => exportList("json")}>Exportar JSON</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-aura-gradient"><Plus className="h-4 w-4 mr-2" /> Novo paciente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo paciente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Telefone (com DDD)</Label><Input inputMode="tel" placeholder="(11) 91234-5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Idade</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label>Gênero</Label><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
              </div>
              <div><Label>Medicamentos que Usa</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div><Label>Queixas do Paciente</Label><Textarea rows={3} placeholder="Queixa principal, indicação para tratamento…" value={form.clinical_indication} onChange={(e) => setForm({ ...form, clinical_indication: e.target.value })} /></div>
              <Button className="w-full bg-aura-gradient" onClick={create}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>


      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por telefone ou nome…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="shadow-soft"><CardContent className="py-12 text-center text-muted-foreground">
          {list.length === 0 ? "Nenhum paciente cadastrado ainda." : "Nenhum resultado para esta busca."}
        </CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="shadow-soft hover:shadow-glow transition">
              <CardHeader><CardTitle className="text-lg">{p.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {formatPhone(p.phone) || "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.age ? `${p.age} anos` : "Idade —"} · {p.gender || "—"}
                </p>
                {p.clinical_indication && (
                  <p className="text-xs text-foreground/80 line-clamp-3 whitespace-pre-wrap border-l-2 border-primary/40 pl-2">
                    <span className="font-medium">Queixas do Paciente:</span> {p.clinical_indication}
                  </p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Link to="/session/$patientId" params={{ patientId: p.id }} className="flex-1">
                    <Button className="w-full bg-aura-gradient" size="sm"><Activity className="h-4 w-4 mr-2" /> Nova sessão</Button>
                  </Link>
                  <Link to="/patient/$patientId" params={{ patientId: p.id }}>
                    <Button variant="outline" size="sm">Histórico</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)} title="Editar ficha do paciente">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => printCadastro(p)} title="Imprimir cadastro">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. As sessões registradas para <strong>{p.name}</strong> permanecerão no banco, mas o paciente será removido da lista.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar ficha do paciente</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><Label>Telefone (com DDD)</Label><Input inputMode="tel" placeholder="(11) 91234-5678" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Idade</Label><Input type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} /></div>
              <div><Label>Gênero</Label><Input value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} /></div>
            </div>
            <div><Label>Medicamentos que Usa</Label><Input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
            <div><Label>Queixas do Paciente</Label><Textarea rows={3} value={editForm.clinical_indication} onChange={(e) => setEditForm({ ...editForm, clinical_indication: e.target.value })} /></div>
            <Button className="w-full bg-aura-gradient" onClick={saveEdit}>Salvar alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
