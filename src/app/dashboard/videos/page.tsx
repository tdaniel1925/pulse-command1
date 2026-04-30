import { createClient } from "@/lib/supabase/server";
import VideoManager from "@/components/dashboard/VideoManager";

export default async function VideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: client } = user
    ? await supabase
        .from("clients")
        .select("id, plan_name, plan_status")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  let videos: {
    id: string;
    title: string;
    status: string;
    thumbnail_url: string | null;
    video_url: string | null;
    heygen_video_id: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
  }[] = [];

  if (client?.id) {
    try {
      const { data } = await supabase
        .from("videos")
        .select("id, title, status, thumbnail_url, video_url, heygen_video_id, created_at, metadata")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      videos = data ?? [];
    } catch {
      // videos table may not exist yet — show empty state
    }
  }

  return (
    <VideoManager
      videos={videos}
      clientId={client?.id ?? ""}
      planName={client?.plan_name ?? "starter"}
    />
  );
}
