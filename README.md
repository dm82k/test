# 🏠 Address Collector - Sales Tracker

A React web application that helps sales professionals collect addresses from OpenStreetMap and track their sales visits in an organized, interactive table.

## Features

### 🔍 Address Collection

- **City Search**: Find addresses by entering city name, state, and country
- **Coordinate Search**: Use bounding box coordinates for precise area targeting
- **OpenStreetMap Integration**: Free, no-API-key-required address data
- **Smart Sorting**: Addresses automatically sorted by street name and house number

### 📊 Sales Tracking

- **Visit Status**: Track if you've visited each address
- **Contact Status**: Mark as Not Contacted, Contacted, Interested, Not Interested, or Sale
- **Interest Levels**: Rate prospects as High, Medium, Low, or None
- **Notes & Contact Info**: Store phone numbers, emails, and detailed notes
- **Follow-up Dates**: Schedule when to revisit prospects

### 🔎 Filtering & Search

- **Text Search**: Search across addresses, cities, postal codes, and notes
- **Status Filters**: Filter by contact status, visit status, or interest level
- **Real-time Updates**: Table updates instantly as you type or change filters
- **Clear Filters**: Reset all filters with one click

### 🗄️ Cloud Database Storage

- **Supabase Integration**: Reliable PostgreSQL cloud database
- **Real-time Sync**: Data syncs across devices automatically
- **Smart Storage**: Only saves modified addresses to optimize performance
- **Backup & Recovery**: Your data is safe in the cloud
- **Pagination**: Handle thousands of addresses efficiently (100 per page)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Supabase account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd address-collector
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase Database**

   #### Create Supabase Project

   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project
   - Wait for database initialization (~2 minutes)

   #### Run Database Schema

   - In your Supabase dashboard, go to "SQL Editor"
   - Copy the contents of `database-schema.sql` from this project
   - Paste and run the SQL to create the addresses table

   #### Get API Credentials

   - Go to Settings → API in your Supabase dashboard
   - Copy your `Project URL` and `anon public key`

4. **Configure Environment Variables**

   Create a `.env.local` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## How to Use

### 1. Search for Addresses

**Option A: Search by City**

- Select "Search by City"
- Enter city name (e.g., "Portland")
- Optionally add state/province (e.g., "Oregon")
- Click "Find Addresses"

**Option B: Search by Coordinates**

- Select "Search by Coordinates"
- Enter bounding box coordinates (South, West, North, East)
- Get coordinates by right-clicking on Google Maps
- Click "Find Addresses"

### 2. Track Your Sales Activities

Once addresses load, use the interactive table to:

- Mark addresses as visited with the date
- Update contact status as you progress
- Rate interest levels after conversations
- Add contact information (phone/email)
- Write detailed notes about each interaction
- Set follow-up dates for future visits

### 3. Filter and Search

Use the filter section to:

- **Search**: Type any text to find matching addresses, cities, or notes
- **Status**: Show only specific contact statuses
- **Visited**: Filter by visited/not visited
- **Interest**: Filter by interest level

### 4. Data Management

- **Auto-Save**: All changes save automatically
- **Persistent**: Data survives browser restarts
- **Clear Data**: Use "Clear All Data" button to start fresh

## Tips for Best Results

### Getting Good Address Data

- Start with smaller areas (neighborhoods vs entire cities)
- Urban areas typically have better address coverage
- Try different spellings if no results found
- Use coordinates for very specific areas

### Effective Sales Tracking

- Update status immediately after each visit
- Use notes to record key conversation points
- Set follow-up dates during conversations
- Track contact preferences (call vs email vs text)

### Using Filters Efficiently

- Use text search to quickly find specific streets
- Filter by "Not Contacted" to see remaining prospects
- Filter by "Interested" to prioritize follow-ups
- Combine filters to create targeted lists

## Technical Details

### Built With

- **React 18** - Modern React with hooks
- **Vite** - Fast development and build tool
- **OpenStreetMap Overpass API** - Free address data
- **Local Storage** - Browser-based data persistence

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/
│   ├── AddressFilter.jsx   # Filtering interface
│   ├── AddressTable.jsx    # Main data table
│   └── SearchForm.jsx      # Address search form
├── services/
│   ├── addressService.js   # OpenStreetMap API
│   └── storageService.js   # Local storage handling
├── App.jsx                 # Main application
├── main.jsx                # React entry point
└── index.css               # Styles
```

## Troubleshooting

### No Addresses Found

- Check spelling of city/state names
- Try broader search area
- Verify coordinates are in correct format (decimal degrees)
- Some rural areas may have limited data

### Data Not Saving

- Ensure JavaScript is enabled
- Check if browser storage is available
- Try refreshing the page
- Clear browser cache if issues persist

### Slow Loading

- Large areas may take longer to process
- Try smaller bounding boxes
- Check internet connection
- OpenStreetMap servers may be busy

## Deployment

### Netlify Deployment

1. **Build Settings**

   - Base directory: `.` (root)
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**

   In your Netlify dashboard, go to Site Settings → Environment Variables and add:

   ```
   VITE_SUPABASE_URL = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```

3. **Deploy**
   - Connect your GitHub repository to Netlify
   - Netlify will automatically build and deploy your app
   - Your app will be available at `https://your-site-name.netlify.app`

### Database Management

- **Supabase Dashboard**: Monitor your database usage and performance
- **Automatic Backups**: Supabase handles backups automatically
- **Scaling**: Free tier includes 500MB database storage
- **Real-time**: Changes sync across all connected devices instantly

## License

This project is open source and available under the MIT License.
