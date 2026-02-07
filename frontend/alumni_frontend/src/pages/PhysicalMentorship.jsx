import React, { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Clock, Users, X, Navigation, Plus, Minus,
  ToggleLeft, ToggleRight, Zap, Radio, User, Star,
  MessageCircle, ChevronDown, ChevronRight, Search,
  Compass, Locate, Eye, EyeOff, Settings, Award,
  BookOpen, Briefcase, Code, Cpu, Filter, ArrowUpRight
} from 'lucide-react'

/* ═══════════════════════════════════════
   Data
   ═══════════════════════════════════════ */

const SPECIALIZATIONS = [
  'Software Engineering', 'Data Science', 'Product Management',
  'UI/UX Design', 'Machine Learning', 'Cloud & DevOps',
  'Cybersecurity', 'Blockchain', 'Embedded Systems', 'Finance & Analytics'
]

const TIME_WINDOWS = [
  '9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM', '1:00 PM – 3:00 PM',
  '3:00 PM – 5:00 PM', '5:00 PM – 7:00 PM', '7:00 PM – 9:00 PM'
]

/* Bhagubai College campus area – Vile Parle, Mumbai */
const CAMPUS_CENTER = [19.1075, 72.8480]

const CAMPUS_LOCATIONS = [
  { id: 'canteen', name: 'Cafeteria', lat: 19.1082, lng: 72.8468, icon: 'C' },
  { id: 'library', name: 'Library Wing', lat: 19.1078, lng: 72.8488, icon: 'L' },
  { id: 'admin', name: 'Admin Block', lat: 19.1072, lng: 72.8500, icon: 'A' },
  { id: 'lhc', name: 'Lecture Hall', lat: 19.1066, lng: 72.8475, icon: 'H' },
  { id: 'lab', name: 'Computer Lab', lat: 19.1060, lng: 72.8492, icon: 'T' },
  { id: 'sports', name: 'Sports Ground', lat: 19.1055, lng: 72.8510, icon: 'S' },
  { id: 'seminar', name: 'Seminar Hall', lat: 19.1085, lng: 72.8452, icon: 'R' },
]

const mockNearbyAlumni = [
  {
    id: 101, name: 'Kavya Nair', avatar: 'KN', role: 'ML Engineer @ DeepMind',
    specialization: 'Machine Learning', rating: 4.9,
    location: CAMPUS_LOCATIONS[1], distance: '120m',
    tags: ['PyTorch', 'NLP', 'Research'],
  },
  {
    id: 102, name: 'Rohan Desai', avatar: 'RD', role: 'Staff Eng @ Stripe',
    specialization: 'Software Engineering', rating: 4.7,
    location: CAMPUS_LOCATIONS[0], distance: '250m',
    tags: ['System Design', 'Go', 'Distributed'],
  },
  {
    id: 103, name: 'Ananya Rao', avatar: 'AR', role: 'Design Lead @ Figma',
    specialization: 'UI/UX Design', rating: 4.8,
    location: CAMPUS_LOCATIONS[2], distance: '400m',
    tags: ['Design Systems', 'Prototyping'],
  },
]

const mockStudentRequests = [
  { id: 201, name: 'Aditya S.', avatar: 'AS', topic: 'Resume Review for SDE roles', time: '2 min ago', status: 'pending' },
  { id: 202, name: 'Meera K.', avatar: 'MK', topic: 'Guidance on ML research papers', time: '5 min ago', status: 'pending' },
]

/* ═══════════════════════════════════════
   Custom Leaflet Marker Icons
   ═══════════════════════════════════════ */

function createLocationIcon(icon, name, isSelected) {
  return L.divIcon({
    className: 'pm-leaflet-loc-icon',
    html: `<div class="pm-loc-pin ${isSelected ? 'selected' : ''}">
      <span class="pm-loc-pin-letter">${icon}</span>
      <div class="pm-loc-pin-tail"></div>
    </div>
    <span class="pm-loc-pin-label ${isSelected ? 'selected' : ''}">${name}</span>`,
    iconSize: [38, 56],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  })
}

function createAlumniIcon(avatar) {
  return L.divIcon({
    className: 'pm-leaflet-alumni-icon',
    html: `<div class="pm-alumni-marker">
      <div class="pm-alumni-pulse"></div>
      <div class="pm-alumni-dot">${avatar}</div>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: 'pm-leaflet-user-icon',
    html: `<div class="pm-user-marker">
      <div class="pm-user-pulse"></div>
      <div class="pm-user-dot"></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

/* Map controller to fly to selected location */
function MapFlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 17, { duration: 1.2 })
  }, [center, zoom])
  return null
}

/* ═══════════════════════════════════════
   Interactive Campus Map (Leaflet)
   ═══════════════════════════════════════ */

function CampusMap({ locations, nearbyAlumni, selectedLocation, onLocationClick, onAlumniClick, isLive, proximityRange }) {
  const flyTarget = selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null

  return (
    <div className="pm-map-container">
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={16}
        className="pm-leaflet-map"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Light clean tiles (CartoDB Voyager) */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {/* Fly to selected location */}
        {flyTarget && <MapFlyTo center={flyTarget} zoom={17} />}

        {/* Proximity range circle */}
        {isLive && selectedLocation && (
          <Circle
            center={[selectedLocation.lat, selectedLocation.lng]}
            radius={proximityRange}
            pathOptions={{
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.07,
              weight: 1.5,
              dashArray: '6 4',
            }}
          />
        )}

        {/* Campus location markers */}
        {locations.map(loc => (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={createLocationIcon(loc.icon, loc.name, selectedLocation?.id === loc.id)}
            eventHandlers={{ click: () => onLocationClick(loc) }}
          >
            <Popup className="pm-map-popup">
              <div className="pm-popup-content">
                <span className="pm-popup-icon">{loc.icon}</span>
                <strong>{loc.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby alumni markers */}
        {nearbyAlumni.map(a => (
          <Marker
            key={a.id}
            position={[a.location.lat + 0.0003, a.location.lng + 0.0004]}
            icon={createAlumniIcon(a.avatar)}
            eventHandlers={{ click: () => onAlumniClick(a) }}
          >
            <Popup className="pm-map-popup">
              <div className="pm-popup-content pm-popup-alumni">
                <div className="pm-popup-avatar">{a.avatar}</div>
                <div>
                  <strong>{a.specialization}</strong>
                  <span className="pm-popup-distance"><Navigation size={10} /> {a.distance}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker (when live) */}
        {isLive && selectedLocation && (
          <Marker
            position={[selectedLocation.lat - 0.0002, selectedLocation.lng + 0.0002]}
            icon={createUserIcon()}
          >
            <Popup className="pm-map-popup">
              <div className="pm-popup-content">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating legend overlay */}
      <div className="pm-map-legend">
        <span className="pm-legend-title">Legend</span>
        <div className="pm-legend-item"><div className="pm-legend-dot" style={{ background: '#4ade80' }} />Selected</div>
        <div className="pm-legend-item"><div className="pm-legend-dot" style={{ background: '#8b5cf6' }} />Alumni Nearby</div>
        {isLive && <div className="pm-legend-item"><div className="pm-legend-dot" style={{ background: '#22c55e' }} />You</div>}
      </div>

      {/* Watermark */}
      <div className="pm-map-watermark">
        <Navigation size={12} />
        <span>Campus Map</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */
export default function PhysicalMentorship({ addToast }) {
  /* Alumni profile state */
  const [specialization, setSpecialization] = useState('')
  const [showSpecDropdown, setShowSpecDropdown] = useState(false)
  const [specSearch, setSpecSearch] = useState('')

  /* Location & availability */
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [timeWindow, setTimeWindow] = useState('')
  const [studentSlots, setStudentSlots] = useState(3)
  const [groupEnabled, setGroupEnabled] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const proximityRange = 500 // meters (default)

  /* UI state */
  const [activePanel, setActivePanel] = useState('setup') // setup | requests | nearby | group
  const [selectedAlumni, setSelectedAlumni] = useState(null)
  const [requests, setRequests] = useState(mockStudentRequests)
  const [toast, setToast] = useState(null)

  const filteredSpecs = SPECIALIZATIONS.filter(s =>
    s.toLowerCase().includes(specSearch.toLowerCase())
  )

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
    addToast?.(msg)
  }

  const handleGoLive = () => {
    if (!specialization) { showToast('Please select your specialization first'); return }
    if (!selectedLocation) { showToast('Please select a campus location'); return }
    if (!timeWindow) { showToast('Please select your available time window'); return }
    setLocationEnabled(true)
    setIsLive(true)
    showToast(`You're live at ${selectedLocation.name}!`)
    setActivePanel('requests')
  }

  const handleStopLive = () => {
    setIsLive(false)
    showToast('Pulse stopped — you\'re no longer visible to students.')
  }

  const handleAcceptRequest = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r))
    showToast('Request accepted! Student has been notified.')
  }

  const handleDeclineRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id))
    showToast('Request declined.')
  }

  return (
    <div className="pm-page">
      <div className="pm-layout">
        {/* ══════ LEFT: Map ══════ */}
        <div className="pm-map-col">
          <CampusMap
            locations={CAMPUS_LOCATIONS}
            nearbyAlumni={mockNearbyAlumni}
            selectedLocation={selectedLocation}
            onLocationClick={(loc) => setSelectedLocation(loc)}
            onAlumniClick={(a) => { setSelectedAlumni(a); setActivePanel('nearby') }}
            isLive={isLive}
            proximityRange={proximityRange}
          />

          {/* Live status bar */}
          {isLive && (
            <div className="pm-live-bar">
              <div className="pm-live-dot" />
              <span className="pm-live-text">LIVE</span>
              <span className="pm-live-detail">{selectedLocation?.name} · {timeWindow} · {studentSlots} slots</span>
              <button className="pm-live-stop" onClick={handleStopLive}>Stop</button>
            </div>
          )}
        </div>

        {/* ══════ RIGHT: Panels ══════ */}
        <div className="pm-panel-col">
          {/* Tab Navigation */}
          <div className="pm-panel-tabs">
            {[
              { key: 'setup', label: 'My Setup', icon: Settings },
              { key: 'requests', label: 'Requests', icon: Users, count: requests.filter(r => r.status === 'pending').length },
              { key: 'nearby', label: 'Alumni Nearby', icon: Eye },
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  className={`pm-panel-tab ${activePanel === tab.key ? 'active' : ''}`}
                  onClick={() => setActivePanel(tab.key)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && <span className="pm-tab-badge">{tab.count}</span>}
                </button>
              )
            })}
          </div>

          {/* ─── SETUP Panel ─── */}
          {activePanel === 'setup' && (
            <div className="pm-panel-body pm-setup">
              <h3 className="pm-panel-title"><Settings size={16} /> Alumni Setup</h3>
              <p className="pm-panel-subtitle">Configure your physical mentorship availability</p>

              {/* Specialization */}
              <div className="pm-field">
                <label className="pm-label"><BookOpen size={13} /> Specialization</label>
                <div className="pm-dropdown-wrap">
                  <button
                    className="pm-dropdown-trigger"
                    onClick={() => setShowSpecDropdown(!showSpecDropdown)}
                  >
                    <span className={specialization ? 'pm-selected-val' : 'pm-placeholder'}>
                      {specialization || 'Select your area of expertise'}
                    </span>
                    <ChevronDown size={14} style={{ transform: showSpecDropdown ? 'rotate(180deg)' : '', transition: '0.2s' }} />
                  </button>
                  {showSpecDropdown && (
                    <div className="pm-dropdown-menu">
                      <div className="pm-dropdown-search">
                        <Search size={13} />
                        <input
                          placeholder="Search..."
                          value={specSearch}
                          onChange={e => setSpecSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      {filteredSpecs.map(s => (
                        <button
                          key={s}
                          className={`pm-dropdown-option ${specialization === s ? 'active' : ''}`}
                          onClick={() => { setSpecialization(s); setShowSpecDropdown(false); setSpecSearch('') }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Toggle */}
              <div className="pm-field">
                <label className="pm-label"><MapPin size={13} /> Location Visibility</label>
                <div className="pm-toggle-row">
                  <span className="pm-toggle-text">{locationEnabled ? 'Your location is visible to students' : 'Location is hidden'}</span>
                  <button className="pm-toggle-btn" onClick={() => setLocationEnabled(!locationEnabled)}>
                    {locationEnabled
                      ? <ToggleRight size={32} className="pm-toggle-on" />
                      : <ToggleLeft size={32} className="pm-toggle-off" />
                    }
                  </button>
                </div>
              </div>

              {/* Campus Location Picker */}
              <div className="pm-field">
                <label className="pm-label"><Compass size={13} /> Campus Location</label>
                <div className="pm-location-grid">
                  {CAMPUS_LOCATIONS.map(loc => (
                    <button
                      key={loc.id}
                      className={`pm-location-chip ${selectedLocation?.id === loc.id ? 'active' : ''}`}
                      onClick={() => setSelectedLocation(loc)}
                    >
                      <span className="pm-loc-icon">{loc.icon}</span>
                      <span>{loc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Window */}
              <div className="pm-field">
                <label className="pm-label"><Clock size={13} /> Available Time Window</label>
                <div className="pm-time-grid">
                  {TIME_WINDOWS.map(tw => (
                    <button
                      key={tw}
                      className={`pm-time-chip ${timeWindow === tw ? 'active' : ''}`}
                      onClick={() => setTimeWindow(tw)}
                    >
                      {tw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Type */}
              <div className="pm-field">
                <label className="pm-label"><Users size={13} /> Session Type</label>
                <div className="pm-session-type-toggle">
                  <button
                    className={`pm-session-type-btn ${!groupEnabled ? 'active' : ''}`}
                    onClick={() => setGroupEnabled(false)}
                  >
                    <User size={14} />
                    <span>Individual Slots</span>
                  </button>
                  <button
                    className={`pm-session-type-btn ${groupEnabled ? 'active' : ''}`}
                    onClick={() => setGroupEnabled(true)}
                  >
                    <Users size={14} />
                    <span>Group Session</span>
                  </button>
                </div>
              </div>

              {/* Student Slots (only for individual sessions) */}
              {!groupEnabled && (
                <div className="pm-field">
                  <label className="pm-label"><Users size={13} /> Student Slots Available</label>
                  <div className="pm-slots-row">
                    <button className="pm-slot-btn" onClick={() => setStudentSlots(s => Math.max(1, s - 1))}>
                      <Minus size={14} />
                    </button>
                    <span className="pm-slot-num">{studentSlots}</span>
                    <button className="pm-slot-btn" onClick={() => setStudentSlots(s => Math.min(10, s + 1))}>
                      <Plus size={14} />
                    </button>
                    <span className="pm-slot-label">students max</span>
                  </div>
                </div>
              )}

              {/* Go Live / Stop */}
              <button
                className={`pm-go-live-btn ${isLive ? 'stop' : ''}`}
                onClick={isLive ? handleStopLive : handleGoLive}
              >
                {isLive ? <><X size={16} /> Stop Pulse</> : <><Zap size={16} /> Go Live Now</>}
              </button>
            </div>
          )}

          {/* ─── REQUESTS Panel ─── */}
          {activePanel === 'requests' && (
            <div className="pm-panel-body">
              <h3 className="pm-panel-title"><Users size={16} /> Student Requests</h3>
              <p className="pm-panel-subtitle">Students requesting a session with you</p>

              {requests.length === 0 ? (
                <div className="pm-empty">
                  <Users size={28} />
                  <span>No requests yet</span>
                  <span className="pm-empty-sub">Go live to start receiving requests!</span>
                </div>
              ) : (
                <div className="pm-request-list">
                  {requests.map(req => (
                    <div key={req.id} className={`pm-request-card ${req.status}`}>
                      <div className="pm-req-avatar">{req.avatar}</div>
                      <div className="pm-req-info">
                        <span className="pm-req-name">{req.name}</span>
                        <span className="pm-req-topic">{req.topic}</span>
                        <span className="pm-req-time">{req.time}</span>
                      </div>
                      {req.status === 'pending' ? (
                        <div className="pm-req-actions">
                          <button className="pm-req-accept" onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                          <button className="pm-req-decline" onClick={() => handleDeclineRequest(req.id)}>✕</button>
                        </div>
                      ) : (
                        <span className="pm-req-status-badge">✓ Accepted</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── NEARBY ALUMNI Panel ─── */}
          {activePanel === 'nearby' && (
            <div className="pm-panel-body">
              <h3 className="pm-panel-title"><Eye size={16} /> Alumni Nearby</h3>
              <p className="pm-panel-subtitle">Other alumni within 500m — view only</p>

              <div className="pm-nearby-list">
                {mockNearbyAlumni.map(alumni => (
                  <div
                    key={alumni.id}
                    className={`pm-nearby-card ${selectedAlumni?.id === alumni.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAlumni(alumni)}
                  >
                    <div className="pm-nearby-avatar" style={{ background: '#8b5cf620', color: '#7c3aed' }}>
                      {alumni.avatar}
                    </div>
                    <div className="pm-nearby-info">
                      <div className="pm-nearby-name-row">
                        <span className="pm-nearby-name">Anonymous Alumni</span>
                        <div className="pm-nearby-rating"><Star size={11} />{alumni.rating}</div>
                      </div>
                      <span className="pm-nearby-spec">{alumni.specialization}</span>
                      <div className="pm-nearby-tags">
                        {alumni.tags.map(t => <span key={t} className="pm-nearby-tag">{t}</span>)}
                      </div>
                    </div>
                    <div className="pm-nearby-distance">
                      <Navigation size={12} />
                      <span>{alumni.distance}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pm-nearby-notice">
                <EyeOff size={14} />
                <span>You can view nearby alumni but cannot send them session requests. Only students can request sessions.</span>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pm-toast">
          <Zap size={14} />
          {toast}
        </div>
      )}
    </div>
  )
}
