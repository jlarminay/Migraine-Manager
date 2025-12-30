<p align="center">
  <img src="assets/icon-only.png" alt="App Icon" style="width:200px; height:200px; border-radius:20px;" />
</p>

# Migraine Manager

## About

I suffer from migraines and previously I used a text document to track my migraines. This worked, but I wanted to get more info, like common days, or overall migraines in a given month. I decided to build an android app using Capacitor to allow me to track my migraines.

## Features

- Simple calendar for logging migraine events (morning/evening)
- Data visualization with charts (day of week, month, type)
- CSV export and import (backup/restore your data)
- Local storage for privacy (no cloud sync)
- Toast notifications for feedback
- Works as a PWA and as a native Android app

## Screenshots

<p align="center">
  <img src="assets/screenshot-1.jpg" alt="Screenshot 1" style="width:300px; margin-right:10px; display:inline-block;" />
  <img src="assets/screenshot-2.jpg" alt="Screenshot 2" style="width:300px; display:inline-block;" />
</p>

## Requirements

- Node.js ^24.11.1
- Java ^24.0.1 (for Android build)

## Setup

Run locally

```bash
npm install
npm run start
```

Build for Android:

```bash
npm install
npx cap add android
npm run build

# This can be used to install the app directly on an android device connected to the PC
npm run build-and-send
```

## Credits

These are some of the tools used:

- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Capacitor](https://capacitorjs.com/)
- [Quasar](https://quasar.dev/)
- [Chart.js](https://www.chartjs.org/)
- [dayjs](https://day.js.org/)
- [@meforma/vue-toaster](https://github.com/meforma/vue-toaster).

## License

Personal project. No license. Use at your own risk.
