import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import {
  COMPLEMENTARY_SPECIALTIES,
  SERVICE_PILLARS,
  type MotorPillarId,
  type ServiceCategory,
} from '../data/rdrContent';
import { ResilientImage } from './ResilientImage';

interface ServicesSectionProps {
  onRequestServiceDiagnosis: (category: ServiceCategory) => void;
}

export function ServicesSection({ onRequestServiceDiagnosis }: ServicesSectionProps) {
  const [activeId, setActiveId] = useState<MotorPillarId>('preditiva');

  const activePillar =
    SERVICE_PILLARS.find((pillar) => pillar.id === activeId) ?? SERVICE_PILLARS[0];

  return (
    <section id="servicos" className="py-16 lg:py-24 border-b border-white/10 bg-[#061124]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
              Especialidade em Motores Elétricos e Eletromecânica
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F8FAFC] tracking-tight max-w-2xl"
              style={{ textWrap: 'balance' }}
            >
              Manutenção preditiva, preventiva e corretiva para manter sua operação ativa
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Modalidades de manutenção em motores elétricos"
            className="inline-flex items-center p-1 bg-[#0B1A36] border border-white/15 rounded-lg self-start lg:self-auto"
          >
            {SERVICE_PILLARS.map((pillar) => {
              const isSelected = pillar.id === activePillar.id;
              return (
                <button
                  key={pillar.id}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => setActiveId(pillar.id)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-yellow-400 ${
                    isSelected
                      ? 'bg-yellow-400 text-[#061124] font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {pillar.indexLabel} {pillar.shortTitle}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/15 bg-[#0B1A36]">
              <ResilientImage
                src={activePillar.image}
                alt={activePillar.imageAlt}
                className="w-full h-full object-cover"
                aspectClassName="aspect-[4/3]"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Modelo de Atendimento</span>
                <span className="text-slate-100 font-medium mt-0.5 block">
                  {activePillar.slaTarget}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Escopo Técnico</span>
                <span className="font-mono text-yellow-400 mt-0.5 block tabular-nums">
                  {activePillar.powerRange}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B1A36] border border-white/15 rounded-lg p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
              {activePillar.title}
            </h3>
            <p className="mt-2 text-base font-medium text-yellow-400">{activePillar.headline}</p>
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              {activePillar.summary}
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                  Serviços Executados
                </h4>
                <ul className="space-y-2.5">
                  {activePillar.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <Check
                        className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC] mb-3">
                  Equipamentos e Aplicações
                </h4>
                <ul className="space-y-2.5">
                  {activePillar.applicableMotors.map((motor) => (
                    <li
                      key={motor}
                      className="text-sm text-slate-300 pb-2 border-b border-white/10 last:border-b-0 last:pb-0"
                    >
                      {motor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-300">
                Atendimento para motores elétricos monofásicos e trifásicos CA/CC, geradores e bombas.
              </span>
              <button
                type="button"
                onClick={() => onRequestServiceDiagnosis(activePillar.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-yellow-300"
              >
                <span>Agendar {activePillar.shortTitle}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-12 border-t border-white/10">
          <div className="max-w-3xl mb-8">
            <p className="text-xs font-medium text-yellow-400 tracking-wide mb-2">
              Soluções Completas em Eletromecânica e Usinagem
            </p>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#F8FAFC] tracking-tight">
              Além dos motores elétricos: infraestrutura, climatização, quadros e torno
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPLEMENTARY_SPECIALTIES.map((spec) => (
              <article
                key={spec.id}
                className="bg-[#0B1A36] border border-white/15 rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-yellow-400 tabular-nums">
                      {spec.indexLabel}
                    </span>
                  </div>
                  <h4 className="mt-2 font-display text-lg font-bold text-[#F8FAFC]">
                    {spec.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{spec.summary}</p>

                  <ul className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {spec.items.map((entry) => (
                      <li key={entry} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{entry}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onRequestServiceDiagnosis(spec.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                  >
                    <span>Solicitar visita nesta frente</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
