import mysql from 'mysql2/promise';

async function seed() {
  const pool = mysql.createPool({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '4N17bdqBMGunQoK.root',
    password: 'p7KmDFgKsgVMmOwo',
    database: 'test',
    port: 4000,
    ssl: { rejectUnauthorized: true }
  });

  const queries = [
    `CREATE TABLE IF NOT EXISTS Admin (
        AdminID INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(50) NOT NULL UNIQUE,
        PasswordHash VARCHAR(255) NOT NULL,
        FullName VARCHAR(100) NOT NULL,
        Role VARCHAR(20) NOT NULL DEFAULT 'Staff',
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Customer (
        CustomerID INT AUTO_INCREMENT PRIMARY KEY,
        FullName VARCHAR(100) NOT NULL,
        Phone VARCHAR(20) NOT NULL,
        Email VARCHAR(100),
        IDProofType VARCHAR(50) NOT NULL,
        IDProofNumber VARCHAR(50) NOT NULL UNIQUE,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS Room (
        RoomID INT AUTO_INCREMENT PRIMARY KEY,
        RoomNumber VARCHAR(20) NOT NULL UNIQUE,
        RoomType VARCHAR(50) NOT NULL,
        PricePerNight DECIMAL(10, 2) NOT NULL,
        Status VARCHAR(30) NOT NULL DEFAULT 'Available',
        Floor INT DEFAULT 1
    )`,
    `CREATE TABLE IF NOT EXISTS Reservation (
        ReservationID INT AUTO_INCREMENT PRIMARY KEY,
        CustomerID INT NOT NULL,
        RoomID INT NOT NULL,
        CheckInDate DATE NOT NULL,
        CheckOutDate DATE NOT NULL,
        TotalNights INT NOT NULL,
        EstimatedCost DECIMAL(10, 2),
        Status VARCHAR(30) NOT NULL DEFAULT 'Confirmed',
        BookedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE RESTRICT,
        FOREIGN KEY (RoomID) REFERENCES Room(RoomID) ON DELETE RESTRICT
    )`,
    `CREATE TABLE IF NOT EXISTS CheckIn (
        CheckInID INT AUTO_INCREMENT PRIMARY KEY,
        ReservationID INT NOT NULL UNIQUE,
        ActualCheckIn DATETIME DEFAULT CURRENT_TIMESTAMP,
        ActualCheckOut DATETIME NULL,
        AddedCharges DECIMAL(10, 2) DEFAULT 0,
        ProcessedByAdminID INT,
        FOREIGN KEY (ReservationID) REFERENCES Reservation(ReservationID) ON DELETE CASCADE,
        FOREIGN KEY (ProcessedByAdminID) REFERENCES Admin(AdminID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Billing (
        BillID INT AUTO_INCREMENT PRIMARY KEY,
        ReservationID INT NOT NULL UNIQUE,
        TotalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        PaymentStatus VARCHAR(30) DEFAULT 'Paid',
        PaymentMethod VARCHAR(30) DEFAULT 'Card',
        BillDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ReservationID) REFERENCES Reservation(ReservationID) ON DELETE CASCADE
    )`,
    `INSERT IGNORE INTO Admin (Username, PasswordHash, FullName, Role) VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'System Administrator', 'Admin')`,
    `INSERT IGNORE INTO Room (RoomNumber, RoomType, PricePerNight, Status, Floor) VALUES
      ('101', 'Single', 1500.00, 'Available', 1),
      ('102', 'Single', 1500.00, 'Available', 1),
      ('103', 'Double', 2500.00, 'Available', 1),
      ('201', 'Deluxe', 4000.00, 'Available', 2),
      ('202', 'Deluxe', 4000.00, 'Maintenance', 2),
      ('301', 'Suite', 8000.00, 'Available', 3)`
  ];

  try {
    for (let q of queries) {
      console.log('Running query...');
      await pool.execute(q);
    }
    console.log("Database Seeded Successfully to TiDB Cloud!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    pool.end();
  }
}
seed();
