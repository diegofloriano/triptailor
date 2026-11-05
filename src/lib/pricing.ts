export const PLANS = {
  express: { name: "Roteiro Express", perDay: 19.9, desc: "Atrações diárias + sugestões de restaurantes." },
  vip: { name: "Roteiro VIP Concierge", perDay: 34.9, desc: "Roteiro completo + links de localização + dicas secretas locais + suporte a dúvidas." },
} as const;
export type PlanKey = keyof typeof PLANS;

export const WHATSAPP_NUMBER = "5511937520421";

export function calcTotal(days: number, plan: PlanKey) {
  return Math.round(days * PLANS[plan].perDay * 100) / 100;
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const normPhone = (phone: string) => phone.replace(/\D/g, "").replace(/^(?!55)/, "55");

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${normPhone(phone)}?text=${encodeURIComponent(text)}`;

export const waWebLink = (phone: string, text: string) =>
  `https://web.whatsapp.com/send?phone=${normPhone(phone)}&text=${encodeURIComponent(text)}`;
