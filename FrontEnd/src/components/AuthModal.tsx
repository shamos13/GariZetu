import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    X,
    Mail,
    Lock,
    User,
    Phone,
    Eye,
    EyeOff,
    ArrowRight,
    Check,
    AlertCircle
} from "lucide-react";
import { authService } from "../services/AuthService";
import type { RegisterRequest, LoginRequest } from "../services/AuthService";

/**
 * AuthModal Component - Now Connected to Real Backend!
 *
 * This modal handles both user registration and login.
 * It talks to your Spring Boot backend through the authService.
 *
 * Key changes from the mock version:
 * 1. Replaced setTimeout with actual API calls
 * 2. Added proper error handling
 * 3. Stores JWT token on successful login
 * 4. Shows backend error messages to user
 */

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    onLoginSuccess?: () => void;  // Optional callback after successful login
}

export function AuthModal({
                              isOpen,
                              onClose,
                              initialMode = "login",
                              onLoginSuccess
                          }: AuthModalProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState<"login" | "signup">(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [signupForm, setSignupForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const loginData: LoginRequest = {
                email: loginForm.email,
                password: loginForm.password,
            };

            const response = await authService.login(loginData);
            console.log("✅ Login successful:", response);

            // Call the callback first (updates navbar state)
            onLoginSuccess?.();
            onClose();

            // Redirect to dashboard
            navigate("/dashboard");

        } catch (err: any) {
            setError(err.message || "Login failed. Please try again.");
            console.error("❌ Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (signupForm.password !== signupForm.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!signupForm.agreeToTerms) {
            setError("Please agree to the terms and conditions");
            return;
        }

        if (signupForm.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);

        try {
            const registerData: RegisterRequest = {
                userName: signupForm.fullName,
                email: signupForm.email,
                password: signupForm.password,
                phoneNumber: signupForm.phone || undefined,
            };

            const response = await authService.register(registerData);
            console.log("✅ Registration successful:", response);

            setSuccessMessage(response.message);

            setSignupForm({
                fullName: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
                agreeToTerms: false
            });

            setTimeout(() => {
                setMode("login");
                setSuccessMessage(null);
                setLoginForm({ ...loginForm, email: signupForm.email });
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
            console.error("❌ Registration error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (newMode: "login" | "signup") => {
        setMode(newMode);
        setError(null);
        setSuccessMessage(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-300">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 pt-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4">
                                <span className="text-2xl">🚗</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {mode === "login" ? "Welcome Back" : "Join GariZetu"}
                            </h2>
                            <p className="text-white/60 text-sm mt-2">
                                {mode === "login"
                                    ? "Sign in to access your account"
                                    : "Create an account to get started"
                                }
                            </p>
                        </div>

                        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                            <button
                                onClick={() => switchMode("login")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                    mode === "login"
                                        ? "bg-white text-gray-900 shadow-lg"
                                        : "text-white/70 hover:text-white"
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => switchMode("signup")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                                    mode === "signup"
                                        ? "bg-white text-gray-900 shadow-lg"
                                        : "text-white/70 hover:text-white"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        {successMessage && (
                            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-200 text-sm">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {mode === "login" && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="email"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={loginForm.rememberMe}
                                            onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-white/60">Remember me</span>
                                    </label>
                                    <button type="button" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {mode === "signup" && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="text"
                                            value={signupForm.fullName}
                                            onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                                            placeholder="John Doe"
                                            required
                                            minLength={5}
                                            maxLength={15}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">5-15 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="email"
                                            value={signupForm.email}
                                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Phone Number (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="tel"
                                            value={signupForm.phone}
                                            onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                                            placeholder="+254 712 345 678"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={signupForm.password}
                                            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">Minimum 8 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={signupForm.confirmPassword}
                                            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {signupForm.password && signupForm.confirmPassword && (
                                    <div className={`flex items-center gap-2 text-sm ${
                                        signupForm.password === signupForm.confirmPassword
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                    }`}>
                                        {signupForm.password === signupForm.confirmPassword ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Passwords match
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                Passwords do not match
                                            </>
                                        )}
                                    </div>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={signupForm.agreeToTerms}
                                        onChange={(e) => setSignupForm({ ...signupForm, agreeToTerms: e.target.checked })}
                                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-white/60">
                                        I agree to the{" "}
                                        <a href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</a>
                                        {" "}and{" "}
                                        <a href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="px-8 py-4 bg-white/5 border-t border-white/10 text-center">
                        <p className="text-sm text-white/50">
                            {mode === "login" ? (
                                <>
                                    Don't have an account?{" "}
                                    <button
                                        onClick={() => switchMode("signup")}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                                    >
                                        Sign up for free
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => switchMode("login")}
                                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}