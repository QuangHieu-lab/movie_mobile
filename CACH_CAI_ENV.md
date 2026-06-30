# Cach Cai Dat .env

File `.env` chi dung o may local va da duoc Git bo qua. Khong commit file nay hoac chia se mat khau trong file.

## 1. Tao file .env

Trong thu muc `movie_mobile`, sao chep file mau:

```powershell
Copy-Item .env.example .env
```

Mo `.env` va thay cac gia tri mau bang cau hinh may cua ban.

## 2. Cau hinh database

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=movie_theater
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

## 3. Cau hinh gui OTP qua Gmail

Bat Xac minh 2 buoc cho Gmail, sau do tao Google App Password tai:

https://myaccount.google.com/apppasswords

Them App Password vao `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-google-app-password
MAIL_FROM="Cine <your-sender@gmail.com>"
```

`SMTP_PASS` la App Password cua Google, khong phai mat khau Gmail thuong. Khong dua gia tri nay vao GitHub.

## 4. Tao du lieu mau va chay API

```powershell
npm install
npm run db:setup
npm start
```

API se chay tai `http://localhost:3000`. Android emulator ket noi den API qua `http://10.0.2.2:3000`.

## 5. Neu dung dien thoai that

Chay Flutter voi IP LAN cua may tinh thay cho `10.0.2.2`:

```powershell
flutter run --dart-define=API_BASE_URL=http://YOUR_LAN_IP:3000
```

May tinh va dien thoai phai cung mang Wi-Fi; cho phep cong 3000 qua Windows Firewall neu duoc hoi.
