/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, User, Users, BarChart } from "lucide-react";
import { getLoggedUser } from "../../../utils/storage";
import { formatCurrency } from "../../../utils/format";
import toast, { Toaster } from "react-hot-toast";

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

const phoneFormats: Record<string, string> = {
  "+506": "xxxx xxxx",
  "+1": "xxx xxx xxxx",
  "+44": "xxxx xxx xxxx",
  "+34": "xxx xxx xxx",
};

const detectCountryFormat = (phone: string) => {
  const codes = Object.keys(phoneFormats).sort((a, b) => b.length - a.length);
  for (const code of codes) {
    if (phone.startsWith(code)) return { code, format: phoneFormats[code] };
  }
  return { code: "", format: "xxxx xxxx xxxx" };
};

const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, "");
  const { code, format } = detectCountryFormat(cleaned);
  const countryCode = code;
  let digitsOnly = cleaned.replace(/\D/g, "");
  if (countryCode) {
    const codeDigits = countryCode.replace("+", "");
    if (digitsOnly.startsWith(codeDigits)) {
      digitsOnly = digitsOnly.slice(codeDigits.length);
    }
  }
  let i = 0;
  const formattedNational = format.replace(/x/g, () => digitsOnly[i++] || "");
  const result = countryCode
    ? `${countryCode} ${formattedNational.trim()}`
    : formattedNational.trim();
  return result;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>();
  const loggedUser = getLoggedUser();
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

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
        user_password: data.user_password || "*******",
      };
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
  }, []);

  const countSignificantBefore = (raw: string, cursorPos: number) => {
    const slice = raw.slice(0, cursorPos);
    const arr = slice.match(/[0-9+]/g);
    return arr ? arr.length : 0;
  };

  const findCursorPosInFormatted = (
    formatted: string,
    significantTarget: number
  ) => {
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/[0-9+]/.test(formatted[i])) count++;
      if (count >= significantTarget) return i + 1;
    }
    return formatted.length;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!formData) return;
    let newValue = value;
    if (name === "phone") {
      const inputEl = e.target as HTMLInputElement;
      const cursorPos = inputEl.selectionStart ?? newValue.length;
      newValue = newValue.replace(/[^0-9+\-\s]/g, "");
      newValue = newValue.replace(/(?!^)\+/g, "");
      const cleanedForCount = newValue.replace(/[-\s]/g, "");
      const significantBefore = countSignificantBefore(
        cleanedForCount,
        cursorPos
      );
      const formatted = formatPhone(newValue);
      const newCursorPos = findCursorPosInFormatted(
        formatted,
        significantBefore
      );
      setFormData({ ...formData, [name]: formatted });
      window.requestAnimationFrame(() => {
        const el = phoneInputRef.current;
        if (el) {
          const pos = Math.min(newCursorPos, el.value.length);
          el.setSelectionRange(pos, pos);
        }
      });
      return;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/[\s-]/g, "").replace(/^\+/, "");
    return /^\d{7,15}$/.test(digits);
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
      ID: formData.ID,
      f_name: formData.f_name,
      l_name: formData.l_name,
      username: formData.username,
      email: formData.email,
      user_password:
        formData.user_password && formData.user_password !== "*******"
          ? formData.user_password
          : user?.user_password || "1234",
      phone: cleanPhone,
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
      if (res.ok) {
        toast.success("Profile updated successfully");
        setUser({ ...(formData as User) });
        setIsEditing(false);
      } else {
        toast.error("Error updating profile");
      }
    } catch {
      toast.error("Error updating profile");
    }
  };

  const [purchasedIncidents, setPurchasedIncidents] = useState<any[]>([]);
  useEffect(() => {
    const fetchPurchased = async () => {
      if (!loggedUser?.id) return setPurchasedIncidents([]);
      try {
        const res = await fetch("https://localhost:7044/Purchase/List");
        const purchases = await res.json();
        const userPurchases = purchases.filter(
          (p: any) => p.user_id === loggedUser.id
        );
        let allLeads: any[] = [];
        for (const purchase of userPurchases) {
          if (purchase.leads && Array.isArray(purchase.leads)) {
            allLeads = allLeads.concat(
              purchase.leads.map((l: any) => ({
                id: l.lead_id,
                title: l.lead?.full_address || l.lead_id,
                price: purchase.amount,
              }))
            );
          }
        }
        setPurchasedIncidents(allLeads);
      } catch {
        setPurchasedIncidents([]);
      }
    };
    fetchPurchased();
  }, [loggedUser?.id]);

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
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
                    className:
                      "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  }}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                {loggedUser?.role === "admin" && (
                  <>
                    <Link
                      to="/AdminUsers"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                      activeProps={{
                        className:
                          "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                      }}
                    >
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Users</span>
                    </Link>
                    <Link
                      to="/AdminReports"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                      activeProps={{
                        className:
                          "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                      }}
                    >
                      <BarChart className="h-5 w-5" />
                      <span className="font-medium">Reports</span>
                    </Link>
                  </>
                )}
              </nav>
            </aside>
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                My Profile
              </h1>
              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex items-center mb-4 gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src="/avatars/default1.png"
                        alt="Default Avatar"
                        className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {user.f_name} {user.l_name}
                    </h3>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm hover:shadow-md"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-sm hover:shadow-md"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(user);
                          }}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 shadow-sm hover:shadow-md"
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
                        { name: "f_name", label: "First Name", inputType: "text" },
                        { name: "l_name", label: "Last Name", inputType: "text" },
                        { name: "username", label: "Username", readOnly: true },
                        { name: "email", label: "Email", inputType: "email" },
                        { name: "phone", label: "Phone", inputType: "tel", placeHolder: "+1 xxx xxx xxxx" },
                        { name: "company", label: "Company", inputType: "text" },
                      ].map((field) => (
                        <label key={field.name} className="flex flex-col text-sm font-medium">
                          {field.label}
                          <input
                            ref={field.name === "phone" ? phoneInputRef : undefined}
                            name={field.name}
                            type={field.inputType}
                            placeholder={field.placeHolder}
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
                          className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        />
                      </label>
                    </form>
                  )}
                  {!isEditing && (
                    <div className="mt-8">
                      <h2 className="text-lg font-semibold mb-2">
                        Purchased Incidents
                      </h2>
                      {purchasedIncidents.length === 0 ? (
                        <p className="text-gray-500">No incidents purchased yet.</p>
                      ) : (
                        <ul className="list-disc pl-6 space-y-2">
                          {purchasedIncidents.map((item: any) => (
                            <li key={item.id} className="p-2 rounded-md hover:bg-gray-100 transition duration-200">
                              <span className="font-medium">{item.title}</span>{" "}
                              — {formatCurrency(item.price)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
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
