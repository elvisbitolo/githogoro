"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ArrowRight, User, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"
import { ZONES } from "@/lib/constants"

const PHONE_REGEX = /^07\d{8}$/

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: "weak", color: "bg-red-500" }
  if (score <= 3) return { score, label: "fair", color: "bg-orange-500" }
  if (score <= 4) return { score, label: "good", color: "bg-amber-500" }
  return { score, label: "strong", color: "bg-emerald-500" }
}

export default function SignupPage() {
  const { t } = useTranslations()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [zone, setZone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClient()

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const strengthLabelMap: Record<string, string> = {
    weak: t.auth.passwordStrengthWeak,
    fair: t.auth.passwordStrengthFair,
    good: t.auth.passwordStrengthGood,
    strong: t.auth.passwordStrengthStrong,
  }

  const validatePhone = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, "")
    if (!digitsOnly) return ""
    if (!PHONE_REGEX.test(digitsOnly)) return t.auth.phoneInvalid
    return ""
  }

  const validatePassword = (value: string): string => {
    if (!value) return ""
    if (value.length < 8) return t.auth.passwordMin
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
      return t.auth.passwordStrong
    }
    return ""
  }

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
    setPhone(digitsOnly)
    if (touched.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: validatePhone(digitsOnly) }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    }
    if (touched.confirmPassword && confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? t.auth.passwordsNoMatch : "",
      }))
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    if (touched.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: value !== password ? t.auth.passwordsNoMatch : "",
      }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errors: Record<string, string> = {}
    if (field === "phone") errors.phone = validatePhone(phone)
    if (field === "password") errors.password = validatePassword(password)
    if (field === "confirmPassword") {
      errors.confirmPassword = confirmPassword !== password ? t.auth.passwordsNoMatch : ""
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const newTouched: Record<string, boolean> = {
      name: true, phone: true, password: true, confirmPassword: true, zone: true,
    }
    setTouched(newTouched)

    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = t.auth.nameRequired
    errors.phone = validatePhone(phone)
    errors.password = validatePassword(password)
    if (!confirmPassword) errors.confirmPassword = t.auth.passwordsNoMatch
    else if (password !== confirmPassword) errors.confirmPassword = t.auth.passwordsNoMatch
    if (!zone) errors.zone = ""

    setFieldErrors(errors)

    const hasErrors = Object.values(errors).some((e) => e !== "")
    if (hasErrors) {
      setLoading(false)
      return
    }

    const formattedPhone = "+254" + phone.slice(1)
    const email = `${formattedPhone.slice(1)}@githogoro.app`

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          phone: formattedPhone,
          zone,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError("Account created successfully! Please log in with your credentials.")
      setLoading(false)
      return
    }

    await fetch("/api/profiles/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: formattedPhone, zone }),
    })

    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError("")
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  const hasFieldError = (field: string) => touched[field] && fieldErrors[field]

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-[#FAF9F6]">
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
          <h1 className="text-2xl font-bold">{t.auth.joinTitle}</h1>
          <p className="text-zinc-500 mt-1">{t.auth.joinSubtitle}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <GoogleIcon />
          <span className="ml-2">{t.auth.continueWithGoogle}</span>
        </Button>

        <div className="flex items-center gap-3 my-4">
          <span className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs uppercase text-zinc-400">{t.auth.orDivider}</span>
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.fullName}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="John Kamau"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
                className={`pl-10 ${hasFieldError("name") ? "border-red-400 focus-visible:ring-red-500" : ""}`}
                required
              />
            </div>
            {hasFieldError("name") && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.phoneNumber}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur("phone")}
                className={`pl-10 ${hasFieldError("phone") ? "border-red-400 focus-visible:ring-red-500" : ""}`}
                maxLength={10}
                required
              />
              {!hasFieldError("phone") && phone.length === 10 && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="text-[11px] text-zinc-400">e.g. 0712345678 (10 digits)</p>
            {hasFieldError("phone") && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`pl-10 pr-10 ${hasFieldError("password") ? "border-red-400 focus-visible:ring-red-500" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= Math.ceil(passwordStrength.score / 1.5)
                          ? passwordStrength.color
                          : "bg-zinc-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] ${
                  passwordStrength.label === "strong" ? "text-emerald-600" :
                  passwordStrength.label === "good" ? "text-amber-600" :
                  "text-zinc-500"
                }`}>
                  {strengthLabelMap[passwordStrength.label]}
                </p>
              </div>
            )}
            {hasFieldError("password") && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.confirmPassword}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                className={`pl-10 ${hasFieldError("confirmPassword") ? "border-red-400 focus-visible:ring-red-500" : ""}`}
                required
              />
              {!hasFieldError("confirmPassword") && confirmPassword && confirmPassword === password && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
            {hasFieldError("confirmPassword") && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.locationZone}</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              required
            >
              <option value="">{t.auth.selectZone}</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.creating : t.auth.createAccount}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-zinc-500">
            {t.auth.alreadyMember}{" "}
            <Link href="/login" className="text-emerald-700 font-medium hover:underline">
              {t.auth.loginLink}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
