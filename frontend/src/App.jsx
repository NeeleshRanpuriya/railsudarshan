import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import BookingTab from './components/BookingTab';
import MyTripsTab from './components/MyTripsTab';
import MyJourneyTab from './components/MyJourneyTab';
import SafetyTab from './components/SafetyTab';
import NewsTab from './components/NewsTab';
import MeProfileModal from './components/MeProfileModal';
import SOSModal from './components/SOSModal';
import RailwayApiConfigModal from './components/RailwayApiConfigModal';

// Initial pre-loaded registered users in our system database
const INITIAL_USERS = [
  {
    fullName: 'Ananya Deshmukh',
    mobile: '9876543210',
    age: 24,
    gender: 'female',
    occupation: 'Engineer',
    password: 'password123',
    pin: '1234',
    createdAt: '2026-10-15T10:30:00Z',
  },
  {
    fullName: 'Dr. Priya Sharma',
    mobile: '9811245890',
    age: 34,
    gender: 'female',
    occupation: 'Doctor',
    password: 'password123',
    pin: '1234',
    createdAt: '2026-10-10T08:15:00Z',
  },
  {
    fullName: 'Rajesh Verma',
    mobile: '9123456780',
    age: 42,
    gender: 'male',
    occupation: 'Business',
    password: 'password123',
    pin: '1234',
    createdAt: '2026-10-05T14:20:00Z',
  }
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('railraksha_theme');
    return saved ? saved === 'dark' : false;
  });

  // User database state
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('railraksha_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('railraksha_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab state: 'book', 'mytrips', 'journey', 'news', 'safety'
  const [currentTab, setCurrentTab] = useState('book');
  const [selectedJourneyPnr, setSelectedJourneyPnr] = useState(null);

  // Modals
  const [isMeOpen, setIsMeOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  // Tickets state with localStorage persistence
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('railraksha_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        pnr: '2489102431',
        bookingType: 'Reserved',
        trainNumber: '12301',
        trainName: 'Howrah Rajdhani Express (via Gaya)',
        from: 'HWH',
        to: 'NDLS',
        journeyDate: '2026-11-02',
        travelClass: '3A',
        coach: 'B3',
        passengers: [
          { id: 1, name: 'Ananya Deshmukh', age: 24, gender: 'female', berthNumber: 21, berthType: 'Lower' }
        ],
        allocatedSeats: [
          { berthNumber: 21, bayNumber: 3, berthType: 'Lower', passengerName: 'Ananya Deshmukh', gender: 'female' }
        ],
        totalFare: 2365,
        status: 'Confirmed',
        allocationRationale: '🛡️ Women Safety Engine: Solo female allocated in Bay 3 alongside verified family (Berths 17-19) and fellow female traveler.',
        isFemaleOnlyBooking: true,
        stops: [
          { code: 'HWH', name: 'Howrah Jn', arrival: 'Source', departure: '16:50', day: 1, dist: 0, status: 'passed' },
          { code: 'ASN', name: 'Asansol Jn', arrival: '18:57', departure: '19:00', day: 1, dist: 200, status: 'passed' },
          { code: 'DHN', name: 'Dhanbad Jn', arrival: '19:50', departure: '19:55', day: 1, dist: 259, status: 'passed' },
          { code: 'GAYA', name: 'Gaya Jn', arrival: '22:19', departure: '22:22', day: 1, dist: 459, status: 'passed' },
          { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', arrival: '00:45', departure: '00:55', day: 2, dist: 664, status: 'current' },
          { code: 'PRYJ', name: 'Prayagraj Jn', arrival: '02:43', departure: '02:45', day: 2, dist: 816, status: 'upcoming' },
          { code: 'CNB', name: 'Kanpur Central', arrival: '04:50', departure: '04:55', day: 2, dist: 1011, status: 'upcoming' },
          { code: 'NDLS', name: 'New Delhi', arrival: '10:05', departure: 'Destination', day: 2, dist: 1451, status: 'upcoming' },
        ]
      }
    ];
  });

  // Sync tickets with localStorage
  useEffect(() => {
    localStorage.setItem('railraksha_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('railraksha_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('railraksha_theme', 'light');
    }
  }, [isDarkMode]);

  // Save users in localStorage
  useEffect(() => {
    localStorage.setItem('railraksha_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Save current user in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('railraksha_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('railraksha_current_user');
    }
  }, [currentUser]);

  // Register user handler
  const handleRegisterUser = (newUser) => {
    setRegisteredUsers(prev => [...prev, newUser]);
  };

  // Login handler
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Add newly booked ticket
  const handleTicketBooked = (newTicket) => {
    setTickets(prev => [newTicket, ...prev]);
  };

  // Cancel ticket handler (updates ticket status to Cancelled and saves refund info)
  const handleCancelTicket = (pnr, refundInfo) => {
    setTickets(prev => prev.map(t => {
      if (t.pnr === pnr || t.id === pnr) {
        return {
          ...t,
          status: 'Cancelled',
          refundInfo: refundInfo,
          cancelledAt: new Date().toISOString(),
        };
      }
      return t;
    }));
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* If User Not Logged In -> Render Landing Page */}
      {!currentUser ? (
        <LandingPage
          registeredUsers={registeredUsers}
          onRegisterUser={handleRegisterUser}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        /* If User Logged In -> Render Full RailRaksha Portal */
        <div className="flex flex-col min-h-screen">
          
          {/* Main Top Taskbar & Navigation Header */}
          <Navbar
            user={currentUser}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            onOpenMe={() => setIsMeOpen(true)}
            onLogout={handleLogout}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenApiConfig={() => setIsApiConfigOpen(true)}
          />

          {/* Main App Content View based on Selected Tab */}
          <main className="flex-1">
            {currentTab === 'book' && (
              <BookingTab
                user={currentUser}
                tickets={tickets}
                onTicketBooked={handleTicketBooked}
                onNavigateToJourney={() => setCurrentTab('journey')}
                onOpenApiConfig={() => setIsApiConfigOpen(true)}
              />
            )}

            {currentTab === 'mytrips' && (
              <MyTripsTab
                tickets={tickets}
                onCancelTicket={handleCancelTicket}
                onSelectJourney={(t) => {
                  setSelectedJourneyPnr(t.pnr || t.id);
                  setCurrentTab('journey');
                }}
                onNavigateToBook={() => setCurrentTab('book')}
              />
            )}

            {currentTab === 'journey' && (
              <MyJourneyTab
                user={currentUser}
                tickets={tickets}
                selectedJourneyPnr={selectedJourneyPnr}
                onCancelTicket={handleCancelTicket}
                onNavigateToBook={() => setCurrentTab('book')}
              />
            )}

            {currentTab === 'news' && (
              <NewsTab />
            )}

            {currentTab === 'safety' && (
              <SafetyTab
                user={currentUser}
                onOpenSOS={() => setIsSOSOpen(true)}
              />
            )}
          </main>

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-railway-900 dark:text-white">RailRaksha</span>
                <span>• Government of India Safe Travel Ecosystem</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Women Safety Directive</span>
                <span>•</span>
                <span>Refund Rules 2026</span>
                <span>•</span>
                <span>Emergency Helpdesk 139</span>
              </div>
            </div>
          </footer>

          {/* ME Profile Details Modal */}
          {isMeOpen && (
            <MeProfileModal
              user={currentUser}
              onClose={() => setIsMeOpen(false)}
            />
          )}

          {/* Global Emergency SOS Modal */}
          <SOSModal
            isOpen={isSOSOpen}
            onClose={() => setIsSOSOpen(false)}
            user={currentUser}
          />

          {/* Railway API Configuration & Key Settings Modal */}
          <RailwayApiConfigModal
            isOpen={isApiConfigOpen}
            onClose={() => setIsApiConfigOpen(false)}
          />

        </div>
      )}

    </div>
  );
}
