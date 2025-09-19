import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, User, Users, BarChart } from "lucide-react";
import { getLoggedUser, purchasedIncidentsKey } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";

type User = {
  ID: number;
  f_name: string;
  l_name: string;
  username: string;
  email: string;
  phone: string;
  company: string;
  user_password?: string;
};

const API_URL = "https://localhost:7044/Users";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const loggedUser = getLoggedUser();

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/List`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const u = data.find((u: any) => u.username === loggedUser?.username);
        if (u) {
          const userData: User = {
            ID: u.ID ?? u.id,
            f_name: u.f_name,
            l_name: u.l_name,
            username: u.username,
            email: u.email,
            phone: u.phone,
            company: u.company,
            user_password: u.user_password || "*******",
          };
          setUser(userData);
          setFormData(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    const payload = {
      ID: formData.ID,
      f_name: formData.f_name,
      l_name: formData.l_name,
      username: formData.username,
      email: formData.email,
      user_password:
        formData.user_password && formData.user_password !== "*******"
          ? formData.user_password
          : user?.user_password || "1234",
      phone: formData.phone,
      user_address: "",
      company: formData.company,
      remember_token: "",
      fechaRegistro: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_URL}/Update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.text();

      setUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // Obtener incidentes comprados
  const [purchasedIncidents, setPurchasedIncidents] = useState<any[]>([]);
  useEffect(() => {
    if (!loggedUser?.username) return;
    const key = purchasedIncidentsKey(loggedUser.username);
    const stored = localStorage.getItem(key);
    if (stored) setPurchasedIncidents(JSON.parse(stored));
    else setPurchasedIncidents([]);
  }, [loggedUser?.username]);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
           
            {/* Sidebar */}
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

    {/* Solo si es admin → mostrar Users y Reports */}
    {loggedUser?.role === "admin" && (
      <>
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
          <span className="font-medium">Reports</span>
        </Link>
      </>
    )}
  </nav>
</aside>


            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                My Profile
              </h1>

              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {user.f_name} {user.l_name}
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                                   hover:bg-blue-700 transition duration-200 shadow-sm hover:shadow-md"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg 
                                     hover:bg-green-700 transition duration-200 shadow-sm hover:shadow-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(user);
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg 
                                     hover:bg-gray-500 transition duration-200 shadow-sm hover:shadow-md"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
  <div className="space-y-3 text-gray-700">
    <p>
      <strong>Username:</strong> {user.username}
    </p>
    <p>
      <strong>Email:</strong> {user.email}
    </p>
    <p>
      <strong>Phone:</strong> {user.phone}
    </p>
    <p>
      <strong>Company:</strong> {user.company}
    </p>
  </div>
) : (
  <form className="grid gap-4">
    {[
      { name: "f_name", label: "First Name" },
      { name: "l_name", label: "Last Name" },
      // 👇 Username solo lectura
      { name: "username", label: "Username", readOnly: true },
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
          readOnly={field.readOnly || false}
          className={`mt-1 border rounded-lg px-3 py-2 shadow-sm transition duration-200
            ${field.readOnly 
              ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
              : "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            }`}
        />
      </label>
    ))}

    {/* 👇 Nuevo campo para cambiar contraseña */}
    <label className="flex flex-col text-sm font-medium">
      New Password
      <input
        type="password"
        name="user_password"
        placeholder="Enter new password (optional)"
        value={
          formData?.user_password && formData.user_password !== "*******"
            ? formData.user_password
            : ""
        }
        onChange={handleChange}
        className="mt-1 border rounded-lg px-3 py-2 shadow-sm 
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 
                   transition duration-200"
      />
    </label>
  </form>
)}


                  {/* Lista de incidentes comprados */}
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">
                      Purchased Incidents
                    </h2>
                    {purchasedIncidents.length === 0 ? (
                      <p className="text-gray-500">
                        No incidents purchased yet.
                      </p>
                    ) : (
                      <ul className="list-disc pl-6 space-y-2">
                        {purchasedIncidents.map((item: any) => (
                          <li
                            key={item.id}
                            className="p-2 rounded-md hover:bg-gray-100 transition duration-200"
                          >
                            <span className="font-medium">{item.title}</span> — {formatCurrency(item.price)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Profile;
