import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { datasets, session } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionRecord = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionRecord.length === 0) {
      return null;
    }

    const sess = sessionRecord[0];
    
    if (new Date(sess.expiresAt) < new Date()) {
      return null;
    }

    return { userId: sess.userId };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateSession(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;

    if (!file || !workspaceId) {
      return NextResponse.json(
        { error: 'File and workspace ID are required', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Detect file format from file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    let fileFormat = 'csv'; // default
    let columns: string[] = [];
    let rowCount = 0;
    let preview: any[] = [];

    const text = await file.text();

    try {
      if (fileExtension === 'json') {
        // Parse JSON
        fileFormat = 'json';
        const jsonData = JSON.parse(text);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        if (dataArray.length > 0) {
          columns = Object.keys(dataArray[0]);
          rowCount = dataArray.length;
          preview = dataArray.slice(0, 10);
        }
      } else if (fileExtension === 'yml' || fileExtension === 'yaml') {
        // Parse YAML (simple parsing, for production use a proper YAML parser)
        fileFormat = 'yml';
        const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        // Try to extract keys from YAML structure
        const yamlKeys = new Set<string>();
        lines.forEach(line => {
          const match = line.match(/^\s*(\w+):/);
          if (match) {
            yamlKeys.add(match[1]);
          }
        });
        
        columns = Array.from(yamlKeys);
        rowCount = Math.floor(lines.length / Math.max(columns.length, 1));
        preview = [{ _raw: text.slice(0, 500) }]; // Show raw preview for YAML
      } else {
        // Parse CSV (default)
        fileFormat = 'csv';
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          // Parse header
          columns = lines[0].split(',').map(col => col.trim().replace(/^["']|["']$/g, ''));
          rowCount = lines.length - 1;
          
          // Parse preview rows
          preview = lines.slice(1, 11).map(line => {
            const values = line.split(',').map(val => val.trim().replace(/^["']|["']$/g, ''));
            const row: any = {};
            columns.forEach((col, idx) => {
              row[col] = values[idx] || '';
            });
            return row;
          });
        }
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse file. Please ensure the file format is correct.', code: 'PARSE_ERROR' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const [newDataset] = await db.insert(datasets).values({
      workspaceId: parseInt(workspaceId),
      name: file.name,
      filePath: `/uploads/${workspaceId}/${file.name}`,
      fileSize: file.size,
      rowCount,
      columnCount: columns.length,
      columnsJson: columns,
      fileFormat,
      uploadedAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json({
      dataset: newDataset,
      columns,
      preview,
      fileFormat,
    }, { status: 201 });
  } catch (error) {
    console.error('Dataset upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}