"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
  type AuthFormState,
} from "@/app/auth/actions";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "update-password";

type AuthFormProps = {
  mode: AuthMode;
  notice?: string;
};

const initialState: AuthFormState = {};

const copy: Record<AuthMode, { title: string; subtitle: string; button: string }> = {
  "sign-in": {
    title: "Welcome back.",
    subtitle: "Sign in to find your place in the journey.",
    button: "Sign in",
  },
  "sign-up": {
    title: "Find your way in.",
    subtitle: "Join a community made for the in-between.",
    button: "Create account",
  },
  "forgot-password": {
    title: "A fresh start.",
    subtitle: "We’ll send you a secure link to reset your password.",
    button: "Send reset link",
  },
  "update-password": {
    title: "Set a new password.",
    subtitle: "Choose a new password for your account.",
    button: "Update password",
  },
};

export function AuthForm({ mode, notice }: AuthFormProps) {
  const action =
    mode === "sign-in"
      ? signInAction
      : mode === "sign-up"
        ? signUpAction
        : mode === "forgot-password"
          ? requestPasswordResetAction
          : updatePasswordAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const content = copy[mode];

  return (
    <div className="auth-content">
      <Link aria-label="The Transit Club home" className="auth-brand" href="/">
        <Image alt="" height={49} src="/logo/logo.png" width={76} />
        <span>THE TRANSIT CLUB</span>
      </Link>
      <section className="auth-card">
        <p className="eyebrow">The Transit Club / Member access</p>
        <h1>{content.title}</h1>
        <p className="auth-subtitle">{content.subtitle}</p>

        {notice && <p className="form-notice">{notice}</p>}
        {state.error && (
          <p aria-live="polite" className="form-message form-error" role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p aria-live="polite" className="form-message form-success" role="status">
            {state.success}
          </p>
        )}

        <form action={formAction} className="auth-form">
          {mode === "sign-up" && (
            <div className="name-fields">
              <label>
                First name
                <input
                  autoComplete="given-name"
                  name="firstName"
                  placeholder="First name"
                  required
                />
              </label>
            <label>
              Last name
              <input
                autoComplete="family-name"
                name="lastName"
                placeholder="Last name"
                required
              />
            </label>
            </div>
          )}

          {mode !== "update-password" && (
            <label>
              Email address
              <input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
          )}

          {(mode === "sign-in" || mode === "sign-up") && (
            <label>
              Password
              <input
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                name="password"
                placeholder={
                  mode === "sign-up"
                    ? "At least 10 characters"
                    : "Your password"
                }
                required
                type="password"
              />
            </label>
          )}

          {mode === "update-password" && (
            <>
              <label>
                New password
                <input
                  autoComplete="new-password"
                  name="password"
                  placeholder="At least 10 characters"
                  required
                  type="password"
                />
              </label>
              <label>
                Confirm new password
                <input
                  autoComplete="new-password"
                  name="confirmPassword"
                  placeholder="Enter your new password again"
                  required
                  type="password"
                />
              </label>
            </>
          )}

          <button
            className="button button-primary auth-submit"
            disabled={isPending}
          >
            {isPending ? "Please wait…" : content.button}
          </button>
        </form>

        <div className="auth-links">
          {mode === "sign-in" && (
            <>
              <Link href="/auth/forgot-password">Forgot your password?</Link>
              <p>
                New around here?{" "}
                <Link href="/auth/sign-up">Create an account</Link>
              </p>
            </>
          )}
          {mode === "sign-up" && (
            <p>
              Already a member? <Link href="/auth/sign-in">Sign in</Link>
            </p>
          )}
          {mode === "forgot-password" && (
            <p>
              Remembered it? <Link href="/auth/sign-in">Back to sign in</Link>
            </p>
          )}
          {mode === "update-password" && (
            <p>
              <Link href="/auth/sign-in">Back to sign in</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
