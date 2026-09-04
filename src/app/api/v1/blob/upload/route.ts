import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { ALL_ALLOWED_TYPES, MAX_VIDEO_SIZE_BYTES } from '@/lib/blob';

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN is missing in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: BLOB_READ_WRITE_TOKEN is not configured in environment variables.' },
      { status: 500 }
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname: string, clientPayload?: string) => {
        // 1. Enforce Authentication & Admin Role
        const user = await getAuthenticatedUser();
        if (!user) {
          throw new Error('Unauthorized: You must be logged in as an administrator to upload media.');
        }

        // 2. Parse client payload if supplied
        let parsedPayload: any = {};
        if (clientPayload) {
          try {
            parsedPayload = JSON.parse(clientPayload);
          } catch {}
        }

        return {
          allowedContentTypes: ALL_ALLOWED_TYPES,
          maximumSizeInBytes: MAX_VIDEO_SIZE_BYTES,
          tokenPayload: JSON.stringify({
            userId: user.id,
            userRole: user.role?.name,
            originalName: parsedPayload.originalName || pathname,
            category: parsedPayload.category || 'general',
            altText: parsedPayload.altText,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Vercel Blob handleUpload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authorize media upload.' },
      { status: error.message?.includes('Unauthorized') ? 401 : 400 }
    );
  }
}
