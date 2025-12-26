import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { validateAPIKey } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key
    const auth = await validateAPIKey();
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Unauthorized', code: auth.error },
        { status: 401 }
      );
    }

    // Await params to get the id
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeResolved = searchParams.get('includeResolved') === 'true';

    // Fetch alerts with conditional filtering
    const whereClause: any = {
      pnodeId: id,
    };

    // Apply resolved filter if includeResolved is false
    if (!includeResolved) {
      whereClause.isResolved = false;
    }

    const alerts = await db?.alert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      pnodeId: id,
      alerts,
      count: alerts?.length,
    });
  } catch (error) {
    console.error(`Get pNode alerts error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}