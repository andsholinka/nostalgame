# NostalGame - Setup Guide

## 1. Setup Database (Neon PostgreSQL)

1. Buat akun di [neon.tech](https://neon.tech)
2. Buat project baru
3. Copy connection string dari dashboard Neon
4. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.neon.tech/neondb?sslmode=require"
```

5. Jalankan migrasi:

```bash
npx prisma migrate dev --name init
```

## 2. Generate VAPID Keys (Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copy output ke `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BPxxxxxxx..."
VAPID_PRIVATE_KEY="xxxxxxx..."
VAPID_SUBJECT="mailto:email@kamu.com"
```

## 3. Set Admin Password

```env
ADMIN_PASSWORD="password-kamu-yang-aman"
```

## 4. Deploy ke Vercel

1. Push ke GitHub
2. Connect repo di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di Vercel dashboard
4. Deploy!

## 5. Aktifkan Push Notifications

1. Buka `/admin` di browser HP/desktop
2. Login dengan admin password
3. Klik "🔔 AKTIFKAN NOTIF"
4. Allow notifications di browser
5. Setiap ada request game baru, kamu akan dapat push notification!

## Fitur Admin Dashboard (`/admin`)

- Lihat semua request game dari user
- Filter by status (pending/approved/rejected/done)
- Approve/Reject/Mark as Done
- Delete request
- Push notification real-time ke HP

## Fitur User

- Request game baru di `/request`
- Isi nama game, alasan, dan nama (opsional)
- Admin akan di-notify otomatis
