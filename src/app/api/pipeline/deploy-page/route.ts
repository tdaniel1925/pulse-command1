import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { pageId, clientId } = await request.json()

    const supabase = await createClient()

    const { data: page } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .eq('client_id', clientId)
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('client_id', clientId)
      .single()

    // Generate HTML content for the landing page
    const pageContent = JSON.stringify(page.content) !== '{}'
      ? page.content
      : {
          headline: `${client?.business_name ?? 'Welcome'}`,
          subheadline: brandProfile?.uniqueValueProp ?? '',
          cta: 'Get Started Today',
          body: brandProfile?.businessDescription ?? '',
        }

    // Simple HTML template
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white font-sans">
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center max-w-3xl mx-auto">
    <h1 class="text-5xl font-bold text-gray-900 mb-6">${(pageContent as any).headline ?? page.title}</h1>
    <p class="text-xl text-gray-600 mb-8">${(pageContent as any).subheadline ?? ''}</p>
    <p class="text-gray-700 mb-10">${(pageContent as any).body ?? ''}</p>
    <a href="#contact" class="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition">
      ${(pageContent as any).cta ?? 'Get Started'}
    </a>
  </div>
</body>
</html>`

    // Push to GitHub
    const filePath = `pages/${clientId}/${page.slug}/index.html`
    const githubRes = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: `Deploy landing page: ${page.slug} for client ${clientId}`,
          content: Buffer.from(html).toString('base64'),
        }),
      }
    )

    if (!githubRes.ok) {
      const errText = await githubRes.text()
      console.error('GitHub push error:', errText)
      return NextResponse.json({ error: 'GitHub push failed', detail: errText }, { status: 502 })
    }

    const githubData = await githubRes.json()
    const commitSha = githubData.commit?.sha

    // Update page status to deploying
    await supabase.from('landing_pages').update({
      status: 'deploying',
      github_commit_sha: commitSha,
    }).eq('id', pageId)

    // Log activity
    await supabase.from('activities').insert({
      client_id: clientId,
      type: 'content_published',
      title: `Landing page "${page.title}" deploying`,
      description: `GitHub commit ${commitSha?.slice(0, 7)}. Vercel will auto-deploy.`,
      created_by: 'system',
    })

    // TODO: Vercel webhook will set status to 'live' when deployment completes
    // For now, optimistically set to live after 30s (in production, use Vercel webhook)

    return NextResponse.json({ success: true, commitSha, slug: page.slug })
  } catch (err) {
    console.error('deploy-page error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
