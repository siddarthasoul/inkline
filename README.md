# Inkline

Inkline is a personal article publishing platform with public reading pages and an owner dashboard.

## Project structure

- `frontend/` — Next.js, React, TypeScript, and Tailwind CSS
- `backend/` — Express, TypeScript, and MongoDB/Mongoose
- MongoDB Atlas — hosted database
- Docker — containerized development and deployment

## Features

- Public article listing and detail pages
- Owner authentication and dashboard
- Article creation, editing, and publishing
- Article likes
- Privacy policy and terms pages

## Local development

### Backend

```bash
cd backend
npm ci
```

Configure `backend/.env` using `backend/.env.example`. Never commit secrets.

### Frontend

```bash
cd frontend
npm ci
```

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Run each application using the scripts defined in its `package.json`.

## Docker

Frontend and backend have separate Dockerfiles and Compose configurations. Run Docker Compose from the relevant application directory.

## Planned production domains

- Website: https://inkline.siddartha.in
- API: https://api-inkline.siddartha.in

These domains require hosting and DNS configuration before they become publicly available.

## Security

Never commit `.env` files, credentials, access tokens, or production secrets. Configure production environment variables in the hosting provider.

## License

All rights reserved unless a license is added to this repository.
