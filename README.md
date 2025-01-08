# WeekendSync

WeekendSync is a modern social calendar application designed to simplify weekend planning among friends and family. The app allows users to share their availability, coordinate events, and keep track of social activities in an intuitive interface.

## 🌟 Features

### Core Features
- **Smart Calendar Management**
  - View availability in monthly, weekly, and list views
  - Quick availability setting for morning, afternoon, and night time slots
  - Bulk selection and date range scheduling
  - Copy/paste availability between days

### Social Features
- **Friend Management**
  - Add friends via SMS or shareable links
  - Organize friends into different tiers with customizable permissions
  - View friends' availability and travel plans

### Event Types
- Open to plans
- Traveling
- Lunch/Dinner plans
- Events
- Weddings
- Parties
- Family time
- Work
- Other

## 🔧 Technical Architecture

### Core Components

#### `App.js`
The main application component that handles:
- Authentication state
- Navigation between different views
- Admin access control
- Overall layout structure

#### `Calendar.js`
The primary calendar interface with:
- Multiple view options (month, week, list)
- Drag-and-drop selection
- Availability management
- Event details viewing

#### `AuthPage.js`
Handles user authentication with:
- Sign in/sign up flows
- Password reset functionality
- Username availability checking
- Form validation

### Feature Components

#### `Profile.js`
User profile management:
- Personal information updates
- Avatar upload
- Personality trait selection
- Location setting

#### `ListView.js`
Alternative calendar view with:
- Filterable event list
- Detailed event information
- Date range selection
- Event type filtering

#### `AvailabilityModal.js`
Complex modal for setting availability:
- Time slot selection
- Event type choosing
- Additional event details
- Privacy settings

### Utility Components

#### `ViewSwitcher.js`
Toggle between different calendar views:
- Month view
- Week view
- List view

#### `ShortcutsModal.js`
Keyboard shortcuts interface for power users

#### `PastEventModal.js`
View and manage past events

### Service Layer

#### `availabilityService.js`
Handles all availability-related operations:
- Save/update availability
- Fetch user availability
- Delete availability entries

#### `supabaseClient.js`
Database connection and configuration

## 🎨 UI/UX Features

- Modern, clean interface
- Responsive design
- Dark mode support
- Intuitive drag-and-drop interactions
- Clear visual feedback for user actions
- Accessible color schemes

## 🏗️ Technical Stack

- **Frontend:** React.js with Hooks
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Icons:** Lucide React
- **Date Handling:** React DatePicker
- **Charts:** Recharts
- **Animations:** Framer Motion

## 📱 Mobile Responsiveness

The app should be designed to be fully responsive across:
- Desktop
- Tablet
- Mobile devices
right now, it is only available via React web.

## 🔒 Security Features

- JWT-based authentication
- Secure password handling
- Privacy controls for sharing availability
- Role-based access control

## 🚀 Future Roadmap

- Integration with popular calendar services (Google Calendar, Outlook)
- Event booking integrations (OpenTable, Eventbrite)
- Mobile apps for iOS and Android
- Advanced group planning features
- Social features similar to Facebook's original "poke"
- Gamification elements for user engagement

## 💡 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
