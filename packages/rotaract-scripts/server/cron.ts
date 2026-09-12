import cron from "node-cron";
import { updateContributions } from "./services/contributions";
import { birthday } from "./services/birthday";

let started = false;

export function startCronJobs(): void {
  if (started) {
    return;
  }
  started = true;

  // Executa às 8:00 todos os dias
  // Verifica as mensalidades vencidas e altera seu status para vencido
  cron.schedule("0 8 * * *", async () => {
    try {
    } catch (err) {
      console.error("Erro ao atualizar mensalidades vencidas:", err);
    }
  });
  console.log("Cron de mensalidades agendado (todos os dias às 08:00).");

  // Executa às 8:00 todos os dias
  // Verifica os associados que tem aniversário e envia um email de parabéns
  cron.schedule("0 8 * * *", async () => {
    try {
      await birthday();
    } catch (err) {
      console.error("Erro ao enviar notificação de aniversários:", err);
    }
  });
  console.log("Cron de aniversários agendado (todos os dias às 08:00).");
}
