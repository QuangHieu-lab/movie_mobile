import { connectDB, sequelize } from '../config/database';
import '../models';
import { Movie, Room, Seat, Showtime, Snack } from '../models';
import { movies, rooms, seatRows, showtimes, snacks } from '../data/seed-data';

const setupDatabase = async (): Promise<void> => {
    await connectDB();
    await sequelize.sync({ alter: true });

    await Room.bulkCreate(
        rooms,
        { updateOnDuplicate: ['name', 'total_seats'] },
    );

    const seats = rooms.flatMap((room) =>
        seatRows.flatMap((row) =>
            Array.from({ length: 10 }, (_value, colIndex) => ({
                room_id: room.room_id,
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
        movies,
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
                'poster_url',
                'status',
                'duration_minutes',
                'age_restriction',
                'color_primary',
                'color_secondary',
            ],
        },
    );

    await Showtime.bulkCreate(
        showtimes.map((showtime) => ({
            ...showtime,
            start_time: new Date(showtime.start_time),
            end_time: new Date(showtime.end_time),
        })),
        { updateOnDuplicate: ['movie_id', 'room_id', 'start_time', 'end_time', 'price'] },
    );

    await Snack.bulkCreate(
        snacks,
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
