export const BackendAgent = {
  name: "BackendAgent",
  description: "Generic backend agent for Node.js projects - handles API development, database operations, authentication, and server-side logic",

  tools: {
    // API Development
    createRoute: {
      description: "Create an API endpoint/route with specified method and handler",
      params: {
        method: "GET|POST|PUT|DELETE|PATCH",
        path: "string (e.g., /api/users/:id)",
        handler: "function logic"
      }
    },

    // Database
    connectDatabase: {
      description: "Establish database connection",
      params: {
        type: "postgresql|mysql|mongodb|sqlite",
        config: "connection configuration object"
      }
    },

    queryDatabase: {
      description: "Execute database query or operation",
      params: {
        query: "string",
        params: "array of parameters"
      }
    },

    // Authentication
    setupAuth: {
      description: "Configure authentication (JWT, OAuth, sessions)",
      params: {
        type: "jwt|oauth|session|basic",
        config: "auth configuration"
      }
    },

    // Middleware
    createMiddleware: {
      description: "Create custom middleware for request/response processing",
      params: {
        name: "string",
        logic: "middleware function"
      }
    },

    // Error Handling
    setupErrorHandling: {
      description: "Configure global error handling and logging",
      params: {
        logLevel: "debug|info|warn|error",
        storage: "console|file|remote"
      }
    },

    // Validation
    validateInput: {
      description: "Validate incoming request data",
      params: {
        schema: "validation schema",
        data: "data to validate"
      }
    }
  },

  capabilities: [
    "REST API development",
    "GraphQL support",
    "Database integration",
    "Authentication & Authorization",
    "Request validation",
    "Error handling",
    "Logging & monitoring",
    "Testing utilities"
  ]
};

export default BackendAgent;
