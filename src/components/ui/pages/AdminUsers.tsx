import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, User, Users, BarChart, Trash, Edit } from "lucide-react";
import { getLoggedUser } from "../../../utils/storage";

type UserRecord = {
  id: number;
  f_name?: string;
  l_name?: string;
  username: string;
  email: string;
  phone?: string;
  company?: string;
  user_password?: string;
};

const API_URL = "https://localhost:7044/Users";

export default function AdminUsers() {
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
        phone: u.phone ?? u.Phone ?? "",
        company: u.company ?? u.Company ?? "",
        user_password: "*******",
      }));

      setUsers(mapped);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      const res = await fetch(`${API_URL}/Delete?pID=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        alert("Usuario eliminado correctamente ✅");
      } else {
        alert("Error al eliminar usuario ❌");
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      alert("Error al conectar con el servidor ❌");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

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
      Phone: formData.phone || "",
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
        alert("Usuario actualizado ✅");
      } else {
        const errorText = await res.text();
        console.error("Error al actualizar:", errorText);
        alert("Error al actualizar usuario ❌");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Server connection error ❌");
    }
  };

  const loggedUser = getLoggedUser();

  if (loggedUser?.role !== "admin") {
    return <p className="text-center mt-10 text-red-500">Access denied</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            
            {/* Sidebar con mismo diseño de Profile */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 p-5 md:p-6 bg-gray-50/60 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">DisasterMatch</span>
                </Link>

                <Link
                  to="/Profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{
                    className: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </Link>

                <Link
                  to="/AdminUsers"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{
                    className: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </Link>

                <Link
                  to="/AdminReports"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                  activeProps={{
                    className: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <BarChart className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                Manage Users
              </h1>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                {loading ? (
                  <p className="text-gray-500 text-center">Loading users...</p>
                ) : !isEditing ? (
                  // Tabla
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-700">
                        <th className="w-16 px-4 py-3 font-semibold">ID</th>
                        <th className="px-4 py-3 font-semibold">Username</th>
                        <th className="px-4 py-3 font-semibold">Email</th>
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
                              <Edit className="h-4 w-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                            >
                              <Trash className="h-4 w-4" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // Formulario
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4">
                      Edit User: {isEditing.username}
                    </h2>
                    <form className="grid gap-4">
                      {[
                        { name: "f_name", label: "First Name" },
                        { name: "l_name", label: "Last Name" },
                        { name: "username", label: "Username" },
                        { name: "email", label: "Email" },
                        { name: "phone", label: "Phone" },
                        { name: "company", label: "Company" },
                      ].map((field) => (
                        <label
                          key={field.name}
                          className="flex flex-col text-sm font-medium"
                        >
                          {field.label}
                          <input
                            name={field.name}
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
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(null);
                          setFormData(null);
                        }}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
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
