import { ArrowRight } from 'lucide-react';
import { COMPANY_CREDENTIALS, HERO_MEDIA, KPI_METRICS } from '../data/rdrContent';
import { RdrLogo } from './RdrLogo';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onScheduleClick: () => void;
}

export function HeroSection({ onScheduleClick }: HeroSectionProps) {
  return (
    <section id="inicio" className="border-b border-white/10 bg-[#061124]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <RdrLogo />
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mb-4 flex flex-wrap items-center gap-2">
                <span>Lauro de Freitas e Salvador · Bahia</span>
                <span aria-hidden="true">·</span>
                <span>Mais de 20 anos de experiência</span>
              </p>

              <h1
                className="font-display font-bold text-[#F8FAFC] tracking-tight leading-[1.08] max-w-2xl"
                style={{ fontSize: 'clamp(2.15rem, 3.8vw, 3.45rem)', textWrap: 'balance' }}
              >
                Sua solução em eletromecânica industrial para hotéis, hospitais, shoppings e indústrias.
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Mantendo sua força motriz em pleno funcionamento com rapidez e dinamismo com
                resultado. Especialistas em manutenção preditiva, preventiva e corretiva em
                motores elétricos, bombas, chillers, torres de resfriamento e usinagem.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onScheduleClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#061124] bg-yellow-400 hover:bg-yellow-300 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                <span>Agendar Visita Técnica</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <a
                href={`https://wa.me/${COMPANY_CREDENTIALS.whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium text-slate-100 hover:text-white border border-white/20 hover:border-yellow-400/50 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
              >
                WhatsApp {COMPANY_CREDENTIALS.whatsappDisplay}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[450px] rounded-lg overflow-hidden border border-white/15 bg-[#0B1A36]">
              <ResilientImage
                src={HERO_MEDIA.src}
                alt={HERO_MEDIA.alt}
                className="w-full h-full object-cover"
                aspectClassName="h-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#061124]/80 via-transparent to-transparent pointer-events-none"
              />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-100">
                <span>Empresarial Porto Ipitanga · Galpão 26 — Lauro de Freitas / BA</span>
                <span className="font-mono text-yellow-400 tabular-nums">
                  {COMPANY_CREDENTIALS.instagramHandle}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-white/15 rounded-lg bg-[#0B1A36] divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {KPI_METRICS.map((metric) => (
            <div key={metric.label} className="p-5 sm:p-6">
              <div className="font-mono text-xl sm:text-2xl font-semibold text-yellow-400 tabular-nums">
                {metric.value}
              </div>
              <div className="mt-1.5 text-sm font-semibold text-[#F8FAFC]">{metric.label}</div>
              <div className="mt-1 text-xs text-slate-300 leading-relaxed">{metric.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
