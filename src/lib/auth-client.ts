"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState } from "react"

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  basePath: "/api/auth",
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : ""}`,
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token")
      if(authToken){
        const tokenPart = authToken.includes('.') ? authToken.split('.')[0] : authToken;
        localStorage.setItem("bearer_token", tokenPart);
      }
    },
    // CRITICAL: Prevent automatic redirects
    onError: (ctx) => {
      // Suppress redirect errors
      return;
    }
  },
});

type SessionData = ReturnType<typeof authClient.useSession>

export function useSession(): SessionData {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);

  const refetch = () => {
    setIsPending(true);
    setError(null);
    fetchSession();
  };

  const fetchSession = async () => {
    try {
      const res = await authClient.getSession({
        fetchOptions: {
          auth: {
            type: "Bearer",
            token: typeof window !== 'undefined' ? localStorage.getItem("bearer_token") || "" : "",
          },
        },
      });
      setSession(res.data);
      setError(null);
    } catch (err) {
      setSession(null);
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { data: session, isPending, error, refetch };
}