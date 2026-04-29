import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PresentationViewer } from '@/components/dashboard/PresentationViewer';
import type { Presentation } from '@/components/dashboard/PresentationViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PresentationViewerPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const admin = createAdminClient();

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (clientError || !client) {
    redirect('/dashboard');
  }

  const { data: presentation, error: presentationError } = await admin
    .from('presentations')
    .select('*')
    .eq('id', id)
    .eq('client_id', client.id)
    .single();

  if (presentationError || !presentation) {
    redirect('/dashboard/presentations');
  }

  if (presentation.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Generation Failed</h2>
          <p className="text-neutral-500 max-w-md">
            Something went wrong while generating this presentation. Please try again.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/presentations"
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Back to Presentations
          </Link>
          <Link
            href="/dashboard/presentations/new"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const isGenerating = presentation.status === 'generating';

  return (
    <div className="-m-8 h-[calc(100vh-4rem)]">
      <PresentationViewer
        presentation={presentation as Presentation}
        isGenerating={isGenerating}
      />
    </div>
  );
}
