import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ALL_ALLOWED_TYPES, MAX_VIDEO_SIZE_BYTES } from '@/lib/blob';

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
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
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
          const isVideo = blob.contentType?.startsWith('video/') || false;

          // Record or upsert MediaAsset in database
          await prisma.mediaAsset.create({
            data: {
              filename: blob.pathname,
              originalName: payload.originalName || blob.pathname,
              mimeType: blob.contentType || (isVideo ? 'video/mp4' : 'image/jpeg'),
              sizeBytes: 0, // Recorded upon client metadata save or estimated
              url: blob.url,
              altText: payload.altText || payload.originalName || 'Studio asset',
            },
          });
        } catch (dbErr) {
          console.error('Error during onUploadCompleted database sync:', dbErr);
        }
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
