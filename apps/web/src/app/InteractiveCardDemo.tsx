'use client';

import { Card } from '@/components/Card';

export function InteractiveCardDemo() {
  return (
    <Card
      title="Haz clic en esta card"
      description="Esta card tiene onClick activo. Al hacer clic aparece una alerta. También responde a Enter y Space con el teclado."
      tags={['Interactiva', 'Accesible']}
      onClick={() => alert('¡Card clickeada!')}
    />
  );
}
