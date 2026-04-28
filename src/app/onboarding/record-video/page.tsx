"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecordVideoRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/onboarding/choose-avatar"); }, [router]);
  return null;
}
