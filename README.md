# AssetPulse

**AssetPulse** is a web-based asset management system designed to help organizations track devices, manage staff assignments, and maintain a clear history of asset usage.

It allows administrators to manage devices and staff while providing real-time tracking of assignments and asset status.

## Overview

Managing company devices manually can quickly become chaotic. AssetPulse provides a centralized system where organizations can:

- Track all company devices

- Assign devices to staff

- Monitor asset status

- Maintain assignment history

- View operational metrics

The platform is built with a modern full-stack architecture using React and Supabase.

## Features

### Authentication

- Secure login using Supabase authentication

- Role-based access control

- Automatic dashboard redirection based on user role

## Admin Dashboard

Administrators can:

- Create and manage staff accounts

- Register new devices

- Assign devices to staff members

- Monitor device availability

- Track device assignment history

## Staff Dashboard

Staff members can:

- View devices assigned to them

- Track device information

- Monitor assignment history

## Device Management

- Create devices

- Update device information

- Track device status

- Monitor assignments

## Assignment Tracking

- Assign devices to staff

- Track assignment history

- Monitor who used what device and when

## Analytics

- Asset distribution metrics

- Device usage tracking

- Assignment insights

## Tech Stack

### Frontend

- React

- React Router

- TailwindCSS

- React Hot Toast

### Backend / Database

- Supabase

- PostgreSQL

- Supabase Authentication

### Deployment

- Vercel / Netlify (recommended)

## Project Structure
src
 ├── components
 ├── pages
 │    ├── Login.jsx
 │    ├── AdminDashboard.jsx
 │    └── StaffDashboard.jsx
 ├── hooks
 │    ├── AuthProvider.jsx
 │    └── AuthContext.jsx
 ├── services
 │    └── supabaseClient.js
 └── App.jsx

## Database Schema

### users_profile
column	type
id	uuid (auth user id)
email	text
role	text (admin / staff)
created_at	timestamp
### devices
column	type
id	uuid
name	text
serial_number	text
status	text
created_at	timestamp
### assignments
column	type
id	uuid
device_id	uuid
staff_id	uuid
assigned_at	timestamp
returned_at	timestamp

## Installation

Clone the repository

git clone https://github.com/Godwinn22/assetpulse.git

Navigate to the project directory

cd assetpulse

Install dependencies

npm install

Run the development server

npm run dev

## Environment Variables

Create a .env file in the root directory.

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

You can find these values in your Supabase Project Settings → API.

## Authentication Flow

1. User logs in via Supabase authentication

2. The system retrieves the user's profile from users_profile

3. Based on the role:

- Admin → redirected to admin dashboard

- Staff → redirected to staff dashboard

## Future Improvements

- Asset check-in / check-out workflow

- Device maintenance tracking

- Email notifications for assignments

- Audit logs

- Exportable reports

- Advanced analytics dashboards

## Contributing

Contributions are welcome.

Fork the repository

Create a feature branch

Commit your changes

Submit a pull request

## License

This project is licensed under the MIT License.

Author

Developed by Ohazulike Chukwuebuka

GitHub:
https://github.com/Godwinn22