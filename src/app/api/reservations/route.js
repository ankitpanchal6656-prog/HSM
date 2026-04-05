import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT r.ReservationID, c.FullName, rm.RoomNumber, r.CheckInDate, r.CheckOutDate, r.Status, r.EstimatedCost 
      FROM Reservation r 
      JOIN Customer c ON r.CustomerID = c.CustomerID
      JOIN Room rm ON r.RoomID = rm.RoomID
      ORDER BY r.CheckInDate DESC
    `;
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(req) {
  const connection = await pool.getConnection(); // Use transaction for safety
  try {
    const { CustomerID, RoomID, CheckInDate, CheckOutDate, EstimatedCost } = await req.json();

    if (!CustomerID || !RoomID || !CheckInDate || !CheckOutDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const inDate = new Date(CheckInDate);
    const outDate = new Date(CheckOutDate);

    if (outDate <= inDate) {
      return NextResponse.json({ error: 'Check-out date must be after Check-in date' }, { status: 400 });
    }

    await connection.beginTransaction();

    // The Double-Booking Prevention SQL (Ported exactly from PRD)
    const checkQuery = `
      SELECT COUNT(*) as overlaps 
      FROM Reservation 
      WHERE RoomID = ? AND Status = 'Confirmed' 
      AND NOT (CheckOutDate <= ? OR CheckInDate >= ?) FOR UPDATE
    `;
    
    // We format dates to YYYY-MM-DD to avoid time zone drift
    const sqlIn = inDate.toISOString().split('T')[0];
    const sqlOut = outDate.toISOString().split('T')[0];

    const [checkRows] = await connection.query(checkQuery, [RoomID, sqlIn, sqlOut]);

    if (checkRows[0].overlaps > 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'Double Booking: Room is already booked for these dates!' }, { status: 409 });
    }

    // Calculate nights
    const diffTime = Math.abs(outDate - inDate);
    const TotalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Insert Reservation
    const [result] = await connection.execute(
      'INSERT INTO Reservation (CustomerID, RoomID, CheckInDate, CheckOutDate, TotalNights, EstimatedCost, Status) VALUES (?, ?, ?, ?, ?, ?, "Confirmed")',
      [CustomerID, RoomID, sqlIn, sqlOut, TotalNights, EstimatedCost || 0]
    );

    await connection.commit();
    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  } finally {
    connection.release();
  }
}
