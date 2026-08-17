import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/graphql/hooks/auth";
import { useTranslate } from "@/hooks/useTranslate";
import { getGraphQLErrorCode } from "@/lib/apollo";
import { setToken } from "@/lib/auth";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { loading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const { translate } = useTranslate();

  // Server messages are not localized — map the error code to a translated string instead.
  const errorMessage = error
    ? translate(
        getGraphQLErrorCode(error) === "BAD_USER_INPUT"
          ? "auth.login.error.invalidCredentials"
          : "auth.login.error.unexpected",
      )
    : null;

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await login({
        variables: { input: { email, password } },
      });
      if (data?.login.token) {
        setToken(data.login.token);
        navigate("/");
      }
    } catch {
      // surfaced via the mutation's `error` state below
    }
  };

  // TODO: wire to the real Google OAuth flow once the backend mutation exists.
  const handleGoogleSignIn = () => {
    console.warn("Google sign-in is not wired yet.");
  };

  return {
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
