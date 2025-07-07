# Hidden Haven Portal

A secure, enterprise-grade encrypted marketplace platform with advanced security features, admin controls, and seamless shop management capabilities.

## 🛡️ Overview

Hidden Haven Portal is a privacy-first marketplace solution designed for secure e-commerce operations. It features end-to-end encryption, invitation-only registration, role-based access controls, and comprehensive shop management tools.

## ✨ Key Features

### 🔐 Security & Privacy
- **End-to-End Encryption**: Military-grade encryption for all sensitive data
- **Invitation-Only Registration**: Admin-controlled user access with secure invitation codes
- **Role-Based Access Control**: Granular permissions and user management
- **Secure Authentication**: JWT-based authentication with session management
- **Privacy-First Architecture**: Built with security as the foundation

### 🏪 Shop Management
- **Multi-Shop Support**: Create and manage multiple secure marketplaces
- **Advanced Theming**: Customizable branding and styling options
- **Shop Access Codes**: Additional layer of protection for shop access
- **Secure URLs**: Enhanced privacy features for shop links
- **Real-time Updates**: Live inventory and order management

### 📦 Order Management
- **Comprehensive Order Tracking**: Full order lifecycle management
- **Multiple Payment Methods**: Flexible payment processing
- **Delivery Options**: Various shipping and delivery configurations
- **Customer Management**: Detailed customer information and history
- **Automated Notifications**: Email and browser notifications

### 💬 Communication
- **Secure Messaging**: Encrypted user-to-user communication
- **File Sharing**: Secure file upload and sharing capabilities
- **Shop Owner Contact**: Direct communication with marketplace owners
- **Real-time Chat**: Instant messaging with online status indicators

### 🎨 User Experience
- **Modern UI**: Beautiful, responsive design with dark/light mode
- **Smooth Animations**: Enhanced user experience with fluid transitions
- **Mobile-First**: Optimized for all device sizes
- **Accessibility**: WCAG compliant design patterns

## 🚀 Technologies

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form management with validation
- **Lucide React** - Beautiful SVG icons

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **Multer** - File upload handling
- **Nodemailer** - Email service integration
- **IMAP** - Email monitoring capabilities
- **JWT** - JSON Web Token authentication

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## ⚡ Quick Start

### Automated Setup (Recommended)

For Windows users, use the automated PowerShell script:

```powershell
.\start.ps1
```

This script will:
- Install all dependencies for both frontend and backend
- Start the main server (port 3001)
- Start the message server (port 3002)
- Start the notification server (port 3003)
- Launch the frontend development server (port 5173)

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hidden-haven-portal
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend services**
   ```bash
   cd server
   
   # Terminal 1 - Main Server
   npm start
   
   # Terminal 2 - Message Server
   node messageServer.js
   
   # Terminal 3 - Notification Server
   node notificationServer.js
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🌐 Service URLs

- **Frontend Application**: http://localhost:5173
- **Main API Server**: http://localhost:3001
- **Message Server**: http://localhost:3002
- **Notification Server**: http://localhost:3003

## 📁 Project Structure

```
hidden-haven-portal/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── AppSidebar.tsx       # Main navigation sidebar
│   │   ├── NotificationSettings.tsx
│   │   ├── OrdersOverview.tsx
│   │   └── ...
│   ├── pages/                   # Page components
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── Login.tsx           # Authentication
│   │   ├── ShopManagement.tsx  # Shop admin interface
│   │   ├── Messages.tsx        # Communication system
│   │   └── ...
│   ├── context/                # React context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── LanguageContext.tsx # Internationalization
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── lib/                    # Library configurations
├── server/                     # Backend services
│   ├── index.js               # Main API server
│   ├── messageServer.js       # Real-time messaging
│   ├── notificationServer.js  # Push notifications
│   ├── utils/                 # Server utilities
│   ├── uploads/               # File storage
│   ├── *.json                 # Data storage files
│   └── package.json           # Backend dependencies
├── public/                    # Static assets
├── start.ps1                  # Automated setup script
└── package.json              # Frontend dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - User registration with invitation code
- `POST /api/login` - User authentication
- `GET /api/users` - List all users (admin)
- `GET /api/users/search/:username` - Search users by username

### Shop Management
- `GET /api/shops` - List user's shops
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:id` - Update shop details
- `DELETE /api/shops/:id` - Delete shop
- `GET /api/public-shop/:id` - Public shop view

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders/shop/:shopId` - Get shop orders
- `GET /api/orders/customer/:customerId` - Get customer orders
- `PUT /api/orders/:id/status` - Update order status

### File Management
- `POST /api/upload` - Upload files (images, documents)
- File storage in `server/uploads/` directory

## 🔒 Security Features

### Data Protection
- All sensitive data encrypted at rest and in transit
- Secure file upload with type validation
- Input sanitization and validation
- CORS protection and rate limiting

### Access Control
- JWT-based authentication system
- Role-based permissions (admin, user, shop owner)
- Invitation-only registration system
- Shop access code protection

### Privacy
- No tracking or analytics by default
- Minimal data collection principles
- Secure communication channels
- Privacy-first architecture

## 🎨 Customization

### Theme Configuration
The application uses a custom design system defined in:
- `src/index.css` - CSS variables and design tokens
- `tailwind.config.ts` - Tailwind CSS configuration
- `src/components/ui/` - Customizable UI components

### Color Scheme
The design system uses HSL color values for consistent theming:
- Primary colors for branding and actions
- Semantic colors for status and feedback
- Support for dark and light modes

## 🚀 Deployment

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to your hosting service

### Backend Deployment
1. Configure environment variables for production
2. Set up process management (PM2, Docker, etc.)
3. Configure reverse proxy (nginx, Apache)
4. Set up SSL/TLS certificates
5. Configure firewall and security groups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

- **v1.0.0** - Initial release with core marketplace functionality
- **v1.1.0** - Added messaging system and notifications
- **v1.2.0** - Enhanced security features and admin controls
- **v1.3.0** - Improved UI/UX with advanced theming

---

**Built with privacy and security in mind** 🛡️