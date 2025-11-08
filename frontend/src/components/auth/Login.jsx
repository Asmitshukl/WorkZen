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
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);

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
        otp: formData.otp || undefined,
      };

      const response = await loginAPI(payload);

      if (response?.requiresOTP) {
        setRequiresOTP(true);
        showSuccess("OTP sent to your email");
      } else if (response?.token && response?.user) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Login ID or Email"
            name="loginId"
            type="text"
            placeholder="Enter your login ID or email"
            value={formData.loginId}
            onChange={handleChange}
            icon={Mail}
            required
            disabled={requiresOTP}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            required
            disabled={requiresOTP}
          />

          {requiresOTP && (
            <Input
              label="OTP"
              name="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
              required
            />
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={LogIn}
          >
            {requiresOTP ? "Verify OTP & Login" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            First time here?{" "}
            <a
              href="/setup-admin"
              className="text-blue-600 hover:text-blue-700 font-medium"
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