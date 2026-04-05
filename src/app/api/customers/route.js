import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    let query = 'SELECT CustomerID, FullName, Phone, Email, IDProofType, IDProofNumber, CreatedAt FROM Customer';
    let params = [];

    if (search) {
      query += ' WHERE FullName LIKE ? OR Phone LIKE ? OR IDProofNumber LIKE ?';
      const likeSearch = `%${search}%`;
      params = [likeSearch, likeSearch, likeSearch];
    }

    query += ' ORDER BY CreatedAt DESC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { FullName, Phone, Email, IDProofType, IDProofNumber } = await req.json();

    if (!FullName || !Phone || !IDProofType || !IDProofNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.execute(
      'INSERT INTO Customer (FullName, Phone, Email, IDProofType, IDProofNumber) VALUES (?, ?, ?, ?, ?)',
      [FullName, Phone, Email, IDProofType, IDProofNumber]
    );

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error('Create Customer Error:', error);
    // Usually a duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'A customer with this ID Proof Number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add customer' }, { status: 500 });
  }
}
