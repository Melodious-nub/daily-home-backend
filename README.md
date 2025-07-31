# DailyHome - Mess Management System

A comprehensive backend API for managing mess (shared accommodation) expenses, meals, and member finances.

## Author

**Shawon Talukder**  
Software Engineer (Green Delta Insurance PLC)

📧 [shawon.taluckder2@gmail.com](mailto:shawon.taluckder2@gmail.com)

---

## Features

### User Management
- **User Registration**: Sign up with email, password, and full name
- **Email Verification**: 4-digit OTP verification with 3-minute expiry
- **User Authentication**: JWT-based authentication system
- **Password Security**: Bcrypt hashing for secure password storage

### Mess Management
- **Create Mess**: Users can create a new mess with name and address
- **Join Mess**: Users can join existing messes using 6-digit identifier codes
- **Leave Mess**: Users can leave a mess (admin cannot leave without transferring admin role)
- **Mess Admin**: Mess creator becomes admin with additional privileges
- **Unique Identifier**: Each mess gets a unique 6-digit code for easy joining

### Financial Management
- **Wallet System**: Users can deposit money into their mess wallet
- **Bazar Tracking**: Track daily grocery expenses
- **Meal Counting**: Record daily meal consumption
- **Cost Calculation**: Automatic meal rate calculation and cost distribution

### Reporting
- **Daily Summary**: Today's meal count and breakdown
- **Monthly Reports**: Comprehensive financial and meal summaries
- **User-wise Analysis**: Individual user statistics and balances

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Mess Management
- `POST /api/mess` - Create new mess
- `GET /api/mess/search/:code` - Search mess by identifier code
- `POST /api/mess/join` - Join a mess
- `POST /api/mess/leave` - Leave current mess
- `GET /api/mess` - Get mess details
- `DELETE /api/mess/members/:memberId` - Remove member (admin only)

### Financial Management
- `GET /api/wallets` - Get user's wallet transactions
- `POST /api/wallets` - Add money to wallet
- `GET /api/wallets/summary` - Get mess wallet summary (admin only)
- `DELETE /api/wallets/:id` - Delete wallet transaction (admin only)

### Bazar Management
- `GET /api/bazars` - Get mess bazar entries
- `POST /api/bazars` - Add bazar entry
- `DELETE /api/bazars/:id` - Delete bazar entry

### Meal Management
- `GET /api/meals` - Get mess meals
- `POST /api/meals` - Add meal entry
- `POST /api/meals/bulk` - Add multiple meals (admin only)
- `DELETE /api/meals/:id` - Delete meal entry

### Reports
- `GET /api/summary` - Get monthly summary report

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/DailyHome

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Server
PORT=3000
```

### Email Setup
For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASS

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with required variables
4. Start the server:
   ```bash
   npm start
   ```

## API Documentation

Visit `/api-docs` for interactive API documentation powered by Swagger.

## Database Models

### User
- Email, password, full name
- Email verification status
- Current mess association
- Admin role status

### Mess
- Name, address, identifier code
- Admin user reference
- Member list with join dates

### Wallet
- User and mess references
- Transaction amount and type
- Description and date

### Bazar
- Date, cost, description
- Mess and added by user references

### Meal
- User, mess, date, meal count
- Added by user reference

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Email verification with OTP
- Role-based access control
- Mess isolation (users can only access their mess data)

## Migration from v1

The system has been completely redesigned from the previous room-based system to a user-based mess system. Key changes:

- Removed room system
- Added user authentication
- Introduced mess concept
- Updated all models to work with users and messes
- Added comprehensive access control

## Contributing

We welcome contributions from the community! If you'd like to contribute to DailyHome, please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   - Fork this repository to your GitHub account
   - Clone your forked repository locally

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, well-documented code
   - Follow the existing code style and conventions
   - Add tests for new features
   - Update documentation if needed

4. **Test Your Changes**
   - Ensure all existing tests pass
   - Add new tests for your features
   - Test the API endpoints manually

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create a Pull Request with a clear description
   - Reference any related issues

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env` (if available)
   - Configure your environment variables

3. **Database Setup**
   - Ensure MongoDB is running
   - Update `MONGO_URI` in your `.env` file

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Code Style Guidelines

- Use meaningful variable and function names
- Add comments for complex logic
- Follow ESLint rules (if configured)
- Use consistent indentation (2 spaces)
- Write descriptive commit messages

### Reporting Issues

- Use the GitHub Issues page
- Provide detailed bug reports
- Include steps to reproduce
- Mention your environment details

### Contact

For questions about contributing, feel free to reach out to:
- **Shawon Talukder**: [shawon.taluckder2@gmail.com](mailto:shawon.taluckder2@gmail.com)

## License

ISC
