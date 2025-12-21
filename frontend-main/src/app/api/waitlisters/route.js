const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.exora.in'

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}))

    const upstream = await fetch(`${API_BASE_URL}/api/waitlisters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Avoid caching edge cases for POSTs
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))

    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ message: 'Unable to reach server. Please try again.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}


