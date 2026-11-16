"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  IconArrowRight,
  IconCloud,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { money } from "@/lib/format";
import { publicAsset } from "@/lib/paths";
import { natProcessingComparison } from "@/server/analysis/research-workflows";
import type { Overview } from "@/lib/domain";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const auth =
  url && key
    ? createClient(url, key, { auth: { flowType: "pkce" } }).auth
    : null;
const guestKey = "cloudlens-guest";

function SpendPreview({ overview }: { overview: Overview }) {
  const nat = natProcessingComparison(
    overview.monthRecords,
    overview.previousMonthRecords,
  );
  return (
    <aside className="entry-preview">
      <div className="entry-preview-content">
        <h2>What changed on your AWS bill?</h2>
        {nat.prior.gb > 0 && nat.delta > 0 && (
          <div className="entry-finding">
            <p className="entry-preview-label">Sample NAT cost increase</p>
            <strong className="entry-finding-value num">
              +{money(nat.delta)}
            </strong>
          </div>
        )}
      </div>
      <img
        className="entry-photo"
        src={publicAsset("/cloudlens-data-center.jpg")}
        alt=""
      />
    </aside>
  );
}

export function AccountEntry({
  overview,
  children,
}: {
  overview: Overview;
  children: (leave: () => void, guest: boolean) => ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState(false);
  const [guest, setGuest] = useState(false);
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setGuest(sessionStorage.getItem(guestKey) === "yes");
    } catch {
      // Guest access also works when browser storage is unavailable.
    }
    if (!auth) {
      setReady(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.has("error"))
      setError("Sign-in was interrupted. Please try again.");
    const { data } = auth.onAuthStateChange((_event, session) => {
      setAccount(Boolean(session));
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function enterAsGuest() {
    try {
      sessionStorage.setItem(guestKey, "yes");
    } catch {}
    setGuest(true);
  }

  async function leave() {
    if (account && auth) {
      const { error } = await auth.signOut({ scope: "local" });
      if (error) {
        window.alert("Couldn’t sign out. Please try again.");
        return;
      }
    }
    try {
      sessionStorage.removeItem(guestKey);
    } catch {}
    setGuest(false);
    setError("");
    setMessage("");
  }

  function returnUrl() {
    return window.location.origin + window.location.pathname;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!auth) {
      setError(
        "Account sign-in needs setup. Continue as guest to open the workspace.",
      );
      return;
    }
    const fields = new FormData(event.currentTarget);
    const credentials = {
      email: String(fields.get("email")).trim(),
      password: String(fields.get("password")),
    };
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = signup
        ? await auth.signUp({
            ...credentials,
            options: { emailRedirectTo: returnUrl() },
          })
        : await auth.signInWithPassword(credentials);
      if (result.error) setError(result.error.message);
      else if (signup && !result.data.session)
        setMessage("Check your email for a link to confirm your account.");
    } catch {
      setError("Couldn’t reach sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!auth || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: returnUrl() },
      });
      if (result.error) setError(result.error.message);
    } catch {
      setError("Couldn’t start sign-in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (ready && (account || guest)) return children(leave, !account);

  return (
    <main className="account-entry">
      <div className="entry-left">
        <div className="entry-brand">
          <IconCloud aria-hidden="true" />{" "}
          <span>
            CloudLens<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="entry-form-wrap">
          <h1>{signup ? "Create your account" : "Log in to CloudLens"}</h1>
          <p className="entry-switch">
            {signup ? "Already have an account? " : "New to CloudLens? "}
            <button
              type="button"
              onClick={() => {
                setSignup(!signup);
                setShowPassword(false);
                setError("");
                setMessage("");
              }}
              disabled={busy}
            >
              {signup ? "Log in" : "Sign up"}
            </button>
          </p>
          <form className="entry-form" onSubmit={submit}>
            <label htmlFor="entry-email">Email address</label>
            <input
              id="entry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
            />
            <label htmlFor="entry-password">Password</label>
            <div className="entry-password">
              <input
                key={signup ? "new" : "current"}
                id="entry-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                minLength={signup ? 8 : undefined}
                required
                disabled={busy}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                disabled={busy}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {signup && <small>Use at least 8 characters.</small>}
            {error && (
              <p className="entry-error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="entry-note" role="status">
                {message}
              </p>
            )}
            <button className="button primary" disabled={!ready || busy}>
              {signup ? "Create account" : "Log in"}
            </button>
          </form>
          <div className="entry-social">
            <button
              className="button secondary"
              onClick={signInWithGoogle}
              disabled={!auth || !ready || busy}
            >
              <img
                src={publicAsset("/google-sign-in.png")}
                width={18}
                height={18}
                alt=""
              />
              Continue with Google
            </button>
          </div>
          {!auth && (
            <p className="entry-note">
              Account sign-in is unavailable in this preview.
            </p>
          )}
          <div className="entry-divider">or</div>
          <button
            className="button secondary entry-guest"
            type="button"
            onClick={enterAsGuest}
          >
            Continue as guest <IconArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <SpendPreview overview={overview} />
    </main>
  );
}
