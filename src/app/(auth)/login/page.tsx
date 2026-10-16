"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Lock, ArrowRight, MessageSquare, Eye, EyeOff, AlertCircle } from "lucide-react"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useTranslations } from "@/lib/i18n/context"

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

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { t } = useTranslations()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClient()

  const validatePhone = (value: string): string => {
    if (!value) return ""
    if (!PHONE_REGEX.test(value)) return t.auth.phoneInvalid
    return ""
  }

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10)
    setPhone(digitsOnly)
    if (touched.phone) {
      setPhoneError(validatePhone(digitsOnly))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    setTouched({ phone: true, password: true })
    const phoneErr = validatePhone(phone)
    setPhoneError(phoneErr)

    if (phoneErr) {
      setLoading(false)
      return
    }

    const formattedPhone = "+254" + phone.slice(1)
    const email = `${formattedPhone.slice(1)}@githogoro.app`

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message === "Invalid login credentials"
        ? t.auth.invalidCredentials
        : loginError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleLogin = async () => {
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

  const handleFacebookLogin = async () => {
    setLoading(true)
    setError("")
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold">{t.auth.loginTitle}</h1>
          <p className="text-zinc-500 mt-1">{t.auth.loginSubtitle}</p>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleIcon />
            <span className="ml-2">{t.auth.continueWithGoogle}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleFacebookLogin}
            disabled={loading}
          >
            <FacebookIcon />
            <span className="ml-2">{t.auth.continueWithFacebook}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <span className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs uppercase text-zinc-400">{t.auth.orDivider}</span>
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
                onBlur={() => { setTouched((p) => ({ ...p, phone: true })); setPhoneError(validatePhone(phone)) }}
                className={`pl-10 ${phoneError ? "border-red-400 focus-visible:ring-red-500" : ""}`}
                maxLength={10}
                required
              />
            </div>
            {phoneError && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {phoneError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">{t.auth.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
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
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.loggingIn : t.auth.login}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-zinc-500">
            {t.auth.noAccount}{" "}
            <Link href="/signup" className="text-emerald-700 font-medium hover:underline">
              {t.auth.signUpLink}
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-emerald-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-emerald-700">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
