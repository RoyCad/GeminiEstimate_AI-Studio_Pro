const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Admin SDK. This is required for server-side operations
// like the ones in your Genkit flows to access Firestore.
admin.initializeApp();
