# Project Deployment Guide for Firebase Hosting

This guide provides the necessary steps and commands to deploy your Next.js application to Firebase Hosting using the framework-aware CLI.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js and npm (or yarn)
- A Firebase account with a project created. Your `firebase.json` is configured for the site ID **rccpro**.

## Deployment Steps

Follow these steps in your terminal from the root directory of the project.

### 1. Install Firebase CLI (if not already installed globally)

If you don't have the Firebase Command Line Interface (CLI) installed globally, it's recommended to do so. The project also includes it as a dev dependency for version consistency.

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

Next, you need to authenticate with your Firebase account. This command will open a new browser window for you to log in.

```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)

If this is the first time you are deploying this project, you might need to link it to your Firebase project.

```bash
firebase init hosting
```
- When prompted, select **Use an existing project** and choose the project from the list that corresponds to the `rccpro` site.
- Your public directory is not needed as Firebase will detect you are using Next.js. You can accept any default if asked.
- When asked to configure as a single-page app, say **No**, as Next.js handles this.
- If it asks to overwrite any files, carefully review them. Generally, you can say **No** if you are unsure.

### 4. Build the Application for Production

Your Next.js application needs to be compiled for production. This single command is all you need.

```bash
npm run build
```
This command executes `next build`, which creates an optimized production build.

### 5. Deploy to Firebase Hosting

Finally, deploy your application to Firebase Hosting. The CLI will automatically detect that you're using Next.js and will deploy it as a dynamic web app.

Run the following command to deploy:

```bash
firebase deploy --only hosting
```

After the command completes successfully, it will provide you with the hosting URL where your application is now live (e.g., `https://rccpro.web.app`).
