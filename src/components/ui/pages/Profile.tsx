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
  user_address?: string;
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
  // Change password box state
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
  const [formData, setFormData] = useState<User | null>();
  const [userPasswordRaw, setUserPasswordRaw] = useState<string | undefined>(undefined);
  const loggedUser = getLoggedUser();
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  // Validate password in real-time
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

  // Validate password confirmation
  const validateConfirmPassword = (value: string) => {
    if (value !== pwdNew) {
      setPwdError("New passwords do not match");
      return false;
    }
    setPwdError("");
    return true;
  };

  // Handle new password change
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwdNew(value);
    validatePassword(value);
    if (pwdConfirm) {
      validateConfirmPassword(pwdConfirm);
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPwdConfirm(value);
    validateConfirmPassword(value);
  };

  // Check if password form is valid
  const isPasswordFormValid = () => {
    return (
      pwdCurrent &&
      pwdNew &&
      pwdConfirm &&
      !pwdError &&
      Object.values(pwdStrength).every(Boolean) &&
      pwdNew === pwdConfirm
    );
  };

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
    // Do not include password here; password changes are handled in a separate box
    // Send minimal fields to reduce backend validation issues
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
      } else {
        // Attempt compatibility retry if backend still requires fields
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
              user_address: (formData.user_address && formData.user_address.trim() !== "") ? formData.user_address : "N/A",
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
          // ignore JSON parse errors
        }
        console.error("Profile update failed", { status: res.status, payload, error: text });
        toast.error(text || "Error updating profile");
      }
    } catch {
      toast.error("Error updating profile");
    }
  };

  const handleChangePassword = async () => {
    if (!user?.ID && !(getLoggedUser() as any)?.id) {
      toast.error("You must be logged in to change password");
      return;
    }

    // Validate all fields
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
          ...(localStorage.getItem("authToken") ? { 
            'Authorization': `Bearer ${localStorage.getItem("authToken")}` 
          } : {})
        },
        body: JSON.stringify({ 
          userId, 
          currentPassword: pwdCurrent, 
          newPassword: pwdNew 
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
                title: l.lead?.event_type || l.lead_id,
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
    <div className="min-h-screen bg-gray-100 dark:bg-[#0b1220] force-light-bg-gray-100">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700 force-light-bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
            <aside className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700 p-5 md:p-6 bg-gray-50/60 dark:bg-[#0e1629] rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl force-light-bg-gray-50">
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition force-light-btn-primary"
                >
                  <Home className="h-5 w-5 text-gray-900 dark:text-slate-300 force-light-icon-contrast" />
                  <span className="font-medium">DisasterMatch</span>
                </Link>

                {loggedUser?.role === "admin" && (
                  <Link
                    to="/AdminReports"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition"
                    activeProps={{
                      className: "bg-indigo-300 text-black shadow-sm dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-0",
                    }}
                  >
                    <BarChart className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}

                <Link
                  to="/Profile"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition force-light-btn-primary"
                  activeProps={{
                    className:
                      "dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-0",
                  }}
                >
                  <User className="h-5 w-5 text-gray-900 dark:text-slate-300 force-light-icon-contrast" />
                  <span className="font-medium">Profile</span>
                </Link>
                {loggedUser?.role === "admin" && (
                  <>
                    <Link
                      to="/AdminUsers"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition"
                      activeProps={{
                        className:
                          "bg-indigo-300 text-black shadow-sm dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-0",
                      }}
                    >
                      <Users className="h-5 w-5 text-gray-900 dark:text-slate-300" />
                      <span className="font-medium">Users</span>
                    </Link>
                    
                  </>
                )}
              </nav>
            </aside>
            <section className="p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 force-light-text">
                My Profile
              </h1>
              {user && (
                <div className="mt-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-[#0b1220] p-6 shadow-sm hover:shadow-md transition duration-200 force-light-bg-gray-50">
                  <div className="flex items-center mb-4 gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src="/avatars/default1.png"
                        alt="Default Avatar"
                        className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 force-light-text">
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
                    <div className="space-y-3 text-gray-700 dark:text-slate-300 force-light-text-muted">
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
                        { name: "user_address", label: "Address", inputType: "text" },
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
                            <li key={item.id} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800/60 transition duration-200">
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
        {/* Change Password Box */}
        <div className="rounded-2xl bg-white dark:bg-[#0f172a] shadow-sm border border-gray-200 dark:border-slate-700 mt-6 p-6 force-light-bg-white">
          <h2 className="text-lg font-semibold text-black force-light-text dark:text-slate-100 mb-4">Change Password</h2>
          <div className="grid gap-4 max-w-md">
            <label className="flex flex-col text-sm font-medium">
              Current Password
              <input
                type="password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
            </label>
            
            <label className="flex flex-col text-sm font-medium">
              New Password
              <input
                type="password"
                value={pwdNew}
                onChange={handleNewPasswordChange}
                className={`mt-1 border ${
                  pwdNew && pwdError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                } rounded-lg px-3 py-2 shadow-sm transition duration-200`}
              />
            </label>
            
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pwdStrength.length ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
                <span className={pwdStrength.length ? 'text-green-600' : 'text-gray-500'}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pwdStrength.upper ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
                <span className={pwdStrength.upper ? 'text-green-600' : 'text-gray-500'}>
                  At least one uppercase letter
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pwdStrength.lower ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
                <span className={pwdStrength.lower ? 'text-green-600' : 'text-gray-500'}>
                  At least one lowercase letter
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pwdStrength.number ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
                <span className={pwdStrength.number ? 'text-green-600' : 'text-gray-500'}>
                  At least one number
                </span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  pwdStrength.special ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
                <span className={pwdStrength.special ? 'text-green-600' : 'text-gray-500'}>
                  At least one special character (@, #, $, %, &, *, !, ?)
                </span>
              </div>
            </div>

            <label className="flex flex-col text-sm font-medium">
              Confirm New Password
              <input
                type="password"
                value={pwdConfirm}
                onChange={handleConfirmPasswordChange}
                className={`mt-1 border ${
                  pwdConfirm && pwdError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                } rounded-lg px-3 py-2 shadow-sm transition duration-200`}
              />
              {pwdError && (
                <p className="mt-1 text-sm text-red-600">{pwdError}</p>
              )}
            </label>

            <div>
              <button
                onClick={handleChangePassword}
                disabled={pwdLoading || !isPasswordFormValid()}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium shadow-sm transition ${
                  isPasswordFormValid() && !pwdLoading
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-md'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {pwdLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              For security, please enter your current password and confirm the new password.
              Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
