const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Home Management API',
      version: '1.0.0',
      description: 'API documentation for the Home Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    tags: [
      {
        name: 'Members',
        description: 'API for managing members'
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
