# 📧 Order Status Email Setup — Sri Velva Naturals

Email is **fully built** in the backend. You just need to fill in your Gmail credentials.

## Steps (takes 5 minutes)

### Step 1 — Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail (e.g. `srivelvanaturals@gmail.com`)
3. Select app: **Mail** → Select device: **Other** → type "Sri Velva"
4. Click **Generate** → Copy the 16-character password (e.g. `abcd efgh ijkl mnop`)

### Step 2 — Edit application.properties
Open: `backend/src/main/resources/application.properties`

Find these two lines and replace:
```
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password-here
```

Change to:
```
spring.mail.username=srivelvanaturals@gmail.com
spring.mail.password=abcdefghijklmnop
```
(no spaces in the password)

### Step 3 — Restart backend
```bash
cd backend
./mvnw spring-boot:run
```

## What happens when admin changes order status?

| Admin changes status to | Customer receives email |
|------------------------|------------------------|
| CONFIRMED | "Order #28 Confirmed — Sri Velva Naturals" |
| PAID | "Payment Received for Order #28" |
| SHIPPED | "Order #28 Shipped — on its way!" |
| DELIVERED | "Order #28 Delivered — enjoy!" |

The email goes to whatever email the customer entered at checkout.

## Test email (optional)
After setup, test with:
```
GET http://localhost:8080/api/mail-test?to=your@email.com
```
