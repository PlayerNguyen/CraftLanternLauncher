/**
 * Check if the application is running on NODE_ENV development.
 *
 * @returns true if the application is running on development mode, false otherwise.
 */
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export { isDevelopment };
