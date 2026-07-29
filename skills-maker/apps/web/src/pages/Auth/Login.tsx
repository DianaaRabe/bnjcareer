import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";

import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "./useLogin";

export function Login() {
  const {
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
  } = useLogin();
  const intl = useIntl();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground">
            S
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              <FormattedMessage id="auth.login.title" />
            </h1>
            <p className="text-sm text-muted-foreground">
              <FormattedMessage
                id="auth.login.subtitle"
                values={{
                  appName: intl.formatMessage({ id: "app.name" }),
                }}
              />
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <FormattedMessage id="auth.login.email.label" />
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={intl.formatMessage({
                    id: "auth.login.email.placeholder",
                  })}
                  required
                  className="pl-9"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">
                  <FormattedMessage id="auth.login.password.label" />
                </Label>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:text-primary-hover"
                >
                  <FormattedMessage id="auth.login.password.forgot" />
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={intl.formatMessage({
                    id: showPassword
                      ? "auth.login.password.hide"
                      : "auth.login.password.show",
                  })}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <FormattedMessage
                id={loading ? "auth.login.submit.loading" : "auth.login.submit"}
              />
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              <FormattedMessage id="common.or" />
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            <FormattedMessage id="auth.login.google" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <FormattedMessage id="auth.login.signup.prompt" />{" "}
            <a
              href="#"
              className="font-medium text-primary hover:text-primary-hover"
            >
              <FormattedMessage id="auth.login.signup.link" />
            </a>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            <FormattedMessage
              id="auth.login.legal"
              values={{
                terms: (
                  <a href="#" className="underline hover:text-foreground">
                    <FormattedMessage id="auth.login.legal.terms" />
                  </a>
                ),
                privacy: (
                  <a href="#" className="underline hover:text-foreground">
                    <FormattedMessage id="auth.login.legal.privacy" />
                  </a>
                ),
              }}
            />
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
