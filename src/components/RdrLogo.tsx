interface RdrLogoProps {
  compact?: boolean;
  className?: string;
}

export function RdrLogo({ compact = false, className = '' }: RdrLogoProps) {
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <svg
          width="34"
          height="28"
          viewBox="0 0 120 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <path
            d="M36 74C18 67 8 49 12 31C16 14 33 4 53 7L56 2L63 4L61 10L67 12L71 7L77 11L74 17L79 21L85 18L88 24L82 28"
            stroke="#F8FAFC"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27 65C15 54 14 33 27 21C38 11 55 10 68 18"
            stroke="#16A34A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <text
            x="33"
            y="60"
            fill="#F8FAFC"
            fontFamily="Archivo, sans-serif"
            fontWeight="700"
            fontSize="36"
          >
            R
          </text>
          <text
            x="58"
            y="60"
            fill="#16A34A"
            fontFamily="Archivo, sans-serif"
            fontWeight="700"
            fontSize="36"
          >
            D
          </text>
          <path d="M74 28L62 47H70L65 65L81 42H73L74 28Z" fill="#FACC15" />
          <text
            x="84"
            y="60"
            fill="#F8FAFC"
            fontFamily="Archivo, sans-serif"
            fontWeight="700"
            fontSize="36"
          >
            R
          </text>
        </svg>
        <span className="font-display text-lg font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap">
          RDR
        </span>
      </span>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <svg
        width="160"
        height="88"
        viewBox="0 0 210 105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="RDR Serviços e Manutenção Ltda"
      >
        <path
          d="M36 74C16 66 7 46 13 27C19 10 38 2 58 6L61 1L68 3L66 9L73 11L77 6L83 10L80 16L86 21L92 17L96 24L89 28"
          stroke="#F8FAFC"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27 65C15 53 15 32 28 20C39 10 57 9 71 17"
          stroke="#16A34A"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x="35"
          y="63"
          fill="#F8FAFC"
          fontFamily="Archivo, sans-serif"
          fontWeight="700"
          fontSize="42"
        >
          R
        </text>
        <text
          x="65"
          y="63"
          fill="#16A34A"
          fontFamily="Archivo, sans-serif"
          fontWeight="700"
          fontSize="42"
        >
          D
        </text>
        <path d="M85 27L71 48H80L74 68L93 43H84L85 27Z" fill="#FACC15" />
        <text
          x="97"
          y="63"
          fill="#F8FAFC"
          fontFamily="Archivo, sans-serif"
          fontWeight="700"
          fontSize="42"
        >
          R
        </text>
        <text
          x="10"
          y="91"
          fill="#CBD5E1"
          fontFamily="DM Sans, sans-serif"
          fontWeight="600"
          fontSize="11.5"
          letterSpacing="0.8"
        >
          SERVIÇOS E MANUTENÇÃO LTDA
        </text>
      </svg>
    </div>
  );
}
