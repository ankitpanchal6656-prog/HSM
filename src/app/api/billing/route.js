import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Bring in Reservations that are confirmed and need checkout/billing
    const query = `
      SELECT r.ReservationID, c.FullName, rm.RoomNumber, r.EstimatedCost, r.Status, 
             ci.ActualCheckIn, ci.ActualCheckOut, b.PaymentStatus 
      FROM Reservation r
      JOIN Customer c ON r.CustomerID = c.CustomerID
      JOIN Room rm ON r.RoomID = rm.RoomID
      LEFT JOIN CheckIn ci ON r.ReservationID = ci.ReservationID
      LEFT JOIN Billing b ON r.ReservationID = b.ReservationID
      ORDER BY r.ReservationID DESC
    `;
    const [rows] = await pool.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
  }
}

export async function POST(req) {
  const connection = await pool.getConnection();
  try {
    const { action, ReservationID, AddedCharges, PaymentMethod } = await req.json();

    if (!action || !ReservationID) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await connection.beginTransaction();

    if (action === 'checkin') {
      // 1. Insert CheckIn Record
      await connection.execute('INSERT INTO CheckIn (ReservationID, ActualCheckIn) VALUES (?, NOW())', [ReservationID]);
      // 2. Update Room Status to Occupied
      await connection.execute('UPDATE Room SET Status="Occupied" WHERE RoomID = (SELECT RoomID FROM Reservation WHERE ReservationID = ?)', [ReservationID]);
      
    } else if (action === 'checkout') {
      // 1. Get Reservation Details
      const [resData] = await connection.query('SELECT EstimatedCost, RoomID FROM Reservation WHERE ReservationID = ?', [ReservationID]);
      const baseCost = resData[0].EstimatedCost;
      const finalCost = Number(baseCost) + Number(AddedCharges || 0);

      // 2. Update CheckOut time
      await connection.execute('UPDATE CheckIn SET ActualCheckOut=NOW(), AddedCharges=? WHERE ReservationID=?', [AddedCharges || 0, ReservationID]);

      // 3. Create Bill
      await connection.execute('INSERT INTO Billing (ReservationID, TotalAmount, PaymentStatus, PaymentMethod) VALUES (?, ?, "Paid", ?)', [ReservationID, finalCost, PaymentMethod || 'Card']);

      // 4. Update Reservation & Room
      await connection.execute('UPDATE Reservation SET Status="Completed" WHERE ReservationID=?', [ReservationID]);
      await connection.execute('UPDATE Room SET Status="Available" WHERE RoomID=?', [resData[0].RoomID]);
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    return NextResponse.json({ error: 'Billing/Checkin process failed' }, { status: 500 });
  } finally {
    connection.release();
  }
}
