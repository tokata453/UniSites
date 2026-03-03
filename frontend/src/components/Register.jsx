import { useState } from "react";
// 1. Import useNavigate and Link for routing
import { useNavigate, Link } from "react-router-dom"; 
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

// 2. Import your auth service
import { authService } from "@/services/authentication"; 

export default function Register() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [touched, setTouched] = useState({});
  
  // 3. Add state for API handling
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBlur = (name) => {
    setFocused(null);
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Validation logic
  const errors = {
    firstName: touched.firstName && !form.firstName ? "Please input your first name" : "",
    lastName: touched.lastName && !form.lastName ? "Please input your last name" : "",
    email: touched.email && !form.email ? "Please input your email" : "",
    password:
      touched.password && !form.password
        ? "Please input your password"
        : touched.password && form.password.length < 6
        ? "Password must have at least 6 characters"
        : "",
  };

  const inputClass = (name) => {
    const hasError = !!errors[name];
    const isFocused = focused === name;
    return `w-full px-4 py-3 rounded-xl text-sm text-slate-800 border outline-none transition-all duration-200 ${
      hasError
        ? "border-red-400 bg-red-50"
        : isFocused
        ? "border-sky-400 bg-sky-50"
        : "border-slate-200 bg-white"
    }`;
  };

  // 4. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any frontend validation errors before sending to API
    if (errors.firstName || errors.lastName || errors.email || errors.password) {
      // Force all fields to show touched so the user sees the red outlines
      setTouched({ firstName: true, lastName: true, email: true, password: true });
      return; 
    }

    // Double check that fields aren't completely empty
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setApiError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Pack the data to match your API requirements
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: "+855000000000" // Temporary placeholder until you add a phone input to the UI
      };

      const result = await authService.register(userData);

      if (result.success) {
        // Save the token/user and redirect to the home page
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/");
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setApiError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-100 via-blue-50 to-sky-100 p-5 font-sans w-full">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create an Account</h1>
          <p className="text-slate-500 text-sm">Please sign up below to create an account.</p>
        </div>

        {/* Display API Errors */}
        {apiError && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm text-center">
            {apiError}
          </div>
        )}

        {/* 5. Wrap the inputs in a form and attach handleSubmit */}
        <form onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handle}
                  onFocus={() => setFocused("firstName")}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="Enter first name"
                  disabled={isLoading}
                  className={`${inputClass("firstName")} ${errors.firstName ? "pr-10" : ""}`}
                />
                {errors.firstName && (
                  <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
                )}
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handle}
                  onFocus={() => setFocused("lastName")}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Enter last name"
                  disabled={isLoading}
                  className={`${inputClass("lastName")} ${errors.lastName ? "pr-10" : ""}`}
                />
                {errors.lastName && (
                  <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
                )}
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                onFocus={() => setFocused("email")}
                onBlur={() => handleBlur("email")}
                placeholder="Enter email address"
                disabled={isLoading}
                className={`${inputClass("email")} ${errors.email ? "pr-10" : ""}`}
              />
              {errors.email && (
                <FiAlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              )}
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handle}
                onFocus={() => setFocused("password")}
                onBlur={() => handleBlur("password")}
                placeholder="Enter password"
                disabled={isLoading}
                className={`${inputClass("password")} ${errors.password ? "pr-16" : "pr-12"}`}
              />
              {errors.password && (
                <FiAlertCircle className="absolute right-9 top-1/2 -translate-y-1/2 text-red-400" size={18} />
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            By signing up I agree to Electronic Store's{" "}
            <a href="#" className="text-sky-500 font-medium hover:underline">Privacy Policy</a>{" "}
            and{" "}
            <a href="#" className="text-sky-500 font-medium hover:underline">Terms & Conditions</a>
          </p>

          {/* Sign up button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-linear-to-r from-sky-400 to-blue-500 text-white font-semibold text-base tracking-wide hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-slate-400 text-xs mb-4">
          <div className="flex-1 h-px bg-slate-200" />
          or sign up with
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* 6. Attach OAuth logic to Social buttons */}
        <div className="flex gap-3 mb-6">
          <button 
            type="button" 
            onClick={() => authService.loginWithGoogle()}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 bg-white hover:border-sky-400 hover:bg-sky-50 hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <FcGoogle size={20} /> Google
          </button>
          <button 
            type="button"
            onClick={() => authService.loginWithFacebook()}
            disabled={isLoading} 
            className="flex-1 flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 bg-white hover:border-sky-400 hover:bg-sky-50 hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <FaFacebook size={20} color="#1877F2" /> Facebook
          </button>
        </div>

        {/* 7. Change to React Router Link */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-500 font-medium hover:underline">Login</Link>
        </p>

      </div>
    </div>
  );
}