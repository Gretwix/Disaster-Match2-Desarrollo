export const swalStyle = () => {
  const dark = document.documentElement.classList.contains("dark");
  return {
    background: dark ? "#1f2937" : "#ffffff",
    color: dark ? "#f9fafb" : "#1f2937",
    border: dark ? "1px solid #374151" : "1px solid #e5e7eb",
    cancelButtonColor: dark ? "#4b5563" : "#9ca3af",
  };
};