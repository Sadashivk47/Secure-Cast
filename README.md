# SecureCast - Centralized Broadcast Control Panel

SecureCast is a modern, encrypted communication platform designed for administrative oversight and group-wide briefings. It utilizes a secure, serverless-style architecture optimized for high-performance mobile and desktop interaction.

## 🚀 Key Features

- **Admin Dashboard**: Real-time broadcast activity tracking and system health monitoring.
- **Encrypted Messaging**: One-way administrative broadcasts with priority protocols (URGENT, HIGH, NORMAL, LOW).
- **Group Management**: Segmented communication perimeters for specific departments or clusters.
- **Personnel Directory**: Comprehensive member management with secure audit logs.
- **Visual Feedback**: Intentional design with fluid gradients, micro-animations (`motion`), and polished UI components.

## 💾 testing & Persistence (LocalStorage)

This application uses `localStorage` for data persistence during this development phase. This allows you to test features, add members, and send broadcasts that persist across page refreshes without needing a backend database initially.

### Storage Keys

The following keys are managed in your browser's Local Storage:

- `securecast_user`: Stores current session details and role (Admin vs. Member).
- `securecast_contacts`: The personnel directory (members list).
- `securecast_broadcasts`: History of sent administrative briefings.
- `securecast_groups`: Definitions for target sectors and departments.
- `securecast_activity`: Logs of recent system actions and broadcasts.

### How to Reset for Testing

If you want to clear all your test data and revert to the factory state:

1. Open your browser's **Developer Tools** (F12 or Right Click > Inspect).
2. Navigate to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
3. Select **Local Storage** from the sidebar.
4. Right-click on the domain and select **Clear**, or manually delete keys starting with `securecast_`.
5. Refresh the page.

## 🛠️ Tech Stack

- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Persistence**: Browser LocalStorage API

## 👤 Credentials (Quick Access)

The login page is currently optimized for rapid testing with pre-filled credentials:

- **Admin Access**: `admin` / `admin`
- **Member Access**: `member` / `member`
