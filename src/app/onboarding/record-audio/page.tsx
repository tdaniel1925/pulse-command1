"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecordAudioRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/onboarding/choose-voice"); }, [router]);
  return null;
}
