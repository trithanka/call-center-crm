import { useState } from "react";
import { useNavigate } from "react-router-dom";
import asdmLogo from "../assets/asdm-logo3.png";
import loginAsset from "../assets/crm-asset.png";
import * as Lu from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous error
    setIsLoading(true); // Disable the button & show loading state

    try {
      const credentials = {
        user: username.trim(),
        password: password.trim(),
      };

      const response = await login(credentials);

      // 🟢 Handle successful login
      if (response?.status === true || response?.status === "true") {
        navigate("/dashboard");
        return;
      }

      // 🔴 Handle known login failure
      let message =
        response?.message?.trim() || "Login failed. Please try again.";

      // Add more engaging fallback messages
      if (/invalid/i.test(message)) {
        message =
          "Invalid username or password. Please double-check your details.";
      } else if (/inactive/i.test(message)) {
        message =
          "Your account appears to be inactive. Contact the administrator for help.";
      }

      setError(message);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message);
      
    } finally {
      setIsLoading(false); // Re-enable the button
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-neutral-100">
      <div className="w-full max-w-4xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT SIDE — Login Form */}
          <div className="px-10 flex flex-col justify-center">
            <div className="flex flex-col items-start mb-4">
              <div className="flex items-center gap-1 mb-12">
                <img src={asdmLogo} alt="ASDM Logo" className="h-10" />
                <div className="">
                  <p className="text-2xl font-medium">Call Center CRM</p>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-medium text-gray-900 leading-tight">
                For Every <span className="text-emerald-600">Voice</span>, a
                Resolution
              </h2>
              <p className="text-gray-500 text-base font-medium mt-4">
                Empowering citizens through prompt grievance redressal and
                continuous improvement.
              </p>
            </div>

            {/* Error message container */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out transform
                ${
                  error
                    ? "max-h-32 opacity-100 translate-y-0 mb-4"
                    : "max-h-0 opacity-0 -translate-y-2"
                }
              `}
            >
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm leading-snug shadow-sm">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div className="flex items-center w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-within:outline-none focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <Lu.LuUser className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-700"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus-within:outline-none focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
                <Lu.LuKeyRound className="text-gray-500 mr-2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none bg-transparent text-gray-700"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? "Logging In..." : "Login"}
              </button>
            </form>
            <div className="pt-6 text-gray-500 text-sm text-center">
              Access restricted to authorized personnel.{" "}
              <span className="text-emerald-600">
                Reach out to the admin for credentials
              </span>
              .
            </div>
          </div>

          {/* RIGHT SIDE — Illustration */}
          <div className="bg-neutral-700 flex items-center justify-center relative rounded-3xl">
            <img
              src={loginAsset}
              alt="Call Center Illustration"
              className="w-3/4 md:w-5/6 h-auto drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
