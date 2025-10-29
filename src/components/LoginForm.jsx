import { useState } from "react";
import { useNavigate } from "react-router-dom";
import asdmLogo from "../assets/asdm-logo3.png";
import { FaUserAlt, FaLock } from "react-icons/fa";
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
    setError("");
    setIsLoading(true);

    try {
      const credentials = {
        user: username,
        password: password
      };

      const response = await login(credentials);
      
      // Check if login was successful
      if (response.status === "true" || response.status === true) {
        // Navigate to dashboard on successful login
      navigate("/dashboard");
    } else {
        // Handle failed login
        setError(response.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-lg border border-green-500 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={asdmLogo} alt="ASDM Logo" className="h-20 mb-2" />
          <h2 className="text-lg font-bold text-blue-700 text-center">
            Assam Skill Development Mission
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Call Center CRM
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
            <FaUserAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full outline-none bg-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
            <FaLock className="text-gray-500 mr-2" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none bg-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-semibold py-2 rounded ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
