# Mobile Number Integration & Forgot Password Feature

## Changes Implemented

### 1. Mobile Number Validation (Register Screen)
- **File**: `mobile/src/screens/auth/RegisterScreen.js`
- **Change**: Updated the Mobile Number input field.
  - `maxLength` set to **10** (previously 12).
  - Validation logic updated to require exactly **10 digits**.
  - Input restricted to numeric values only.

### 2. Forgot Password Screen
- **File**: `mobile/src/screens/auth/ForgotPasswordScreen.js`
- **Description**: Created a new screen for password recovery.
- **Features**:
  - **Step 1**: User enters Email or Mobile Number.
    - Validates input format (Email regex or 10-digit number).
    - Simulates sending an OTP (Mock API).
  - **Step 2**: User enters OTP and New Password.
    - Validates OTP (presence).
    - Validates New Password (min 6 chars, match confirmation).
    - Simulates password reset (Mock API).
  - **Navigation**: Options to go back to Login or change Email/Mobile.

### 3. Login Screen Updates
- **File**: `mobile/src/screens/auth/LoginScreen.js`
- **Change**: Added a "Forgot Password?" link.
  - Placed above the "Sign In" button.
  - Navigates to the `ForgotPassword` screen.

### 4. Navigation Configuration
- **File**: `mobile/App.js`
- **Change**: Registered `ForgotPasswordScreen` in the navigation stack.

## How to Test

1.  **Registration**:
    - Go to the Sign Up screen.
    - Try entering a mobile number. It should stop at 10 digits.
    - Try submitting with < 10 digits; it should show an error.

2.  **Forgot Password**:
    - Go to the Login screen.
    - Click "Forgot Password?".
    - Enter a valid Email or 10-digit Mobile Number.
    - Click "Send OTP".
    - Wait for the simulated delay (1.5s).
    - Enter any 6-digit OTP and a new password.
    - Click "Reset Password".
    - You should be redirected to the Login screen upon success.
