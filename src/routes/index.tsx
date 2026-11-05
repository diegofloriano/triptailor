import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Users, Clock, PiggyBank, UserRound, MessageCircle, FileText, MapPin, Check, MessageSquare, ArrowRight } from "lucide-react";
import { PLANS, calcTotal, brl, WHATSAPP_NUMBER, type PlanKey } from "@/lib/pricing";
import { WhatsAppDialog, type WaMessage } from "@/components/WhatsAppDialog";
import { useDB, uid } from "@/lib/store";

const HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripTailor — Sua viagem perfeita sob medida em 24h" },
      { name: "description", content: "Monte seu perfil e receba um roteiro exclusivo em PDF no WhatsApp em até 24h. Planos a partir de R$ 19,90 por dia." },
      { property: "og:title", content: "TripTailor — Roteiros de viagem sob medida" },
      { property: "og:description", content: "Receba um roteiro exclusivo em PDF pensado para o seu bolso, ritmo e estilo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: HERO },
      { name: "twitter:image", content: HERO },
    ],
  }),
  component: Index,
});

const DESTINOS = [
  { nome: "Litoral Norte - SP", img: "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=800&q=80", itens: ["Praias escondidas de Ubatuba", "Trilhas em Ilhabela", "Frutos do mar em São Sebastião"] },
  { nome: "Fortaleza & Ceará", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80", itens: ["Beach Park e Cumbuco", "Bate-volta a Jericoacoara", "Rota da culinária cearense"] },
  { nome: "Balneário Camboriú - SC", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80", itens: ["Bondinho do Parque Unipraias", "Praias agrestes", "Vida noturna e beach clubs"] },
];
const ESTILOS = ["Praia & Descanso", "Gastronomia", "Aventura & Natureza", "Vida Noturna", "Econômico/Mochilão"];
const COMPANHIA = ["Sozinho(a)", "Casal", "Família", "Amigos"];
const ORCAMENTO = ["Econômico", "Moderado", "Alto Padrão"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary"}`}>
      {children}
    </button>
  );
}

function Index() {
  const [, update] = useDB();
  const [f, setF] = useState({ nome: "", whatsapp: "", email: "", destino: "", dias: 5, plano: "express" as PlanKey, estilos: [] as string[], companhia: "Casal", orcamento: "Moderado", obs: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const total = calcTotal(f.dias, f.plano);
  const [wa, setWa] = useState<WaMessage>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.nome.trim() || f.whatsapp.replace(/\D/g, "").length < 10 || !f.destino.trim()) {
      toast.error("Preencha nome, WhatsApp com DDD e destino.");
      return;
    }
    update((db) => ({ ...db, leads: [{ id: uid(), ...f, valor: total, status: "Novo", criadoEm: new Date().toISOString().slice(0, 10) }, ...db.leads] }));
    toast.success("Pedido registrado!");
    const text = `Olá, TripTailor! ✈️ Quero meu roteiro:\n\n• Nome: ${f.nome}\n• Destino: ${f.destino}\n• Dias: ${f.dias}\n• Plano: ${PLANS[f.plano].name}\n• Estilo: ${f.estilos.join(", ") || "-"}\n• Viajando com: ${f.companhia}\n• Orçamento: ${f.orcamento}${f.obs ? `\n• Obs: ${f.obs}` : ""}\n\n💰 Valor total: ${brl(total)}`;
    setWa({ title: "Pedido Pronto para Envio no WhatsApp! 🚀", phone: WHATSAPP_NUMBER, text });
  };

  return (
    <main>
      <WhatsAppDialog msg={wa} onClose={() => setWa(null)} />
      <section className="relative flex min-h-[640px] items-center overflow-hidden">
        <img src={HERO} alt="Praia paradisíaca com mar azul" className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">Sua próxima viagem perfeita, desenhada sob medida em 24h.</h1>
          <p className="mt-5 max-w-2xl text-lg opacity-90">Chega de perder horas em blogs e vídeos genéricos. Receba um roteiro exclusivo em PDF pensado para o seu bolso, seu ritmo e seu estilo de viagem.</p>
          <a href="#plano" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-secondary px-7 py-4 font-bold text-secondary-foreground shadow-soft transition hover:brightness-110">
            Montar Meu Roteiro Agora <ArrowRight className="h-5 w-5" />
          </a>
          <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold">
            {[[Users, "+500 viajantes atendidos"], [Clock, "Entrega em 24h no WhatsApp"], [PiggyBank, "Economia de tempo e dinheiro"]].map(([I, t]) => {
              const Icon = I as typeof Users;
              return <span key={t as string} className="flex items-center gap-2"><Icon className="h-5 w-5" />{t as string}</span>;
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="text-center text-3xl font-extrabold">Como funciona</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            [UserRound, "Monte seu Perfil", "Conte para onde vai, quantos dias e o que gosta de fazer."],
            [MessageCircle, "Alinhamento no WhatsApp", "Fechamos os detalhes e o pagamento rápido via PIX."],
            [FileText, "Roteiro em Mãos", "Receba seu guia interativo em PDF com passeios, restaurantes e mapas."],
          ].map(([I, t, d], i) => {
            const Icon = I as typeof Users;
            return (
              <div key={t as string} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary"><Icon className="h-6 w-6" /></div>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-secondary">Passo {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{t as string}</h3>
                <p className="mt-2 text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="destinos" className="scroll-mt-20 bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold">Destinos em Alta</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DESTINOS.map((d) => (
              <article key={d.nome} className="overflow-hidden rounded-2xl border border-border bg-background shadow-soft">
                <img src={d.img} alt={d.nome} loading="lazy" className="h-52 w-full object-cover" />
                <div className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold"><MapPin className="h-5 w-5 text-secondary" />{d.nome}</h3>
                  <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">O roteiro inclui</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {d.itens.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-success" />{i}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plano" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="text-center text-3xl font-extrabold">Monte o Seu Plano</h2>
        <p className="mt-2 text-center text-muted-foreground">O valor é calculado na hora, conforme suas escolhas.</p>
        <form onSubmit={submit} className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">Nome Completo<input className="input-base mt-1.5" value={f.nome} onChange={(e) => set("nome", e.target.value)} maxLength={100} /></label>
              <label className="text-sm font-semibold">WhatsApp com DDD<input type="tel" className="input-base mt-1.5" placeholder="(11) 99999-9999" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} maxLength={20} /></label>
              <label className="text-sm font-semibold">E-mail<input type="email" className="input-base mt-1.5" value={f.email} onChange={(e) => set("email", e.target.value)} maxLength={120} /></label>
              <label className="text-sm font-semibold">Destino Desejado<input className="input-base mt-1.5" placeholder="Ex: Bertioga, SP" value={f.destino} onChange={(e) => set("destino", e.target.value)} maxLength={80} /></label>
            </div>
            <div>
              <p className="text-sm font-semibold">Duração da viagem: <span className="text-primary">{f.dias} dias</span></p>
              <input type="range" min={2} max={15} value={f.dias} onChange={(e) => set("dias", +e.target.value)} className="mt-2 w-full accent-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Tipo de Plano</p>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                {(Object.keys(PLANS) as PlanKey[]).map((k) => (
                  <button type="button" key={k} onClick={() => set("plano", k)}
                    className={`rounded-xl border-2 p-4 text-left transition ${f.plano === k ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                    <p className="font-bold">{PLANS[k].name}</p>
                    <p className="text-sm font-semibold text-secondary">{brl(PLANS[k].perDay)} por dia</p>
                    <p className="mt-1 text-xs text-muted-foreground">{PLANS[k].desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Estilo da Viagem</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ESTILOS.map((s) => <Chip key={s} active={f.estilos.includes(s)} onClick={() => set("estilos", f.estilos.includes(s) ? f.estilos.filter((x) => x !== s) : [...f.estilos, s])}>{s}</Chip>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Viajando com</p>
              <div className="mt-2 flex flex-wrap gap-2">{COMPANHIA.map((s) => <Chip key={s} active={f.companhia === s} onClick={() => set("companhia", s)}>{s}</Chip>)}</div>
            </div>
            <div>
              <p className="text-sm font-semibold">Orçamento estimado para gastos na viagem</p>
              <div className="mt-2 flex flex-wrap gap-2">{ORCAMENTO.map((s) => <Chip key={s} active={f.orcamento === s} onClick={() => set("orcamento", s)}>{s}</Chip>)}</div>
            </div>
            <label className="block text-sm font-semibold">Observações Extras (opcional)<textarea className="input-base mt-1.5 min-h-24" value={f.obs} onChange={(e) => set("obs", e.target.value)} maxLength={1000} /></label>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <h3 className="text-lg font-bold">Resumo do Pedido</h3>
            <dl className="space-y-2 text-sm">
              {[["Destino", f.destino || "—"], ["Duração", `${f.dias} dias`], ["Plano", PLANS[f.plano].name], ["Estilo", f.estilos.join(", ") || "—"], ["Viajando com", f.companhia], ["Orçamento", f.orcamento]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
            <div className="rounded-xl bg-accent p-4">
              <p className="text-xs text-muted-foreground">{f.dias} dias × {brl(PLANS[f.plano].perDay)}</p>
              <p className="text-3xl font-extrabold text-primary">{brl(total)}</p>
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3.5 font-bold text-success-foreground transition hover:brightness-110">
              <MessageSquare className="h-5 w-5" /> Finalizar e Enviar Pedido no WhatsApp
            </button>
          </aside>
        </form>
      </section>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">© 2026 TripTailor — Roteiros sob medida</footer>
    </main>
  );
}
