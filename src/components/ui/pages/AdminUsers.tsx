import { useEffect, useState } from "react";
import { Home, User, Users, Settings, Trash } from "lucide-react";

type UserRecord = {
  id: number;
  username: string;
  email: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "https://localhost:7044/Users/List";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        console.log("Usuarios desde API:", data);

        const mapped: UserRecord[] = data.map((u: any) => ({
          id: u.ID ?? u.id,
          username: u.Username ?? u.username,
          email: u.Email ?? u.email,
        }));

        setUsers(mapped);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
  if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

  try {
    const res = await fetch(`https://localhost:7044/Users/Delete?pID=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      alert("Usuario eliminado correctamente.");
    } else {
      const errorText = await res.text();
      console.error("Error eliminando:", errorText);
      alert("Error al eliminar usuario.");
    }
  } catch (err) {
    console.error("Error en la petición:", err);
    alert("Error al conectar con el servidor.");
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 p-5 md:p-6 bg-gray-50/60 rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl">
              <nav className="space-y-2">
                <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </a>
                <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </a>
                <a href="#" aria-current="page" className="flex items-center gap-3 rounded-xl px-3 py-2 bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Users</span>
                </a>
                <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </a>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                Manage Users
              </h1>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                <div className="overflow-x-auto">
                  {loading ? (
                    <p className="text-gray-500 text-center">Loading users...</p>
                  ) : (
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-700">
                          <th className="w-16 px-4 py-3 font-semibold">ID</th>
                          <th className="px-4 py-3 font-semibold">Username</th>
                          <th className="px-4 py-3 font-semibold">Email</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white rounded-xl overflow-hidden">
                        {users.map((u, idx) => (
                          <tr key={u.id ?? idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 text-gray-900">{u.id}</td>
                            <td className="px-4 py-3 text-gray-900">{u.username}</td>
                            <td className="px-4 py-3 text-gray-900">{u.email}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                              >
                                <Trash className="h-4 w-4" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

