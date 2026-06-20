'use client';

import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Button from './Button';

function SheetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export interface XlsColumn<T> {
  header: string;
  getValue: (item: T) => string | number | null | undefined;
}

interface ExportXlsButtonProps<T> {
  data: T[];
  columns: XlsColumn<T>[];
  filename?: string;
  label?: string;
  disabled?: boolean;
}

export default function ExportXlsButton<T>({
  data,
  columns,
  filename = 'exportar',
  label = 'Descargar página en Excel',
  disabled = false,
}: ExportXlsButtonProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    if (isLoading || data.length === 0) return;
    setIsLoading(true);
    try {
      const rows = [
        columns.map((col) => col.header),
        ...data.map((item) => columns.map((col) => col.getValue(item) ?? '')),
      ];
      const worksheet = utils.aoa_to_sheet(rows);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Resultados');
      writeFile(workbook, `${filename}.xlsx`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      <Button
        onClick={handleExport}
        disabled={disabled || isLoading || data.length === 0}
        iconLeft={isLoading ? <SpinnerIcon /> : <SheetIcon />}
        size="sm"
        variant="outline"
        className="hover:scale-[1.03] transition-transform duration-300 ease-in-out"
      >
        {isLoading ? 'Generando...' : label}
      </Button>

      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 rounded-lg px-3 py-2 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-500"
        style={{ backgroundColor: '#1f2937' }}
      >
        Descarga los resultados de esta página en formato Excel (.xlsx).
        <span
          className="absolute top-full right-4 border-4 border-transparent"
          style={{ borderTopColor: '#1f2937' }}
        />
      </div>
    </div>
  );
}
