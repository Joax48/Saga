'use client';

import { useMemo } from 'react';

export default function AboutPage() {
  const developersOrdenados = useMemo(() => {
    const developers = [
      'JOSE LUIS AMADOR MORA',
      'ERICKA MELISSA ARAYA HIDALGO',
      'LUIS ESTEBAN CHACON CHAVES',
      'ESTEBAN ANDRES CHAVES OBANDO',
      'RACHIT DE JESUS DIAZ VEGA',
      'EMANUEL GARCIA ROJAS',
      'ERICK JOSUE HERNANDEZ HERNANDEZ',
      'YERLAN JESUS IROLA RODRIGUEZ',
      'SHARON NICOLE JIMENEZ LOPEZ',
      'KENNETH SANTIAGO OSORIO MASIS',
      'FABIAN MORA ARIAS',
      'ALVARO JOSE MOYA ARRIETA',
      'DARIO MURILLO CHAVERRI',
      'ANTONY LEONARDO PICADO ALVARADO',
      'JORGE JOSE QUIROS ANDERSON',
      'ANDERSON RAMIREZ MENDEZ',
      'BRAYAN ALONSO RIVERA NAVARRO',
      'NATHALIA ISABEL RODRIGUEZ ALFARO',
      'ANDRES ESTEBAN SERRANO ROBLES',
      'ISAAC VARGAS JIMENEZ',
      'ANGELICA VARGAS ARTAVIA',
      'LUIS GUSTAVO ESQUIVEL QUIROS',
    ];
    return [...developers].sort((a, b) => a.localeCompare(b));
  }, []);

  const mitad = Math.ceil(developersOrdenados.length / 2);
  const columnaIzquierda = developersOrdenados.slice(0, mitad);
  const columnaDerecha = developersOrdenados.slice(mitad);

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-primary)] px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Sobre este proyecto</h1>

        <div className="mb-12 space-y-4 text-[var(--color-text-neutral-secondary)]">
          <p>
            Este proyecto es desarrollado por estudiantes de la Universidad de Costa Rica
            como parte del curso de Prácticas de Desarrollo de Software.
          </p>
          <p>
            Nuestro objetivo es crear una plataforma que facilite la gestión y
            visualización de unidades académicas, investigadores, proyectos y producciones
            científicas.
          </p>
        </div>

        <h1 className="text-3xl font-bold mb-8"> Desarrolladores </h1>
        <div className="flex gap-12">
          <div className="flex-1">
            {columnaIzquierda.map((name, index) => (
              <div key={index} className="py-1">
                {name}
              </div>
            ))}
          </div>
          <div className="flex-1">
            {columnaDerecha.map((name, index) => (
              <div key={index} className="py-1">
                {name}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-12 w-full h-128 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: "url('/developers_pic.png')" }}
        />
      </div>
    </main>
  );
}
