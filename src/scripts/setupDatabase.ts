import { connectDB, sequelize } from '../config/database';
import '../models';
import { Movie, Room, Seat, Showtime, Snack } from '../models';

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const roomNames = [
    'Phòng 1 · 2D',
    'Phòng 2 · 2D',
    'Phòng 3 · 3D',
    'Phòng 4 · 3D',
    'Phòng 5 · IMAX 3D',
    'Phòng 6 · 4DX 3D',
];

const setupDatabase = async (): Promise<void> => {
    await connectDB();
    await sequelize.sync({ alter: true });

    await Room.bulkCreate(
        roomNames.map((name, index) => ({ room_id: index + 1, name, total_seats: 90 })),
        { updateOnDuplicate: ['name', 'total_seats'] },
    );

    const seats = roomNames.flatMap((_name, roomIndex) =>
        rows.flatMap((row) =>
            Array.from({ length: 10 }, (_value, colIndex) => ({
                room_id: roomIndex + 1,
                row_name: row,
                seat_number: colIndex + 1,
                type: ['E', 'F', 'G'].includes(row) ? 'VIP' as const : 'STANDARD' as const,
                physical_status: 'ACTIVE' as const,
            })),
        ),
    );

    await Seat.bulkCreate(seats, {
        updateOnDuplicate: ['type', 'physical_status'],
    });

    await Movie.bulkCreate(
        [
            {
                movie_id: 1,
                api_movie_id: 'avengers-secret-wars',
                title: 'Avengers: Secret Wars',
                genre: 'Hành động • Sci-Fi',
                rating: '9.2',
                description: 'Sau sự kiện Endgame, vũ trụ Marvel bước vào kỷ nguyên mới khi các dị nhân bắt đầu xâm chiếm Trái Đất từ đa vũ trụ.',
                director: 'Anthony & Joe Russo',
                cast: ['Robert Downey Jr.', 'Chris Evans', 'Scarlett Johansson', 'Benedict Cumberbatch', 'Tom Holland'],
                language: 'Tiếng Anh (Phụ đề Việt)',
                first_showing: '01/05/2026',
                status: 'NOW_SHOWING',
                duration_minutes: 180,
                age_restriction: 13,
                color_primary: '#1A237E',
                color_secondary: '#880E4F',
            },
            {
                movie_id: 2,
                api_movie_id: 'mission-impossible-8',
                title: 'Mission: Impossible 8',
                genre: 'Hành động • Gián điệp',
                rating: '8.9',
                description: 'Ethan Hunt và đội IMF phải ngăn chặn một tổ chức khủng bố bí ẩn có trong tay vũ khí có thể kiểm soát toàn bộ hệ thống tình báo thế giới.',
                director: 'Christopher McQuarrie',
                cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Rebecca Ferguson'],
                language: 'Tiếng Anh (Phụ đề Việt)',
                first_showing: '22/05/2026',
                status: 'NOW_SHOWING',
                duration_minutes: 155,
                age_restriction: 16,
                color_primary: '#4E342E',
                color_secondary: '#37474F',
            },
            {
                movie_id: 3,
                api_movie_id: 'inside-out-3',
                title: 'Inside Out 3',
                genre: 'Hoạt hình • Gia đình',
                rating: '8.5',
                description: 'Riley giờ đã vào đại học, mang theo cả thế giới cảm xúc bên trong.',
                director: 'Kelsey Mann',
                cast: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Tony Hale', 'Liza Lapira'],
                language: 'Tiếng Anh • Tiếng Việt (lồng tiếng)',
                first_showing: '13/06/2026',
                status: 'NOW_SHOWING',
                duration_minutes: 110,
                age_restriction: 0,
                color_primary: '#4A148C',
                color_secondary: '#0D47A1',
            },
            {
                movie_id: 4,
                api_movie_id: 'moana-3',
                title: 'Moana 3',
                genre: 'Hoạt hình • Phiêu lưu',
                rating: '8.7',
                description: 'Moana trở lại với hành trình vượt ra ngoài đại dương quen thuộc để khám phá những vùng đất huyền bí.',
                director: 'Dana Ledoux Miller',
                cast: ['Auli\'i Cravalho', 'Dwayne Johnson', 'Alan Tudyk', 'Rachel House', 'Temuera Morrison'],
                language: 'Tiếng Anh • Tiếng Việt (lồng tiếng)',
                first_showing: '25/06/2026',
                status: 'NOW_SHOWING',
                duration_minutes: 115,
                age_restriction: 0,
                color_primary: '#006064',
                color_secondary: '#1B5E20',
            },
            {
                movie_id: 5,
                api_movie_id: 'jurassic-world-4',
                title: 'Jurassic World 4',
                genre: 'Phiêu lưu • Viễn tưởng',
                rating: 'Sắp ra mắt',
                description: 'Một loài mới hung hãn và thông minh hơn bất kỳ loài nào từng tồn tại xuất hiện.',
                director: 'Gareth Edwards',
                cast: ['Scarlett Johansson', 'Jonathan Bailey', 'Manuel Garcia-Rulfo', 'Rupert Friend'],
                language: 'Tiếng Anh (Phụ đề Việt)',
                first_showing: 'Mùa hè 2026',
                status: 'UPCOMING',
                duration_minutes: 140,
                age_restriction: 13,
                color_primary: '#1B5E20',
                color_secondary: '#004D40',
            },
        ],
        {
            updateOnDuplicate: [
                'title',
                'genre',
                'rating',
                'description',
                'director',
                'cast',
                'language',
                'first_showing',
                'status',
                'duration_minutes',
                'age_restriction',
                'color_primary',
                'color_secondary',
            ],
        },
    );

    await Showtime.bulkCreate(
        [
            { showtime_id: 1, movie_id: 1, room_id: 1, start_time: new Date('2026-06-26T09:30:00'), end_time: new Date('2026-06-26T12:30:00'), price: 75000 },
            { showtime_id: 2, movie_id: 1, room_id: 5, start_time: new Date('2026-06-26T19:30:00'), end_time: new Date('2026-06-26T22:30:00'), price: 85000 },
            { showtime_id: 3, movie_id: 2, room_id: 2, start_time: new Date('2026-06-26T12:00:00'), end_time: new Date('2026-06-26T14:35:00'), price: 75000 },
            { showtime_id: 4, movie_id: 2, room_id: 6, start_time: new Date('2026-06-26T22:00:00'), end_time: new Date('2026-06-27T00:35:00'), price: 90000 },
            { showtime_id: 5, movie_id: 3, room_id: 3, start_time: new Date('2026-06-26T14:30:00'), end_time: new Date('2026-06-26T16:20:00'), price: 70000 },
            { showtime_id: 6, movie_id: 4, room_id: 4, start_time: new Date('2026-06-26T17:00:00'), end_time: new Date('2026-06-26T18:55:00'), price: 70000 },
            { showtime_id: 7, movie_id: 1, room_id: 5, start_time: new Date('2026-06-27T20:15:00'), end_time: new Date('2026-06-27T23:15:00'), price: 85000 },
            { showtime_id: 8, movie_id: 3, room_id: 1, start_time: new Date('2026-06-27T09:00:00'), end_time: new Date('2026-06-27T10:50:00'), price: 70000 },
        ],
        { updateOnDuplicate: ['movie_id', 'room_id', 'start_time', 'end_time', 'price'] },
    );

    await Snack.bulkCreate(
        [
            { snack_id: 1, name: 'Bắp rang bơ cỡ nhỏ', type: 'POPCORN', price: 45000, status: 'AVAILABLE' },
            { snack_id: 2, name: 'Bắp rang bơ cỡ lớn', type: 'POPCORN', price: 65000, status: 'AVAILABLE' },
            { snack_id: 3, name: 'Bắp phô mai cỡ nhỏ', type: 'POPCORN', price: 50000, status: 'AVAILABLE' },
            { snack_id: 4, name: 'Bắp phô mai cỡ lớn', type: 'POPCORN', price: 70000, status: 'AVAILABLE' },
            { snack_id: 5, name: 'Combo 1 - Bắp nhỏ + 1 Pepsi M', type: 'COMBO', price: 75000, status: 'AVAILABLE' },
            { snack_id: 6, name: 'Combo 2 - Bắp lớn + 2 Pepsi M', type: 'COMBO', price: 110000, status: 'AVAILABLE' },
            { snack_id: 7, name: 'Pepsi cỡ vừa', type: 'DRINK', price: 30000, status: 'AVAILABLE' },
            { snack_id: 8, name: 'Pepsi cỡ lớn', type: 'DRINK', price: 40000, status: 'AVAILABLE' },
            { snack_id: 9, name: '7UP cỡ vừa', type: 'DRINK', price: 30000, status: 'AVAILABLE' },
            { snack_id: 10, name: 'Nước suối', type: 'DRINK', price: 20000, status: 'AVAILABLE' },
            { snack_id: 11, name: 'Hotdog', type: 'FOOD', price: 50000, status: 'AVAILABLE' },
            { snack_id: 12, name: 'Khoai tây chiên', type: 'FOOD', price: 45000, status: 'AVAILABLE' },
        ],
        { updateOnDuplicate: ['name', 'type', 'price', 'status'] },
    );

    console.log('Database setup completed.');
};

setupDatabase()
    .catch((error) => {
        console.error('Database setup failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await sequelize.close();
    });
