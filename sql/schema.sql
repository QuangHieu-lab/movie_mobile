CREATE DATABASE IF NOT EXISTS movie_mobile
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE movie_mobile;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    api_movie_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('UPCOMING', 'NOW_SHOWING', 'ENDED') DEFAULT 'UPCOMING',
    duration_minutes INT,
    age_restriction INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    total_seats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    row_name VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    type ENUM('STANDARD', 'VIP', 'COUPLE') DEFAULT 'STANDARD',
    physical_status ENUM('ACTIVE', 'MAINTENANCE') DEFAULT 'ACTIVE',
    CONSTRAINT fk_seats_room
        FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
        ON DELETE CASCADE,
    UNIQUE KEY unique_room_seat (room_id, row_name, seat_number)
);

CREATE TABLE IF NOT EXISTS Showtimes (
    showtime_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_showtimes_movie
        FOREIGN KEY (movie_id) REFERENCES Movies(movie_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_showtimes_room
        FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_showtime_time CHECK (start_time < end_time),
    INDEX idx_showtimes_movie_time (movie_id, start_time),
    INDEX idx_showtimes_room_time (room_id, start_time)
);

CREATE TABLE IF NOT EXISTS Snacks (
    snack_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('POPCORN', 'DRINK', 'COMBO') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('AVAILABLE', 'OUT_OF_STOCK') DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'E_WALLET', 'BANK_TRANSFER', 'CASH') NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    booking_status ENUM('RESERVED', 'CONFIRMED', 'CANCELLED') DEFAULT 'RESERVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_showtime
        FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id)
        ON DELETE RESTRICT,
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_showtime (showtime_id)
);

CREATE TABLE IF NOT EXISTS Booking_Seats (
    booking_seat_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_booking_seats_booking
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_seats_showtime
        FOREIGN KEY (showtime_id) REFERENCES Showtimes(showtime_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_booking_seats_seat
        FOREIGN KEY (seat_id) REFERENCES Seats(seat_id)
        ON DELETE RESTRICT,
    UNIQUE KEY unique_showtime_seat (showtime_id, seat_id),
    INDEX idx_booking_seats_booking (booking_id)
);

CREATE TABLE IF NOT EXISTS Booking_Snacks (
    booking_snack_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    snack_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_booking_snacks_booking
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_snacks_snack
        FOREIGN KEY (snack_id) REFERENCES Snacks(snack_id)
        ON DELETE RESTRICT
);
