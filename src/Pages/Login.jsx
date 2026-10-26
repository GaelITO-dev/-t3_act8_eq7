import { useState } from "react";
import fondo from "../assets/Fondo.PNG";
import "./Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    usernameErrorVacio: "",
    passwordErrorVacio: "",
  });
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = { usernameErrorVacio: "", passwordErrorVacio: "" };

    if (username.trim() === "") newErrors.usernameErrorVacio = "Ingresa tu usuario";
    if (password.trim() === "") newErrors.passwordErrorVacio = "Ingresa tu contraseña";

    setFieldErrors(newErrors);
    setServerError("");

    if (newErrors.usernameErrorVacio || newErrors.passwordErrorVacio) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          expiresInMins: 30,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No fue posible iniciar sesión.");
      }

      onLogin(data);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servicio de inicio de sesión.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="login__card">
        <h1 className="login__title">¿Hambre de pizza?</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label className="login__label" htmlFor="username">Usuario</label>
          <div className="login__field">
            <svg className="login__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="emilys"
              value={username}
              onChange={(alguienEscribeAlgo) => setUsername(alguienEscribeAlgo.target.value)}
            />
          </div>
          <p className="login__error">{fieldErrors.usernameErrorVacio}</p>

          <label className="login__label" htmlFor="password">Contraseña</label>
          <div className="login__field">
            <svg className="login__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login__eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="M4 4l16 16" />}
              </svg>
            </button>
          </div>
          <p className="login__error">{fieldErrors.passwordErrorVacio}</p>

          <p className="login__demo">Acceso de prueba: emilys / emilyspass</p>

          {serverError && <p className="login__error login__error--server">{serverError}</p>}

          <button type="submit" className="login__submit" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Entrar"}
          </button>
        </form>

        <div className="login__divider"><span>o</span></div>

        {/* Botones de redes sociales, los voy a cambiar por iconos, es la primer prueba */}
        <div className="login__social">
          <button type="button" className="login__social-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8z" />
              <path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.8A11 11 0 0012 23z" />
              <path fill="#FBBC05" d="M6 14.1a6.6 6.6 0 010-4.2V7.1H2.4a11 11 0 000 9.8L6 14.1z" />
              <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 002.4 7.1L6 9.9c.8-2.6 3.2-4.5 6-4.5z" />
            </svg>
            Google
          </button>
          <button type="button" className="login__social-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#1877F2" />
              <path fill="#fff" d="M13.4 22v-8h2.7l.4-3.2h-3.1V8.9c0-.9.3-1.5 1.600-1.500h1.700V4.500c-.3 0-1.300-.1-2.400-.1-2.400 0-4 1.400-4 4.100v2.300H7.600V14h2.700v8h3.100z" />
            </svg>
            Facebook
          </button>
        </div>

        <p className="login__signup">
          ¿No tienes cuenta? <a href="#">Regístrate</a>
        </p>
      </div>
    </div>
  );
}