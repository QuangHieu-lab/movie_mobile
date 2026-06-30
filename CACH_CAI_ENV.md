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

## 4. Cau hinh MoMo test

MoMo can bo `PARTNER_CODE`, `ACCESS_KEY`, va `SECRET_KEY` khop voi nhau. Neu dung key cu hoac sai secret, MoMo se bao loi `Chu ky khong hop le` va app Android/web se khong mo duoc link thanh toan dung.

Neu chay local va can MoMo callback ve backend, tao ngrok cho port 3000:

```powershell
ngrok http 3000
```

Sau do cap nhat `.env` bang domain HTTPS moi cua ngrok:

```env
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_API_URL=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=https://your-ngrok-domain.ngrok-free.app/api/payments/momo/return
MOMO_IPN_URL=https://your-ngrok-domain.ngrok-free.app/api/payments/webhook
```

Luu y:

- `MOMO_REDIRECT_URL` va `MOMO_IPN_URL` phai la HTTPS public URL, khong dung `localhost`.
- Moi lan ngrok doi domain, phai cap nhat lai 2 bien tren.
- Neu MoMo bao link/phien het han, tao lai giao dich moi trong app; link MoMo test khong nen dung lai.

## 5. Tao du lieu mau va chay API

```powershell
npm install
npm run db:setup
npm start
```

API se chay tai `http://localhost:3000`. Android emulator ket noi den API qua `http://10.0.2.2:3000`.

## 6. Neu dung dien thoai that

Chay Flutter voi IP LAN cua may tinh thay cho `10.0.2.2`:

```powershell
flutter run --dart-define=API_BASE_URL=http://YOUR_LAN_IP:3000
```

May tinh va dien thoai phai cung mang Wi-Fi; cho phep cong 3000 qua Windows Firewall neu duoc hoi.
