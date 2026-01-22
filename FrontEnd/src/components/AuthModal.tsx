import { useState, useEffect } from "react";
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
    AlertCircle,
    Shield,
    Zap,
    Percent,
    DollarSign,
    ThumbsUp,
    Key,
    Facebook
} from "lucide-react";
import { authService } from "../services/AuthService";
import type { RegisterRequest, LoginRequest } from "../services/AuthService";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: "login" | "signup";
    onLoginSuccess?: () => void;
}

export function AuthModal({
                              isOpen,
                              onClose,
                              initialMode = "login",
                              onLoginSuccess
                          }: AuthModalProps) {
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

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setSuccessMessage(null);
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

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

            // Call the callback (updates navbar state)
            onLoginSuccess?.();
            onClose();

            // Don't redirect - user can navigate to dashboard via navbar

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

            onLoginSuccess?.();
            onClose();


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

    const features = [
        { icon: Shield, text: "Secure payments through reliable partners", color: "text-emerald-400" },
        { icon: Zap, text: "Fast services", color: "text-emerald-400" },
        { icon: Percent, text: "Fair Commissions", color: "text-emerald-400" },
        { icon: DollarSign, text: "Best Available Rates", color: "text-emerald-400" },
        { icon: ThumbsUp, text: "Convenience", color: "text-emerald-400" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop with glassmorphism */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Subtle background elements - fixed position */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Modal Container - Fixed size, no scroll */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col">
                {/* Close Button - Always visible */}
                    <button
                        onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all group"
                    aria-label="Close"
                    >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>

                {/* Content Container - Flex layout */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Left Panel - Features with Car Background (Both modes) */}
                    <div className="hidden lg:flex flex-col justify-center px-10 py-12 border-r border-white/10 relative overflow-hidden min-w-[40%]">
                        {/* Car Background - More Visible */}
                        <div 
                            className="absolute inset-0 opacity-40 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: "url('/src/assets/hero.png')",
                                filter: "grayscale(100%) contrast(1.1) brightness(0.9)"
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
                        
                        {/* Content */}
                        <div className="relative z-10 space-y-8">
                            {mode === "login" ? (
                                // Login Features
                                <>
                                    {features.map((feature, index) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={index} className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-white/90 text-sm font-medium pt-2">{feature.text}</p>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                // Signup Promotional Content
                                <>
                                    <div>
                                        <h3 className="text-3xl font-bold text-white mb-3">Join the ride</h3>
                                        <p className="text-white/70 text-base leading-relaxed">
                                            Experience premium car rentals with exclusive perks and benefits.
                                        </p>
                                    </div>
                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-white/90 text-sm font-medium">Verified vehicle selection</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-white/90 text-sm font-medium">Secure payment processing</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-white/90 text-sm font-medium">24/7 customer support</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-8 py-12">
                            <div className="max-w-md mx-auto">
                                {/* Header */}
                        <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
                                        <User className="w-8 h-8 text-white" />
                            </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {mode === "login" ? "Sign in" : "Create Account"}
                            </h2>
                                    <p className="text-white/50 text-sm">
                                {mode === "login"
                                            ? "Welcome back to GariZetu"
                                            : "Join GariZetu today"
                                }
                            </p>
                        </div>

                                {/* Mode Toggle - Only show for signup */}
                                {mode === "signup" && (
                        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
                            <button
                                onClick={() => switchMode("login")}
                                            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all text-white/70 hover:text-white"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => switchMode("signup")}
                                            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all bg-white text-gray-900 shadow-lg"
                            >
                                Sign Up
                            </button>
                        </div>
                                )}

                                {/* Messages */}
                        {successMessage && (
                                    <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 text-white text-sm">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                                {/* Login Form */}
                        {mode === "login" && (
                                    <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={loginForm.email}
                                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                                        />
                                </div>

                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={loginForm.password}
                                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                                    placeholder="Enter your password"
                                            required
                                                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
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
                                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/50"
                                        />
                                                <span className="text-sm text-white/70">Remember me</span>
                                    </label>
                                            <button type="button" className="text-sm text-white/70 hover:text-white transition-colors">
                                                Forgot your password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                                    Sign in
                                                    <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                        {/* Separator */}
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-black text-white/50">or</span>
                                            </div>
                                        </div>

                                        {/* Social Login */}
                                        <div className="flex justify-center gap-4">
                                            <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 flex items-center justify-center transition-all group"
                                                title="SSO"
                                            >
                                                <Key className="w-5 h-5 text-white/80 group-hover:text-white" />
                                            </button>
                                            <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] flex items-center justify-center transition-all group shadow-lg shadow-[#1877F2]/20"
                                                title="Facebook"
                                            >
                                                <Facebook className="w-5 h-5 text-white" />
                                            </button>
                                            <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 border border-white/20 flex items-center justify-center transition-all group shadow-lg"
                                                title="Google"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Signup Link */}
                                        <div className="text-center pt-4">
                                            <p className="text-sm text-white/60">
                                                Don't have an account?{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => switchMode("signup")}
                                                    className="text-white hover:text-white/80 font-medium underline"
                                                >
                                                    Sign up here
                                                </button>
                                            </p>
                                        </div>
                            </form>
                        )}

                                {/* Signup Form */}
                        {mode === "signup" && (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Full Name</label>
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
                                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">5-15 characters</p>
                                </div>

                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="email"
                                            value={signupForm.email}
                                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="tel"
                                            value={signupForm.phone}
                                            onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                                            placeholder="+254 712 345 678"
                                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                            <label className="block text-sm font-medium text-white mb-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={signupForm.password}
                                            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
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
                                            <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={signupForm.confirmPassword}
                                            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            required
                                                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
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
                                                    ? "text-white/80"
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
                                                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/50"
                                    />
                                    <span className="text-sm text-white/60">
                                        I agree to the{" "}
                                                <a href="/terms" className="text-white hover:text-white/80 underline">Terms of Service</a>
                                        {" "}and{" "}
                                                <a href="/privacy" className="text-white hover:text-white/80 underline">Privacy Policy</a>
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                            className="w-full py-3.5 bg-white text-black hover:bg-white/90 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                                    <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                        {/* Separator */}
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-black text-white/50">or</span>
                                            </div>
                    </div>

                                        {/* Social Login */}
                                        <div className="flex justify-center gap-4">
                                            <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 flex items-center justify-center transition-all group"
                                                title="SSO"
                                            >
                                                <Key className="w-5 h-5 text-white/80 group-hover:text-white" />
                                            </button>
                                            <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] flex items-center justify-center transition-all group shadow-lg shadow-[#1877F2]/20"
                                                title="Facebook"
                                            >
                                                <Facebook className="w-5 h-5 text-white" />
                                            </button>
                                    <button
                                                type="button"
                                                className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 border border-white/20 flex items-center justify-center transition-all group shadow-lg"
                                                title="Google"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                                </svg>
                                    </button>
                                        </div>

                                        {/* Login Link */}
                                        <div className="text-center pt-4">
                                            <p className="text-sm text-white/60">
                                    Already have an account?{" "}
                                    <button
                                                    type="button"
                                        onClick={() => switchMode("login")}
                                                    className="text-white hover:text-white/80 font-medium underline"
                                    >
                                        Sign in
                                    </button>
                                            </p>
                                        </div>
                                    </form>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
