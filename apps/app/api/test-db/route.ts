import { NextResponse } from 'next/server';
import { sql, testConnection } from '@/lib/db';

export async function GET() {
  try {
    // Test the connection
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful!',
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

