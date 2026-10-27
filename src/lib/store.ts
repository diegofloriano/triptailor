import { useEffect, useState, useCallback } from "react";
import type { PlanKey } from "./pricing";

export type LeadStatus = "Novo" | "Em Contato" | "Convertido" | "Perdido";
export type Lead = {
  id: string; nome: string; whatsapp: string; email: string; destino: string; dias: number;
  plano: PlanKey; valor: number; estilos: string[]; companhia: string; orcamento: string;
  obs: string; status: LeadStatus; criadoEm: string;
};
export type Cliente = { id: string; nome: string; contato: string; destino: string; valor: number; pagamento: "Aguardando PIX" | "Pago" };
export type EntregaStatus = "Na Fila" | "Montando PDF" | "Entregue";
export type Entrega = { id: string; cliente: string; contato: string; destino: string; dias: number; prazo: string; status: EntregaStatus; pdf: string };
export type Lembrete = { id: string; titulo: string; data: string; prioridade: "Alta" | "Média" | "Baixa"; feito: boolean };

export type DB = { leads: Lead[]; clientes: Cliente[]; entregas: Entrega[]; lembretes: Lembrete[] };

const d = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
export const uid = () => Math.random().toString(36).slice(2, 10);

export const MOCK: DB = {
  leads: [
    { id: "l1", nome: "Mariana Souza", whatsapp: "(85) 98812-3344", email: "mariana@email.com", destino: "Fortaleza, CE", dias: 6, plano: "vip", valor: 209.4, estilos: ["Praia & Descanso", "Gastronomia"], companhia: "Casal", orcamento: "Moderado", obs: "Lua de mel!", status: "Novo", criadoEm: d(0) },
    { id: "l2", nome: "Rafael Lima", whatsapp: "(11) 97654-1122", email: "rafael@email.com", destino: "Balneário Camboriú, SC", dias: 4, plano: "express", valor: 79.6, estilos: ["Vida Noturna"], companhia: "Amigos", orcamento: "Alto Padrão", obs: "", status: "Em Contato", criadoEm: d(-1) },
    { id: "l3", nome: "Juliana Torres", whatsapp: "(13) 99123-4567", email: "ju@email.com", destino: "Bertioga, SP", dias: 3, plano: "express", valor: 59.7, estilos: ["Praia & Descanso", "Econômico/Mochilão"], companhia: "Família", orcamento: "Econômico", obs: "Duas crianças pequenas", status: "Novo", criadoEm: d(-1) },
    { id: "l4", nome: "Pedro Almeida", whatsapp: "(51) 98111-2233", email: "pedro@email.com", destino: "Gramado, RS", dias: 5, plano: "vip", valor: 174.5, estilos: ["Gastronomia", "Aventura & Natureza"], companhia: "Casal", orcamento: "Alto Padrão", obs: "", status: "Perdido", criadoEm: d(-3) },
  ],
  clientes: [
    { id: "c1", nome: "Lucas Ferreira", contato: "(11) 98888-7777", destino: "Caraguatatuba, SP", dias: 0, valor: 139.6, pagamento: "Pago" } as Cliente,
    { id: "c2", nome: "Camila Rocha", contato: "(21) 99777-6655", destino: "Jericoacoara, CE", valor: 244.3, pagamento: "Aguardando PIX" },
    { id: "c3", nome: "Bruno Martins", contato: "(41) 98444-3322", destino: "Florianópolis, SC", valor: 99.5, pagamento: "Pago" },
  ],
  entregas: [
    { id: "e1", cliente: "Lucas Ferreira", contato: "(11) 98888-7777", destino: "Caraguatatuba, SP", dias: 4, prazo: d(-2), status: "Entregue", pdf: "https://drive.google.com/roteiro-caragua" },
    { id: "e2", cliente: "Camila Rocha", contato: "(21) 99777-6655", destino: "Jericoacoara, CE", dias: 7, prazo: d(1), status: "Na Fila", pdf: "" },
    { id: "e3", cliente: "Bruno Martins", contato: "(41) 98444-3322", destino: "Florianópolis, SC", dias: 5, prazo: d(0), status: "Montando PDF", pdf: "" },
  ],
  lembretes: [
    { id: "r1", titulo: "Cobrar PIX de Camila - Roteiro Jericoacoara", data: d(0), prioridade: "Alta", feito: false },
    { id: "r2", titulo: "Enviar PDF atualizado de Caraguatatuba", data: d(1), prioridade: "Média", feito: false },
    { id: "r3", titulo: "Pedir depoimento pós-viagem de Lucas", data: d(3), prioridade: "Baixa", feito: false },
    { id: "r4", titulo: "Responder Rafael sobre baladas em BC", data: d(-1), prioridade: "Alta", feito: true },
  ],
};

const KEY = "triptailor-db-v1";
const listeners = new Set<() => void>();

export function readDB(): DB {
  if (typeof window === "undefined") return MOCK;
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
  return MOCK;
}
export function writeDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  listeners.forEach((l) => l());
}

export function useDB() {
  const [db, setDb] = useState<DB>(MOCK);
  useEffect(() => {
    const sync = () => setDb(readDB());
    sync();
    listeners.add(sync);
    return () => { listeners.delete(sync); };
  }, []);
  const update = useCallback((fn: (db: DB) => DB) => writeDB(fn(readDB())), []);
  return [db, update] as const;
}
