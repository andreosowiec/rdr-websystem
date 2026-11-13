import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, X } from 'lucide-react';
import { updateAdminVisit } from '../../services/visitApi';
import { VISIT_STATUSES, type VisitRecord, type VisitStatus } from '../../types/visit';

interface VisitTriageDrawerProps {
  visit: VisitRecord | null;
  onClose: () => void;
  onUpdated: (updatedVisit: VisitRecord) => void;
}

const SERVICE_LABEL_MAP: Record<string, string> = {
  preventiva: 'Preventiva em Motores e Bombas',
  corretiva: 'Corretiva / Rebobinagem CA e CC',
  preditiva: 'Preditiva (Vibração, Alinhamento e Balanceamento)',
  'bombas-incendio': 'Bombas Elétricas e Sistema de Incêndio',
  'climatizacao-chiller': 'Chiller, Fancoil e Torre de Resfriamento',
  'quadros-transformadores': 'Quadros de Comando, CCM e Transformadores a Seco',
  'torno-usinagem': 'Torno, Usinagem e Selos Mecânicos',
  'diagnostico-geral': 'Avaliação Geral da Casa de Máquinas',
};

export function VisitTriageDrawer({ visit, onClose, onUpdated }: VisitTriageDrawerProps) {
  const [status, setStatus] = useState<VisitStatus>('Agendada');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredShift, setPreferredShift] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (visit) {
      setStatus(visit.status);
      setAssignedTechnician(visit.assignedTechnician || '');
      setPreferredDate(visit.preferredDate || '');
      setPreferredShift(visit.preferredShift || '');
      setInternalNotes(visit.internalNotes || '');
      setError(null);
      setSavedNotice(false);
    }
  }, [visit]);

  if (!visit) return null;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedNotice(false);

    try {
      const updated = await updateAdminVisit(visit.id, {
        status,
        assignedTechnician,
        preferredDate,
        preferredShift,
        internalNotes,
      });
      onUpdated(updated);
      setSavedNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar solicitação.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-visit-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl bg-[#0B1A36] border-l border-white/10 h-full flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#061124]">
          <div>
            <span className="font-mono text-xs text-yellow-400 tabular-nums">
              {visit.protocol}
            </span>
            <h2
              id="drawer-visit-title"
              className="font-display text-lg font-bold text-[#F8FAFC] leading-snug"
            >
              {visit.companyName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel de triagem"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block">Modalidade e Criticidade</span>
              <span className="text-slate-100 font-medium mt-0.5 block">
                {SERVICE_LABEL_MAP[visit.serviceType] || visit.serviceType} · {visit.urgency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Segmento e Parque</span>
              <span className="text-slate-100 mt-0.5 block">
                {visit.sector} · <span className="font-mono tabular-nums">{visit.motorCount}</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Solicitante</span>
              <span className="text-slate-100 font-medium mt-0.5 block">
                {visit.contactName}
                {visit.contactRole ? ` (${visit.contactRole})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">CNPJ Informado</span>
              <span className="font-mono text-slate-200 mt-0.5 block tabular-nums">
                {visit.cnpj || 'Não informado'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pb-5 border-b border-white/10 text-xs">
            <div className="flex items-start gap-2.5 text-slate-200">
              <MapPin className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                {visit.plantAddress} — {visit.cityState}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Phone className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
              <span className="font-mono tabular-nums">{visit.contactPhone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Mail className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
              <span>{visit.contactEmail}</span>
            </div>
          </div>

          <div className="pb-5 border-b border-white/10">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">
              Relato Técnico do Cliente
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-[#061124] border border-white/10 rounded-md p-3.5">
              {visit.motorDetails || 'Nenhuma observação adicional preenchida pelo solicitante.'}
            </p>
          </div>

          <form id="triage-form" onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xs font-semibold text-yellow-400">
              Atualização Operacional RDR
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="triage-status" className="block text-xs text-slate-300 mb-1.5">
                  Status do Atendimento
                </label>
                <select
                  id="triage-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VisitStatus)}
                  className="w-full px-3 py-2 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                >
                  {VISIT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="triage-tech" className="block text-xs text-slate-300 mb-1.5">
                  Técnico Designado
                </label>
                <input
                  id="triage-tech"
                  type="text"
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  placeholder="Ex: Equipe Eletromecânica RDR"
                  className="w-full px-3 py-2 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="triage-date" className="block text-xs text-slate-300 mb-1.5">
                  Data Confirmada
                </label>
                <input
                  id="triage-date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label htmlFor="triage-shift" className="block text-xs text-slate-300 mb-1.5">
                  Janela de Atendimento
                </label>
                <input
                  id="triage-shift"
                  type="text"
                  value={preferredShift}
                  onChange={(e) => setPreferredShift(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="triage-notes" className="block text-xs text-slate-300 mb-1.5">
                Anotações Internas de Triagem / Orçamento
              </label>
              <textarea
                id="triage-notes"
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Registre contato realizado, peças previstas, necessidade de retirada para oficina em Lauro de Freitas ou resumo do diagnóstico."
                className="w-full px-3 py-2 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {savedNotice && (
              <div
                role="status"
                className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Atualização salva e refletida na consulta de protocolo.</span>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-[#061124] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            Fechar
          </button>

          <button
            type="submit"
            form="triage-form"
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 rounded-md transition-colors cursor-pointer"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
