import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function PaymentForm() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardType, setCardType] = useState("visa");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Obtener usuario logueado
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");
    if (!loggedUser || !loggedUser.username) {
      alert(t("payment.mustLoginError"));
      navigate({ to: "/Login" });
      return;
    }
    // Construir objeto de forma de pago (sin guardar CVV por seguridad)
    const paymentMethod = {
      cardType,
      cardNumber,
      cardHolder,
      expiryDate
    };
    // Guardar en localStorage bajo la clave "paymentMethods_<username>"
    const key = `paymentMethods_${loggedUser.username}`;
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    // Evitar duplicados por número de tarjeta
    const updated = [
      ...prev.filter((pm: any) => pm.cardNumber !== cardNumber),
      paymentMethod
    ];
    localStorage.setItem(key, JSON.stringify(updated));
    alert(t("payment.savedSuccess"));
    navigate({ to: "/Cart" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6" data-i18n="payment.addPayment">{t("payment.addPayment")}</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-md space-y-4"
        >
          {/* Tipo de tarjeta */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700" data-i18n="payment.cardType">{t("payment.cardType")}</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
            </select>
          </div>

          {/* Número de tarjeta */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700" data-i18n="payment.cardNumber">{t("payment.cardNumber")}</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={19}
              placeholder="XXXX XXXX XXXX XXXX"
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Nombre del titular */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700" data-i18n="payment.cardHolder">{t("payment.cardHolder")}</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder={t("payment.cardHolder")}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Expiración y CVV en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" data-i18n="payment.expiryDate">{t("payment.expiryDate")}</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/AA"
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" data-i18n="payment.cvv">{t("payment.cvv")}</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                placeholder="***"
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            data-i18n="payment.confirm"
          >
            {t("payment.confirm")}
          </button>
        </form>
      </main>
    </div>
  );
}

export default PaymentForm;
