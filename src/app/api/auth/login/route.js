import pool from '@/lib/db';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Match the existing C# hash logic: simple SHA256 
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const [rows] = await pool.execute(
      'SELECT AdminID, FullName, Role FROM Admin WHERE Username = ? AND PasswordHash = ?',
      [username, hash]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    // In a real app we'd set JWT here. Returning user data for simplicity.
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message, stack: error.stack }, { status: 500 });
  }
}
