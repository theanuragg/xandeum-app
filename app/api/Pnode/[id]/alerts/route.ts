import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { validateAPIKey } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id:  string } }
) {
  try {
    // Validate API key
    const auth = await validateAPIKey();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', code:  auth.error },
        { status: 401 }
      );
    }

    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeResolved = searchParams.get('includeResolved') === 'true';

    // Fetch alerts with conditional filtering
    const alerts = await db. alert.findMany({
      where: {
        pnodeId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      pnodeId: id,
      alerts,
      count: alerts.length,
      unresolved: alerts.filter()
    });
  } catch (error) {
    console.error(`Get pNode alerts error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}