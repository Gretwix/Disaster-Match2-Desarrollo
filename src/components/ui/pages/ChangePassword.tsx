import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { API_BASE } from '../../../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Read params from URL (login will send userId & email)
  const search = useMemo(() => new URLSearchParams(window.location.search), []);
  const userIdParam = search.get('userId') || '';
  const emailParam = search.get('email') || '';

  const [userId, setUserId] = useState<string>(userIdParam);
  const [email, setEmail] = useState<string>(emailParam);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // If params are missing or invalid, try to recover from sessionStorage
    const userIdNum = Number(userIdParam);
    const userIdInvalid = !userIdParam || !Number.isFinite(userIdNum);
    if (userIdInvalid || !emailParam) {
      try {
        const raw = sessionStorage.getItem('forcePwdChange');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.userId && (!userId || userIdInvalid)) setUserId(String(parsed.userId));
          if (parsed?.email && !email) setEmail(String(parsed.email));
        }
      } catch {
        // ignore
      }
    }
  }, [userIdParam, emailParam]);

  const validatePassword = (value: string) => {
    const rules = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@#$%&*!?]/.test(value),
    };
    setStrength(rules);
    if (!Object.values(rules).every(Boolean)) {
      setError(t('register.errorPwdRequirements'));
      return false;
    }
    setError('');
    return true;
  };

  const onNewPasswordChange = (v: string) => {
    setNewPassword(v);
    if (v === '') {
      setError('');
      setStrength({ length: false, upper: false, lower: false, number: false, special: false });
    } else {
      validatePassword(v);
    }
    if (confirmPassword) {
      if (v !== confirmPassword) setError(t('register.errorPasswordsMismatch'));
    }
  };

  const onConfirmChange = (v: string) => {
    setConfirmPassword(v);
    if (newPassword && v !== newPassword) setError(t('register.errorPasswordsMismatch'));
    else setError('');
  };

  const isValid = () => {
    return (
      !!userId &&
      !!email &&
      !!currentPassword &&
      !!newPassword &&
      newPassword === confirmPassword &&
      Object.values(strength).every(Boolean)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError(t('changePassword.errorMissingUserId'));
      return;
    }
    const userIdNum = Number(userId);
    if (!Number.isFinite(userIdNum)) {
      setError(t('changePassword.errorMissingUserId'));
      return;
    }
    if (!validatePassword(newPassword) || newPassword !== confirmPassword) {
      return;
    }
    if (newPassword === currentPassword) {
      setError(t('changePassword.errorSame'));
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/Users/ChangePassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdNum, currentPassword, newPassword }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || t('changePassword.errorChangeFailed'));
      }

      const data = await res.json().catch(() => ({ success: true }));
      if (data?.success === false) {
        throw new Error(data?.message || t('changePassword.errorChangeFailed'));
      }

      toast.success(t('changePassword.success'));
      // Redirect to login screen
      setTimeout(() => navigate({ to: '/Login' }), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('changePassword.errorChangeFailed');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-1">{t('changePassword.title')}</h1>
        <p className="text-sm text-gray-600 mb-2">{t('changePassword.subtitle')}</p>
        {(!userId || !email) && (
          <div className="mb-4 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
            {t('changePassword.hintEnterDetails')}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col text-sm font-medium">
              {t('changePassword.email')}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`mt-1 border rounded-lg px-3 py-2 shadow-sm ${email ? 'bg-gray-50' : ''}`}
                readOnly={!!email}
              />
            </label>

            <label className="flex flex-col text-sm font-medium">
              {t('changePassword.userId')}
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`mt-1 border rounded-lg px-3 py-2 shadow-sm ${userId ? 'bg-gray-50' : ''}`}
                readOnly={!!userId}
              />
            </label>

            <label className="flex flex-col text-sm font-medium">
              {t('changePassword.currentTempPassword')}
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 border rounded-lg px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the temporary password"
              />
            </label>

            <label className="flex flex-col text-sm font-medium">
              {t('changePassword.newPassword')}
              <input
                type="password"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                className={`mt-1 border rounded-lg px-3 py-2 shadow-sm ${
                  newPassword && !Object.values(strength).every(Boolean)
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder={t('changePassword.placeholderNew')}
              />
            </label>

            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${strength.length ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className={strength.length ? 'text-green-600' : 'text-gray-500'}>{t('register.pwdLength')}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${strength.upper ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className={strength.upper ? 'text-green-600' : 'text-gray-500'}>{t('register.pwdUpper')}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${strength.lower ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className={strength.lower ? 'text-green-600' : 'text-gray-500'}>{t('register.pwdLower')}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${strength.number ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className={strength.number ? 'text-green-600' : 'text-gray-500'}>{t('register.pwdNumber')}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${strength.special ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <span className={strength.special ? 'text-green-600' : 'text-gray-500'}>{t('register.pwdSpecial')}</span>
              </div>
            </div>

            <label className="flex flex-col text-sm font-medium">
              {t('changePassword.confirmNewPassword')}
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => onConfirmChange(e.target.value)}
                className={`mt-1 border rounded-lg px-3 py-2 shadow-sm ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                }`}
                placeholder="Repeat the new password"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !isValid()}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium shadow-sm transition ${
                isValid() && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Updating…' : t('changePassword.update')}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-indigo-600 hover:text-indigo-700"
            onClick={() => navigate({ to: '/Login' })}
          >
            {t('changePassword.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
