"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Camera, Save, LogOut, Trash2, Lock, User, Mail, Phone, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || "", email: user?.email || "", phone: user?.phone || "" },
  });

  const onSubmit = (data: any) => {
    updateProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onAvatarPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile({ avatar: reader.result });
        setAvatarSaved(true);
        setTimeout(() => setAvatarSaved(false), 2000);
      }
    };
    reader.readAsDataURL(file);
    // allow picking the same file again later
    e.target.value = "";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-[#1F2937] font-bold mb-6" style={{ fontSize: "1.75rem" }}>My Profile</h1>

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <ImageWithFallback
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#EFF6FF]"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarPicked}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center border-2 border-white hover:bg-[#1D4ED8] transition-colors"
              >
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <h2 className="font-semibold text-[#1F2937]" style={{ fontSize: "1.1rem" }}>{user.name}</h2>
              <p className="text-[#64748B] text-sm">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[#10B981]" style={{ fontSize: "0.75rem" }}>
                <Shield size={12} /> {avatarSaved ? "Photo updated!" : "Member account"}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
          <h3 className="font-semibold text-[#1F2937] mb-5 flex items-center gap-2">
            <User size={16} className="text-[#2563EB]" /> Personal Information
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-1.5 block flex items-center gap-1.5">
                <User size={13} className="text-[#94A3B8]" /> Full Name
              </Label>
              <Input
                className="rounded-xl border-[#E2E8F0] h-11 focus-visible:ring-[#2563EB]"
                {...register("name")}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-1.5 block flex items-center gap-1.5">
                <Mail size={13} className="text-[#94A3B8]" /> Email Address
              </Label>
              <Input
                type="email"
                className="rounded-xl border-[#E2E8F0] h-11 focus-visible:ring-[#2563EB]"
                {...register("email")}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-1.5 block flex items-center gap-1.5">
                <Phone size={13} className="text-[#94A3B8]" /> Phone Number
              </Label>
              <Input
                type="tel"
                className="rounded-xl border-[#E2E8F0] h-11 focus-visible:ring-[#2563EB]"
                {...register("phone")}
              />
            </div>
            <Button
              type="submit"
              className={`w-full h-11 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                saved ? "bg-[#10B981] hover:bg-[#059669]" : "bg-[#2563EB] hover:bg-[#1D4ED8]"
              } text-white`}
            >
              {saved ? <><Shield size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
            </Button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-5">
          <h3 className="font-semibold text-[#1F2937] mb-5 flex items-center gap-2">
            <Lock size={16} className="text-[#2563EB]" /> Security Settings
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter current password"
                  className="rounded-xl border-[#E2E8F0] h-11 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-1.5 block">New Password</Label>
              <Input type="password" placeholder="Enter new password" className="rounded-xl border-[#E2E8F0] h-11" />
            </div>
            <Button variant="outline" className="w-full h-11 rounded-xl border-[#E2E8F0] text-[#374151]">
              Change Password
            </Button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <h3 className="font-semibold text-[#1F2937] mb-4">Account Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => { logout(); router.push("/login"); }}
              className="w-full h-11 rounded-xl border-[#E2E8F0] text-[#EF4444] hover:text-[#EF4444] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] flex items-center gap-2"
            >
              <LogOut size={15} /> Logout
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full h-11 rounded-xl border-[#E2E8F0] text-[#94A3B8] hover:text-[#EF4444] hover:border-[#FCA5A5] flex items-center gap-2"
            >
              <Trash2 size={15} /> Delete Account
            </Button>
          </div>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="rounded-2xl border border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This will permanently delete your account and all your listings. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => { logout(); router.push("/login"); }} className="bg-[#EF4444] hover:bg-red-600 text-white rounded-xl">
                Delete My Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function profile_Guard() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
