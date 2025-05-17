import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('API Key available:', !!process.env.HEYGEN_API_KEY);
    
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // HeyGen requires an empty JSON body
    });

    if (!response.ok) {
      console.error('HeyGen API error:', {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json({ error: 'HeyGen API request failed' }, { status: response.status });
    }

    const data = await response.json();
    console.log('Token response:', { success: !!data.token });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching HeyGen token:', error);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
