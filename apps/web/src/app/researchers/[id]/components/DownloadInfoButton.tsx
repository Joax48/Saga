'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import Button from '@/components/Button';
import { ResearcherInfoDocument } from './ResearcherInfoDocument';
import type { ResearcherProfile } from '@/types/researcher-detail';

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface Props {
  profile: ResearcherProfile;
}

export default function DownloadInfoButton({ profile }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const fullName = [profile.name, profile.firstSurname, profile.secondSurname]
    .filter(Boolean)
    .join(' ');

  const handleDownload = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;

      // Fetch the profile photo and convert to base64 so the PDF renderer's
      // Web Worker receives embedded data instead of making its own network request.
      let photoSrc = avatarSrc;
      if (profile.photo) {
        try {
          photoSrc = await toBase64(profile.photo);
        } catch {
          // fall back to avatar if the photo fetch fails
        }
      }

      const blob = await pdf(
        <ResearcherInfoDocument profile={profile} photoSrc={photoSrc} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `info_${fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group relative">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        iconLeft={isLoading ? <SpinnerIcon /> : <DownloadIcon />}
        size="sm"
        variant="primary"
        className="hover:scale-105 transition-all duration-200"
      >
        {isLoading ? 'Generando...' : 'Descargar info'}
      </Button>

      {/* Tooltip — appears after 500 ms of hovering */}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 rounded-lg px-3 py-2 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-500"
        style={{ backgroundColor: '#1f2937' }}
      >
        Descarga un PDF con el perfil completo: formación académica, experiencia, producción científica y proyectos.
        <span
          className="absolute top-full right-4 border-4 border-transparent"
          style={{ borderTopColor: '#1f2937' }}
        />
      </div>
    </div>
  );
}
