"use client";

interface PhoneInputTNProps {
  id?: string;
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  className?: string;
}

// Tunisian phone input: fixed, greyed-out "+216" prefix, and the field only
// ever holds the 8 local digits (no spaces, no letters). Formatting/joining
// with "+216" happens where the value is actually submitted.
export function PhoneInputTN({
  id,
  value,
  onChange,
  placeholder = "20 000 000",
  className = "",
}: PhoneInputTNProps) {
  return (
    <div
      className={`flex items-stretch rounded-xl border border-[#E2E8F0] bg-white h-11 overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-[#2563EB] ${className}`}
    >
      <span className="flex items-center px-3 bg-[#F1F5F9] text-[#64748B] text-sm font-medium border-r border-[#E2E8F0] select-none">
        +216
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          // Digits only, hard cap at 8 (standard Tunisian mobile/landline length).
          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
          onChange(digits);
        }}
        className="flex-1 min-w-0 px-3 h-full outline-none text-sm bg-transparent text-[#1F2937] placeholder:text-[#94A3B8]"
      />
    </div>
  );
}

// A valid Tunisian number here is exactly 8 digits, nothing more or less.
export function isValidTNPhone(digits: string): boolean {
  return /^\d{8}$/.test(digits);
}

export const TN_PHONE_ERROR = "Enter a valid 8-digit phone number.";

// Joins the raw 8 digits with the country code for storage/display,
// e.g. "20000000" -> "+216 20 000 000".
export function formatTNPhone(digits: string): string {
  if (!isValidTNPhone(digits)) return digits;
  return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)}`;
}
