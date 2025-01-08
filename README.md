# WeekendSync (Name is NOT final - it's a draft)

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

### Project Structure

```
weekend-sync/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminDashboard.js
│   │   ├── Friends/
│   │   │   ├── components/
│   │   │   │   ├── AvailabilityComparisonChart.js
│   │   │   │   ├── AvailabilitySidebar.js
│   │   │   │   ├── FriendsCalendar.js
│   │   │   │   ├── GroupView.js
│   │   │   │   ├── SocialDistributionChart.js
│   │   │   │   └── TierSelector.js
│   │   │   └── index.js
│   │   ├── AvailabilityModal.js
│   │   ├── EventDetailsModal.js
│   │   ├── ListView.js
│   │   ├── PastEventModal.js
│   │   ├── Profile.js
│   │   ├── ShortcutsModal.js
│   │   └── ViewSwitcher.js
│   ├── App.js
│   ├── AuthPage.js
│   ├── Calendar.js
│   └── supabaseClient.js
```

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

#### Friends Module
The Friends section contains components for social features and friend management:

##### `Friends/components/AvailabilityComparisonChart.js`
- Visualizes availability comparisons between users
- Shows activity stats and trends
- Filterable by time periods and event types

##### `Friends/components/AvailabilitySidebar.js`
- Shows available friends for selected time periods
- Displays upcoming events
- Quick filters for availability view

##### `Friends/components/FriendsCalendar.js`
- Calendar view optimized for viewing friends' availability
- Multiple view options (month/week)
- Visual indicators for friend availability

##### `Friends/components/GroupView.js`
- Manages friend groups and circles
- Group creation and management interface
- Member management

##### `Friends/components/SocialDistributionChart.js`
- Analytics for social activity distribution
- Visual breakdown of event types
- Social activity trends

##### `Friends/components/TierSelector.js`
- Interface for managing friend tiers
- Permission management
- Customizable tier settings

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

The app is designed to be fully responsive across:
- Desktop
- Tablet
- Mobile devices

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
   ```bash
   git clone https://github.com/your-username/weekend-sync.git
   cd weekend-sync
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up Supabase
   - Create a free account at [Supabase](https://supabase.com)
   - Create a new project
   - Go to Project Settings -> API
   - Copy your project URL and anon key

4. Create a `.env` file in the project root
   ```env
   REACT_APP_SUPABASE_URL=your_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Start the development server
   ```bash
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the app

The app will now prompt you to create an account or sign in!

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
