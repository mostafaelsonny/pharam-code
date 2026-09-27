interface ErrorMessageProps {
  message?: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-center max-w-2xl mx-auto font-bold shadow-sm">
      {message}
    </div>
  );
}
