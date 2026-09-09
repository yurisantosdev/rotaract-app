import { Contribution } from "@rotaract/finance/server";

export async function updateContributions(): Promise<{
  success: boolean;
  message: string;
}> {
  const hoje = new Date().toISOString().split("T")[0];

  const resultado = await Contribution.updateMany(
    {
      status: "pendente",
      date: { $lt: hoje },
    },
    {
      $set: {
        status: "vencido",
      },
    },
    {
      runValidators: true,
    }
  );

  if (!resultado) {
    return {
      success: false,
      message: "Não foi possível atualizar as mensalidades",
    };
  }

  return { success: true, message: "Mensalidades atualizadas com sucesso" };
}
