# Progressive Web App (PWA) Features

This project has been enhanced with Progressive Web App (PWA) capabilities, allowing it to be installed on devices and work offline.

## Features

- **Installable**: The app can be installed on mobile devices and desktops
- **Offline Support**: The app works offline using service workers and IndexedDB
- **Data Synchronization**: Changes made offline are synchronized when the device comes back online
- **Cache First Strategy**: The app uses a cache-first strategy for better performance

## How to Use

### Installing the App

1. Open the app in a compatible browser (Chrome, Edge, Safari, etc.)
2. Look for the install prompt or use the browser's menu to install the app
3. The app will be installed on your device and can be launched like a native app

### Offline Usage

The app will automatically work offline after the first visit. When you're offline:

- You can still view previously loaded data
- You can make changes to your shopping list, recipes, and week plan
- Changes will be stored locally and synchronized when you're back online

### Data Synchronization

When your device comes back online:

1. The app will automatically detect the connection
2. Any changes made while offline will be synchronized with the server
3. You'll receive a notification when synchronization is complete

## Technical Implementation

The PWA features are implemented using:

- **Service Workers**: For offline functionality and caching
- **IndexedDB**: For local data storage
- **Web App Manifest**: For installability and app metadata
- **Cache API**: For caching static assets and API responses

## Development

### Generating PWA Icons

To generate the PWA icons, run:

```bash
npm run generate-pwa-icons
```

This will create the necessary icon files in the `public/icon` directory.

### Testing PWA Features

To test PWA features during development:

1. Build the app for production: `npm run build`
2. Start the production server: `npm start`
3. Open the app in a compatible browser
4. Use Chrome DevTools > Application tab to inspect service workers and IndexedDB

## Troubleshooting

If you encounter issues with the PWA features:

1. Clear your browser cache and IndexedDB storage
2. Uninstall and reinstall the app
3. Check the browser console for errors
4. Ensure you're using a compatible browser
