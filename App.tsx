import React, { useEffect, useState } from "react";
import { supabase } from "./src/supabase";
import { Session } from "@supabase/supabase-js";
import AppNavigator from "./src/navigation/AppNavigator";
import LoginScreen from "./src/screens/LoginScreen";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return session ? <AppNavigator /> : <LoginScreen />;
}
