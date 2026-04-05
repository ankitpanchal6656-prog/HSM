import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Total Rooms
    const [totalRows] = await pool.query('SELECT COUNT(*) as count FROM Room');
    const totalRooms = totalRows[0].count;

    // 2. Occupied Rooms
    const [occupiedRows] = await pool.query("SELECT COUNT(*) as count FROM Room WHERE Status='Occupied'");
    const occupiedRooms = occupiedRows[0].count;

    // 3. Available Rooms
    const [availRows] = await pool.query("SELECT COUNT(*) as count FROM Room WHERE Status='Available'");
    const availableRooms = availRows[0].count;

    // 4. Today's Checkins (Looking at CheckIn table based on today's date)
    const [checkinRows] = await pool.query("SELECT COUNT(*) as count FROM CheckIn WHERE DATE(ActualCheckIn) = CURDATE()");
    const todaysCheckins = checkinRows[0].count;

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        todaysCheckins
      }
    });
  } catch (error) {
    console.error('Stats fetch Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
