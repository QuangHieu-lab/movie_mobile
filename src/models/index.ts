import Booking from './Booking';
import BookingSeat from './BookingSeat';
import BookingSnack from './BookingSnack';
import Movie from './Movie';
import Room from './Room';
import Seat from './Seat';
import Showtime from './Showtime';
import Snack from './Snack';
import User from './User';
import Payment from './Payment';

User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

Movie.hasMany(Showtime, { foreignKey: 'movie_id' });
Showtime.belongsTo(Movie, { foreignKey: 'movie_id' });

Room.hasMany(Seat, { foreignKey: 'room_id' });
Seat.belongsTo(Room, { foreignKey: 'room_id' });

Room.hasMany(Showtime, { foreignKey: 'room_id' });
Showtime.belongsTo(Room, { foreignKey: 'room_id' });

Showtime.hasMany(Booking, { foreignKey: 'showtime_id' });
Booking.belongsTo(Showtime, { foreignKey: 'showtime_id' });

Booking.hasMany(BookingSeat, { foreignKey: 'booking_id' });
BookingSeat.belongsTo(Booking, { foreignKey: 'booking_id' });

Showtime.hasMany(BookingSeat, { foreignKey: 'showtime_id' });
BookingSeat.belongsTo(Showtime, { foreignKey: 'showtime_id' });

Seat.hasMany(BookingSeat, { foreignKey: 'seat_id' });
BookingSeat.belongsTo(Seat, { foreignKey: 'seat_id' });

Booking.hasMany(BookingSnack, { foreignKey: 'booking_id' });
BookingSnack.belongsTo(Booking, { foreignKey: 'booking_id' });

Snack.hasMany(BookingSnack, { foreignKey: 'snack_id' });
BookingSnack.belongsTo(Snack, { foreignKey: 'snack_id' });

Booking.hasMany(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

export {
    Booking,
    BookingSeat,
    BookingSnack,
    Movie,
    Room,
    Seat,
    Payment,
    Showtime,
    Snack,
    User,
};
