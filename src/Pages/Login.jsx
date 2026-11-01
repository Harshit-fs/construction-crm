import API_BASE_URL from "../apiConfig";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [rememberMe, setRememberMe] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

// =====================================
// LOGIN
// =====================================

const handleLogin = async (e) => {
e.preventDefault();


try {
  setLoading(true);

  const response = await axios.post(
    `${API_BASE_URL}/user/login`,
    {
      email,
      password,
    }
  );

  const loggedInUser = response.data.user;

  localStorage.setItem(
    "user",
    JSON.stringify(loggedInUser)
  );
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  if (rememberMe) {
    localStorage.setItem(
      "rememberEmail",
      email
    );
  } else {
    localStorage.removeItem(
      "rememberEmail"
    );
  }

  navigate("/");

} catch (error) {
  console.log("LOGIN ERROR:", error);
  
  alert(
    error.response?.data?.message ||
    "Login failed"
  );
} finally {
  setLoading(false);
}


};

// =====================================
// GOOGLE LOGIN
// =====================================

const handleGoogleLogin = () => {
alert("Google login will be added later.");
};

// =====================================
// GITHUB LOGIN
// =====================================

const handleGithubLogin = () => {
alert("GitHub login will be added later.");
};

// =====================================
// REGISTER
// =====================================

const handleRegister = (e) => {
e.preventDefault();
alert("Account registration is managed by the administrator.");
};

// =====================================
// FORGOT PASSWORD
// =====================================

const handleForgotPassword = (e) => {
e.preventDefault();


alert(
  "Forgot password feature will be added later."
);


};

// =====================================
// RETURN
// =====================================

return ( <div className="login-wrapper">


  {/* Background Shapes */}

  <div className="login-bg-shape login-bg-shape-1"></div>

  <div className="login-bg-shape login-bg-shape-2"></div>


  {/* Main Login Card */}

  <div className="login-card">


    {/* Brand */}

    <a
      href="/login"
      className="login-brand text-decoration-none"
      onClick={(e) => e.preventDefault()}
    >

      <i className="bi bi-asterisk"></i>

      <span>
        Construction CRM
      </span>

    </a>


    {/* Subtitle */}

    <p className="login-subtitle">
      Please sign in to access your dashboard
    </p>


    {/* Login Form */}

    <form
      onSubmit={handleLogin}
      className="needs-validation"
    >


      {/* Email */}

      <div className="login-form-group">

        <label
          htmlFor="email"
          className="login-form-label"
        >
          Email Address
        </label>


        <div className="login-input-group">

          <i className="bi bi-envelope input-icon"></i>

          <input
            type="email"
            id="email"
            className="login-input"
            placeholder="name@company.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

        </div>

      </div>


      {/* Password */}

      <div className="login-form-group">

        <label
          htmlFor="password"
          className="login-form-label"
        >
          Password
        </label>


        <div className="login-input-group">

          <i className="bi bi-shield-lock input-icon"></i>


          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            id="password"
            className="login-input login-input-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          <button
            type="button"
            className="password-toggle-btn"
            id="toggle-password"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
          >

            <i
              className={
                showPassword
                  ? "bi bi-eye-slash"
                  : "bi bi-eye"
              }
            ></i>

          </button>

        </div>

      </div>


      {/* Remember Me + Forgot Password */}

      <div className="login-options">

        <label className="custom-control-label">

          <input
            type="checkbox"
            className="custom-checkbox-input"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) =>
              setRememberMe(
                e.target.checked
              )
            }
          />

          <span>
            Remember Me
          </span>

        </label>


        <a
          href="#"
          className="forgot-password-link"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </a>

      </div>


      {/* Submit */}

      <button
        type="submit"
        className="btn-login"
        id="btn-submit"
        disabled={loading}
      >

        {loading ? (

          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>

            <span>
              Signing In...
            </span>
          </>

        ) : (

          <>
            <span>
              Sign In to Dashboard
            </span>

            <i className="bi bi-arrow-right"></i>
          </>

        )}

      </button>


    </form>



   


  </div>

</div>


);
}

export default Login;
