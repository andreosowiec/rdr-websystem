import { useState } from 'react';
import { ArrowRight, Building2, FileCheck2, MapPin, ShieldCheck, X } from 'lucide-react';
import {
  CASE_STUDIES,
  COMPANY_CREDENTIALS,
  REAL_CLIENTS,
  TARGET_SECTORS,
  type CaseStudy,
  type MotorPillarId,
  type ServiceCategory,
} from '../data/rdrContent';
import { RdrLogo } from './RdrLogo';
import { ResilientImage } from './ResilientImage';

interface SectorsAndProofSectionProps {
  onRequestDiagnosis: (category?: ServiceCategory) => void;
}

type FilterOption = 'todos' | MotorPillarId;

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'preditiva', label: 'Preditiva' },
  { value: 'preventiva', label: 'Preventiva' },
  { value: 'corretiva', label: 'Corretiva' },
];

export function SectorsAndProofSection({ onRequestDiagnosis }: SectorsAndProofSectionProps) {
  const [filter, setFilter] = useState<FilterOption>('todos');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const visibleCases =
    filter === 'todos' ? CASE_STUDIES : CASE_STUDIES.filter((item) => item.category === filter);

  return (
    <>
      <section id="setores" className="py-16 lg:py-24 border-b border-white/10 bg-[#0B1A36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
              Segmentos Atendidos na Bahia
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8FAFC] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Soluções eletromecânicas para hotéis, hospitais, shoppings e indústrias
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              De grandes resorts no Litoral Norte a hospitais e shoppings em Salvador e plantas
              industriais na Região Metropolitana, atendemos ativos críticos onde a parada custa
              operação, segurança e receita.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/15 rounded-lg bg-[#061124] divide-y md:divide-y-0 md:divide-x divide-white/10">
            {TARGET_SECTORS.map((sector, idx) => (
              <article key={sector.id} className="p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs text-yellow-400 tabular-nums">
                    0{idx + 1}.
                  </span>
                  <h3 className="mt-2 font-display text-lg font-bold text-[#F8FAFC]">
                    {sector.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{sector.context}</p>

                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    {sector.criticalApplications.map((app) => (
                      <li key={app} className="text-xs text-slate-200 leading-relaxed">
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed">
                  {sector.operationalRisk}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="clientes" className="py-16 lg:py-24 border-b border-white/10 bg-[#061124]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-10 border-b border-white/10">
            <div className="max-w-3xl">
              <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
                Carteira de Clientes Atendidos
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8FAFC] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Empresas que confiam suas casas de máquinas e motores à RDR
              </h2>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-white/15 rounded-lg bg-[#0B1A36] divide-y sm:divide-y-0 sm:grid-flow-row">
              {REAL_CLIENTS.map((client) => (
                <div
                  key={client.name}
                  className="p-5 border-b border-white/10 sm:border-r last:border-b-0 flex flex-col justify-between"
                >
                  <div className="font-display text-base font-bold text-[#F8FAFC]">
                    {client.name}
                  </div>
                  <div className="mt-1.5 text-xs text-slate-300 flex items-center gap-2">
                    <span>{client.segment}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-yellow-400 font-medium">{client.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
                Serviços Documentados em Campo e Oficina
              </p>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
                Exemplos reais de intervenções da RDR
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-300 tabular-nums">
                {visibleCases.length} {visibleCases.length === 1 ? 'registro' : 'registros'}
              </span>
              <div
                role="group"
                aria-label="Filtrar casos executados por modalidade"
                className="inline-flex items-center p-1 bg-[#0B1A36] border border-white/15 rounded-lg"
              >
                {FILTER_OPTIONS.map((option) => {
                  const isActive = filter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-yellow-400 text-[#061124] font-semibold'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {visibleCases.map((item) => (
              <article
                key={item.id}
                className="bg-[#0B1A36] border border-white/15 rounded-lg overflow-hidden flex flex-col justify-between hover:border-white/30 transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#061124] overflow-hidden border-b border-white/10">
                    <ResilientImage
                      src={item.image}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover"
                      aspectClassName="aspect-[4/3]"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                      <span>{item.sector}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.categoryLabel}</span>
                    </div>

                    <h4 className="mt-2 font-display text-lg font-bold text-[#F8FAFC] leading-snug">
                      {item.title}
                    </h4>

                    <p className="mt-2 font-mono text-xs text-slate-300 tabular-nums">
                      {item.equipmentSpec}
                    </p>

                    <p className="mt-4 text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {item.execution}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-lg font-bold text-yellow-400 tabular-nums">
                      {item.metricValue}
                    </div>
                    <div className="text-xs text-slate-300">{item.metricLabel}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCase(item)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-100 hover:text-yellow-300 border border-white/20 hover:border-yellow-400/50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="empresa" className="py-16 lg:py-24 border-b border-white/10 bg-[#0B1A36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6">
              <div className="mb-5">
                <RdrLogo />
              </div>

              <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
                Sede Própria e Dados Cadastrais Oficiais
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8FAFC] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Rapidez e dinamismo com resultado há mais de 20 anos na Bahia
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed">
                {COMPANY_CREDENTIALS.missionQuote}
              </p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold text-[#F8FAFC]">
                      {COMPANY_CREDENTIALS.legalName}
                    </div>
                    <div className="font-mono text-xs text-slate-300 mt-0.5 tabular-nums">
                      CNPJ {COMPANY_CREDENTIALS.cnpj} · Situação Ativa
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      CNAE: {COMPANY_CREDENTIALS.cnae}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-medium text-slate-100">{COMPANY_CREDENTIALS.address}</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {COMPANY_CREDENTIALS.cityState}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {COMPANY_CREDENTIALS.coverageArea}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck2 className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-medium text-slate-100">{COMPANY_CREDENTIALS.hours}</div>
                    <div className="font-mono text-xs text-slate-200 mt-0.5 tabular-nums">
                      WhatsApp: {COMPANY_CREDENTIALS.whatsappDisplay} · {COMPANY_CREDENTIALS.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#061124] border border-white/15 rounded-lg p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-[#F8FAFC] mb-5">
                  Por que escolher a RDR Serviços e Manutenção?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {COMPANY_CREDENTIALS.differentials.map((item) => (
                    <div key={item.title} className="pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        <span className="text-sm font-semibold text-[#F8FAFC]">{item.title}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-slate-300">
                    Instagram oficial:{' '}
                    <a
                      href={COMPANY_CREDENTIALS.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-yellow-400 hover:underline"
                    >
                      {COMPANY_CREDENTIALS.instagramHandle}
                    </a>
                  </span>

                  <button
                    type="button"
                    onClick={() => onRequestDiagnosis()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors cursor-pointer"
                  >
                    <span>Agendar Visita na Planta</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedCase && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-2xl bg-[#0B1A36] border border-white/15 rounded-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-[#061124]">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span>{selectedCase.sector}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedCase.categoryLabel}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label="Fechar detalhes do projeto"
                className="w-9 h-9 inline-flex items-center justify-center rounded-md text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <h3
                  id="case-modal-title"
                  className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC]"
                >
                  {selectedCase.title}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{selectedCase.clientType}</p>
                <p className="mt-2 font-mono text-xs text-yellow-400 tabular-nums">
                  {selectedCase.equipmentSpec}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#061124] border border-white/10 rounded-lg">
                <div>
                  <span className="text-xs text-slate-400 block">Resultado / Escopo</span>
                  <span className="font-mono text-xl font-bold text-yellow-400 tabular-nums">
                    {selectedCase.metricValue}
                  </span>
                  <span className="text-xs text-slate-300 block">{selectedCase.metricLabel}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Condição de Execução</span>
                  <span className="text-sm font-medium text-[#F8FAFC] mt-1 block">
                    {selectedCase.duration}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1.5">Cenário Técnico</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedCase.challenge}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC] mb-1.5">
                  Atuação da Equipe RDR
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedCase.execution}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#061124] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const category = selectedCase.category;
                  setSelectedCase(null);
                  onRequestDiagnosis(category);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors cursor-pointer"
              >
                <span>Agendar Diagnóstico Semelhante</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
