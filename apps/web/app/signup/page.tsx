"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

// Define the API function - replace with your actual API endpoint
const sendMagicLink = async (email: string) => {
  // Replace this with your actual API call
  // Example:
  // const response = await fetch('/api/auth/magic-link', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ email }),
  // });
  // if (!response.ok) {
  //   throw new Error('Failed to send magic link');
  // }
  // return response.json();

  // Simulate API call for now
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: `Magic link sent to ${email}` };
};

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: sendMagicLink,
    onSuccess: () => {
      // Clear any previous errors
      setEmailError("");
    },
    onError: (error) => {
      // Handle error if needed
      console.error("Error sending magic link:", error);
    },
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-4xl p-8 border-1 border-gray-200 dark:border-black/10">
          <div className="text-center mb-8">
            <div className="mx-auto bg-primary/10 text-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Exness</h1>
            <p className="text-muted-foreground">
              Enter your email to receive a magic link for authentication
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6 text-center">
              <div className="mx-auto bg-green-500/20 text-green-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground mb-1">Magic link sent!</h3>
              <p className="text-muted-foreground text-sm">
                We've sent a magic link to <span className="font-medium">{email}</span>. Check your inbox and click the link to sign in.
              </p>
              <button
                onClick={() => mutate(email)}
                disabled={isPending}
                className="mt-4 text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isPending ? "Resending..." : "Resend link"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  disabled={isPending}
                  className={`w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-colors ${emailError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="you@example.com"
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-black text-white py-4 px-4 rounded-xl font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center justify-center border border-gray-300 dark:border-gray-600"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Magic Link...
                  </>
                ) : (
                  "Send Magic Link"
                )}
              </button>
            </form>
          )}

          {isError && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300">
              Failed to send magic link. Please try again.
            </div>
          )}

          {/* <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div> */}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}