# 💸 FinanceApp - Personal Finance Management

A comprehensive full-stack financial management application built with React, TypeScript, Node.js, and SQLite. Track your income, expenses, and get insights into your spending patterns with beautiful visualizations.

## ✨ Features

- **💰 Transaction Management**: Add, edit, and delete income and expense transactions
- **📊 Dashboard**: Beautiful charts and statistics showing your financial overview
- **🏷️ Categories**: Organize transactions with customizable categories
- **🔍 Filtering**: Filter transactions by date, category, and type
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔐 User Authentication**: Secure login and registration system
- **📈 Data Visualization**: Interactive charts powered by Recharts
- **🎨 Modern UI**: Beautiful interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and setup the project**:
   ```bash
   git clone <your-repo-url>
   cd financial-app
   npm run install:all
   ```

2. **Setup environment variables**:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start the development servers**:
   ```bash
   # From the root directory
   npm run dev
   ```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Manual Setup

If you prefer to set up each part separately:

1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Setup the backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Setup the frontend** (in a new terminal):
   ```bash
   cd client
   npm install
   npm start
   ```

## 📱 Usage

1. **Register** a new account or **login** with existing credentials
2. **Add transactions** by clicking the "Add Transaction" button
3. **View your dashboard** for financial overview and insights
4. **Filter transactions** by date, category, or type
5. **Edit or delete** transactions as needed

## 🎯 Default Categories

The app comes with pre-configured categories:

**Income Categories:**
- Salary
- Freelance

**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare

You can add custom categories as needed.

## 📊 Dashboard Features

- **Financial Overview**: Total income, expenses, and net balance
- **Spending Breakdown**: Interactive pie chart showing expenses by category
- **Recent Transactions**: Quick view of your latest transactions
- **Period Selection**: View data for week, month, or year

## 🔧 Development

### Project Structure
```
financial-app/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   └── package.json
└── package.json          # Root package.json
```

### Available Scripts

From the root directory:
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

From the client directory:
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests

From the server directory:
- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development

## 🗄️ Database

The app uses SQLite with the following tables:
- `users` - User accounts
- `categories` - Income/expense categories
- `transactions` - Financial transactions
- `budgets` - Budget settings (for future features)

The database file (`financial_app.db`) is created automatically when you first run the server.

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- CORS enabled for cross-origin requests
- Input validation on both frontend and backend

## 🎨 Customization

### Adding New Categories
Categories are managed through the API. Default categories are automatically created, and users can add custom categories through the application.

### Styling
The app uses Tailwind CSS with a custom configuration. You can modify the design system in:
- `client/tailwind.config.js` - Tailwind configuration
- `client/src/index.css` - Global styles and custom components

## 📚 API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Transactions
- `GET /api/transactions` - Get user transactions (with optional filters)
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `server/.env` file
2. **Database issues**: Delete `financial_app.db` to reset the database
3. **Node modules issues**: Delete `node_modules` folders and run `npm run install:all`

### Getting Help

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify environment variables are set correctly
4. Check that both frontend and backend servers are running

---

Built with ❤️ using React, Node.js, and modern web technologies.
