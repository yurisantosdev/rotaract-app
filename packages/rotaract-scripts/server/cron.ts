import cron from "node-cron";
import { updateContributions } from "./services/contributions";

let started = false;

export function startCronJobs(): void {
  if (started) {
    return;
  }
  started = true;

  // Executa às 8:00 todos os dias
  // Verifica as mensalidades vencidas e altera seu status para vencido
  cron.schedule("0 8 * * *", async () => {
    console.log("Executando tarefa:", new Date());

    try {
      const resultado = await updateContributions();
      console.log(resultado.message);
    } catch (err) {
      console.error("Erro ao atualizar mensalidades vencidas:", err);
    }
  });

  console.log("Cron de mensalidades agendado (todos os dias às 08:00).");
}
