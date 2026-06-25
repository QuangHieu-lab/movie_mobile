USE movie_theater;

INSERT INTO Rooms (room_id, name, total_seats) VALUES
    (1, 'Phòng 1 · 2D', 90),
    (2, 'Phòng 2 · 2D', 90),
    (3, 'Phòng 3 · 3D', 90),
    (4, 'Phòng 4 · 3D', 90),
    (5, 'Phòng 5 · IMAX 3D', 90),
    (6, 'Phòng 6 · 4DX 3D', 90)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    total_seats = VALUES(total_seats);

INSERT INTO Seats (room_id, row_name, seat_number, type)
SELECT r.room_id, rows.row_name, nums.seat_number,
    CASE
        WHEN rows.row_name IN ('E', 'F', 'G') THEN 'VIP'
        ELSE 'STANDARD'
    END AS type
FROM Rooms r
CROSS JOIN (
    SELECT 'A' AS row_name UNION ALL SELECT 'B' UNION ALL SELECT 'C' UNION ALL
    SELECT 'D' UNION ALL SELECT 'E' UNION ALL SELECT 'F' UNION ALL
    SELECT 'G' UNION ALL SELECT 'H' UNION ALL SELECT 'I'
) rows
CROSS JOIN (
    SELECT 1 AS seat_number UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) nums
ON DUPLICATE KEY UPDATE
    type = VALUES(type),
    physical_status = 'ACTIVE';

INSERT INTO Movies (
    movie_id, api_movie_id, title, genre, rating, description, director, cast, language,
    first_showing, status, duration_minutes, age_restriction, color_primary, color_secondary
) VALUES
    (1, 'avengers-secret-wars', 'Avengers: Secret Wars', 'Hành động • Sci-Fi', '9.2',
     'Sau sự kiện Endgame, vũ trụ Marvel bước vào kỷ nguyên mới khi các dị nhân bắt đầu xâm chiếm Trái Đất từ đa vũ trụ.',
     'Anthony & Joe Russo', JSON_ARRAY('Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson', 'Benedict Cumberbatch', 'Tom Holland'),
     'Tiếng Anh (Phụ đề Việt)', '01/05/2026', 'NOW_SHOWING', 180, 13, '#1A237E', '#880E4F'),
    (2, 'mission-impossible-8', 'Mission: Impossible 8', 'Hành động • Gián điệp', '8.9',
     'Ethan Hunt và đội IMF phải ngăn chặn một tổ chức khủng bố bí ẩn có trong tay vũ khí có thể kiểm soát toàn bộ hệ thống tình báo thế giới.',
     'Christopher McQuarrie', JSON_ARRAY('Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson'),
     'Tiếng Anh (Phụ đề Việt)', '22/05/2026', 'NOW_SHOWING', 155, 16, '#4E342E', '#37474F'),
    (3, 'inside-out-3', 'Inside Out 3', 'Hoạt hình • Gia đình', '8.5',
     'Riley giờ đã vào đại học, mang theo cả thế giới cảm xúc bên trong.',
     'Kelsey Mann', JSON_ARRAY('Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Tony Hale', 'Liza Lapira'),
     'Tiếng Anh • Tiếng Việt (lồng tiếng)', '13/06/2026', 'NOW_SHOWING', 110, 0, '#4A148C', '#0D47A1'),
    (4, 'moana-3', 'Moana 3', 'Hoạt hình • Phiêu lưu', '8.7',
     'Moana trở lại với hành trình vượt ra ngoài đại dương quen thuộc để khám phá những vùng đất huyền bí.',
     'Dana Ledoux Miller', JSON_ARRAY('Auli''i Cravalho', 'Dwayne Johnson', 'Alan Tudyk', 'Rachel House', 'Temuera Morrison'),
     'Tiếng Anh • Tiếng Việt (lồng tiếng)', '25/06/2026', 'NOW_SHOWING', 115, 0, '#006064', '#1B5E20'),
    (5, 'jurassic-world-4', 'Jurassic World 4', 'Phiêu lưu • Viễn tưởng', 'Sắp ra mắt',
     'Một loài mới hung hãn và thông minh hơn bất kỳ loài nào từng tồn tại xuất hiện.',
     'Gareth Edwards', JSON_ARRAY('Scarlett Johansson', 'Jonathan Bailey', 'Manuel Garcia-Rulfo', 'Rupert Friend'),
     'Tiếng Anh (Phụ đề Việt)', 'Mùa hè 2026', 'UPCOMING', 140, 13, '#1B5E20', '#004D40')
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    genre = VALUES(genre),
    rating = VALUES(rating),
    description = VALUES(description),
    director = VALUES(director),
    cast = VALUES(cast),
    language = VALUES(language),
    first_showing = VALUES(first_showing),
    status = VALUES(status),
    duration_minutes = VALUES(duration_minutes),
    age_restriction = VALUES(age_restriction),
    color_primary = VALUES(color_primary),
    color_secondary = VALUES(color_secondary);

INSERT INTO Showtimes (showtime_id, movie_id, room_id, start_time, end_time, price) VALUES
    (1, 1, 1, '2026-06-26 09:30:00', '2026-06-26 12:30:00', 75000),
    (2, 1, 5, '2026-06-26 19:30:00', '2026-06-26 22:30:00', 85000),
    (3, 2, 2, '2026-06-26 12:00:00', '2026-06-26 14:35:00', 75000),
    (4, 2, 6, '2026-06-26 22:00:00', '2026-06-27 00:35:00', 90000),
    (5, 3, 3, '2026-06-26 14:30:00', '2026-06-26 16:20:00', 70000),
    (6, 4, 4, '2026-06-26 17:00:00', '2026-06-26 18:55:00', 70000),
    (7, 1, 5, '2026-06-27 20:15:00', '2026-06-27 23:15:00', 85000),
    (8, 3, 1, '2026-06-27 09:00:00', '2026-06-27 10:50:00', 70000)
ON DUPLICATE KEY UPDATE
    movie_id = VALUES(movie_id),
    room_id = VALUES(room_id),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    price = VALUES(price);

INSERT INTO Snacks (snack_id, name, type, price, status) VALUES
    (1, 'Bắp rang bơ cỡ nhỏ', 'POPCORN', 45000, 'AVAILABLE'),
    (2, 'Bắp rang bơ cỡ lớn', 'POPCORN', 65000, 'AVAILABLE'),
    (3, 'Bắp phô mai cỡ nhỏ', 'POPCORN', 50000, 'AVAILABLE'),
    (4, 'Bắp phô mai cỡ lớn', 'POPCORN', 70000, 'AVAILABLE'),
    (5, 'Combo 1 - Bắp nhỏ + 1 Pepsi M', 'COMBO', 75000, 'AVAILABLE'),
    (6, 'Combo 2 - Bắp lớn + 2 Pepsi M', 'COMBO', 110000, 'AVAILABLE'),
    (7, 'Pepsi cỡ vừa', 'DRINK', 30000, 'AVAILABLE'),
    (8, 'Pepsi cỡ lớn', 'DRINK', 40000, 'AVAILABLE'),
    (9, '7UP cỡ vừa', 'DRINK', 30000, 'AVAILABLE'),
    (10, 'Nước suối', 'DRINK', 20000, 'AVAILABLE'),
    (11, 'Hotdog', 'FOOD', 50000, 'AVAILABLE'),
    (12, 'Khoai tây chiên', 'FOOD', 45000, 'AVAILABLE')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    type = VALUES(type),
    price = VALUES(price),
    status = VALUES(status);
