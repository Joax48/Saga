'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Minus, Search } from 'lucide-react';

import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ProjectListItem from '@/app/projects/components/ProjectListItem';
import { getProjects, type Project } from '@/services/projects';
import { getResearchers } from '@/services/researchers';
import { getScientificProductions } from '@/services/scientific-productions';
import { getUnits } from '@/services/units';
import type { ScientificProduction } from '@/types';

type ContentType = 'researchers' | 'units' | 'projects' | 'scientific-productions';

type Operator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'exactPhrase';

type JoinWith = 'and' | 'or';

type FieldOption = {
  value: string;
  label: string;
};

type QueryRow = {
  id: number;
  joinWith: JoinWith;
  field: string;
  operator: Operator;
  value: string;
};

type ResultItem = {
  id: string;
  title: string;
  subtitle: string;
  excerpt?: string;
  tags?: string[];
  href: string;
};

type LoadResult = {
  rows: ResultItem[];
  projects?: Project[];
};

const CONTENT_TYPE_OPTIONS: Array<{ value: ContentType; label: string }> = [
  { value: 'researchers', label: 'Perfiles' },
  { value: 'units', label: 'Unidades' },
  { value: 'projects', label: 'Proyectos' },
  { value: 'scientific-productions', label: 'Producción científica' },
];

const FIELD_OPTIONS: Record<ContentType, FieldOption[]> = {
  researchers: [
    { value: 'any', label: 'Cualquier campo' },
    { value: 'name', label: 'Nombre' },
    { value: 'unit', label: 'Unidad' },
    { value: 'category', label: 'Categoría CEA' },
  ],
  units: [
    { value: 'any', label: 'Cualquier campo' },
    { value: 'name', label: 'Nombre' },
  ],
  projects: [
    { value: 'any', label: 'Cualquier campo' },
    { value: 'code', label: 'Código' },
    { value: 'title', label: 'Nombre' },
    { value: 'participant', label: 'Participante' },
    { value: 'keywords', label: 'Palabras clave' },
  ],
  'scientific-productions': [
    { value: 'any', label: 'Cualquier campo' },
    { value: 'title', label: 'Título' },
    { value: 'authors', label: 'Autores' },
    { value: 'keywords', label: 'Palabras clave' },
    { value: 'year', label: 'Año' },
  ],
};

const OPERATOR_OPTIONS: Array<{ value: Operator; label: string }> = [
  { value: 'contains', label: 'contiene' },
  { value: 'equals', label: 'coincide exactamente' },
  { value: 'startsWith', label: 'empieza con' },
  { value: 'endsWith', label: 'termina con' },
  { value: 'exactPhrase', label: 'frase exacta' },
];

const PAGE_SIZE = 120;

function getDefaultField(contentType: ContentType): string {
  return contentType === 'projects' ? 'code' : 'any';
}

function newRow(nextId: number, contentType: ContentType): QueryRow {
  return {
    id: nextId,
    joinWith: 'and',
    field: getDefaultField(contentType),
    operator: 'contains',
    value: '',
  };
}

function compareValue(source: string, query: string, operator: Operator): boolean {
  const left = source.toLowerCase().trim();
  const right = query.toLowerCase().trim();

  if (!right) return true;

  if (operator === 'equals') return left === right;
  if (operator === 'startsWith') return left.startsWith(right);
  if (operator === 'endsWith') return left.endsWith(right);
  if (operator === 'exactPhrase') return left.includes(` ${right} `) || left === right;

  return left.includes(right);
}

function includeIfHasValue(row: QueryRow): boolean {
  return row.value.trim().length > 0;
}

export default function AdvancedSearchPage() {
  const searchParams = useSearchParams();
  const [contentType, setContentType] = useState<ContentType>('projects');
  const [rows, setRows] = useState<QueryRow[]>([newRow(1, 'projects')]);
  const [nextRowId, setNextRowId] = useState(2);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [projectResults, setProjectResults] = useState<Project[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableFields = useMemo(() => FIELD_OPTIONS[contentType], [contentType]);

  useEffect(() => {
    setRows((previous) =>
      previous.map((row) => ({ ...row, field: getDefaultField(contentType) })),
    );
  }, [contentType]);

  useEffect(() => {
    const query = searchParams.get('q')?.trim();
    if (!query) return;

    setContentType('projects');

    setRows((previous) => {
      if (previous.length === 1 && !previous[0].value.trim()) {
        return [
          {
            ...previous[0],
            field: 'code',
            value: query,
          },
        ];
      }
      return previous;
    });
  }, [searchParams]);

  const updateRow = (rowId: number, patch: Partial<QueryRow>) => {
    setRows((previous) =>
      previous.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setRows((previous) => [...previous, newRow(nextRowId, contentType)]);
    setNextRowId((previous) => previous + 1);
  };

  const removeRow = (rowId: number) => {
    setRows((previous) => {
      if (previous.length <= 1) return previous;
      return previous.filter((row) => row.id !== rowId);
    });
  };

  const clearAll = () => {
    setRows([newRow(1, contentType)]);
    setNextRowId(2);
    setResults([]);
    setProjectResults([]);
    setSearched(false);
    setError(null);
  };

  const evaluateRows = (
    rowSet: QueryRow[],
    extractor: (field: string) => string[],
  ): boolean => {
    if (rowSet.length === 0) return true;

    return rowSet.reduce((accumulator, row, index) => {
      const values = extractor(row.field);
      const current = values.some((value) =>
        compareValue(value, row.value, row.operator),
      );

      if (index === 0) return current;
      return row.joinWith === 'and' ? accumulator && current : accumulator || current;
    }, true);
  };

  const loadResearchers = async (queryRows: QueryRow[]): Promise<LoadResult> => {
    const response = await getResearchers(1, PAGE_SIZE, '');

    const rowsResult = response.data
      .filter((researcher) =>
        evaluateRows(queryRows, (field) => {
          const fullName = `${researcher.name} ${researcher.firstSurname} ${researcher.secondSurname}`;
          const byField: Record<string, string[]> = {
            any: [
              fullName,
              researcher.baseUnit,
              researcher.ceaCategory ?? '',
              researcher.orcidId ?? '',
            ],
            name: [fullName],
            unit: [researcher.baseUnit],
            category: [researcher.ceaCategory ?? ''],
          };
          return byField[field] ?? byField.any;
        }),
      )
      .map((researcher) => ({
        id: researcher.id,
        title: `${researcher.name} ${researcher.firstSurname}`,
        subtitle: researcher.baseUnit,
        excerpt: researcher.ceaCategory ?? 'Investigador',
        href: `/researchers/${researcher.id}`,
      }));

    return { rows: rowsResult };
  };

  const loadUnits = async (queryRows: QueryRow[]): Promise<LoadResult> => {
    const response = await getUnits(1, PAGE_SIZE, '');

    const rowsResult = response.data
      .filter((unit) =>
        evaluateRows(queryRows, (field) => {
          const byField: Record<string, string[]> = {
            any: [unit.name],
            name: [unit.name],
          };
          return byField[field] ?? byField.any;
        }),
      )
      .map((unit) => ({
        id: String(unit.id),
        title: unit.name,
        subtitle: `Unidad académica #${unit.id}`,
        href: `/units/${unit.id}`,
      }));

    return { rows: rowsResult };
  };

  const loadProjects = async (queryRows: QueryRow[]): Promise<LoadResult> => {
    const response = await getProjects(1, PAGE_SIZE, '', {});

    const filteredProjects = response.data.filter((project) =>
      evaluateRows(queryRows, (field) => {
        const associatedNames = project.associatedProfiles.map((profile) => profile.name);
        const byField: Record<string, string[]> = {
          any: [
            project.code,
            project.title,
            project.manager,
            ...project.keywords,
            ...associatedNames,
          ],
          code: [project.code],
          title: [project.title],
          participant: [project.manager, ...associatedNames],
          keywords: project.keywords,
        };
        return byField[field] ?? byField.any;
      }),
    );

    const rowsResult = filteredProjects.map((project: Project) => ({
      id: project.id,
      title: project.title,
      subtitle: `${project.code} · ${project.manager}`,
      excerpt: `${project.startDate} - ${project.endDate}`,
      tags: project.keywords.slice(0, 3),
      href: `/projects/${project.id}`,
    }));

    return { rows: rowsResult, projects: filteredProjects };
  };

  const loadScientificProductions = async (
    queryRows: QueryRow[],
  ): Promise<LoadResult> => {
    const response = await getScientificProductions(1, PAGE_SIZE);

    const rowsResult = response.items
      .filter((production) =>
        evaluateRows(queryRows, (field) => {
          const byField: Record<string, string[]> = {
            any: [
              production.title,
              String(production.publication_year),
              ...production.authors,
              ...production.keywords,
            ],
            title: [production.title],
            authors: production.authors,
            keywords: production.keywords,
            year: [String(production.publication_year)],
          };
          return byField[field] ?? byField.any;
        }),
      )
      .map((production: ScientificProduction) => ({
        id: production.id,
        title: production.title,
        subtitle: `${production.publication_year} · ${production.type.category}`,
        excerpt: production.authors.slice(0, 2).join(', '),
        tags: production.keywords.slice(0, 3),
        href: `/scientific-productions/${production.id}`,
      }));

    return { rows: rowsResult };
  };

  const runSearch = async () => {
    setSearched(true);
    setLoading(true);
    setError(null);

    const queryRows = rows.filter(includeIfHasValue);

    try {
      let loaded: LoadResult;

      if (contentType === 'researchers') {
        loaded = await loadResearchers(queryRows);
      } else if (contentType === 'units') {
        loaded = await loadUnits(queryRows);
      } else if (contentType === 'projects') {
        loaded = await loadProjects(queryRows);
      } else {
        loaded = await loadScientificProductions(queryRows);
      }

      setResults(loaded.rows);
      setProjectResults(loaded.projects ?? []);
    } catch (searchError) {
      console.error(searchError);
      setError('No fue posible completar la búsqueda. Inténtalo de nuevo.');
      setResults([]);
      setProjectResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-secondary)]">
      <section className="relative overflow-hidden px-6 lg:px-10 pt-6 pb-14">
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <div className="absolute -top-16 right-10 h-48 w-48 rounded-full bg-[var(--color-celeste-100)] blur-3xl" />
          <div className="absolute top-28 -left-10 h-56 w-56 rounded-full bg-[var(--color-azul-100)] blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="pt-2 pb-4">
            <Breadcrumb items={[{ label: 'Búsqueda avanzada' }]} />
          </div>

          <div className="rounded-3xl border border-[var(--color-gray-200)] bg-[var(--color-bg-neutral-primary)] shadow-sm px-5 py-8 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-gray-300)] pb-6">
              <h1 className="text-h2 font-bold text-[var(--color-text-neutral-primary)]">
                Búsqueda avanzada
              </h1>
              <p className="text-body-sm text-[var(--color-text-neutral-secondary)]">
                Combina condiciones y descubre resultados más precisos.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-body-md text-[var(--color-text-neutral-primary)]">
                  Tipo de contenido
                </label>
                <select
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value as ContentType)}
                  className="h-12 w-full rounded-xl border border-[var(--color-gray-300)] bg-white px-4 text-body-md outline-none focus:border-[var(--color-azul-600)]"
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid gap-3 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-gray-25)] p-4 md:grid-cols-[100px_220px_220px_1fr_auto] md:items-center"
                  >
                    {index > 0 ? (
                      <select
                        value={row.joinWith}
                        onChange={(event) =>
                          updateRow(row.id, {
                            joinWith: event.target.value as JoinWith,
                          })
                        }
                        className="h-11 rounded-xl border border-[var(--color-gray-300)] bg-white px-3 text-body-md outline-none focus:border-[var(--color-azul-600)]"
                      >
                        <option value="and">y</option>
                        <option value="or">o</option>
                      </select>
                    ) : (
                      <div className="h-11 flex items-center text-body-sm text-[var(--color-text-neutral-secondary)]">
                        si
                      </div>
                    )}

                    <select
                      value={row.field}
                      onChange={(event) =>
                        updateRow(row.id, { field: event.target.value })
                      }
                      className="h-11 rounded-xl border border-[var(--color-gray-300)] bg-white px-3 text-body-md outline-none focus:border-[var(--color-azul-600)]"
                    >
                      {availableFields.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={row.operator}
                      onChange={(event) =>
                        updateRow(row.id, {
                          operator: event.target.value as Operator,
                        })
                      }
                      className="h-11 rounded-xl border border-[var(--color-gray-300)] bg-white px-3 text-body-md outline-none focus:border-[var(--color-azul-600)]"
                    >
                      {OPERATOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <input
                      value={row.value}
                      onChange={(event) =>
                        updateRow(row.id, { value: event.target.value })
                      }
                      placeholder="Escribe tu criterio"
                      className="h-11 rounded-xl border border-[var(--color-gray-300)] bg-white px-4 text-body-md outline-none focus:border-[var(--color-azul-600)]"
                    />

                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length === 1}
                      className="h-11 w-11 rounded-full border border-[var(--color-gray-300)] text-[var(--color-text-neutral-primary)] inline-flex items-center justify-center disabled:opacity-40"
                      aria-label="Eliminar fila"
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-300)] bg-white px-4 py-2 text-body-sm font-semibold text-[var(--color-text-neutral-primary)] hover:border-[var(--color-azul-500)]"
                >
                  <Plus size={16} />
                  Añadir fila
                </button>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-body-md font-semibold text-[var(--color-text-brand-primary)] hover:underline"
                  >
                    Limpiar todo
                  </button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={runSearch}
                    iconLeft={<Search size={18} />}
                    className="rounded-full px-6"
                  >
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl border border-[var(--color-gray-200)] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-gray-200)] pb-5">
            <h2 className="text-h5 font-bold text-[var(--color-text-neutral-primary)]">
              Resultados
            </h2>

            <span className="rounded-full bg-[var(--color-azul-50)] px-3 py-1 text-body-sm font-semibold text-[var(--color-azul-700)]">
              {loading ? 'Buscando...' : `${results.length} resultado(s)`}
            </span>
          </div>

          {!searched ? (
            <div className="py-10 text-center">
              <p className="text-body-md text-[var(--color-text-neutral-secondary)]">
                Configura tus criterios y presiona buscar para ver resultados aquí.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="py-10 text-center">
              <p className="text-body-md text-[var(--color-text-error-primary)]">
                {error}
              </p>
            </div>
          ) : null}

          {searched && !loading && !error && results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-body-md text-[var(--color-text-neutral-secondary)]">
                No se encontraron resultados para los criterios indicados.
              </p>
            </div>
          ) : null}

          {results.length > 0 && contentType === 'projects' ? (
            <div className="mt-6 space-y-12">
              {projectResults.map((project) => {
                const managerProfile = project.associatedProfiles.find(
                  (profile) => profile.name === project.manager,
                );

                return (
                  <ProjectListItem
                    key={project.id}
                    code={project.code}
                    title={project.title}
                    href={`/projects/${project.id}`}
                    manager={project.manager}
                    managerHref={
                      managerProfile
                        ? `/researchers/${managerProfile.id}`
                        : `/researchers?q=${encodeURIComponent(project.manager)}`
                    }
                    startDate={project.startDate}
                    endDate={project.endDate}
                    researchType={project.researchType}
                    actionType={project.projectType}
                    keywords={project.keywords}
                  />
                );
              })}
            </div>
          ) : null}

          {results.length > 0 && contentType !== 'projects' ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-bg-neutral-primary)] px-2 py-2"
                >
                  <Card
                    title={item.title}
                    description={item.subtitle}
                    excerpt={item.excerpt}
                    tags={item.tags}
                    href={item.href}
                    hideImage
                    chromeless
                    className="px-3 py-2"
                  />
                </div>
              ))}
            </div>
          ) : null}

          {results.length > 0 ? (
            <div className="mt-8 text-center">
              <Link
                href={`/${contentType}`}
                className="text-body-sm font-semibold text-[var(--color-text-brand-primary)] hover:underline"
              >
                Ver más en la sección completa
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
