// src/components/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { login as loginAPI } from "@api/authAPI";
import { useAuth } from "@hooks/useAuth";
import { useNotification } from "@hooks/useNotification";
import Input from "@components/common/Input";
import Button from "@components/common/Button";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        loginId: formData.loginId,
        email: formData.loginId,
        password: formData.password,
      };

      const response = await loginAPI(payload);

      if (response?.token && response?.user) {
        login(response.token, response.user);
        showSuccess("Login successful!");

        if (response.mustChangePassword) {
          navigate("/change-password");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      showError(error?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Patrick+Hand&display=swap');
        
        .sketch-card {
          font-family: 'Patrick Hand', cursive;
          background: white;
          border: 3px solid #2d2d2d;
          border-radius: 8px;
          box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.15);
          position: relative;
        }
        
        .sketch-card::before {
          content: '★';
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 24px;
          color: #d1d5db;
        }
        
        .sketch-card::after {
          content: '♥';
          position: absolute;
          bottom: 15px;
          left: 20px;
          font-size: 20px;
          color: #fca5a5;
        }
        
        .sketch-title {
          font-family: 'Caveat', cursive;
          font-size: 2.5rem;
          font-weight: 700;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }
        
        .sketch-input {
          font-family: 'Patrick Hand', cursive;
          border: 2px solid #2d2d2d;
          border-radius: 6px;
          padding: 12px 16px;
          font-size: 16px;
          background: white;
          transition: all 0.2s;
        }
        
        .sketch-input:focus {
          outline: none;
          border-color: #2d2d2d;
          box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.1);
        }
        
        .sketch-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .sketch-button {
          font-family: 'Patrick Hand', cursive;
          background: #2d2d2d;
          color: white;
          border: 3px solid #2d2d2d;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:active:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        }
        
        .sketch-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .sketch-label {
          font-family: 'Patrick Hand', cursive;
          font-size: 16px;
          font-weight: 600;
          color: #2d2d2d;
          margin-bottom: 6px;
          display: block;
        }
        
        .sketch-link {
          font-family: 'Patrick Hand', cursive;
          color: #3b82f6;
          text-decoration: underline;
          text-decoration-style: wavy;
          text-underline-offset: 3px;
        }
        
        .sketch-link:hover {
          color: #2563eb;
        }
      `}</style>
      
      <div className="sketch-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="sketch-title text-gray-900 mb-2">
            Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="sketch-label">
              Username
            </label>
            <input
              name="loginId"
              type="text"
              placeholder="Enter your username"
              value={formData.loginId}
              onChange={handleChange}
              className="sketch-input w-full"
              required
            />
          </div>

          <div>
            <label className="sketch-label">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="sketch-input w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="sketch-button w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            Log In →
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ fontFamily: 'Patrick Hand, cursive', color: '#6b7280' }}>
            First time here?{" "}
            <a
              href="/setup-admin"
              className="sketch-link font-medium"
            >
              Setup Admin Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;