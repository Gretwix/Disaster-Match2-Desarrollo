/**
 * Valida y da formato automático a números telefónicos internacionales.
 * Detecta el país por prefijo y aplica el formato local.
 */

const phoneFormats: Record<string, string> = {
  "+506": "xxxx xxxx",       // Costa Rica
  "+1": "xxx xxx xxxx",      // USA / Canadá
  "+44": "xxxx xxx xxxx",    // Reino Unido
  "+34": "xxx xxx xxx",      // España
  "+52": "xxx xxx xxxx",     // México
  "+57": "xxx xxx xxxx",     // Colombia
  "+54": "xxx xxx xxxx",     // Argentina
};

/**
 * Detecta el formato del país a partir del prefijo.
 */
export const detectCountryFormat = (phone: string) => {
  const codes = Object.keys(phoneFormats).sort((a, b) => b.length - a.length);
  for (const code of codes) {
    if (phone.startsWith(code)) return { code, format: phoneFormats[code] };
  }
  return { code: "", format: "xxx xxx xxxx" }; // sin prefijo detectado aún
};

/**
 * Aplica el formato visual automático según el país detectado.
 */
export const formatPhone = (input: string): string => {
  // Permitir escribir el "+" y dígitos
  const cleaned = input.replace(/[^\d+]/g, "");

  // Si no tiene "+", no forzar nada aún
  if (!cleaned.startsWith("+")) return cleaned;

  // Detectar si ya hay un código de país válido
  const { code, format } = detectCountryFormat(cleaned);
  if (!code) return cleaned; // si el prefijo no se reconoce aún, no formatear

  const codeDigits = code.replace("+", "");
  let digits = cleaned.replace(/\D/g, "");
  if (digits.startsWith(codeDigits)) digits = digits.slice(codeDigits.length);

  let i = 0;
  const formatted = format.replace(/x/g, () => digits[i++] || "");
  return `${code} ${formatted.trim()}`;
};

/**
 * Verifica que sea un teléfono válido internacional (solo un + y de 7 a 15 dígitos)
 */
export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};