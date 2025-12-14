# Hacker News Mobile Reader

A React Native mobile application that fetches and displays mobile development articles from Hacker News, with offline support, favorites management, and push notifications for new articles.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![Expo Router](https://img.shields.io/badge/Expo%20Router-6-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## Features

### Core Functionality
- **Data Fetching**: Fetches articles from the Hacker News Algolia API on startup and pull-to-refresh
- **Offline Access**: Displays cached articles when offline
- **Article Viewing**: Scrollable list sorted by date with in-app WebView
- **Swipe to Delete**: Swipe left on articles to delete them

### Enhanced Features
- **Favorites**: Mark articles as favorites with a dedicated favorites tab
- **Deleted Articles View**: View and restore previously deleted articles
- **Clean Light Theme**: Simple, iOS-style design

### Push Notifications
- **Permission Request**: Asks for notification permission on first launch
- **User Preferences**: Configure which article types to receive notifications about
- **Background Fetch**: Periodically checks for new articles in the background
- **Notification Interaction**: Tapping a notification opens the relevant article

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Expo Go app (for physical device testing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd techtest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on a device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go app for physical device

## Running Tests

The project includes comprehensive unit tests for services, store, and components.

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Type checking
```bash
npm run lint
```

## Project Structure

```
techtest/
├── app/                       # Expo Router file-based routes
│   ├── _layout.tsx            # Root layout with initialization
│   ├── (tabs)/                # Tab navigation group
│   │   ├── _layout.tsx        # Tab navigator configuration
│   │   ├── index.tsx          # Articles screen (main tab)
│   │   ├── favorites.tsx      # Favorites tab
│   │   └── deleted.tsx        # Deleted articles tab
│   ├── webview.tsx            # In-app article viewer
│   └── settings.tsx           # Notification settings
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ArticleCard.tsx    # Article display row
│   │   ├── SwipeableRow.tsx   # Swipe-to-delete wrapper
│   │   ├── EmptyState.tsx     # Empty state placeholder
│   │   └── LoadingSpinner.tsx # Loading indicator
│   ├── services/              # Business logic services
│   │   ├── api.ts             # Hacker News API client
│   │   ├── storage.ts         # AsyncStorage persistence
│   │   └── notifications.ts   # Push notification handling
│   ├── store/                 # State management
│   │   └── useArticlesStore.ts# Zustand store
│   ├── types/                 # TypeScript type definitions
│   └── __tests__/             # Unit tests (47 tests)
├── jest.config.js             # Jest configuration
├── jest.setup.js              # Jest setup and mocks
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies
```

## Navigation (Expo Router)

This project uses **Expo Router** for file-based navigation:

- `/` - Main articles list (tab)
- `/favorites` - Favorites list (tab)
- `/deleted` - Deleted articles (tab)
- `/webview?url=...&title=...` - Article web view
- `/settings` - Notification preferences

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Development platform |
| `expo-router` | File-based navigation |
| `zustand` | State management |
| `@react-native-async-storage/async-storage` | Local persistence |
| `expo-notifications` | Push notifications |
| `expo-background-fetch` | Background article checking |
| `react-native-webview` | In-app article viewing |
| `react-native-gesture-handler` | Swipe gestures |

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run all 47 unit tests |
| `npm run lint` | TypeScript type checking |

## License

This project is created as part of a technical challenge.
