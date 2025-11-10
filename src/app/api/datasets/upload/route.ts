import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/db';
import { datasets } from '@/db/schema';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: 'File and workspace ID are required' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });

    const columns = parsed.meta.fields || [];
    const rowCount = parsed.data.length;
    const preview = parsed.data.slice(0, 10);

    const now = new Date().toISOString();
    const [newDataset] = await db.insert(datasets).values({
      workspaceId: parseInt(workspaceId),
      name: file.name,
      filePath: `/uploads/${workspaceId}/${file.name}`,
      fileSize: file.size,
      rowCount,
      columnCount: columns.length,
      columnsJson: JSON.stringify(columns),
      uploadedAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({
      dataset: newDataset,
      columns,
      preview,
    });
  } catch (error) {
    console.error('Dataset upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
