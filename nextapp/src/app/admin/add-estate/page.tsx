"use client";
import { AdminRoute } from "@/components/ProtectedRoute";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Upload, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEstates } from "@/context/EstatesContext";
import { useAuth } from "@/context/AuthContext";

const STEPS = ["Basic Info", "Location", "Features", "Photos"];

interface FormData {
  title: string;
  description: string;
  price: number;
  type: string;
  listingPurpose: "rent" | "sale";
  governorate: string;
  zone: string;
  address: string;
  rooms: number;
  bathrooms: number;
  surface: number;
  livingRooms: number;
  floor: number;
  furnished: boolean;
  parking: boolean;
  airConditioner: boolean;
  acUnits: number;
  internet: boolean;
  balcony: boolean;
  kitchen: boolean;
}

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1724582586529-62622e50c0b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
];

function AddEstatePage() {
  const router = useRouter();
  const { addEstate } = useEstates();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      furnished: false,
      parking: false,
      airConditioner: false,
      internet: true,
      listingPurpose: "rent",
      balcony: false,
      kitchen: true,
      acUnits: 1,
      livingRooms: 1,
      floor: 1,
      rooms: 2,
      bathrooms: 1,
      surface: 60,
    },
  });

  const SwitchField = ({ label, name }: { label: string; name: keyof FormData }) => (
    <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
      <Label className="text-sm text-[#374151] font-normal cursor-pointer">{label}</Label>
      <Switch
        checked={!!watch(name)}
        onCheckedChange={(v) => setValue(name, v as any)}
        className="data-[state=checked]:bg-[#2563EB]"
      />
    </div>
  );

  const addDemoImage = () => {
    const unused = DEMO_IMAGES.filter((img) => !selectedImages.includes(img));
    if (unused.length > 0) setSelectedImages((prev) => [...prev, unused[0]]);
  };

  const removeImage = (img: string) => setSelectedImages((prev) => prev.filter((i) => i !== img));

  const onSubmit = (data: FormData) => {
    if (!user) return;
    addEstate({
      ...data,
      price: Number(data.price),
      rooms: Number(data.rooms),
      bathrooms: Number(data.bathrooms),
      surface: Number(data.surface),
      livingRooms: Number(data.livingRooms),
      floor: Number(data.floor),
      acUnits: data.airConditioner ? Number(data.acUnits) : 0,
      type: data.type as any,
      status: "active",
      images: selectedImages.length > 0 ? selectedImages : [DEMO_IMAGES[0]],
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatar,
      ownerVerified: true,
    });
    router.push("/admin");
  };

  const stepContent = [
    // Step 1: Basic Info
    <div key="step1" className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Property Title *</Label>
        <Input
          placeholder="e.g. Bright 2BR Apartment in Paris 8th"
          className="rounded-xl border-[#E2E8F0] h-11"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Description *</Label>
        <Textarea
          placeholder="Describe your property in detail..."
          rows={4}
          className="rounded-xl border-[#E2E8F0] resize-none"
          {...register("description", { required: "Description is required" })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Listing Purpose *</Label>
          <div className="flex gap-2">
            {(["rent", "sale"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setValue("listingPurpose", p)}
                className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-colors ${
                  watch("listingPurpose") === p
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB]"
                }`}
              >
                {p === "rent" ? "For Rent" : "For Sale"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
            {watch("listingPurpose") === "sale" ? "Sale Price (DT) *" : "Monthly Price (DT) *"}
          </Label>
          <Input
            type="number"
            placeholder={watch("listingPurpose") === "sale" ? "450000" : "1500"}
            className="rounded-xl border-[#E2E8F0] h-11"
            {...register("price", { required: true, min: 1 })}
          />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Property Type *</Label>
        <Select value={watch("type")} onValueChange={(v) => setValue("type", v)}>
          <SelectTrigger className="rounded-xl border-[#E2E8F0] h-11">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="studio">Studio</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>,

    // Step 2: Location
    <div key="step2" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Governorate *</Label>
          <Select value={watch("governorate")} onValueChange={(v) => setValue("governorate", v)}>
            <SelectTrigger className="rounded-xl border-[#E2E8F0] h-11">
              <SelectValue placeholder="Select governorate" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
                "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse",
                "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid",
                "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili",
              ].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Zone / Neighborhood *</Label>
          <Input
            placeholder="e.g. Le Marais"
            className="rounded-xl border-[#E2E8F0] h-11"
            {...register("zone", { required: "Zone is required" })}
          />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium text-[#374151] mb-1.5 block">Full Address *</Label>
        <Input
          placeholder="e.g. 12 Rue de la Paix"
          className="rounded-xl border-[#E2E8F0] h-11"
          {...register("address", { required: "Address is required" })}
        />
      </div>
      <div className="bg-[#EFF6FF] rounded-xl border border-[#BFDBFE] p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <p className="text-[#2563EB] text-sm">Your address will be used to show the property on a map. We keep your exact address private until contact is made.</p>
      </div>
    </div>,

    // Step 3: Features
    <div key="step3" className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Bedrooms", name: "rooms" as const },
          { label: "Bathrooms", name: "bathrooms" as const },
          { label: "Surface (m²)", name: "surface" as const },
          { label: "Living Rooms", name: "livingRooms" as const },
          { label: "Floor", name: "floor" as const },
          { label: "AC Units", name: "acUnits" as const },
        ].map(({ label, name }) => (
          <div key={name}>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">{label}</Label>
            <Input
              type="number"
              min={0}
              className="rounded-xl border-[#E2E8F0] h-11"
              {...register(name)}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SwitchField label="Furnished" name="furnished" />
        <SwitchField label="Parking Included" name="parking" />
        <SwitchField label="Air Conditioner" name="airConditioner" />
        <SwitchField label="Internet Included" name="internet" />
        <SwitchField label="Balcony" name="balcony" />
        <SwitchField label="Kitchen" name="kitchen" />
      </div>
    </div>,

    // Step 4: Photos
    <div key="step4" className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addDemoImage(); }}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
          dragOver ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#CBD5E1] bg-[#F8FAFC]"
        }`}
        onClick={addDemoImage}
      >
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <Upload size={22} className="text-[#2563EB]" />
        </div>
        <div className="text-center">
          <p className="font-medium text-[#1F2937] text-sm">Drop images here or click to upload</p>
          <p className="text-[#94A3B8] text-xs mt-1">Click to add a demo image (up to 4)</p>
        </div>
      </div>

      {selectedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {selectedImages.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-[#2563EB] text-white text-xs px-1.5 py-0.5 rounded-full">Cover</div>
              )}
              <button
                onClick={() => removeImage(img)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length === 0 && (
        <p className="text-[#94A3B8] text-xs text-center">No images added yet. Click above to add images.</p>
      )}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#1F2937] font-bold mb-1" style={{ fontSize: "1.75rem" }}>List Your Property</h1>
          <p className="text-[#64748B] text-sm">Complete all steps to publish your property listing</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold transition-all ${
                i < step ? "bg-[#10B981] text-white" :
                i === step ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30" :
                "bg-[#E2E8F0] text-[#94A3B8]"
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <div className="flex-1 flex flex-col items-center">
                {i < STEPS.length - 1 && (
                  <div className={`w-full h-0.5 ${i < step ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-6 -mt-4">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs font-medium ${i === step ? "text-[#2563EB]" : "text-[#94A3B8]"}`}>{s}</span>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="font-semibold text-[#1F2937] mb-5">{STEPS[step]}</h2>
          {stepContent[step]}

          <div className="flex justify-between mt-6 pt-5 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => step > 0 ? setStep(step - 1) : router.push("/admin")}
              className="rounded-xl border-[#E2E8F0] flex items-center gap-2"
            >
              <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2"
              >
                Continue <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl flex items-center gap-2 px-6"
              >
                <Check size={16} /> Publish Property
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function admin_add_estate_Guard() {
  return (
    <AdminRoute>
      <AddEstatePage />
    </AdminRoute>
  );
}
