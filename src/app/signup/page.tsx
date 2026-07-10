"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Eye, EyeOff, Building2, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { PhoneInputTN, isValidTNPhone, TN_PHONE_ERROR, formatTNPhone } from "@/components/PhoneInputTN";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  terms: boolean;
}

function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmNotice, setConfirmNotice] = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { terms: false },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setLoading(true);
    const result = await signup(data.name, data.email, formatTNPhone(data.phone), data.password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Something went wrong. Please try again.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmNotice(true);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1619218070141-bcfeb8b93074?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
          alt="Modern building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/80 to-[#1F2937]/60" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-sm">
            <h2 className="text-white font-bold mb-2" style={{ fontSize: "1.4rem" }}>Start Your Journey.</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Join thousands of tenants and landlords who trust NestFinder to find their perfect match.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="font-bold text-[#1F2937]" style={{ fontSize: "1.2rem" }}>NestFinder</span>
          </div>

          <h1 className="text-[#1F2937] mb-1" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Create Account</h1>
          <p className="text-[#64748B] mb-8 text-sm">Join NestFinder and find your perfect home</p>

          {confirmNotice ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-4 text-sm">
              Account created! Check your email to confirm your address before logging in.
            </div>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <Label className="text-[#374151] text-sm font-medium mb-1.5 block">Full Name</Label>
              <Input
                placeholder="Ahmed Ben Salah"
                className="rounded-xl border-[#E2E8F0] bg-white h-11 focus-visible:ring-[#2563EB]"
                {...register("name", { required: "Full name is required" })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label className="text-[#374151] text-sm font-medium mb-1.5 block">Email Address</Label>
              <Input
                type="email"
                placeholder="ahmed@example.com"
                className="rounded-xl border-[#E2E8F0] bg-white h-11 focus-visible:ring-[#2563EB]"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label className="text-[#374151] text-sm font-medium mb-1.5 block">Phone Number</Label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone is required",
                  validate: (v) => isValidTNPhone(v) || TN_PHONE_ERROR,
                }}
                render={({ field }) => (
                  <PhoneInputTN value={field.value || ""} onChange={field.onChange} />
                )}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[#374151] text-sm font-medium mb-1.5 block">Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 chars"
                    className="rounded-xl border-[#E2E8F0] bg-white h-11 pr-9 focus-visible:ring-[#2563EB]"
                    {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 chars" } })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <Label className="text-[#374151] text-sm font-medium mb-1.5 block">Confirm</Label>
                <Input
                  type="password"
                  placeholder="Repeat"
                  className="rounded-xl border-[#E2E8F0] bg-white h-11 focus-visible:ring-[#2563EB]"
                  {...register("confirm", {
                    required: "Please confirm",
                    validate: (v) => v === watch("password") || "Passwords don't match",
                  })}
                />
                {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={watch("terms")}
                onCheckedChange={(v) => setValue("terms", !!v)}
                className="mt-0.5 border-[#CBD5E1] data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
              />
              <Label htmlFor="terms" className="text-sm text-[#64748B] cursor-pointer font-normal leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-[#2563EB] hover:underline">Terms & Conditions</a>{" "}
                and{" "}
                <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms.message}</p>}

            <Button
              type="submit"
              disabled={loading || !watch("terms")}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-sm"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FAFC] px-3 text-sm text-[#94A3B8]">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl border-[#E2E8F0] text-[#374151] font-medium flex items-center gap-2"
          >
            <Chrome size={18} className="text-[#4285F4]" />
            Sign Up with Google
          </Button>

          <p className="text-center text-sm text-[#64748B] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2563EB] font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
