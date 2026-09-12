import { Member } from "@rotaract/members/server";
import { createNotice } from "@rotaract/notices/server";

function firstName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean)[0] || name;
}

function birthdayMessage(name: string): string {
  const primeiro = firstName(name);
  const mensagens = [
    `Feliz aniversário, ${primeiro}! Que o seu dia seja leve e especial.`,
    `Parabéns, ${primeiro}! O clube celebra você hoje.`,
    `${primeiro}, feliz aniversário! Conte sempre com a gente.`,
    `Hoje o abraço é seu, ${primeiro}. Feliz aniversário!`,
    `Parabéns pelo seu dia, ${primeiro}! Que venha um ciclo incrível.`,
    `${primeiro}, o clube te deseja um aniversário cheio de alegria.`,
    `Feliz aniversário, ${primeiro}! Obrigado por fazer parte desta família.`,
    `${primeiro}, hoje é dia de sorrir. Parabéns e tudo de bom!`,
  ];

  const indice = Math.floor(Math.random() * mensagens.length);
  return mensagens[indice] ?? mensagens[0];
}

function todayMonthDay(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

export async function birthday(): Promise<{
  success: boolean;
  message: string;
}> {
  const mmdd = todayMonthDay();

  const aniversariantes = await Member.find({
    status: "ativo",
    birthDate: { $regex: `-${mmdd}$` },
  }).lean();

  if (!aniversariantes) {
    return {
      success: false,
      message: "Não foi possível encontrar os associados que tem aniversário",
    };
  }

  await Promise.all(
    aniversariantes.map((member) =>
      createNotice(
        member._id.toString(),
        "Feliz Aniversário",
        birthdayMessage(member.name)
      )
    )
  );

  const total = aniversariantes.length;
  return {
    success: true,
    message:
      total === 0
        ? "Nenhum associado faz aniversário hoje"
        : total === 1
          ? "1 associado aniversariante notificado com sucesso"
          : `${total} associados aniversariantes notificados com sucesso`,
  };
}
