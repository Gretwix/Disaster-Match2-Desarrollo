
interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomModal({ isOpen, title, message, onClose }: CustomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>

        {/* Mensaje */}
        <p className="text-gray-700 mb-4 whitespace-pre-line">{message}</p>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
