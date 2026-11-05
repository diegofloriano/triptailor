import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, UserCheck, FileCheck, DollarSign, MessageSquare, UserPlus, Send, Plus, Lock } from "lucide-react";
import { PLANS, brl } from "@/lib/pricing";
import { WhatsAppDialog, type WaMessage } from "@/components/WhatsAppDialog";
import { useDB, uid, type LeadStatus, type EntregaStatus, type Lembrete } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Admin — TripTailor" },
      { name: "description", content: "Gestão de leads, clientes, entregas e lembretes do TripTailor." },
      { property: "og:title", content: "Painel Admin — TripTailor" },
      { property: "og:description", content: "Gestão operacional do TripTailor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const pill: Record<string, string> = {
  Novo: "bg-accent text-accent-foreground", "Em Contato": "bg-secondary/15 text-secondary", Convertido: "bg-success/15 text-success", Perdido: "bg-muted text-muted-foreground",
  "Aguardando PIX": "bg-secondary/15 text-secondary", Pago: "bg-success/15 text-success",
  "Na Fila": "bg-muted text-muted-foreground", "Montando PDF": "bg-accent text-accent-foreground", Entregue: "bg-success/15 text-success",
  Alta: "bg-destructive/15 text-destructive", Média: "bg-secondary/15 text-secondary", Baixa: "bg-muted text-muted-foreground",
};
const Pill = ({ v }: { v: string }) => <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill[v] ?? ""}`}>{v}</span>;
const btn = "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition hover:brightness-110";
const fmtDate = (s: string) => new Date(s + "T12:00").toLocaleDateString("pt-BR");

function Login({ onOk }: { onOk: () => void }) {
  const [p, setP] = useState("");
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form onSubmit={(e) => { e.preventDefault(); if (p === "admin123") { sessionStorage.setItem("tt-admin", "1"); onOk(); } else toast.error("Senha incorreta"); }}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
        <Lock className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">Painel Admin</h1>
        <p className="text-sm text-muted-foreground">Senha de demonstração: <b className="text-foreground">admin123</b></p>
        <input type="password" className="input-base" placeholder="Senha" value={p} onChange={(e) => setP(e.target.value)} />
        <button className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground">Entrar</button>
      </form>
    </div>
  );
}

function Admin() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(sessionStorage.getItem("tt-admin") === "1"), []);
  return ok ? <Dashboard /> : <Login onOk={() => setOk(true)} />;
}

function Dashboard() {
  const [db, update] = useDB();
  const [tab, setTab] = useState<"leads" | "clientes" | "entregas" | "lembretes">("leads");
  const receita = db.clientes.reduce((s, c) => s + c.valor, 0);
  const [wa, setWa] = useState<WaMessage>(null);
  const T = "Mensagem para o Cliente";

  const converter = (id: string) => {
    const l = db.leads.find((x) => x.id === id)!;
    const prazo = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    update((d) => ({
      leads: d.leads.map((x) => (x.id === id ? { ...x, status: "Convertido" } : x)),
      clientes: [{ id: uid(), nome: l.nome, contato: l.whatsapp, destino: l.destino, valor: l.valor, pagamento: "Aguardando PIX" }, ...d.clientes],
      entregas: [{ id: uid(), cliente: l.nome, contato: l.whatsapp, destino: l.destino, dias: l.dias, prazo, status: "Na Fila", pdf: "" }, ...d.entregas],
      lembretes: [{ id: uid(), titulo: `Cobrar PIX de ${l.nome.split(" ")[0]} - Roteiro ${l.destino}`, data: new Date().toISOString().slice(0, 10), prioridade: "Alta", feito: false }, ...d.lembretes],
    }));
    toast.success(`${l.nome} virou cliente! Entrega e lembrete de PIX criados.`);
  };

  const tabs = [["leads", "Leads", db.leads.length], ["clientes", "Clientes", db.clientes.length], ["entregas", "Entregas", db.entregas.length], ["lembretes", "Lembretes", db.lembretes.filter((r) => !r.feito).length]] as const;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Painel Admin</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[[Users, "Total de Leads", db.leads.length], [UserCheck, "Clientes Ativos", db.clientes.length], [FileCheck, "Roteiros Entregues", db.entregas.filter((e) => e.status === "Entregue").length], [DollarSign, "Receita Estimada", brl(receita)]].map(([I, t, v]) => {
          const Icon = I as typeof Users;
          return (
            <div key={t as string} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t as string}</p>
              <p className="text-2xl font-extrabold">{v as string}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {tabs.map(([k, l, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {l} <span className="ml-1 rounded-full bg-muted px-2 text-xs">{n}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        {tab === "leads" && (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Nome", "WhatsApp", "Destino", "Dias", "Plano/Valor", "Estilo", "Status", "Ações"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {db.leads.map((l) => (
                <tr key={l.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-semibold">{l.nome}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{l.whatsapp}</td>
                  <td className="px-4 py-3">{l.destino}</td>
                  <td className="px-4 py-3">{l.dias}</td>
                  <td className="px-4 py-3">{PLANS[l.plano].name.replace("Roteiro ", "")}<br /><b>{brl(l.valor)}</b></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.estilos.join(", ")}</td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={(e) => update((d) => ({ ...d, leads: d.leads.map((x) => (x.id === l.id ? { ...x, status: e.target.value as LeadStatus } : x)) }))} className="rounded-md border border-input bg-card px-1 py-0.5 text-xs">
                      {["Novo", "Em Contato", "Convertido", "Perdido"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <div className="mt-1"><Pill v={l.status} /></div>
                  </td>
                  <td className="space-y-1.5 px-4 py-3">
                    <button onClick={() => setWa({ title: T, phone: l.whatsapp, text: `Olá, ${l.nome.split(" ")[0]}! Aqui é da TripTailor ✈️ Recebemos seu pedido de roteiro para ${l.destino} (${l.dias} dias). Vamos alinhar os detalhes?` })} className={`${btn} bg-success text-success-foreground`}><MessageSquare className="h-3.5 w-3.5" />Chamar no WhatsApp</button>
                    {l.status !== "Convertido" && <button onClick={() => converter(l.id)} className={`${btn} bg-primary text-primary-foreground`}><UserPlus className="h-3.5 w-3.5" />Converter</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "clientes" && <Clientes onWa={(c) => setWa({ title: T, phone: c.contato, text: `Olá, ${c.nome.split(" ")[0]}! Aqui é da TripTailor ✈️ Sobre seu roteiro para ${c.destino} (${brl(c.valor)}): ${c.pagamento === "Pago" ? "pagamento confirmado, obrigado!" : "segue a chave PIX para finalizarmos."}` })} />}
        <WhatsAppDialog msg={wa} onClose={() => setWa(null)} />
        {tab === "entregas" && (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Cliente", "Destino", "Dias", "Prazo", "Status", "Link do PDF", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {db.entregas.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{e.cliente}</td>
                  <td className="px-4 py-3">{e.destino}</td>
                  <td className="px-4 py-3">{e.dias}</td>
                  <td className="px-4 py-3">{fmtDate(e.prazo)}</td>
                  <td className="px-4 py-3">
                    <select value={e.status} onChange={(ev) => update((d) => ({ ...d, entregas: d.entregas.map((x) => (x.id === e.id ? { ...x, status: ev.target.value as EntregaStatus } : x)) }))} className="rounded-md border border-input bg-card px-1 py-0.5 text-xs">
                      {["Na Fila", "Montando PDF", "Entregue"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <div className="mt-1"><Pill v={e.status} /></div>
                  </td>
                  <td className="px-4 py-3"><input className="input-base min-w-48 py-1 text-xs" placeholder="Cole o link do Drive/Canva" value={e.pdf} onChange={(ev) => update((d) => ({ ...d, entregas: d.entregas.map((x) => (x.id === e.id ? { ...x, pdf: ev.target.value } : x)) }))} /></td>
                  <td className="px-4 py-3">
                    <button disabled={!e.pdf} onClick={() => setWa({ title: T, phone: e.contato, text: `Olá, ${e.cliente.split(" ")[0]}! Seu roteiro de ${e.destino} está pronto 🎉\n\n${e.pdf}\n\nBoa viagem! — TripTailor` })} className={`${btn} bg-success text-success-foreground disabled:opacity-40`}><Send className="h-3.5 w-3.5" />Enviar Roteiro</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "lembretes" && <Lembretes />}
      </div>
    </main>
  );
}

function Clientes({ onWa }: { onWa: (c: { nome: string; contato: string; destino: string; valor: number; pagamento: string }) => void }) {
  const [db, update] = useDB();
  const [n, setN] = useState({ nome: "", contato: "", destino: "", valor: "" });
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); if (!n.nome.trim()) return; update((d) => ({ ...d, clientes: [{ id: uid(), nome: n.nome, contato: n.contato, destino: n.destino, valor: Number(n.valor.replace(",", ".")) || 0, pagamento: "Aguardando PIX" }, ...d.clientes] })); setN({ nome: "", contato: "", destino: "", valor: "" }); toast.success("Cliente adicionado"); }}
        className="grid gap-2 border-b border-border p-4 md:grid-cols-5">
        <input className="input-base" placeholder="Nome" value={n.nome} onChange={(e) => setN({ ...n, nome: e.target.value })} />
        <input className="input-base" placeholder="WhatsApp" value={n.contato} onChange={(e) => setN({ ...n, contato: e.target.value })} />
        <input className="input-base" placeholder="Destino" value={n.destino} onChange={(e) => setN({ ...n, destino: e.target.value })} />
        <input className="input-base" placeholder="Valor (R$)" value={n.valor} onChange={(e) => setN({ ...n, valor: e.target.value })} />
        <button className={`${btn} justify-center bg-primary text-primary-foreground`}><Plus className="h-4 w-4" />Novo cliente</button>
      </form>
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase text-muted-foreground"><tr>{["Nome", "Contato", "Destino", "Valor", "Pagamento", ""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody>
          {db.clientes.map((c) => (
            <tr key={c.id} className="border-t border-border">
              <td className="px-4 py-3 font-semibold">{c.nome}</td><td className="px-4 py-3">{c.contato}</td><td className="px-4 py-3">{c.destino}</td>
              <td className="px-4 py-3 font-semibold">{brl(c.valor)}</td><td className="px-4 py-3"><Pill v={c.pagamento} /></td>
              <td className="space-x-1.5 whitespace-nowrap px-4 py-3">
                <button onClick={() => onWa(c)} className={`${btn} bg-success text-success-foreground`}><MessageSquare className="h-3.5 w-3.5" />Chamar no WhatsApp</button>
                <button onClick={() => update((d) => ({ ...d, clientes: d.clientes.map((x) => (x.id === c.id ? { ...x, pagamento: x.pagamento === "Pago" ? "Aguardando PIX" : "Pago" } : x)) }))} className={`${btn} border border-border`}>
                  {c.pagamento === "Pago" ? "Marcar pendente" : "Marcar como Pago"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Lembretes() {
  const [db, update] = useDB();
  const [n, setN] = useState({ titulo: "", data: new Date().toISOString().slice(0, 10), prioridade: "Média" as Lembrete["prioridade"] });
  const list = [...db.lembretes].sort((a, b) => Number(a.feito) - Number(b.feito) || a.data.localeCompare(b.data));
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); if (!n.titulo.trim()) return; update((d) => ({ ...d, lembretes: [{ id: uid(), ...n, feito: false }, ...d.lembretes] })); setN({ ...n, titulo: "" }); }}
        className="grid gap-2 border-b border-border p-4 md:grid-cols-[1fr_160px_130px_auto]">
        <input className="input-base" placeholder="Novo lembrete..." value={n.titulo} onChange={(e) => setN({ ...n, titulo: e.target.value })} />
        <input type="date" className="input-base" value={n.data} onChange={(e) => setN({ ...n, data: e.target.value })} />
        <select className="input-base" value={n.prioridade} onChange={(e) => setN({ ...n, prioridade: e.target.value as Lembrete["prioridade"] })}>
          {["Alta", "Média", "Baixa"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <button className={`${btn} justify-center bg-primary text-primary-foreground`}><Plus className="h-4 w-4" />Adicionar</button>
      </form>
      <ul>
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 border-t border-border px-4 py-3 first:border-t-0">
            <input type="checkbox" checked={r.feito} onChange={() => update((d) => ({ ...d, lembretes: d.lembretes.map((x) => (x.id === r.id ? { ...x, feito: !x.feito } : x)) }))} className="h-4 w-4 accent-primary" />
            <span className={`flex-1 ${r.feito ? "text-muted-foreground line-through" : "font-medium"}`}>{r.titulo}</span>
            <span className="text-xs text-muted-foreground">{fmtDate(r.data)}</span>
            <Pill v={r.prioridade} />
          </li>
        ))}
      </ul>
    </div>
  );
}
