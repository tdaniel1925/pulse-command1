"use client";

import { useState } from "react";
import { User, Bell, Shield, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";

type Tab = "profile" | "notifications" | "security";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {description && <p className="text-xs text-neutral-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-primary-600" : "bg-neutral-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent bg-white"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  // Profile
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Johnson");
  const [business, setBusiness] = useState("Apex Roofing");
  const [website, setWebsite] = useState("https://apexroofing.com");
  const [industry, setIndustry] = useState("home-services");
  const [bio, setBio] = useState("");

  // Notifications
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [contentPublished, setContentPublished] = useState(true);
  const [reportReady, setReportReady] = useState(true);

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", Icon: User },
    { key: "notifications", label: "Notifications", Icon: Bell },
    { key: "security", label: "Security", Icon: Shield },
  ];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Settings</h2>

      {/* Tab bar */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" placeholder="Alex" value={firstName} onChange={setFirstName} />
              <InputField label="Last Name" placeholder="Johnson" value={lastName} onChange={setLastName} />
            </div>
            <InputField label="Business Name" placeholder="Apex Roofing" value={business} onChange={setBusiness} />
            <InputField label="Website" placeholder="https://yoursite.com" value={website} onChange={setWebsite} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
              >
                <option value="home-services">Home Services</option>
                <option value="roofing">Roofing</option>
                <option value="plumbing">Plumbing</option>
                <option value="hvac">HVAC</option>
                <option value="landscaping">Landscaping</option>
                <option value="real-estate">Real Estate</option>
                <option value="legal">Legal</option>
                <option value="healthcare">Healthcare</option>
                <option value="fitness">Fitness & Wellness</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Business Description</label>
              <textarea
                rows={4}
                placeholder="Tell us about your business, who you help, and what makes you different..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none bg-white"
              />
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <p className="text-sm text-neutral-500 mb-4">Choose what email notifications you receive.</p>
            <Toggle
              checked={weeklySummary}
              onChange={setWeeklySummary}
              label="Weekly Summary"
              description="A digest of your content performance every Monday."
            />
            <Toggle
              checked={contentPublished}
              onChange={setContentPublished}
              label="Content Published"
              description="Notified each time new content goes live on your channels."
            />
            <Toggle
              checked={reportReady}
              onChange={setReportReady}
              label="Report Ready"
              description="Receive your monthly performance report by email."
            />
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-semibold text-neutral-800">Change Password</h3>
              <InputField label="Current Password" type="password" placeholder="••••••••" value={currentPw} onChange={setCurrentPw} />
              <InputField label="New Password" type="password" placeholder="••••••••" value={newPw} onChange={setNewPw} />
              <InputField label="Confirm New Password" type="password" placeholder="••••••••" value={confirmPw} onChange={setConfirmPw} />
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-base font-semibold text-red-600 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Cancelling your subscription will stop all content generation at the end of your current billing period.
              </p>
              <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
