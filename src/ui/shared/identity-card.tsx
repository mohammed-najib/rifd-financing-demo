import type { Language } from '../../domain/model';

export function IdentityCard({
  name,
  role,
  language,
  disabled,
  onClick,
}: {
  name: string;
  role: string;
  language: Language;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="identity-card m-0 grid min-h-[140px] grid-cols-[52px_1fr_20px] items-center gap-x-[18px] gap-y-[2px] rounded-card bg-surface p-[26px] text-start text-ink narrow:min-h-[110px] narrow:p-5"
      disabled={disabled}
      onClick={onClick}
      aria-label={name}
    >
      <span
        className="row-[1/3] flex size-[52px] items-center justify-center rounded-[50%] bg-summary text-[22px] text-accent"
        aria-hidden="true"
      >
        {name.slice(0, 1)}
      </span>
      <strong>{name}</strong>
      <span>{role}</span>
      <span className="col-start-3 row-[1/3] text-[24px] text-accent" aria-hidden="true">
        {language === 'ar' ? '←' : '→'}
      </span>
    </button>
  );
}
