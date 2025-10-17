/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, User, Users, BarChart } from "lucide-react";
import { getLoggedUser } from "../../../utils/storage";
import { formatPhone, validatePhone } from "../../../utils/phoneValidation";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../../utils/api";

type UserRecord = {
  id: number;
  f_name?: string;
  l_name?: string;
  username: string;
  email: string;
  phone: string;
  company?: string;
  user_password?: string;
};

const API_URL = `${API_BASE}/Users`;

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState<UserRecord | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/List`);
      const data = await res.json();

      const mapped: UserRecord[] = data.map((u: any) => ({
        id: u.ID ?? u.id,
        f_name: u.f_name ?? u.F_Name ?? "",
        l_name: u.l_name ?? u.L_Name ?? "",
        username: u.username ?? u.Username ?? "",
        email: u.email ?? u.Email ?? "",
        phone: u.phone ?? u.formatPhone(String(data.phone || "")) ?? "",
        company: u.company ?? u.Company ?? "",
        user_password: "*******",
      }));

      setUsers(mapped);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e3342f",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/Delete?pID=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        toast.success("Usuario eliminado correctamente");
      } else {
        toast.error("Error al eliminar usuario");
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      toast.error("Error al conectar con el servidor");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    let newValue = value;
    if (name === "phone") {
      // use external util for formatting
      newValue = formatPhone(newValue);
      setFormData({ ...formData, [name]: newValue });
      return;
    }
  };

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
      ID: formData.id,
      F_Name: formData.f_name || "",
      L_Name: formData.l_name || "",
      Username: formData.username,
      Email: formData.email,
      User_Password:
        formData.user_password && formData.user_password !== "*******"
          ? formData.user_password
          : "1234",
      Phone: cleanPhone,
      User_Address: "",
      Company: formData.company || "",
      Remember_Token: "",
      FechaRegistro: new Date(),
    };

    try {
      const res = await fetch(`${API_URL}/Update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === formData.id ? { ...formData } : u))
        );
        setIsEditing(null);
        toast.success("Usuario actualizado correctamente");
      } else {
        const errorText = await res.text();
        console.error("Error al actualizar:", errorText);
        toast.error("Error al actualizar usuario");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      toast.error("Error al conectar con el servidor");
    }
  };

  const loggedUser = getLoggedUser();

  if (loggedUser?.role !== "admin") {
    return <p className="text-center mt-10 text-red-500">{t("admin.deleteConfirmTitle")}</p>;
  }

  const sidebarLinkBase = "flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition";
  const sidebarActiveClass = "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300";

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">

            {/* Sidebar con mismo diseño de Profile */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 p-5 md:p-6 bg-gray-50/60 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <Link to="/" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <Home className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.disasterMatch">{t("nav.disasterMatch")}</span>
                </Link>

                <Link to="/AdminReports" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <BarChart className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.adminPanel">{t("nav.adminPanel")}</span>
                </Link>

                <Link to="/Profile" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <User className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.profile">{t("nav.profile")}</span>
                </Link>

                <Link to="/AdminUsers" className={sidebarLinkBase} activeProps={{ className: sidebarActiveClass }}>
                  <Users className="h-5 w-5" />
                  <span className="font-medium" data-i18n="nav.users">{t("nav.users")}</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6" data-i18n="admin.manageUsers">{t("admin.manageUsers")}</h1>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                {loading ? (
                  <p className="text-gray-500 text-center" data-i18n="admin.loadingUsers">{t("admin.loadingUsers")}</p>
                ) : !isEditing ? (
                  // Tabla
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-700">
                        <th className="w-16 px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">{t("profile.username")}</th>
                        <th className="px-4 py-3 font-semibold">{t("profile.email")}</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr
                          key={u.id ?? idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-3">{u.id}</td>
                          <td className="px-4 py-3">{u.username}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={() => {
                                setIsEditing(u);
                                setFormData(u);
                              }}
                              className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                            >
                              {t("admin.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                            >
                              {t("admin.delete")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Formulario
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">Edit User: {isEditing.username}</h2>
                    <form className="grid gap-4">
                      {[
                        { name: "f_name", label: "First Name" },
                        { name: "l_name", label: "Last Name" },
                        { name: "username", label: "Username" },
                        { name: "email", label: "Email" },
                        { name: "phone", label: "Phone", inputType: "tel", placeHolder: "+1 xxx xxx xxxx" },
                        { name: "company", label: "Company" },
                      ].map((field) => (
                        <label
                          key={field.name}
                          className="flex flex-col text-sm font-medium"
                        >
                          {field.label}
                          <input
                            name={field.name}
                            type={field.inputType}
                            placeholder={field.placeHolder}
                            value={(formData as any)?.[field.name] || ""}
                            onChange={handleChange}
                            className="mt-1 border rounded-lg px-3 py-2 shadow-sm 
                                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                      ))}

                      <label className="flex flex-col text-sm font-medium">
                        New Password
                        <input
                          type="password"
                          name="user_password"
                          placeholder="Enter new password (optional)"
                          value={
                            formData?.user_password !== "*******"
                              ? formData?.user_password || ""
                              : ""
                          }
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm 
                                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        />
                      </label>
                    </form>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        {t("profile.save")}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(null);
                          setFormData(null);
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        {t("profile.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
