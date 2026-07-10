"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Building2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    const loggedInUser = await login(data.email, data.password);
    setLoading(false);
    if (loggedInUser) {
      if (loggedInUser.role === "admin") {
        router.push("/admin");
      } else if (loggedInUser.role === "worker") {
        router.push("/worker");
      } else {
        router.push("/");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1530877872966-40bb5529f558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
          alt="Luxury apartments"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/80 to-[#1F2937]/60" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm">
            <h2 className="text-white font-bold mb-2" style={{ fontSize: "1.4rem" }}>Find Your Next Home.</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Thousands of premium apartments, villas, and houses available for rent across Tunisia.
            </p>
            <div className="flex items-center gap-4 mt-4">
              {["10K+", "50+", "4.9★"].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-white font-bold">{stat}</div>
                  <div className="text-white/60 text-xs">{["Listings", "Cities", "Rating"][i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-bold text-[#1F2937]" style={{ fontSize: "1.2rem" }}>NestFinder</span>
          </div>

          <h1 className="text-[#1F2937] mb-1" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Welcome Back</h1>
          <p className="text-[#64748B] mb-8 text-sm">Sign in to continue to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#374151] text-sm font-medium mb-1.5 block">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-xl border-[#E2E8F0] bg-white h-11 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-[#374151] text-sm font-medium mb-1.5 block">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  className="rounded-xl border-[#E2E8F0] bg-white h-11 pr-10 focus-visible:ring-[#2563EB] focus-visible:border-[#2563EB]"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={watch("remember")}
                  onCheckedChange={(v) => setValue("remember", !!v)}
                  className="border-[#CBD5E1] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                />
                <Label htmlFor="remember" className="text-sm text-[#64748B] cursor-pointer font-normal">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-[#2563EB] hover:underline font-medium">Forgot Password?</a>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FAFC] px-3 text-sm text-[#94A3B8]">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl border-[#E2E8F0] text-[#374151] font-medium flex items-center gap-2"
            onClick={() => {}}
          >
            <Chrome size={18} className="text-[#4285F4]" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-[#64748B] mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#2563EB] font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
