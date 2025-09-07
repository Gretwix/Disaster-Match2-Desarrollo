import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const i = "/IconCont.png";
const im = "/IconDash.png";
const ima = "/IconSet.png";
const imag = "/IconPro.png";

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

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/List`);
      const data = await res.json();
      console.log("Backend response for user list:", data);
      if (Array.isArray(data)) {
        const u = data.find((u: any) => u.username === loggedUser.username);
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

      const message = await res.text();
      console.log("Respuesta backend:", message);

      setUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };


  // Obtener incidentes comprados
  const [purchasedIncidents, setPurchasedIncidents] = useState([]);
  useEffect(() => {
    if (!loggedUser?.username) return;
    const key = `purchasedIncidents_${loggedUser.username}`;
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
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <img className="h-4" src={im} alt="alt" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <img className="h-7" src={i} alt="alt" />
                  <span className="font-medium">Contacts</span>
                </Link>
                <Link
                  to="/Profile"
                  aria-current="page"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                >
                  <img className="h-4" src={imag} alt="alt" />
                  <span className="font-medium">Profile</span>
                </Link>
                <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition">
                  <img className="h-5" src={ima} alt="alt" />
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>
            </aside>

            {/* Main content */}
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>

              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {user.f_name} {user.l_name}
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(user);
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="space-y-3 text-gray-700">
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <p><strong>Company:</strong> {user.company}</p>
                    </div>
                  ) : (
                    <form className="grid gap-4">
                      <label className="flex flex-col text-sm font-medium">
                        First Name
                        <input
                          name="f_name"
                          value={formData?.f_name || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex flex-col text-sm font-medium">
                        Last Name
                        <input
                          name="l_name"
                          value={formData?.l_name || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex flex-col text-sm font-medium">
                        Username
                        <input
                          name="username"
                          value={formData?.username || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex flex-col text-sm font-medium">
                        Email
                        <input
                          name="email"
                          value={formData?.email || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex flex-col text-sm font-medium">
                        Phone
                        <input
                          name="phone"
                          value={formData?.phone || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex flex-col text-sm font-medium">
                        Company
                        <input
                          name="company"
                          value={formData?.company || ""}
                          onChange={handleChange}
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </label>
                    </form>
                  )}

                  {/* Lista de incidentes comprados */}
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">Purchased Incidents</h2>
                    {purchasedIncidents.length === 0 ? (
                      <p className="text-gray-500">No incidents purchased yet.</p>
                    ) : (
                      <ul className="list-disc pl-6">
                        {purchasedIncidents.map((item: any) => (
                          <li key={item.id} className="mb-2">
                            <span className="font-medium">{item.title}</span> — ${item.price}
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