import { toast } from "sonner";
import { Copy, MessageSquare, Monitor } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { waLink, waWebLink } from "@/lib/pricing";

export type WaMessage = { title: string; phone: string; text: string } | null;

export function WhatsAppDialog({ msg, onClose }: { msg: WaMessage; onClose: () => void }) {
  const copy = async () => {
    if (!msg) return;
    try {
      await navigator.clipboard.writeText(msg.text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = msg.text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    toast.success("Mensagem copiada!");
  };
  return (
    <Dialog open={!!msg} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{msg?.title}</DialogTitle>
          <DialogDescription>Confira a mensagem e escolha como enviar.</DialogDescription>
        </DialogHeader>
        <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted p-4 font-sans text-sm">{msg?.text}</pre>
        {msg && (
          <div className="grid gap-2">
            <button type="button" onClick={copy} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 font-semibold transition hover:border-primary">
              <Copy className="h-4 w-4" /> Copiar Mensagem
            </button>
            <a href={waLink(msg.phone, msg.text)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3.5 font-bold text-success-foreground transition hover:brightness-110">
              <MessageSquare className="h-5 w-5" /> Abrir WhatsApp em Nova Aba
            </a>
            <a href={waWebLink(msg.phone, msg.text)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
              <Monitor className="h-4 w-4" /> Alternativa: abrir no WhatsApp Web
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
