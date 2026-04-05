import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT RoomID, RoomNumber, RoomType, PricePerNight, Floor, Status FROM Room ORDER BY RoomNumber ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { RoomNumber, RoomType, Floor, PricePerNight } = await req.json();

    if (!RoomNumber || !RoomType || !PricePerNight) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO Room (RoomNumber, RoomType, Floor, PricePerNight, Status) VALUES (?, ?, ?, ?, "Available")',
      [RoomNumber, RoomType, Floor || 1, PricePerNight]
    );

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Room number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add room' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { RoomID, Status } = await req.json();
    if (!RoomID || !Status) {
      return NextResponse.json({ error: 'RoomID and Status are required' }, { status: 400 });
    }

    await pool.execute('UPDATE Room SET Status = ? WHERE RoomID = ?', [Status, RoomID]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update room status' }, { status: 500 });
  }
}
