import { useState, type FormEvent } from "react";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useRegisterMutation } from "@/graphql/hooks/auth";
import { useTranslate } from "@/hooks/useTranslate";
import { getGraphQLErrorCode } from "@/lib/apollo";
import { setToken } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export type AuthMode = "login" | "register";

export function useLogin() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const [login, { loading: loginLoading, error: loginError }] = useLoginMutation();
  const [register, { loading: registerLoading, error: registerError }] = useRegisterMutation();

  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const { translate } = useTranslate();

  const isRegister = mode === "register";
  const loading = isRegister ? registerLoading : loginLoading;
  const currentError = isRegister ? registerError : loginError;

  const errorMessage =
    googleError ||
    (currentError
      ? translate(
          isRegister
            ? getGraphQLErrorCode(currentError) === "BAD_USER_INPUT"
              ? "auth.register.error.emailExists"
              : "auth.register.error.unexpected"
            : getGraphQLErrorCode(currentError) === "BAD_USER_INPUT"
              ? "auth.login.error.invalidCredentials"
              : "auth.login.error.unexpected",
        )
      : null);

  const togglePasswordVisibility = () => setShowPassword((v) => !v);
  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setGoogleError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setGoogleError(null);
    try {
      if (isRegister) {
        const { data } = await register({
          variables: { input: { email, password } },
        });
        if (data?.register.token) {
          setToken(data.register.token);
          await apolloClient.clearStore();
          navigate("/");
        }
      } else {
        const { data } = await login({
          variables: { input: { email, password } },
        });
        if (data?.login.token) {
          setToken(data.login.token);
          await apolloClient.clearStore();
          navigate("/");
        }
      }
    } catch {
      // surfaced via the mutation's `error` state
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setGoogleError(oauthError.message);
      }
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : "Erreur de connexion Google");
    }
  };

  return {
    mode,
    isRegister,
    toggleMode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    togglePasswordVisibility,
    loading,
    errorMessage,
    handleSubmit,
    handleGoogleSignIn,
  };
}
