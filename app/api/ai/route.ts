import { NextRequest, NextResponse } from 'next/server';

// Note: In production, use environment variables for API keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Check if API key is configured
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not configured. AI assistant will not work.');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body safely
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { question } = body;

    // Validate question input
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return NextResponse.json(
        { error: 'Question is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      const fallbackResponse = "I'm sorry, but the AI service is not configured yet. To enable me:\n\n" +
        "1. Visit: https://aistudio.google.com/app/apikey\n" +
        "2. Create a free Gemini API key\n" +
        "3. Create a `.env.local` file in your project root\n" +
        "4. Add: `GEMINI_API_KEY=your_api_key_here`\n" +
        "5. Restart your development server\n\n" +
        "Once configured, I'll be able to answer your questions about Xandeum! 🚀";

      return NextResponse.json({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        configured: false
      });
    }

    // Context about Xandeum for better responses
    const context = `You are an AI assistant for Xandeum, a decentralized network infrastructure platform. 

Xandeum Protocol:
- Distributed network of Proof Nodes (PNodes) providing computational resources, storage, and validation
- PNodes participate in marketplace for computational resources with rewards based on performance
- Network includes 200+ active PNodes across 127 countries with 340TB+ storage capacity
- 99.9% uptime SLA with real-time monitoring

Key Features:
- Real-time PNode monitoring with sub-second latency
- Advanced analytics with XDN scoring algorithms
- Intelligent alerting with ML-powered anomaly detection
- Geographic distribution insights and capacity planning

Technical Stack:
- Next.js 16 + React 19 with App Router
- PostgreSQL + Prisma ORM with ACID transactions
- Redis caching with multi-layer strategy
- SWR for data fetching with stale-while-revalidate
- pRPC for Xandeum Protocol communication

Be helpful, accurate, and focus on Xandeum-specific information. Keep responses concise and actionable.`;

    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${context}\n\nUser Question: ${question}\n\nProvide a helpful, accurate response about Xandeum:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    // Handle Gemini API errors
    if (!geminiResponse.ok) {
      let errorData;
      try {
        errorData = await geminiResponse.json();
      } catch (parseError) {
        // If we can't parse the error JSON, fall back to text
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', geminiResponse.status, errorText);
        errorData = { error: { message: errorText } };
      }

      console.error('Gemini API error:', geminiResponse.status, JSON.stringify(errorData, null, 2));

      let errorMessage = 'AI service temporarily unavailable';
      let isQuotaExhausted = false;
      let retryAfter = null;

      switch (geminiResponse.status) {
        case 400:
          errorMessage = 'Invalid request to AI service. Please try rephrasing your question.';
          break;
        case 401:
          errorMessage = 'AI service authentication failed. Please check your API key configuration.';
          break;
        case 403:
          errorMessage = 'AI service access denied. Your API key may not have the required permissions.';
          break;
        case 429:
          // Check if this is quota exhaustion (free tier used up) vs rate limit
          if (errorData.error?.message?.includes('Quota exceeded') ||
              errorData.error?.message?.includes('quota') ||
              errorData.error?.status === 'RESOURCE_EXHAUSTED') {
            isQuotaExhausted = true;
            errorMessage = '🚫 Free tier quota exhausted! You\'ve reached the daily limit for free Gemini API usage.\n\n💡 To continue using the AI assistant:\n• Wait for quota reset (typically daily)\n• Upgrade to a paid plan: https://aistudio.google.com/app/apikey\n• Enable billing: https://console.cloud.google.com/billing\n\nThe free tier provides limited requests per day. Paid plans offer much higher limits!';
          } else {
            // Regular rate limit - can retry
            errorMessage = '⏳ Rate limit exceeded. The AI service is busy right now. Please wait a moment and try again.';
          }

          // Extract retry delay if provided
          if (errorData.error?.details) {
            const retryInfo = errorData.error.details.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
            if (retryInfo?.retryDelay) {
              // Parse retry delay (e.g., "44s" -> 44 seconds)
              const delayMatch = retryInfo.retryDelay.match(/(\d+)s/);
              if (delayMatch) {
                retryAfter = parseInt(delayMatch[1]);
              }
            }
          }
          break;
        case 500:
        case 503:
          errorMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
          break;
        default:
          errorMessage = `AI service error (${geminiResponse.status}). Please try again.`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          quotaExhausted: isQuotaExhausted,
          retryAfter: retryAfter
        },
        { status: 503 }
      );
    }

    const data = await geminiResponse.json();

    // Validate response structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response:', data);
      return NextResponse.json(
        { error: 'AI service did not return a valid response. Please try again.' },
        { status: 500 }
      );
    }

    const candidate = data.candidates[0];
    
    // Check if content was blocked
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('Content blocked or empty:', candidate);
      return NextResponse.json(
        { error: 'Unable to generate a response. The content may have been filtered.' },
        { status: 500 }
      );
    }

    const aiResponse = candidate.content.parts[0].text;

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      configured: true
    });

  } catch (error) {
    console.error('AI API error:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to AI service. Please check your internet connection.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}