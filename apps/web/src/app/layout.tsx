import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'SGCI | Sistema de Gestión Contextualmente Inteligente',
    template: '%s | SGCI',
  },

  description:
    'Plataforma empresarial de gestión logística, operaciones, manifiestos, guías, almacén y distribución.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}