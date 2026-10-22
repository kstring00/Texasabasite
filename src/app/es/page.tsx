import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/data/site';
import { Section } from '@/components/site/Section';

export const metadata: Metadata = {
  title: 'Terapia ABA y evaluaciones de autismo en Texas',
  description: 'Terapia ABA y evaluaciones de autismo en Austin, Cedar Hill, Katy, Pearland, Plano y Sugar Land. Versión en español próximamente.',
  alternates: { canonical: '/es', languages: { en: '/', es: '/es' } },
};

/**
 * Spanish route stub. The structure is ready; Spanish copy is the post-demo step.
 * Everything here is real and callable today.
 */
export default function EsPage() {
  return (
    <div lang="es">
      <Section eyebrow="Español" title="Terapia ABA y evaluaciones de autismo en Texas." lede="La versión completa en español está en camino. Mientras tanto, puede llamarnos y hablar con una persona en español.">
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${site.phone.tel}`} className="btn-primary">
            Llamar {site.phone.display}
          </a>
          <Link href="/request-a-tour" className="btn-secondary">
            Solicitar una visita
          </Link>
        </div>
        <p className="mt-8 text-base text-body">
          <Link href="/" className="font-semibold text-ink underline underline-offset-4">
            Ver el sitio en inglés
          </Link>
        </p>
      </Section>
    </div>
  );
}
