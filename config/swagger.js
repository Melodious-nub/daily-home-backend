const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DailyHome API',
      version: '2.0.0',
      description: 'API documentation for the DailyHome Mess Management System',
    },
    servers: [
      {
        // url: 'http://localhost:3000',
        url: 'https://daily-home-backend-dev.onrender.com'
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'API for user authentication and management'
      },
      {
        name: 'Mess',
        description: 'API for managing messes'
      },
      {
        name: 'Bazars',
        description: 'API for managing bazars'
      },
      {
        name: 'Wallets',
        description: 'API for managing wallets'
      },
      {
        name: 'Meals',
        description: 'API for managing meals'
      },
      {
        name: 'Summary',
        description: 'API for generating summary reports'
      },
    ],
  },
  apis: ['./routes/*.js'], // This is the path to your route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
