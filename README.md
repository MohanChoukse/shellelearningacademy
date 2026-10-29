#shellelearningacademy

﻿<!-- This is a single-line comment skill-bridge -->
## 1) Backend Setup

1. Open a terminal in:
   `backend/`

2. Create a `.env` file in `backend/` with the following keys:

```env
# backend/.env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-secret
PORT=5000
```

3. Install and run:
```bash
npm install
npm start
```

You should see logs indicating MongoDB connected and the server listening on the configured port.

---

## 2) Frontend Setup

1. Open a new terminal in:
   `frontend/`

2. 
```bash
npm install
npm run dev
```



