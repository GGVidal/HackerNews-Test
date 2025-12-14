# Hacker News Mobile Reader

A React Native mobile application that fetches and displays mobile development articles from Hacker News, with offline support, favorites management, and push notifications for new articles.

## Features

### Core Functionality
- **Data Fetching**: Fetches articles from the Hacker News Algolia API on startup and pull-to-refresh
- **Offline Access**: Displays cached articles when offline
- **Article Viewing**: Scrollable list sorted by date with in-app WebView
- **Swipe to Delete**: Swipe left on articles to delete them

### Enhanced Features
- **Favorites**: Long press on any article to add to favorites
- **Deleted Articles View**: View and restore previously deleted articles

### Push Notifications
- **Permission Request**: Asks for notification permission on first launch
- **User Preferences**: Configure which article types to receive notifications about (Android, iOS, React Native, Flutter)
- **Background Fetch**: Periodically checks for new articles in the background
- **Notification Interaction**: Tapping a notification opens the relevant article

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Xcode (for iOS) or Android Studio (for Android)

## Running the App

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate native projects**
   ```bash
   npx expo prebuild
   ```

3. **Run on iOS**
   ```bash
   npx expo run:ios
   ```

   Or for Android:
   ```bash
   npx expo run:android
   ```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Type checking
npm run lint
```

## License

This project is created as part of a technical challenge.
