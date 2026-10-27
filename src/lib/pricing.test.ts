import { describe, it, expect } from "vitest";
import { calcTotal } from "./pricing";

describe("preço do roteiro", () => {
  it("Express custa R$ 19,90 por dia", () => expect(calcTotal(5, "express")).toBe(99.5));
  it("VIP custa R$ 34,90 por dia", () => expect(calcTotal(7, "vip")).toBe(244.3));
});
