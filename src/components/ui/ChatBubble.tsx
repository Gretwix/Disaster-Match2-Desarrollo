import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Message = { sender: "user" | "bot"; text: string };

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll al final del chat
  useEffect(() => {
    if (messagesEndRef.current) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages, loading, open]);

  // Enviar mensaje al backend y manejar respuesta/escalamiento
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://localhost:7044/Chat/Ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: 1 }),
      });

      const data = await res.json();

      if (data.escalate) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply },
          {
            sender: "bot",
            text: `
                💜 [Telegram Support](https://t.me/dghlhg)<br>
                ✉️ [Email Us](https://mail.google.com/mail/?view=cm&fs=1&to=disastermatch@gmail.com&su=Support%20Request%20from%20DisasterMatch&body=Hello%2C%20I%20have%20a%20question%20about%20my%20account.%20Please%20help%20me%20with%3A%20)

                📱 [WhatsApp Chat](https://wa.me/50685988448?text=Hello%2C%20I%20need%20help%20with%20my%20DisasterMatch%20account.)
            `,
          },
        ]);
      } else {
        const botMsg: Message = {
          sender: "bot",
          text: data.reply || "No response received.",
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to AI service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="group fixed bottom-6 right-6 text-white p-5 rounded-full shadow-[0_0_25px_rgba(91,61,253,0.6)] 
        z-[9999] flex items-center justify-center overflow-hidden
        bg-[conic-gradient(at_top_right,_#2B1F65,_#472CBA,_#5B3DFD,_#2B1F65)]
        animate-rotateGradient transition-all duration-500 ease-out
        hover:scale-125 hover:shadow-[0_0_45px_rgba(91,61,253,0.8)] active:scale-100"
      >
        <span className="relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {open ? <X size={22} /> : <MessageCircle size={24} />}
        </span>
      </button>

      {/* Ventana del chat */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn z-[9999]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2B1F65] via-[#3B29A3] to-[#5B3DFD] text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm tracking-wide">
              DisasterMatch Assistant
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3 max-h-96 scroll-smooth">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center text-sm mt-10">
                Hi! How can I assist you today?
              </p>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-br from-[#5B3DFD] to-[#6E4BFF] text-white rounded-br-sm"
                      : "bg-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\n/g, "<br>")
                      .replace(
                        /\[(.*?)\]\((.*?)\)/g,
                        '<a href="$2" target="_blank" class="text-blue-600 underline hover:text-blue-800">$1</a>'
                      ),
                  }}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-2xl text-sm animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5B3DFD] outline-none transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-gradient-to-br from-[#5B3DFD] to-[#472CBA] text-white p-2 rounded-xl hover:opacity-90 transition flex items-center justify-center disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
