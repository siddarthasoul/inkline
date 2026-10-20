"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/mutations/useAuthMutations";
import { ApiError } from "@/lib/api-errors";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    }
  }

  return (
    <main className="login-page">
      <div className="login-panel">
        <Link href="/" className="login-brand">
          inkline<span>.</span>
        </Link>

        <p className="login-eyebrow">OWNER ACCESS</p>
        <h1 className="login-title">Welcome back.</h1>
        <p className="login-description">
          Sign in to create, edit, and publish your stories.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link href="/" className="login-back-link">
          ← Back to stories
        </Link>
      </div>
    </main>
  );
}
