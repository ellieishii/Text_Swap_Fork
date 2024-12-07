import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'No email found in session' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        role: user.role,
        email: user.email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Detailed error fetching user role:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}