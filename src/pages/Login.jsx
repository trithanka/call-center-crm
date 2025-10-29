import React from "react";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
