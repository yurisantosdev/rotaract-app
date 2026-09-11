import { CalendarBlankIcon, CurrencyCircleDollarIcon, GearIcon, PencilRulerIcon, UsersThreeIcon } from "@phosphor-icons/react";

export const modules = [
  {
    title: "Financeiro",
    description: "Tesouraria, mensalidades e prestações de contas.",
    href: "/home/finance",
    action: "Abrir tesouraria",
    icon: (
      <CurrencyCircleDollarIcon size={25} />
    ),
  },
  {
    title: "Agenda",
    description: "Eventos, projetos e compromissos do calendário.",
    href: "/home/calendar",
    action: "Abrir agenda",
    icon: (
      <CalendarBlankIcon size={25} />
    ),
  },
  {
    title: "Membros",
    description: "Cadastro, cargos e a família do Rotaract.",
    href: "/home/members",
    action: "Abrir membros",
    icon: (
      <UsersThreeIcon size={25} />
    ),
  },
  {
    title: "Configurações",
    description: "Preferências do clube, permissões e ajustes da conta.",
    href: "/home/settings",
    action: "Abrir configurações",
    icon: (
      <GearIcon size={25} />
    ),
  },
  {
    title: "Projetos",
    description: "Gerenciamento de projetos do clube.",
    href: "/home/projects",
    action: "Abrir projetos",
    icon: (
      <PencilRulerIcon size={25} />
    ),
  },
];