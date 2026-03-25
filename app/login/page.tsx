"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}