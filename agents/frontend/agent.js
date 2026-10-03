export const FrontendAgent = {
  name: "FrontendAgent",
  description: "Generic frontend agent for React/Vue projects - handles UI components, state management, styling, and client-side logic",

  tools: {
    // Component Creation
    createComponent: {
      description: "Generate a new component (React or Vue)",
      params: {
        framework: "react|vue",
        name: "string",
        type: "functional|class|composition",
        features: "array of features (hooks, props, etc)"
      }
    },

    // State Management
    setupStateManagement: {
      description: "Configure state management solution",
      params: {
        type: "redux|zustand|pinia|useState|ref",
        structure: "state structure definition"
      }
    },

    // Styling
    applyStyles: {
      description: "Apply styling solution to components",
      params: {
        approach: "tailwind|styled-components|css-modules|scss",
        config: "styling configuration"
      }
    },

    // Routing
    setupRouting: {
      description: "Configure routing and navigation",
      params: {
        library: "react-router|vue-router",
        routes: "array of route definitions"
      }
    },

    // API Integration
    integrateAPI: {
      description: "Setup API client and data fetching",
      params: {
        client: "fetch|axios|swr|react-query",
        baseURL: "string",
        interceptors: "array of interceptor configs"
      }
    },

    // Form Handling
    createForm: {
      description: "Generate form component with validation",
      params: {
        framework: "react|vue",
        fields: "array of field definitions",
        validation: "validation rules"
      }
    },

    // Testing
    generateTests: {
      description: "Create unit and integration tests",
      params: {
        framework: "vitest|jest|mocha",
        type: "unit|integration|e2e"
      }
    },

    // Performance
    optimizePerformance: {
      description: "Apply performance optimization techniques",
      params: {
        techniques: "array (code-splitting, lazy-loading, memoization, etc)"
      }
    }
  },

  capabilities: [
    "React component development",
    "Vue component development",
    "State management setup",
    "Styling solutions",
    "Client-side routing",
    "API integration",
    "Form handling",
    "Component testing",
    "Performance optimization",
    "Accessibility (a11y)",
    "Responsive design"
  ]
};

export default FrontendAgent;
