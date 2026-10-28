import { useState } from 'react';
import { products } from '../../domain';
import type { Language, ProductId } from '../../domain/model';
import { applicationText } from '../application/application-copy';
import { documentLabel, money, text } from '../i18n';
import { Select } from '../shared/select';

const copy = {
  heading: { en: 'Your business.', ar: 'مشروعك.' },
  accent: { en: 'Its next chapter.', ar: 'وخطوته القادمة.' },
  intro: {
    en: 'More stock for your shelves. Better tools for your work. Explore financing shaped around your next step.',
    ar: 'مخزون جديد لمتجرك. ومعدات أفضل لعملك. اكتشف التمويل المناسب لخطوتك القادمة.',
  },
  explore: { en: 'Find your financing', ar: 'اكتشف خيارات التمويل' },
  products: { en: 'Room to grow', ar: 'مساحة للنمو' },
  productIntro: {
    en: 'Two purposes. Clear terms. Choose what your business needs.',
    ar: 'خياران بشروط واضحة. اختر ما يحتاجه مشروعك.',
  },
  inventory: { en: 'Keep your shelves ready.', ar: 'مخزون يواكب طموحك.' },
  equipment: { en: 'Make room for better tools.', ar: 'معدات تفتح لك آفاقًا.' },
  upTo: { en: 'Financing up to', ar: 'تمويل يصل إلى' },
  from: { en: 'Starting from', ar: 'ابتداءً من' },
  term: { en: 'Choose a term', ar: 'اختر مدة السداد' },
  documents: { en: 'What you need', ar: 'ما الذي تحتاجه؟' },
  markup: { en: 'One-time illustrative markup', ar: 'زيادة توضيحية لمرة واحدة' },
  options: { en: 'Financing options', ar: 'خيارات التمويل' },
  journey: { en: 'A clear path, from the start.', ar: 'خطوات واضحة، منذ البداية.' },
  step1: { en: 'Choose your financing', ar: 'اختر التمويل' },
  step1Body: { en: 'Compare the purpose, amount and term.', ar: 'قارن الغرض والمبلغ ومدة السداد.' },
  step2: { en: 'Tell us about your business', ar: 'عرّفنا بمشروعك' },
  step2Body: {
    en: 'Prepare your details and four documents.',
    ar: 'جهّز بياناتك والمستندات الأربعة.',
  },
  step3: { en: 'Follow your application', ar: 'تابع طلبك' },
  step3Body: {
    en: 'See review updates and your next step.',
    ar: 'اطّلع على تحديثات المراجعة وخطوتك التالية.',
  },
};
type IconName = 'arrow' | 'box' | 'equipment' | 'check' | 'spark';
export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5v4" />
      </>
    ),
    equipment: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M9 7V4h6v3M4 12h16M9 16h6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />,
  };
  return (
    <svg
      className={`products-icon products-icon-${name}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function GrowthArt({ language }: { language: Language }) {
  return (
    <div className="growth-art" aria-hidden="true">
      <div className="growth-orbit" />
      <div className="growth-orbit growth-orbit-two" />
      <div className="growth-label">
        <span />
        {language === 'ar' ? 'خطوتك القادمة' : 'YOUR NEXT CHAPTER'}
      </div>
      <div className="growth-bars">
        <i />
        <i />
        <i />
      </div>
      <div className="growth-note">
        <Icon name="spark" />
        <span>
          {language === 'ar'
            ? 'أفكار اليوم. فرص الغد.'
            : "Today's ideas. Tomorrow's possibilities."}
        </span>
      </div>
      <span className="growth-coordinate">R / 01</span>
    </div>
  );
}

export function ProductCard({
  productId,
  language,
  choose,
}: {
  productId: ProductId;
  language: Language;
  choose: (product: ProductId, term: number) => void;
}) {
  const product = products[productId];
  const [term, setTerm] = useState(product.terms[0]);
  return (
    <article
      className={`product-card product-card-${product.id}`}
      aria-labelledby={`${product.id}-title`}
    >
      <div className="product-top">
        <span className="product-icon">
          <Icon name={product.id === 'inventory' ? 'box' : 'equipment'} size={26} />
        </span>
        <h3 className="product-category" id={`${product.id}-title`}>
          {product.name[language]}
        </h3>
        <span className="product-number">{product.id === 'inventory' ? '01' : '02'}</span>
      </div>
      <p className="product-title">{copy[product.id][language]}</p>
      <p className="product-description">{product.purpose[language]}</p>
      <div className="product-amount">
        <small>{copy.upTo[language]}</small>
        <strong>
          <bdi dir="ltr">{money(product.maximum, language)}</bdi>
        </strong>
      </div>
      <dl className="product-facts">
        <div>
          <dt>{copy.from[language]}</dt>
          <dd>
            <bdi dir="ltr">{money(product.minimum, language)}</bdi>
          </dd>
        </div>
        <div>
          <dt>{text.term[language]}</dt>
          <dd>
            <bdi>{product.terms.join(' / ')}</bdi> {text.months[language]}
          </dd>
        </div>
        <div>
          <dt>{copy.markup[language]}</dt>
          <dd>
            <bdi>{product.markupPercent}%</bdi>
          </dd>
        </div>
      </dl>
      <details className="product-documents">
        <summary>
          {copy.documents[language]}
          <span aria-hidden="true">+</span>
        </summary>
        <ul>
          {(['identity', 'business', 'financial', 'purchase'] as const).map(slot => (
            <li key={slot}>
              <Icon name="check" size={16} />
              {documentLabel(slot, product.id)[language]}
            </li>
          ))}
        </ul>
        <p>{applicationText.eligibility[language]}</p>
      </details>
      <div className="product-controls">
        <div className="product-term-field">
          <label htmlFor={`product-term-${product.id}`}>{copy.term[language]}</label>
          <Select
            id={`product-term-${product.id}`}
            label={copy.term[language]}
            value={String(term)}
            options={product.terms.map(term => ({
              value: String(term),
              label: `${term} ${text.months[language]}`,
            }))}
            onValueChange={value => setTerm(Number(value))}
          />
        </div>
        <button type="button" onClick={() => choose(product.id, term)}>
          {applicationText.choose[language]}
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </article>
  );
}

export function Products({
  language,
  choose,
}: {
  language: Language;
  choose: (product: ProductId, term: number) => void;
}) {
  return (
    <div className="products-page">
      <section className="products-hero grid grid-cols-[1.15fr_1fr] items-center gap-16 narrow:grid-cols-1 narrow:gap-8">
        <div>
          <h1 tabIndex={-1}>
            {copy.heading[language]}
            <em>{copy.accent[language]}</em>
          </h1>
          <p>{copy.intro[language]}</p>
          <a className="button" href="#financing-products">
            {copy.explore[language]}
            <Icon name="arrow" size={19} />
          </a>
        </div>
        <GrowthArt language={language} />
      </section>
      <section
        id="financing-products"
        className="products-catalogue"
        aria-labelledby="products-title"
      >
        <div className="products-heading">
          <div>
            <span className="products-label">{copy.options[language]}</span>
            <h2 id="products-title">{copy.products[language]}</h2>
          </div>
          <p>{copy.productIntro[language]}</p>
        </div>
        <div className="grid grid-cols-2 gap-6 narrow:grid-cols-1">
          {Object.values(products).map(product => (
            <ProductCard
              key={product.id}
              productId={product.id}
              language={language}
              choose={choose}
            />
          ))}
        </div>
      </section>
      <section className="product-journey" aria-labelledby="journey-title">
        <h2 id="journey-title">{copy.journey[language]}</h2>
        <ol>
          {(['step1', 'step2', 'step3'] as const).map((step, index) => (
            <li key={step}>
              <span className="product-step-number">0{index + 1}</span>
              <div>
                <h3>{copy[step][language]}</h3>
                <p>{copy[`${step}Body`][language]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
