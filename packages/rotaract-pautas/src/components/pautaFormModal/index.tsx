"use client";

import { Button, DatePicker, Modal } from "@rotaract/components";
import {
  PAUTA_INPUT_CLASS,
  PAUTA_STATUS_OPTIONS,
  PAUTA_TEXTAREA_CLASS,
  PAUTA_TYPE_OPTIONS,
} from "../../types/pautas";
import { formatDate } from "../../lib/dates";
import { MemberPicker } from "../memberPicker";
import type { PautaFormModalProps } from "./type";
import { usePautaFormModal } from "./services";

export function PautaFormModal({
  open,
  pauta,
  members,
  currentUserId,
  onClose,
  onSave,
}: PautaFormModalProps) {
  const data = usePautaFormModal({
    open,
    pauta,
    members,
    currentUserId,
    onClose,
    onSave,
  });
  if (!data) return null;
  const {
    titleRef,
    isEdit,
    title,
    meetingDate,
    type,
    status,
    notes,
    setNotes,
    presentMemberIds,
    setPresentMemberIds,
    calendarEventId,
    calendarMeetings,
    loadingMeetings,
    selectedMeeting,
    error,
    saving,
    handleSubmit,
    handleTypeChange,
    handleDateChange,
    handleTitleChange,
    handleCalendarMeetingChange,
    setStatus,
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Pautas"
      title={isEdit ? "Editar pauta" : "Nova pauta"}
      description={
        isEdit
          ? "Atualize a reunião, o status e os companheiros presentes."
          : "Cadastre a reunião e escolha quem esteve ou estará presente."
      }
      initialFocusRef={titleRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-rotaract-mist p-1 sm:grid-cols-4">
          {PAUTA_STATUS_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={`h-11 rounded-[1.1rem] px-2 text-sm font-semibold transition ${
                status === item.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-1 rounded-2xl bg-rotaract-mist p-1 sm:grid-cols-3">
          {PAUTA_TYPE_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTypeChange(item.id)}
              className={`h-11 rounded-[1.1rem] px-2 text-sm font-semibold transition ${
                type === item.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={PAUTA_INPUT_CLASS}
            placeholder="Ex.: Reunião ordinária — 15/09/2026"
            maxLength={80}
          />
        </label>

        <div className="mt-4">
          <label htmlFor="pauta-date" className="mb-1.5 block text-sm text-zinc-600">
            Data da reunião
          </label>
          <DatePicker
            id="pauta-date"
            value={meetingDate}
            onChange={handleDateChange}
            fixedPopover
            allowClear={false}
          />
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">
            Observações{" "}
            <span className="font-normal text-zinc-400">(opcional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={PAUTA_TEXTAREA_CLASS}
            placeholder="Recados, quorum, visitas ou o que precisa constar na pauta"
            maxLength={600}
          />
        </label>

        <div className="mt-5">
          <label
            htmlFor="pauta-calendar-meeting"
            className="mb-1.5 block text-sm text-zinc-600"
          >
            Importar da agenda{" "}
            <span className="font-normal text-zinc-400">(opcional)</span>
          </label>
          <select
            id="pauta-calendar-meeting"
            value={calendarEventId ?? ""}
            onChange={(event) => handleCalendarMeetingChange(event.target.value)}
            className={PAUTA_INPUT_CLASS}
            disabled={loadingMeetings}
          >
            <option value="">
              {loadingMeetings
                ? "Carregando reuniões..."
                : "Selecionar reunião futura da agenda"}
            </option>
            {calendarMeetings.map((meeting) => (
              <option key={meeting.id} value={meeting.id}>
                {formatDate(meeting.date)} — {meeting.title}
                {meeting.acceptedMemberIds.length > 0
                  ? ` (${meeting.acceptedMemberIds.length} aceito${meeting.acceptedMemberIds.length === 1 ? "" : "s"})`
                  : ""}
              </option>
            ))}
          </select>
          {selectedMeeting ? (
            <p className="mt-2 text-xs text-zinc-500">
              Presentes sincronizados com quem já aceitou nesta reunião.
              {selectedMeeting.pendingCount > 0
                ? ` ${selectedMeeting.pendingCount} convite${selectedMeeting.pendingCount === 1 ? "" : "s"} ainda pendente${selectedMeeting.pendingCount === 1 ? "" : "s"} — entram na pauta ao aceitar.`
                : ""}
            </p>
          ) : calendarMeetings.length === 0 && !loadingMeetings ? (
            <p className="mt-2 text-xs text-zinc-500">
              Nenhuma reunião futura encontrada na agenda.
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          <MemberPicker
            members={members}
            selectedIds={presentMemberIds}
            onChange={setPresentMemberIds}
            label="Membros presentes"
            hint={
              presentMemberIds.length === 0
                ? "Selecione os companheiros da reunião ou importe da agenda"
                : `${presentMemberIds.length} ${presentMemberIds.length === 1 ? "presente" : "presentes"}`
            }
          />
        </div>

        {error ? (
          <p className="mt-4 text-sm text-rose-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            loading={saving}
            title={
              saving
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Cadastrar pauta"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
