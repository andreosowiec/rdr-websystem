import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  Search,
} from 'lucide-react';
import { COMPANY_CREDENTIALS, type ServiceCategory } from '../data/rdrContent';
import { createVisit, lookupVisitByProtocol } from '../services/visitApi';
import type { PublicVisitSummary, VisitRecord } from '../types/visit';

interface VisitSchedulerSectionProps {
  preselectedCategory: ServiceCategory | null;
}

type StepNumber = 1 | 2 | 3;

interface FormState {
  serviceType: string;
  sector: string;
  urgency: string;
  motorCount: string;
  preferredDate: string;
  preferredShift: string;
  plantAddress: string;
  cityState: string;
  companyName: string;
  cnpj: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  motorDetails: string;
}

const SERVICE_OPTIONS: { value: ServiceCategory | 'diagnostico-geral'; label: string }[] = [
  { value: 'preditiva', label: 'Manutenção Preditiva (Vibração, Alinhamento e Balanceamento)' },
  { value: 'preventiva', label: 'Manutenção Preventiva em Motores e Bombas' },
  { value: 'corretiva', label: 'Manutenção Corretiva e Rebobinagem CA/CC' },
  { value: 'bombas-incendio', label: 'Bombas Elétricas e Sistema de Incêndio (Grundfos / Diesel)' },
  { value: 'climatizacao-chiller', label: 'Chiller, Fancoil e Torre de Resfriamento' },
  { value: 'quadros-transformadores', label: 'Quadros de Comando, CCM e Transformadores a Seco' },
  { value: 'torno-usinagem', label: 'Torno, Usinagem e Selos Mecânicos' },
  { value: 'diagnostico-geral', label: 'Avaliação Geral da Casa de Máquinas' },
];

const SECTOR_OPTIONS = [
  'Hotel / Resort / Pousada',
  'Hospital / Clínica',
  'Shopping / Centro Comercial',
  'Indústria / Manufatura',
  'Condomínio / Edifício Corporativo',
  'Outro Segmento',
];

const URGENCY_OPTIONS = [
  { value: 'Programada', label: 'Programada (Planejamento preventivo)' },
  { value: 'Prioritária (24h–48h)', label: 'Prioritária (Sintoma ativo, 24h–48h)' },
  { value: 'Emergencial (Motor parado)', label: 'Emergencial (Operação parada)' },
];

const MOTOR_COUNT_OPTIONS = [
  '1 a 5 equipamentos',
  '6 a 20 equipamentos',
  '21 a 50 equipamentos',
  'Acima de 50 equipamentos',
];

const SHIFT_OPTIONS = [
  'Manhã (08h00 – 12h00)',
  'Tarde (13h30 – 17h30)',
  'Janela Programada / Noturna',
];

function getTomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

function getTodayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function VisitSchedulerSection({ preselectedCategory }: VisitSchedulerSectionProps) {
  const [step, setStep] = useState<StepNumber>(1);
  const [form, setForm] = useState<FormState>({
    serviceType: preselectedCategory ?? 'preditiva',
    sector: 'Hotel / Resort / Pousada',
    urgency: 'Programada',
    motorCount: '1 a 5 equipamentos',
    preferredDate: getTomorrowIsoDate(),
    preferredShift: 'Manhã (08h00 – 12h00)',
    plantAddress: '',
    cityState: 'Salvador / BA',
    companyName: '',
    cnpj: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    motorDetails: '',
  });

  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedVisit, setConfirmedVisit] = useState<VisitRecord | null>(null);
  const [copiedProtocol, setCopiedProtocol] = useState(false);

  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<PublicVisitSummary | null>(null);

  useEffect(() => {
    if (preselectedCategory) {
      setForm((prev) => ({ ...prev, serviceType: preselectedCategory }));
      setConfirmedVisit(null);
      setStep(1);
      setStepError(null);
    }
  }, [preselectedCategory]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (stepError) setStepError(null);
  };

  const selectedServiceLabel =
    SERVICE_OPTIONS.find((opt) => opt.value === form.serviceType)?.label ?? form.serviceType;

  const validateStep = (targetStep: StepNumber): string | null => {
    if (targetStep === 1) {
      if (!form.serviceType || !form.sector || !form.urgency) {
        return 'Selecione a modalidade, o segmento e o nível de criticidade para avançar.';
      }
    }

    if (targetStep === 2) {
      if (!form.preferredDate) {
        return 'Escolha uma data preferencial para a visita técnica.';
      }
      if (form.preferredDate < getTodayIsoDate()) {
        return 'A data da visita técnica não pode ser anterior à data de hoje.';
      }
      if (form.plantAddress.trim().length < 5) {
        return 'Informe o endereço completo do local onde os equipamentos estão instalados.';
      }
      if (form.cityState.trim().length < 3) {
        return 'Informe a cidade e o estado do estabelecimento.';
      }
    }

    if (targetStep === 3) {
      if (form.companyName.trim().length < 2) {
        return 'Informe o nome da empresa, hotel, hospital ou shopping.';
      }
      if (form.contactName.trim().length < 2) {
        return 'Informe o nome do responsável técnico ou solicitante.';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.contactEmail.trim())) {
        return 'Informe um endereço de e-mail válido para envio do protocolo.';
      }
      const phoneDigits = form.contactPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return 'Informe um telefone ou WhatsApp com DDD válido (mínimo 10 dígitos).';
      }
    }

    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((prev) => (prev < 3 ? ((prev + 1) as StepNumber) : prev));
  };

  const handlePrevStep = () => {
    setStepError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as StepNumber) : prev));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validateStep(3);
    if (error) {
      setStepError(error);
      return;
    }

    setIsSubmitting(true);
    setStepError(null);

    try {
      const visit = await createVisit(form);
      setConfirmedVisit(visit);
    } catch (err) {
      setStepError(
        err instanceof Error
          ? err.message
          : 'Falha de conexão com o servidor ao registrar a visita. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyProtocol = async () => {
    if (!confirmedVisit) return;
    try {
      await navigator.clipboard.writeText(confirmedVisit.protocol);
      setCopiedProtocol(true);
      setTimeout(() => setCopiedProtocol(false), 2500);
    } catch {
      setCopiedProtocol(false);
    }
  };

  const handleReset = () => {
    setConfirmedVisit(null);
    setStep(1);
    setStepError(null);
    setForm((prev) => ({
      ...prev,
      plantAddress: '',
      companyName: '',
      cnpj: '',
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      motorDetails: '',
    }));
  };

  const handleLookupProtocol = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = lookupCode.trim().toUpperCase();
    if (!cleaned) {
      setLookupError('Digite um código de protocolo (ex: RDR-2026-1040).');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const summary = await lookupVisitByProtocol(cleaned);
      setLookupResult(summary);
    } catch (err) {
      setLookupError(
        err instanceof Error
          ? err.message
          : 'Erro ao consultar o servidor. Verifique sua conexão.'
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const whatsappSummaryUrl = confirmedVisit
    ? `https://wa.me/${COMPANY_CREDENTIALS.whatsappDigits}?text=${encodeURIComponent(
        `Olá RDR, acabei de agendar uma visita técnica pelo site.\nProtocolo: ${confirmedVisit.protocol}\nEmpresa: ${confirmedVisit.companyName}\nServiço: ${selectedServiceLabel}\nData: ${confirmedVisit.preferredDate} (${confirmedVisit.preferredShift})`
      )}`
    : `https://wa.me/${COMPANY_CREDENTIALS.whatsappDigits}?text=${encodeURIComponent(
        'Olá RDR Serviços e Manutenção, gostaria de agendar uma visita técnica / solicitar orçamento.'
      )}`;

  return (
    <section id="agendamento" className="py-16 lg:py-24 bg-[#061124]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
              Agendamento de Visita Técnica e Orçamento
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8FAFC] tracking-tight max-w-2xl"
              style={{ textWrap: 'balance' }}
            >
              Agende uma visita técnica da RDR na sua empresa, hotel, hospital ou shopping
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setLookupOpen((prev) => !prev);
              setLookupError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:text-white border border-white/20 hover:border-yellow-400/50 rounded-md transition-colors self-start md:self-auto whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4 text-yellow-400" aria-hidden="true" />
            <span>{lookupOpen ? 'Ocultar Consulta' : 'Consultar Protocolo'}</span>
          </button>
        </div>

        {lookupOpen && (
          <div className="mt-6 p-5 sm:p-6 bg-[#0B1A36] border border-white/15 rounded-lg">
            <form
              onSubmit={handleLookupProtocol}
              className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
            >
              <div className="flex-1">
                <label
                  htmlFor="lookup-protocol"
                  className="block text-xs font-medium text-slate-200 mb-1.5"
                >
                  Código do Protocolo de Visita
                </label>
                <input
                  id="lookup-protocol"
                  type="text"
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  placeholder="Ex: RDR-2026-1042"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-5 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {lookupLoading ? 'Consultando...' : 'Verificar Status'}
              </button>
            </form>

            {lookupError && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-400" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{lookupError}</span>
              </div>
            )}

            {lookupResult && (
              <div className="mt-4 p-4 bg-[#061124] border border-white/15 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Protocolo</span>
                  <span className="font-mono font-semibold text-yellow-400 tabular-nums">
                    {lookupResult.protocol}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Empresa / Unidade</span>
                  <span className="text-slate-100 font-medium">{lookupResult.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Data e Janela</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {lookupResult.preferredDate} · {lookupResult.preferredShift}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Técnico Designado</span>
                  <span className="text-slate-200">
                    {lookupResult.assignedTechnician || 'Em definição'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Situação</span>
                  <span className="text-emerald-400 font-semibold">{lookupResult.status}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 bg-[#0B1A36] border border-white/15 rounded-lg p-6 sm:p-8">
            {confirmedVisit ? (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                      Visita Técnica Registrada
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      Sua solicitação foi registrada no sistema da RDR. Nossa equipe comercial e
                      técnica confirmará o horário pelo WhatsApp ou e-mail informado.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#061124] border border-white/15 rounded-lg flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Protocolo de Atendimento</span>
                    <span className="font-mono text-2xl font-bold text-yellow-400 tabular-nums">
                      {confirmedVisit.protocol}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyProtocol}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 hover:text-white border border-white/15 rounded-md cursor-pointer"
                  >
                    {copiedProtocol ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        <span>Copiar Protocolo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-white/10 pt-5">
                  <div>
                    <span className="text-xs text-slate-400 block">Empresa / Responsável</span>
                    <span className="text-slate-100 font-medium">
                      {confirmedVisit.companyName} — {confirmedVisit.contactName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Serviço e Criticidade</span>
                    <span className="text-slate-100 font-medium">
                      {selectedServiceLabel} · {confirmedVisit.urgency}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Data e Turno Solicitados</span>
                    <span className="font-mono text-slate-100 tabular-nums">
                      {confirmedVisit.preferredDate} · {confirmedVisit.preferredShift}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Local da Visita</span>
                    <span className="text-slate-100">
                      {confirmedVisit.plantAddress} — {confirmedVisit.cityState}
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-white/15 rounded-md cursor-pointer"
                  >
                    Novo Agendamento
                  </button>

                  <a
                    href={whatsappSummaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors"
                  >
                    <span>Enviar Protocolo no WhatsApp</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {[
                      { num: 1, title: 'Serviço e Escopo' },
                      { num: 2, title: 'Data e Local' },
                      { num: 3, title: 'Contato' },
                    ].map((item) => {
                      const active = step === item.num;
                      const done = step > item.num;
                      return (
                        <div key={item.num} className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center tabular-nums border ${
                              active
                                ? 'bg-yellow-400 text-[#061124] border-yellow-400'
                                : done
                                  ? 'bg-white/10 text-yellow-400 border-yellow-400/50'
                                  : 'bg-[#061124] text-slate-400 border-white/15'
                            }`}
                          >
                            {done ? <Check className="w-3.5 h-3.5" /> : item.num}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                              active ? 'text-[#F8FAFC]' : 'text-slate-400'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="font-mono text-xs text-slate-300 tabular-nums">
                    Etapa {step}/3
                  </span>
                </div>

                {step === 1 && (
                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-3">
                        Qual solução eletromecânica sua operação precisa?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICE_OPTIONS.map((option) => {
                          const selected = form.serviceType === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateField('serviceType', option.value)}
                              className={`text-left px-4 py-3 rounded-md border text-xs sm:text-sm transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-yellow-400/10 border-yellow-400 text-[#F8FAFC] font-medium'
                                  : 'bg-[#061124] border-white/10 text-slate-300 hover:border-white/30'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="sector-select"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Segmento do Estabelecimento
                        </label>
                        <select
                          id="sector-select"
                          value={form.sector}
                          onChange={(e) => updateField('sector', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                        >
                          {SECTOR_OPTIONS.map((sector) => (
                            <option key={sector} value={sector}>
                              {sector}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="motor-count-select"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Quantidade Estimada de Equipamentos
                        </label>
                        <select
                          id="motor-count-select"
                          value={form.motorCount}
                          onChange={(e) => updateField('motorCount', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                        >
                          {MOTOR_COUNT_OPTIONS.map((count) => (
                            <option key={count} value={count}>
                              {count}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#F8FAFC] mb-3">
                        Nível de Criticidade
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {URGENCY_OPTIONS.map((item) => {
                          const selected = form.urgency === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => updateField('urgency', item.value)}
                              className={`text-left px-3.5 py-2.5 rounded-md border text-xs sm:text-sm transition-colors cursor-pointer ${
                                selected
                                  ? 'bg-yellow-400/10 border-yellow-400 text-[#F8FAFC] font-medium'
                                  : 'bg-[#061124] border-white/10 text-slate-300 hover:border-white/30'
                              }`}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="preferred-date"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Data Preferencial da Visita
                        </label>
                        <input
                          id="preferred-date"
                          type="date"
                          min={getTodayIsoDate()}
                          value={form.preferredDate}
                          onChange={(e) => updateField('preferredDate', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="preferred-shift"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Janela de Horário
                        </label>
                        <select
                          id="preferred-shift"
                          value={form.preferredShift}
                          onChange={(e) => updateField('preferredShift', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] focus:outline-none focus:border-yellow-400"
                        >
                          {SHIFT_OPTIONS.map((shift) => (
                            <option key={shift} value={shift}>
                              {shift}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="plant-address"
                        className="block text-sm font-medium text-[#F8FAFC] mb-2"
                      >
                        Endereço da Empresa, Hotel, Hospital ou Shopping
                      </label>
                      <input
                        id="plant-address"
                        type="text"
                        value={form.plantAddress}
                        onChange={(e) => updateField('plantAddress', e.target.value)}
                        placeholder="Ex: Av. Paralela, 1500 — Casa de Máquinas"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city-state"
                        className="block text-sm font-medium text-[#F8FAFC] mb-2"
                      >
                        Cidade / Estado
                      </label>
                      <input
                        id="city-state"
                        type="text"
                        value={form.cityState}
                        onChange={(e) => updateField('cityState', e.target.value)}
                        placeholder="Ex: Salvador / BA ou Lauro de Freitas / BA"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="company-name"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Nome da Empresa / Instituição
                        </label>
                        <input
                          id="company-name"
                          type="text"
                          value={form.companyName}
                          onChange={(e) => updateField('companyName', e.target.value)}
                          placeholder="Ex: Resort Praia do Forte / Hospital"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="company-cnpj"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          CNPJ (Opcional)
                        </label>
                        <input
                          id="company-cnpj"
                          type="text"
                          value={form.cnpj}
                          onChange={(e) => updateField('cnpj', e.target.value)}
                          placeholder="00.000.000/0001-00"
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Nome do Responsável
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={form.contactName}
                          onChange={(e) => updateField('contactName', e.target.value)}
                          placeholder="Nome completo"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-role"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Cargo / Setor (Opcional)
                        </label>
                        <input
                          id="contact-role"
                          type="text"
                          value={form.contactRole}
                          onChange={(e) => updateField('contactRole', e.target.value)}
                          placeholder="Ex: Engenheiro / Supervisor de Manutenção"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          E-mail Corporativo
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={form.contactEmail}
                          onChange={(e) => updateField('contactEmail', e.target.value)}
                          placeholder="nome@empresa.com.br"
                          className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-sm font-medium text-[#F8FAFC] mb-2"
                        >
                          Telefone / WhatsApp
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={form.contactPhone}
                          onChange={(e) => updateField('contactPhone', e.target.value)}
                          placeholder="(71) 99999-9999"
                          className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="motor-details"
                        className="block text-sm font-medium text-[#F8FAFC] mb-2"
                      >
                        Equipamentos, Potência (CV) e Sintomas Observados (Opcional)
                      </label>
                      <textarea
                        id="motor-details"
                        rows={3}
                        value={form.motorDetails}
                        onChange={(e) => updateField('motorDetails', e.target.value)}
                        placeholder="Ex: Motor 30 CV de Chiller Carrier com ruído em rolamento ou bomba de incêndio 50 CV para preventiva."
                        className="w-full px-3.5 py-2.5 text-sm bg-[#061124] border border-white/15 rounded-md text-[#F8FAFC] placeholder:text-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>
                )}

                {stepError && (
                  <div
                    role="alert"
                    className="mt-5 p-3.5 rounded-md bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs sm:text-sm text-red-300"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                    <span>{stepError}</span>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white border border-white/15 rounded-md transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Voltar</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">
                      Orçamento técnico após avaliação presencial ou bancada
                    </span>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors cursor-pointer"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 rounded-md transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      <span>{isSubmitting ? 'Registrando...' : 'Confirmar Agendamento'}</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#0B1A36] border border-white/15 rounded-lg p-6">
              <h3 className="font-display text-base font-bold text-[#F8FAFC] pb-3 border-b border-white/10">
                Resumo da Solicitação
              </h3>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Serviço</dt>
                  <dd className="text-slate-100 font-medium text-right">{selectedServiceLabel}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Segmento</dt>
                  <dd className="text-slate-100 text-right">{form.sector}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Criticidade</dt>
                  <dd className="text-yellow-400 font-medium text-right">{form.urgency}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Porte Estimado</dt>
                  <dd className="font-mono text-slate-200 text-right tabular-nums">
                    {form.motorCount}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Data / Turno</dt>
                  <dd className="font-mono text-slate-200 text-right tabular-nums">
                    {form.preferredDate || '—'} · {form.preferredShift.split(' ')[0]}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-[#0B1A36] border border-white/15 rounded-lg p-6">
              <h3 className="font-display text-base font-bold text-[#F8FAFC] pb-3 border-b border-white/10">
                Canais Oficiais RDR
              </h3>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                Atendimento direto para solicitações urgentes, retirada de motores e visitas em
                Salvador, Lauro de Freitas e região:
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={`https://wa.me/${COMPANY_CREDENTIALS.whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-100 hover:text-yellow-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                  <span className="font-mono tabular-nums">
                    {COMPANY_CREDENTIALS.whatsappDisplay}
                  </span>
                </a>

                <a
                  href={`mailto:${COMPANY_CREDENTIALS.email}`}
                  className="flex items-center gap-3 text-slate-100 hover:text-yellow-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                  <span>{COMPANY_CREDENTIALS.email}</span>
                </a>
              </div>

              <a
                href={whatsappSummaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors"
              >
                <span>Falar no WhatsApp da RDR</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
