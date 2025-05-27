# Paycase

A mobile app for sharing vibes with subscription features built with React Native, Expo, Supabase, and RevenueCat.

## Features

- Authentication with email/password and Google sign-in via Supabase
- Premium subscription management with RevenueCat
- Create, read, update, and delete vibes
- Character limit gating for non-premium users
- Dark mode support
- Offline caching for vibes
- Profile management with avatar uploads

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase for authentication and database
- **Subscription**: RevenueCat for in-app purchases
- **API**: Supabase Edge Functions with Prisma ORM
- **Styling**: Tailwind RN for consistent UI
- **Testing**: Jest and React Native Testing Library
- **CI/CD**: GitHub Actions and Expo EAS

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- RevenueCat account

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_api_key
DATABASE_URL=your_database_url
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ravijha11/React-native-paycase.git
   cd paycase
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on a device or emulator:
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Database Setup

1. Set up your Supabase project and create the necessary tables as defined in `prisma/schema.prisma`
2. Apply the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```

## RevenueCat Setup

1. Create a RevenueCat account and set up your app
2. Configure your subscription offerings and entitlements
3. Set the entitlement ID to "pro" to match the app's code
4. Add your RevenueCat API key to the `.env` file

## Testing

Run the test suite with:

```bash
npm test
```

The project includes tests for:
- Authentication context
- Subscription context and RevenueCat integration
- Profile service mutations
- Paywall component (with snapshots)
- Prisma-powered vibes endpoint

## Deployment

### Development Build

```bash
eas build --profile development --platform all
```

### Preview Build

```bash
eas build --profile preview --platform all
```

### Production Build

```bash
eas build --profile production --platform all
```

## CI/CD

The project uses GitHub Actions for continuous integration and Expo EAS for continuous deployment. The workflow is defined in `.github/workflows/ci.yml`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
