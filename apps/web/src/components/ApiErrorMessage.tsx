interface ApiErrorMessageProps {
  message?: string;
  className?: string;
}

const DEFAULT_API_ERROR_MESSAGE =
  'No se pudieron cargar los datos. Intenta nuevamente más tarde.';

export default function ApiErrorMessage({
  message = DEFAULT_API_ERROR_MESSAGE,
  className = '',
}: ApiErrorMessageProps) {
  return (
    <div
      role="status"
      className={[
        'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {message}
    </div>
  );
}
