const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "Description of your API",
    },
    servers: [
      {
        url: "http://localhost:3000", // Replace with your API server URL
        description: "Development server",
      },
    ],
  },
  apis: ["../routes/routes.js"], // Replace with the path to your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;
