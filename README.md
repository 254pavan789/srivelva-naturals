# Sri Velva Naturals — Full-Stack E-Commerce

React (Vite) + Spring Boot + MySQL/H2 + Razorpay

---

## QUICK START

### 1. Backend

```bash
cd backend
# No MySQL? Backend auto-uses H2 in-memory (data resets on restart — fine for dev)
mvn spring-boot:run
# → http://localhost:8080
```

To use MySQL instead of H2:
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/srivelva?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=yourpassword
export SPRING_JPA_HIBERNATE_DDL_AUTO=update
mvn spring-boot:run
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

The Vite dev server proxies all `/api` calls to `http://localhost:8080` automatically.
**Do NOT set VITE_API_BASE_URL in .env during local development** — it would bypass the proxy.

---

## ONLINE PAYMENT SETUP (Razorpay)

### Option A — Demo Mode (default, no account needed)

The project ships with `VITE_PAYMENT_DEMO_MODE=true` in `frontend/.env`.
In demo mode, clicking "Pay Online" simulates a successful payment **without any real money being charged** and without needing a Razorpay account.

This is the default so you can test the full checkout flow immediately.

### Option B — Real Razorpay (test or live)

**Step 1 — Get your API keys (free, 2 minutes):**
1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy the **Key ID** (starts with `rzp_test_`) and the **Key Secret**

**Step 2 — Set frontend key:**
```bash
# frontend/.env
VITE_RAZORPAY_KEY=rzp_test_XXXXXXXXXXXXXXXXXXXX   # your real Key ID
VITE_PAYMENT_DEMO_MODE=false                       # disable demo mode
```

**Step 3 — Set backend keys:**
```bash
export RAZORPAY_KEY=rzp_test_XXXXXXXXXXXXXXXXXXXX
export RAZORPAY_SECRET=your_key_secret_here
```

Or add to `backend/.env` (if using dotenv-spring-boot):
```
RAZORPAY_KEY=rzp_test_XXXXXXXXXXXXXXXXXXXX
RAZORPAY_SECRET=your_key_secret_here
```

**Step 4 — Restart both servers.** Online payment will now open the real Razorpay modal.

### Root Cause of "Online payment is not configured" Error

The error appeared because:
1. `VITE_RAZORPAY_KEY` in `frontend/.env` was set to the placeholder value `rzp_test_your_key_here`
2. `Checkout.jsx` detects this and shows the error to prevent a broken payment UX

**Fix applied:** Added `VITE_PAYMENT_DEMO_MODE=true` — when set, the checkout page shows a working demo payment simulation without needing real keys. Set to `false` and add real keys for production.

---

## CSP (Content Security Policy) Notes

The project sets CSP via both `vite.config.js` (dev server headers) and a `<meta>` tag in `index.html`.

**Why `unsafe-eval` is needed in development:**
- Vite's HMR (Hot Module Replacement) uses `new Function()` internally for fast refresh
- This is development-only; production builds (`npm run build`) contain no eval

**For production:** Remove `'unsafe-eval'` from your server's CSP header. The production build does not need it.

**Razorpay requires:**
- `script-src ... https://checkout.razorpay.com` — loads the checkout JS
- `frame-src ... https://api.razorpay.com https://checkout.razorpay.com` — payment modal iframe
- `connect-src ... https://api.razorpay.com` — payment API calls

---

## API ENDPOINTS

| Method | URL                              | Description             | Auth?  |
|--------|----------------------------------|-------------------------|--------|
| GET    | /api/products                    | All products            | No     |
| GET    | /api/products?category=Oils      | Filtered products       | No     |
| GET    | /api/products/{id}               | Single product          | No     |
| POST   | /api/products                    | Create product          | Admin  |
| PUT    | /api/products/{id}               | Update product          | Admin  |
| DELETE | /api/products/{id}               | Delete product          | Admin  |
| POST   | /api/orders                      | Place order (customer)  | No     |
| GET    | /api/orders                      | All orders              | Admin  |
| PUT    | /api/orders/{id}/confirm         | Confirm order           | Admin  |
| PUT    | /api/orders/admin/{id}/status    | Update order status     | Admin  |
| DELETE | /api/orders/{id}                 | Delete order            | Admin  |
| POST   | /api/payment/create-order        | Create Razorpay order   | No     |
| POST   | /api/payment/verify              | Verify payment HMAC     | No     |
| GET    | /api/reviews/{productId}         | Product reviews         | No     |
| POST   | /api/reviews                     | Submit review           | No     |
| GET    | /api/settings                    | Business settings       | No     |
| PUT    | /api/settings                    | Update settings         | Admin  |
| POST   | /api/auth/login                  | Admin login             | No     |
| GET    | /h2-console                      | H2 DB browser (dev)    | No     |

---

## COMMON ERRORS

| Error | Cause | Fix |
|-------|-------|-----|
| ERR_CONNECTION_REFUSED | Backend not running | Run `mvn spring-boot:run` |
| "Online payment is not configured" | Placeholder Razorpay key | Set demo mode OR add real Razorpay keys |
| Payment 503 | Backend has placeholder Razorpay keys | Set `RAZORPAY_KEY` and `RAZORPAY_SECRET` env vars |
| CSP eval blocked | Strict CSP in browser | CSP now configured in vite.config.js + index.html |
| Network Error in Axios | VITE_API_BASE_URL set to localhost:8080 | Remove from .env, let proxy handle it |
| DB connection failed | MySQL not running | Use H2 (no env vars needed) or start MySQL |
| CORS error | Direct browser→backend call | Use Vite proxy (baseURL='/') |

---

## TECH STACK

- **Frontend**: React 18, Vite 5, React Router v6, Axios, react-hot-toast, react-icons
- **Backend**: Spring Boot 3.2, Spring Data JPA, MySQL 8 / H2, Razorpay SDK 1.4.3
- **Payment**: Razorpay (demo mode included — no account needed for development)
- **Fonts**: Playfair Display + Poppins (Google Fonts)
- **Brand Colours**: Forest green (#2D5016) + Honey gold (#B8860B)
