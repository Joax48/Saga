'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import Breadcrumb from '../../../../components/Breadcrumb';
import BackButton from '../../../../components/BackButton';
import Button from '../../../../components/Button';
import {
  getResearcherProfile,
  updateResearcherLinks,
  updateResearcherPhoto,
  deleteResearcherPhoto,
} from '../../../../services/researchers';
import ApiErrorMessage from '@/components/ApiErrorMessage';
import { ResearcherEditSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import type { ResearcherProfile } from '../../../../types/researcher-detail';

interface ResearcherEditPageProps {
  params: { id: string };
}

function getAvatarUrl(...nameParts: (string | null)[]): string {
  const fullName = nameParts.filter(Boolean).join(' ');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&size=200`;
}

function OrcidIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zM7.37 4.38c.53 0 .95.43.95.95s-.42.95-.95.95-.95-.42-.95-.95.43-.95.95-.95zm-.72 3.04h1.44v10.04H6.65V7.42zm3.56 0h3.9c3.71 0 5.34 2.65 5.34 5.02 0 2.58-2.02 5.02-5.33 5.02h-3.91V7.42zm1.44 1.3v7.44h2.3c3.27 0 4.02-2.48 4.02-3.72 0-2.02-1.28-3.72-4.1-3.72h-2.22z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M6.94 5a2 2 0 11-4-.002 2 2 0 014 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
    </svg>
  );
}

function ResearchGateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M19.586 0c-.818 0-1.508.19-2.073.565-.563.377-.97.936-1.213 1.68a3.193 3.193 0 0 0-.112.437 6.503 6.503 0 0 0-.078.53 31.99 31.99 0 0 0-.05.727c-.013.292-.022.737-.022 1.335 0 .595.009 1.041.022 1.333.013.292.03.535.05.727a4.94 4.94 0 0 0 .19.967c.241.742.65 1.303 1.214 1.679.563.377 1.255.567 2.073.567.818 0 1.51-.19 2.074-.567.564-.376.97-.937 1.214-1.679.04-.117.075-.236.107-.355.034-.117.067-.262.094-.43.026-.17.046-.376.06-.617a31.99 31.99 0 0 0 .051-.728c.011-.293.022-.738.022-1.336 0-.595-.011-1.04-.022-1.333a31.99 31.99 0 0 0-.05-.727 4.94 4.94 0 0 0-.19-.967c-.244-.744-.65-1.303-1.215-1.68C21.097.19 20.404 0 19.586 0zm0 1.553c.421 0 .77.106 1.046.32.275.213.485.515.628.904.027.075.05.156.07.243.02.087.038.196.054.323.017.13.029.288.038.476.01.187.018.43.024.724.007.295.01.66.01 1.094 0 .435-.003.8-.01 1.095-.006.295-.014.535-.024.722a4.95 4.95 0 0 1-.038.476 2.13 2.13 0 0 1-.124.567c-.143.388-.353.69-.628.904-.276.214-.625.32-1.046.32-.422 0-.77-.106-1.045-.32-.275-.213-.485-.516-.628-.904a3.234 3.234 0 0 1-.054-.243 4.85 4.85 0 0 1-.07-.323 8.7 8.7 0 0 1-.038-.476 19.476 19.476 0 0 1-.024-.722c-.007-.295-.01-.66-.01-1.095s.003-.799.01-1.094c.006-.294.014-.537.024-.724.01-.188.022-.346.038-.476.017-.127.035-.235.054-.323.02-.087.043-.168.07-.243.143-.388.353-.69.628-.904.275-.213.624-.32 1.045-.32zm-7.96 5.838c-1.04 0-1.974.137-2.802.412-.827.276-1.529.66-2.105 1.156-.576.494-1.017 1.083-1.323 1.766-.306.683-.46 1.43-.46 2.243 0 .849.144 1.62.435 2.314.291.694.706 1.286 1.244 1.776.539.49 1.187.866 1.946 1.13.759.262 1.604.394 2.535.394.689 0 1.353-.063 1.992-.187.638-.124 1.243-.31 1.815-.557v-5.355h-3.844v-1.99h6.235v8.737a9.92 9.92 0 0 1-2.71 1.32 9.927 9.927 0 0 1-3.05.47c-1.232 0-2.354-.177-3.367-.532-1.014-.355-1.879-.86-2.595-1.516a6.835 6.835 0 0 1-1.667-2.349c-.395-.91-.592-1.916-.592-3.018 0-1.085.205-2.085.615-3 .41-.916.989-1.706 1.736-2.37.748-.665 1.643-1.18 2.685-1.547 1.042-.367 2.198-.55 3.468-.55.74 0 1.434.062 2.083.187.65.124 1.252.296 1.806.516v2.094a8.07 8.07 0 0 0-1.806-.602 9.43 9.43 0 0 0-2.083-.224z" />
    </svg>
  );
}

function ScopusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.247 17.514c-1.748 0-3.318-.34-4.71-1.025a6.717 6.717 0 0 1-3.21-3.014l1.262-.635c.628 1.196 1.523 2.075 2.685 2.617 1.162.543 2.547.815 4.155.815.93 0 1.642-.16 2.137-.479.494-.32.741-.762.741-1.305 0-.495-.197-.886-.59-1.18-.394-.293-1.005-.531-1.83-.74L7.964 11.7c-1.215-.31-2.094-.704-2.643-1.18-.55-.476-.825-1.131-.825-1.967 0-1.043.443-1.873 1.328-2.494.886-.62 2.064-.93 3.534-.93 1.494 0 2.823.288 3.99.864 1.167.575 2.121 1.36 2.862 2.352l-1.262.635c-.679-.869-1.498-1.53-2.46-1.984-.96-.455-2.07-.682-3.328-.682-.86 0-1.523.156-1.985.469-.464.312-.695.737-.695 1.275 0 .494.183.881.55 1.16.366.279.974.51 1.821.692l3.245.842c1.218.312 2.107.728 2.668 1.247.562.519.842 1.193.842 2.021 0 .985-.434 1.781-1.3 2.39-.866.61-1.998.914-3.394.914zm10.18-2.493c-.91 0-1.65-.74-1.65-1.65 0-.91.74-1.65 1.65-1.65.91 0 1.65.74 1.65 1.65 0 .91-.74 1.65-1.65 1.65z" />
    </svg>
  );
}

// Each link field carries the regex that its value must match. The patterns are
// anchored (^…$) and pin the exact host so look-alike or malicious URLs such as
// `https://orcid.org.evil.com/…` or `https://evil.com/orcid.org` are rejected.
// Only HTTPS is accepted to avoid protocol-downgrade tricks. Empty values are
// allowed (every link is optional) — emptiness is handled before the regex test.
const LINK_FIELDS = [
  {
    key: 'orcidId' as const,
    label: 'ORCID',
    placeholder: 'https://orcid.org/0000-0000-0000-0000',
    icon: <OrcidIcon />,
    // Accepts either the full orcid.org URL or a bare 16-digit ORCID iD
    // (the detail page already normalizes a bare iD into a URL).
    pattern: /^(https:\/\/orcid\.org\/)?\d{4}-\d{4}-\d{4}-\d{3}[\dXx]$/,
    errorMessage:
      'Debe ser un ORCID válido, p. ej. https://orcid.org/0000-0002-1825-0097',
  },
  {
    key: 'linkedin' as const,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/usuario',
    icon: <LinkedInIcon />,
    pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/,
    errorMessage: 'Debe ser un enlace de LinkedIn (https://linkedin.com/in/usuario).',
  },
  {
    key: 'researchGate' as const,
    label: 'ResearchGate',
    placeholder: 'https://researchgate.net/profile/usuario',
    icon: <ResearchGateIcon />,
    pattern: /^https:\/\/(www\.)?researchgate\.net\/profile\/[A-Za-z0-9\-_.%]+\/?$/,
    errorMessage:
      'Debe ser un enlace de ResearchGate (https://researchgate.net/profile/usuario).',
  },
  {
    key: 'scopus' as const,
    label: 'Scopus',
    placeholder: 'https://scopus.com/authid/detail.uri?authorId=usuario',
    icon: <ScopusIcon />,
    pattern: /^https:\/\/(www\.)?scopus\.com\/authid\/detail\.uri\?authorId=\d+$/,
    errorMessage:
      'Debe ser un enlace de Scopus (https://scopus.com/authid/detail.uri?authorId=usuario).',
  },
] as const;

type LinkKey = (typeof LINK_FIELDS)[number]['key'];

type LinksState = Record<LinkKey, string>;

// Returns an error message when the value is non-empty and does not match the
// field's site-specific pattern; returns null when the value is empty (optional)
// or valid.
function getLinkError(key: LinkKey, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const field = LINK_FIELDS.find((f) => f.key === key);
  if (!field) return null;
  return field.pattern.test(trimmed) ? null : field.errorMessage;
}

export default function ResearcherEditPage({ params }: ResearcherEditPageProps) {
  const router = useRouter();


  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Marks the currently saved photo (the one persisted in Dropbox) for removal.
  // This is independent from `previewUrl`/`photoFile`, which only track a newly
  // selected file that has not been uploaded yet.
  const [removeSavedPhoto, setRemoveSavedPhoto] = useState(false);
  // Controls the kebab (⋮) menu that exposes the "delete current photo" action.
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const photoMenuRef = useRef<HTMLDivElement>(null);


  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const [links, setLinks] = useState<LinksState>({
    orcidId: '',
    linkedin: '',
    researchGate: '',
    scopus: '',
  });

  const [initialLinks, setInitialLinks] = useState<LinksState>({
    orcidId: '',
    linkedin: '',
    researchGate: '',
    scopus: '',
  });


  // Tracks which fields the user has interacted with, so validation errors only
  // appear after a field is touched (blurred) rather than on initial load.
  const [touched, setTouched] = useState<Record<LinkKey, boolean>>({
    orcidId: false,
    linkedin: false,
    researchGate: false,
    scopus: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError(null);
        const data = await getResearcherProfile(params.id);
        setProfile(data);
        const toOrcidUrl = (v: string | null) =>
          v ? (v.startsWith('https://') ? v : `https://orcid.org/${v}`) : '';

        const fetched: LinksState = {
          orcidId: toOrcidUrl(data.orcidId),
          linkedin: data.linkedin ?? '',
          researchGate: data.researchGate ?? '',
          scopus: data.scopus ?? '',
        };
        setLinks(fetched);
        setInitialLinks(fetched);
      } catch (error) {
        console.error(error);
        setLoadError('No se pudo cargar el perfil. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  // Closes the photo menu when clicking anywhere outside of it.
  useEffect(() => {
    if (!photoMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target as Node)) {
        setPhotoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [photoMenuOpen]);


  function handleFileChange(file: File | null) {
    if (!file) return;
    setPhotoError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Solo se permiten archivos JPG o PNG.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
      return;
    }

    setPhotoFile(file);
    // Uploading a new photo supersedes any pending removal of the saved one.
    setRemoveSavedPhoto(false);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileChange(e.target.files?.[0] ?? null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  }

  // Discards the newly selected (un-uploaded) file and reverts the preview to the
  // previously saved photo. previewUrl must be set back to null (not ''), otherwise
  // currentPhoto resolves the empty string to the avatar fallback instead of the
  // saved photo.
  function handleRemovePhoto() {
    setPreviewUrl(null);
    setPhotoFile(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Marks the currently saved photo for deletion. Distinct from
  // `handleRemovePhoto`, which only discards a newly selected (un-uploaded) file.
  // Any pending new selection is cleared so the preview shows the avatar fallback.
  function handleRemoveSavedPhoto() {
    setRemoveSavedPhoto(true);
    setPhotoFile(null);
    setPreviewUrl(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhotoMenuOpen(false);
  }

  function handleUndoRemoveSavedPhoto() {
    setRemoveSavedPhoto(false);
    setPhotoMenuOpen(false);
  }


  function handleLinkChange(key: LinkKey, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
  }

  function handleLinkBlur(key: LinkKey) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  // Blocks saving while any link fails its site-specific validation.
  const hasLinkErrors = LINK_FIELDS.some(
    (f) => getLinkError(f.key, links[f.key]) !== null,
  );

  // When the user clicks "Save", if there are validation errors we mark all fields
  // as touched to show the errors; otherwise we proceed to save
  async function handleSave() {
    if (hasLinkErrors) {
      setTouched({ orcidId: true, linkedin: true, researchGate: true, scopus: true });
      return;
    }

    const changedFields = Object.fromEntries(
      LINK_FIELDS.filter((f) => links[f.key].trim() !== initialLinks[f.key].trim()).map(
        (f) => [f.key, links[f.key].trim()],
      ),
    ) as Partial<LinksState>;

    const hasLinksChange = Object.keys(changedFields).length > 0;

    // Only delete the saved photo when no new file is replacing it.
    const willRemoveSavedPhoto = removeSavedPhoto && !photoFile;

    if (!photoFile && !willRemoveSavedPhoto && !hasLinksChange) {
      router.push(`/researchers/${params.id}`);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await Promise.all([
        photoFile
          ? updateResearcherPhoto(params.id, photoFile)
          : willRemoveSavedPhoto
            ? deleteResearcherPhoto(params.id)
            : Promise.resolve(),
        hasLinksChange
          ? updateResearcherLinks(params.id, changedFields)
          : Promise.resolve(),
      ]);
      router.push(`/researchers/${params.id}`);
    } catch {
      setSaveError('No se pudieron guardar los cambios. Intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) return <ResearcherEditSkeleton />;

  if (loadError) return <ApiErrorMessage className="m-6" message={loadError} />;

  if (!profile) return <div className="p-6">Perfil no encontrado.</div>;

  const fullName = [profile.name, profile.firstSurname, profile.secondSurname]
    .filter(Boolean)
    .join(' ');

  const avatarUrl = getAvatarUrl(
    profile.name,
    profile.firstSurname,
    profile.secondSurname,
  );

  // The saved photo is flagged for deletion (and not being replaced by a new file).
  const willRemoveSavedPhoto = removeSavedPhoto && !photoFile;

  const currentPhoto =
    previewUrl !== null
      ? previewUrl || avatarUrl
      : willRemoveSavedPhoto
        ? avatarUrl
        : profile.photo || avatarUrl;

  const hasPhotoChange = previewUrl !== null;

  return (
    <main className="min-h-screen bg-[var(--color-bg-neutral-secondary)]">
      {/* ── Header blanco ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Breadcrumb
            items={[
              { label: 'Perfiles', href: '/researchers' },
              { label: fullName, href: `/researchers/${params.id}` },
              { label: 'Editar' },
            ]}
          />

          <BackButton
            fallbackHref={`/researchers/${params.id}`}
            ariaLabel="Volver al perfil"
            className="mt-4"
          />

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Columna izquierda: foto actual + botón de eliminar */}
            <div className="flex flex-col items-center sm:items-start gap-2.5 shrink-0 mx-auto sm:mx-0">
              <div className="relative">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src={currentPhoto}
                    alt="Vista previa"
                    fill
                    sizes="(max-width: 640px) 112px, 144px"
                    className="object-cover"
                  />
                  {hasPhotoChange && previewUrl && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-[var(--color-bg-brand-primary)] px-2 py-0.5 text-[10px] font-semibold text-white leading-tight">
                      Nueva
                    </span>
                  )}
                  {willRemoveSavedPhoto && (
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white leading-tight">
                      Se eliminará
                    </span>
                  )}
                </div>

                {/* Menú de opciones (⋮) — solo cuando hay una foto guardada sobre
                    la que actuar. Permite eliminar la foto actual del perfil
                    (la persistida), distinta de la nueva foto sin subir. */}
                {profile.photo && (
                  <div ref={photoMenuRef} className="absolute top-1.5 right-1.5">
                    <button
                      type="button"
                      aria-label="Opciones de foto"
                      aria-haspopup="menu"
                      aria-expanded={photoMenuOpen}
                      onClick={() => setPhotoMenuOpen((open) => !open)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {photoMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-10"
                      >
                        {willRemoveSavedPhoto ? (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleUndoRemoveSavedPhoto}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-neutral-primary)] hover:bg-gray-50 transition-colors"
                          >
                            <RotateCcw size={14} />
                            Deshacer eliminación
                          </button>
                        ) : (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleRemoveSavedPhoto}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                            Eliminar foto actual
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {hasPhotoChange && previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar nueva foto
                </button>
              )}

              {willRemoveSavedPhoto && (
                <button
                  type="button"
                  onClick={handleUndoRemoveSavedPhoto}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-neutral-secondary)] hover:text-[var(--color-text-neutral-primary)] transition-colors"
                >
                  <RotateCcw size={14} />
                  Deshacer eliminación
                </button>
              )}
            </div>

            {/* Columna derecha: nombre, categoría y zona de carga */}
            <div className="flex-1 min-w-0 w-full">
              {/* Identidad del investigador */}
              <div className="pb-4 border-b border-gray-200">
                <h1 className="text-2xl sm:text-[28px] font-normal text-[var(--color-text-neutral-primary)] break-words">
                  {fullName}
                </h1>
                {profile.ceaCategory && (
                  <p className="mt-1 text-sm text-[var(--color-text-neutral-secondary)]">
                    {profile.ceaCategory}
                  </p>
                )}
              </div>

              {/* Zona de carga */}
              <div className="pt-4 space-y-3">
                <p className="text-sm font-semibold text-[var(--color-text-neutral-secondary)]">
                  Cambiar foto de perfil
                </p>

                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Subir foto de perfil"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[var(--color-bg-brand-primary)] bg-[var(--color-bg-brand-primary)]/5'
                      : 'border-gray-300 hover:border-[var(--color-bg-brand-primary)] hover:bg-[var(--color-bg-brand-primary)]/5'
                  }`}
                >
                  <Camera
                    size={22}
                    className="text-[var(--color-text-neutral-secondary)] shrink-0"
                  />
                  <p className="text-sm text-[var(--color-text-neutral-secondary)]">
                    Arrastre una imagen o{' '}
                    <span
                      className="font-medium"
                      style={{ color: 'var(--color-text-brand-primary)' }}
                    >
                      seleccione un archivo
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-neutral-secondary)]">
                    PNG o JPG · máx. 5 MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={handleInputChange}
                />

                {photoError && <p className="text-sm text-red-500">{photoError}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Tarjeta de enlaces */}
        <section className="bg-white rounded-xl px-6 sm:px-8 py-6 sm:py-7">
          <div className="pb-4 mb-5 border-b border-gray-200">
            <h2 className="text-xl sm:text-[22px] font-normal text-[var(--color-text-neutral-primary)]">
              Enlaces de interés
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-neutral-secondary)]">
              Agregue, modifique o elimine sus enlaces académicos para que la comunidad
              investigadora pueda encontrarlo fácilmente. Cada enlace debe ser válido y
              seguir el formato específico del sitio pertinente.
            </p>
          </div>

          <div className="space-y-4">
            {LINK_FIELDS.map(({ key, label, placeholder, icon }) => {
              const error = getLinkError(key, links[key]);
              const showError = touched[key] && error !== null;
              return (
                <div key={key}>
                  <label
                    htmlFor={`link-${key}`}
                    className="block text-sm font-semibold mb-1.5 text-[var(--color-text-neutral-secondary)]"
                  >
                    {label}
                  </label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-bg-brand-primary)] text-white shrink-0">
                      {icon}
                    </span>
                    <input
                      id={`link-${key}`}
                      type="url"
                      value={links[key]}
                      onChange={(e) => handleLinkChange(key, e.target.value)}
                      onBlur={() => handleLinkBlur(key)}
                      placeholder={placeholder}
                      maxLength={200}
                      aria-invalid={showError}
                      aria-describedby={showError ? `link-${key}-error` : undefined}
                      className={`w-full rounded-xl border pl-[2.875rem] pr-4 py-2.5 text-sm text-[var(--color-text-neutral-primary)] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        showError
                          ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
                          : 'border-gray-200 focus:ring-[var(--color-bg-brand-primary)]/40 focus:border-[var(--color-bg-brand-primary)]'
                      }`}
                    />
                  </div>
                  {showError && (
                    <p id={`link-${key}-error`} className="mt-1.5 text-sm text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Barra de acciones */}
        <div className="flex flex-col items-end gap-3 pb-8">
          {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          <div className="flex gap-3">
            <Button href={`/researchers/${params.id}`} variant="outline" size="sm">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={hasLinkErrors || isSaving}
              onClick={handleSave}
              className="transition-transform duration-150 enabled:hover:scale-105 disabled:hover:bg-[var(--color-bg-brand-primary)]"
            >
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
