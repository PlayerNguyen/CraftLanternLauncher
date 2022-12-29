const React = require("react");
const { createRoot } = require("react-dom/client");
const { App } = require("./App");

const app = document.getElementById("app");

createRoot(app).render(
  // Check if the app is debugging
  environments.isDevelopment ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  )
);
