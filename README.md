# Karate Borrowing App

This project is a mobile application built with **React Native** and **Expo**. It allows users to track items that are lent or borrowed using a [Supabase](https://supabase.com/) backend.

## Requirements

- [Node.js](https://nodejs.org/) (version 18 or later is recommended)
- [npm](https://www.npmjs.com/) installed with Node.js
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (install globally with `npm install -g expo-cli` or use `npx expo`)

## Installation

1. Clone this repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the project

To start the Expo development server, run:

```bash
npm start
```

This opens the Expo developer tools in your browser. From there you can:

- Press **`a`** to run the app on an Android emulator or connected device.
- Press **`i`** to run on an iOS simulator (macOS only).
- Press **`w`** to run the web version in your browser.

Alternatively, you can use npm scripts directly:

```bash
npm run android   # start on Android
npm run ios       # start on iOS
npm run web       # start in the browser
```

## Configuration

The Supabase credentials used by the app are defined in `src/supabase.ts` and `src/supabaseAdmin.ts`. If you have your own Supabase project, update these files with your keys and project URL.

## Project structure

- `App.tsx` – entry point that switches between authentication and the main navigator
- `src/` – contains screens, navigation setup and Supabase helpers
- `assets/` – application icons and splash images

## Building

For a production build, follow the [Expo documentation](https://docs.expo.dev/distribution/introduction/) to generate native binaries for Android and iOS.
