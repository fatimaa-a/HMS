import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);

      if (user) {
        navigate(`/${user.role}/dashboard`);
      }
    } catch (error) {
      console.error(error);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">

      <aside className="login-aside">
        <div className="login-aside-top">
          <div className="login-logo">+</div>

          <div>
            <h1>HMS</h1>
            <span>Hospital Management System</span>
          </div>
        </div>

        <div className="login-aside-content">
          <span className="login-eyebrow">HOSPITAL MANAGEMENT</span>

          <h2>
            Welcome
            <br />
            back.
          </h2>

          <p>
            Securely access your hospital workspace,
            appointments, records, and patient information.
          </p>
        </div>

        <div className="login-aside-footer">
          <span>Hospital Management System</span>
          <span>2026</span>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-form-wrapper">

          <div className="login-heading">
            <span className="login-step">SECURE ACCESS</span>

            <h2>Sign in to HMS</h2>

            <p>
              Enter your credentials to continue.
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            <div className="auth-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="button-spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          <div className="login-register">
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Login;