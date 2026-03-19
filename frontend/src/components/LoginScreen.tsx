"use client";

import { useState, type FormEvent } from "react";

type LoginScreenProps = {
  onLogin: (username: string, password: string) => boolean;
};

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = onLogin(username.trim(), password);

    if (!isValid) {
      setError("Invalid credentials. Use user/password.");
      return;
    }

    setError(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,_rgba(32,157,215,0.25)_0%,_rgba(32,157,215,0.05)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[520px] w-[520px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,_rgba(117,57,145,0.18)_0%,_rgba(117,57,145,0.05)_55%,_transparent_75%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
        <section className="rounded-[32px] border border-[var(--stroke)] bg-white/80 p-10 shadow-[var(--shadow)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--gray-text)]">
            Project Management MVP
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-[var(--navy-dark)]">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
            Sign in to access your Kanban board. Use the demo credentials to
            continue.
          </p>

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm"
                placeholder="user"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--gray-text)]"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm"
                placeholder="password"
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-[var(--secondary-purple)]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-2 rounded-full bg-[var(--secondary-purple)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:opacity-90"
            >
              Sign in
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};
