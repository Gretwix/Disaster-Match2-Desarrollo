/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, User, Users, BarChart } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";

import apiUrl, { API_BASE } from "../../../utils/api";
import { getLoggedUser } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import { formatPhone, validatePhone } from "../../../utils/phoneValidation";

import IncidentDetailsModal from "../IncidentDetailsModal";

// URL base de la API
const API_URL = `${API_BASE}/Users`;

// tipo local para usuario
type User = {
  ID: number;
  f_name: string;
  l_name: string;
  username: string;
  email: string;
  phone: string;
  company: string;
  user_password?: string;
  user_address?: string;
};

// componente Profile
export default function Profile() {
  const { t } = useTranslation();
  const loggedUser = getLoggedUser();

  // clases reutilizables para el sidebar
  const sidebarLinkBase =
    "flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition";
  const sidebarActiveClass =
    "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300";

  // estados de usuario y UI
  const [user, setUser] = useState<User | null>();
  const [formData, setFormData] = useState<User | null>();
  const [userPasswordRaw, setUserPasswordRaw] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // estados para cambio de contraseña
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdStrength, setPwdStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // estados de carrito / compras
  const [purchasedIncidents, setPurchasedIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // validar fuerza de contraseña en tiempo real
  const validatePassword = (value: string) => {
    const validations = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@#$%&*!?]/.test(value),
    };
    setPwdStrength(validations);

    if (value === "") {
      setPwdError("");
      return false;
    }
    if (!Object.values(validations).every(Boolean)) {
      setPwdError("Password does not meet requirements");
      return false;
    }
    setPwdError("");
    return true;
  };

  // validar confirmación de contraseña
  const validateConfirmPassword = (value: string) => {
    if (value !== pwdNew) {
      setPwdError("New passwords do not match");
      return false;
    }
    setPwdError("");
    return true;
  };

  // manejadores para inputs de contraseña
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwdNew(value);
    validatePassword(value);
    if (pwdConfirm) validateConfirmPassword(pwdConfirm);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwdConfirm(value);
    validateConfirmPassword(value);
  };

  const isPasswordFormValid = () =>
    pwdCurrent &&
    pwdNew &&
    pwdConfirm &&
    !pwdError &&
    Object.values(pwdStrength).every(Boolean) &&
    pwdNew === pwdConfirm;

  // cargar datos del usuario
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/${getLoggedUser()?.id}`);
      const data = await res.json();
      const userData: User = {
        ID: data.ID ?? data.id,
        f_name: data.f_name,
        l_name: data.l_name,
        username: data.username,
        email: data.email,
        phone: formatPhone(String(data.phone || "")),
        company: data.company,
        user_password: data.user_password ? "*******" : undefined,
        user_address: data.user_address ?? "",
      };
      setUserPasswordRaw(data.user_password);
      setUser(userData);
      setFormData(userData);
    } catch {
      toast.error("Error fetching user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // manejar cambios en formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    let newValue = value;
    if (name === "phone") {
      newValue = formatPhone(newValue);
      setFormData({ ...formData, [name]: newValue });
      return;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  // guardar cambios de perfil
  const handleSave = async () => {
    if (!formData) return;
    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number (7–15 digits)");
      return;
    }
    const cleanPhone = formData.phone.startsWith("+")
      ? "+" + formData.phone.slice(1).replace(/[\s-]/g, "")
      : formData.phone.replace(/[\s-]/g, "");

    const payload = {
      ID: formData.ID,
      f_name: formData.f_name,
      l_name: formData.l_name,
      username: formData.username,
      email: formData.email,
      phone: cleanPhone,
      company: formData.company,
      user_address: formData.user_address ?? "",
    };

    try {
      const token = localStorage.getItem("authToken");
      let res = await fetch(`${API_URL}/Update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        setUser({ ...(formData as User) });
        setIsEditing(false);
        return;
      }

      let text = await res.text().catch(() => "");
      let retried = false;
      try {
        const json = JSON.parse(text);
        const errors = json?.errors || {};
        if ((errors.user_password || errors.user_address) && !retried) {
          retried = true;
          const compatPayload = {
            ...payload,
            user_password: userPasswordRaw || "********",
            user_address:
              formData.user_address && formData.user_address.trim() !== ""
                ? formData.user_address
                : "N/A",
          };
          res = await fetch(`${API_URL}/Update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(compatPayload),
          });
          if (res.ok) {
            toast.success("Profile updated successfully");
            setUser({ ...(formData as User) });
            setIsEditing(false);
            return;
          }
          text = await res.text().catch(() => text);
        }
      } catch {
        // ignore parse errors
      }

      console.error("Profile update failed", { status: res.status, payload, error: text });
      toast.error(text || "Error updating profile");
    } catch {
      toast.error("Error updating profile");
    }
  };

  // cambiar contraseña
  const handleChangePassword = async () => {
    if (!user?.ID && !(getLoggedUser() as any)?.id) {
      toast.error("You must be logged in to change password");
      return;
    }
    if (!pwdCurrent) {
      toast.error("Please enter your current password");
      return;
    }
    if (!validatePassword(pwdNew)) {
      toast.error("Please fix the password requirements");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError("New passwords do not match");
      return;
    }
    if (pwdNew === pwdCurrent) {
      setPwdError("New password must be different from current password");
      return;
    }

    try {
      setPwdLoading(true);
      const userId = (user as any)?.ID ?? (getLoggedUser() as any)?.id;

      const res = await fetch(`${API_URL}/ChangePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("authToken")
            ? { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            : {}),
        },
        body: JSON.stringify({
          userId,
          currentPassword: pwdCurrent,
          newPassword: pwdNew,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Failed to change password");
      }

      const result = await res.json();
      if (result.success) {
        toast.success("Password updated successfully");
        setPwdCurrent("");
        setPwdNew("");
        setPwdConfirm("");
        setPwdError("");
        setPwdStrength({
          length: false,
          upper: false,
          lower: false,
          number: false,
          special: false,
        });
      } else {
        throw new Error(result.message || "Failed to update password");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Error changing password";
      setPwdError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPwdLoading(false);
    }
  };

  // cargar incidencias compradas por el usuario
  useEffect(() => {
    const fetchPurchased = async () => {
      if (!loggedUser?.id) return setPurchasedIncidents([]);
      try {
        const resPurchases = await fetch(apiUrl("/Purchase/List"));
        const purchases = await resPurchases.json();

        const userPurchases = purchases.filter((p: any) => p.user_id === loggedUser.id);

        const resLeads = await fetch(apiUrl("/Leads/List"));
        const allLeads = await resLeads.json();

        let merged: any[] = [];

        for (const purchase of userPurchases) {
          if (purchase.leads && Array.isArray(purchase.leads)) {
            merged = merged.concat(
              purchase.leads.map((l: any) => {
                const leadId = parseInt(String(l.lead_id).trim());
                const leadInfo = allLeads.find(
                  (lead: any) => parseInt(String(lead.id).trim()) === leadId
                );

                const price =
                  leadInfo?.home_owner_email && leadInfo?.home_owner_phone ? 200 : 100;

                return {
                  id: leadId,
                  title: leadInfo?.event_type || `Incident #${leadId}`,
                  price,
                  type: leadInfo?.event_type || "N/A",
                  address: leadInfo?.full_address || "N/A",
                  city: leadInfo?.city || "N/A",
                  date: leadInfo?.lead_date || "N/A",
                  details: leadInfo?.details || "No details provided",
                  owner_name: leadInfo?.home_owner_name || "N/A",
                  email: leadInfo?.home_owner_email || "N/A",
                  phone: leadInfo?.home_owner_phone || "N/A",
                };
              })
            );
          }
        }

        setPurchasedIncidents(merged);
      } catch (err) {
        console.error(" Error fetching purchases:", err);
        setPurchasedIncidents([]);
      }
    };

    fetchPurchased();
  }, [loggedUser?.id]);

  if (loading) return <p className="text-center mt-10">{t("home.loadingProfile")}</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b1220] force-light-bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700 force-light-bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            {/* aside con navegación */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 p-5 md:p-6 bg-gray-50 dark:bg-[#0e1629] rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <Link to="/HomePage" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <LayoutGrid className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                  <span className="font-medium" data-i18n="nav.disasterMatch"> {t("nav.disasterMatch")}</span>
                </Link>

                {loggedUser?.role === "admin" && (
                  <Link to="/AdminReports" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                    <BarChart className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                    <span className="font-medium" data-i18n="nav.adminPanel">{t("nav.adminPanel")}</span>
                  </Link>
                )}

                <Link to="/Profile" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <User className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                  <span className="font-medium" data-i18n="nav.profile">{t("nav.profile")}</span>
                </Link>

                {loggedUser?.role === "admin" && (
                  <Link to="/AdminUsers" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                    <Users className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                    <span className="font-medium" data-i18n="nav.users">{t("nav.users")}</span>
                  </Link>
                )}
              </nav>
            </aside>

            {/* sección principal */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 force-light-text" data-i18n="profile.myProfile">
                {t("profile.myProfile")}
              </h1>

              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0b1220] p-6 shadow-sm hover:shadow-md transition duration-200 force-light-bg-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-4 text-center sm:text-left md:justify-start md:gap-8">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img src="/avatars/default1.png" alt="Default Avatar" className="w-full h-full rounded-full object-cover border-2 border-gray-300" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 force-light-text">
                      {user.f_name} {user.l_name}
                    </h3>

                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm hover:shadow-md" data-i18n="profile.editProfile">
                        {t("profile.editProfile")}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-sm hover:shadow-md" data-i18n="profile.save">
                          {t("profile.save")}
                        </button>
                        <button onClick={() => { setIsEditing(false); setFormData(user); }} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 shadow-sm hover:shadow-md" data-i18n="profile.cancel">
                          {t("profile.cancel")}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-3 text-gray-700 dark:text-slate-300 force-light-text-muted">
                      <p><strong data-i18n="profile.username">{t("profile.username")}:</strong> {user.username}</p>
                      <p><strong data-i18n="profile.email">{t("profile.email")}:</strong> {user.email}</p>
                      <p><strong data-i18n="profile.phone">{t("profile.phone")}:</strong> {user.phone}</p>
                      <p><strong data-i18n="profile.company">{t("profile.company")}:</strong> {user.company}</p>
                    </div>
                  ) : (
                    <form className="grid gap-4">
                      {[
                        { name: "f_name", label: t("profile.username"), inputType: "text" },
                        { name: "l_name", label: t("profile.lastName"), inputType: "text" },
                        { name: "username", label: t("profile.username"), readOnly: true },
                        { name: "email", label: t("profile.email"), inputType: "email" },
                        { name: "phone", label: t("profile.phone"), inputType: "tel", placeHolder: "+1 xxx xxx xxxx" },
                        { name: "user_address", label: t("profile.address"), inputType: "text" },
                        { name: "company", label: t("profile.company"), inputType: "text" },
                      ].map((field) => (
                        <label key={field.name} className="flex flex-col text-sm font-medium">
                          {field.label}
                          <input
                            name={field.name}
                            type={field.inputType}
                            placeholder={field.placeHolder}
                            value={(formData as any)?.[field.name] || ""}
                            onChange={handleChange}
                            readOnly={field.readOnly || false}
                            className={`mt-1 border rounded-lg px-3 py-2 shadow-sm transition duration-200
                              ${field.readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"}`}
                          />
                        </label>
                      ))}
                    </form>
                  )}

                  {/* lista de compras del usuario */}
                  {!isEditing && (
                    <div className="mt-8">
                      <h2 className="text-lg font-semibold mb-2" data-i18n="profile.purchasedIncidents">
                        {t("profile.purchasedIncidents")}
                      </h2>

                      {purchasedIncidents.length === 0 ? (
                        <p className="text-gray-500" data-i18n="profile.noPurchased">{t("profile.noPurchased")}</p>
                      ) : (
                        <>
                          <ul className="list-disc pl-6 space-y-2">
                            {purchasedIncidents.map((item: any) => (
                              <li
                                key={item.id}
                                onClick={() => {
                                  setSelectedIncident(item);
                                  setIsModalOpen(true);
                                }}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/60 transition duration-200 cursor-pointer"
                              >
                                <span className="font-medium">{item.title}</span>
                                {" — "}
                                {formatCurrency(item.price)}
                              </li>
                            ))}
                          </ul>

                          {/* modal de detalles de incidente */}
                          <IncidentDetailsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} incident={selectedIncident} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* caja para cambiar contraseña */}
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700 mt-6 p-6 force-light-bg-white">
          <h2 className="text-lg font-semibold text-black force-light-text dark:text-slate-100 mb-4" data-i18n="profile.changePassword">
            {t("profile.changePassword")}
          </h2>

          <div className="grid gap-4 max-w-md">
            <label className="flex flex-col text-sm font-medium" data-i18n="profile.currentPassword">
              {t("profile.currentPassword")}
              <input type="password" value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200" />
            </label>

            <label className="flex flex-col text-sm font-medium" data-i18n="profile.newPassword">
              {t("profile.newPassword")}
              <input type="password" value={pwdNew} onChange={handleNewPasswordChange} className={`mt-1 border ${pwdNew && pwdError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"} rounded-lg px-3 py-2 shadow-sm transition duration-200`} />
            </label>

            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pwdStrength.length ? "bg-green-500" : "bg-gray-200"}`}></div>
                <span className={pwdStrength.length ? "text-green-600" : "text-gray-500"} data-i18n="register.pwdLength">
                  {t("register.pwdLength")}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pwdStrength.upper ? "bg-green-500" : "bg-gray-200"}`}></div>
                <span className={pwdStrength.upper ? "text-green-600" : "text-gray-500"} data-i18n="register.pwdUpper">
                  {t("register.pwdUpper")}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pwdStrength.lower ? "bg-green-500" : "bg-gray-200"}`}></div>
                <span className={pwdStrength.lower ? "text-green-600" : "text-gray-500"} data-i18n="register.pwdLower">
                  {t("register.pwdLower")}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pwdStrength.number ? "bg-green-500" : "bg-gray-200"}`}></div>
                <span className={pwdStrength.number ? "text-green-600" : "text-gray-500"} data-i18n="register.pwdNumber">
                  {t("register.pwdNumber")}
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${pwdStrength.special ? "bg-green-500" : "bg-gray-200"}`}></div>
                <span className={pwdStrength.special ? "text-green-600" : "text-gray-500"} data-i18n="register.pwdSpecial">
                  {t("register.pwdSpecial")}
                </span>
              </div>
            </div>

            <label className="flex flex-col text-sm font-medium" data-i18n="profile.confirmNewPassword">
              {t("profile.confirmNewPassword")}
              <input type="password" value={pwdConfirm} onChange={handleConfirmPasswordChange} className={`mt-1 border ${pwdConfirm && pwdError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"} rounded-lg px-3 py-2 shadow-sm transition duration-200`} />
              {pwdError && <p className="mt-1 text-sm text-red-600">{pwdError}</p>}
            </label>

            <div>
              <button onClick={handleChangePassword} disabled={pwdLoading || !isPasswordFormValid()} className={`w-full py-2 px-4 rounded-lg text-white font-medium shadow-sm transition ${isPasswordFormValid() && !pwdLoading ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-md" : "bg-gray-400 cursor-not-allowed"}`} data-i18n="profile.updatePassword">
                {pwdLoading ? "Updating…" : t("profile.updatePassword")}
              </button>
            </div>

            <p className="text-xs text-gray-500" data-i18n="profile.passwordInstructions">{t("profile.passwordInstructions")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
