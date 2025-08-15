const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DailyHome API',
      version: '2.3.0',
      description: `
# DailyHome Mess Management System API

A comprehensive REST API for managing mess (student accommodation) operations with real-time WebSocket communication and email notifications.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with OTP verification
- **Mess Management**: Create, join, and manage mess communities
- **Real-time Updates**: WebSocket integration for instant notifications
- **Email Notifications**: Automated email alerts for request status changes
- **Financial Tracking**: Bazar (grocery) and wallet management
- **Meal Management**: Track daily meals and attendance
- **Reporting**: Comprehensive summary and analytics

## 📧 Email Notifications

The system automatically sends email notifications for:
- **Request Accepted**: When admin accepts a user's join request
- **Request Rejected**: When admin rejects a user's join request

## 🔌 WebSocket Events

Real-time updates are provided for:
- Join request status changes
- Mess member updates
- New join requests
- Member activities

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:
\`Authorization: Bearer <your-jwt-token>\`

## 📱 WebSocket Connection

Connect to WebSocket with authentication:
\`\`\`javascript
const socket = io('https://daily-home-backend-dev.onrender.com', {
  auth: { token: 'your-jwt-token' }
});
\`\`\`

## 🧪 Testing

Use the provided test scripts to verify functionality:
- \`test-websocket.js\` - WebSocket functionality tests
- \`verify-websocket.js\` - Quick connection verification
      `,
      contact: {
        name: 'DailyHome Support',
        email: 'support@dailyhome.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        name: 'Production',
        url: 'https://daily-home-backend-dev.onrender.com',
        description: 'Production server'
      },
      {
        name: 'Development',
        url: 'http://localhost:3000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint'
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+8801712345678' },
            isVerified: { type: 'boolean', example: true },
            isMessAdmin: { type: 'boolean', example: false },
            currentMess: { type: 'string', example: '507f1f77bcf86cd799439012' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Mess: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'Student Mess #1' },
            address: { type: 'string', example: '123 University Road, Dhaka' },
            identifierCode: { type: 'string', example: 'MESS123456' },
            admin: { $ref: '#/components/schemas/User' },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  joinedAt: { type: 'string', format: 'date-time' },
                  isActive: { type: 'boolean' }
                }
              }
            },
            pendingRequests: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  requestedAt: { type: 'string', format: 'date-time' },
                  status: { type: 'string', enum: ['pending', 'approved', 'rejected'] }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
            status: { type: 'number', example: 400 }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication, registration, and account management endpoints'
      },
      {
        name: 'Mess',
        description: 'Mess creation, joining, and management operations with real-time updates'
      },
      {
        name: 'Bazars',
        description: 'Grocery shopping and expense tracking functionality'
      },
      {
        name: 'Wallets',
        description: 'Financial management and transaction tracking'
      },
      {
        name: 'Meals',
        description: 'Daily meal tracking and attendance management'
      },
      {
        name: 'Summary',
        description: 'Analytics and reporting endpoints for mess activities'
      },
      {
        name: 'WebSocket',
        description: 'Real-time communication events and connection management'
      }
    ],
  },
  apis: ['./routes/*.js'], // Path to route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
