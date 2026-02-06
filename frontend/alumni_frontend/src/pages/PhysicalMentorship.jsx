import React, { useState, useEffect, useRef, useCallback } from 'react'
import { GoogleMap, OverlayViewF, OverlayView, CircleF } from '@react-google-maps/api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Users, ChevronUp, ChevronDown, X, Navigation,
  Plus, Minus, ToggleLeft, ToggleRight, Zap, Bell, Footprints,
  Radio, User, Star, MessageCircle
} from 'lucide-react'
import Button from '../components/Button'
import Badge from '../components/Badge'

/* ─── Google Maps custom style (light, minimal — matches the mint theme) ─── */
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'on' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4a7a5a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4edda' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4a7a5a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#dcfce8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a7a5a' }] },
]

const MAP_OPTIONS = {
  styles: MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: 'greedy',
}

/* ─── Pulse Marker Overlay ─── */
function PulseMarker({ position, color, onClick }) {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -18, y: -18 })}
    >
      <div
        onClick={onClick}
        style={{ width: 36, height: 36, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: color,
          opacity: 0.18, animation: 'pulse-ring 2s ease-out infinite',
        }} />
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: color,
          border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          position: 'relative', zIndex: 1,
        }} />
      </div>
    </OverlayViewF>
  )
}

/* ─── Student "You" Marker Overlay ─── */
function StudentMarker({ position }) {
  return (
    <OverlayViewF
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -14, y: -14 })}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: '#3b82f6',
        border: '3px solid white', boxShadow: '0 2px 10px rgba(59,130,246,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="12" cy="7" r="4" />
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        </svg>
      </div>
    </OverlayViewF>
  )
}

/* ─── Mock data ─── */
const CAMPUS_CENTER = { lat: 28.5449, lng: 77.1926 } // IIT Delhi
const LOCATIONS = [
  { name: 'Main Canteen', pos: { lat: 28.5460, lng: 77.1905 } },
  { name: 'Central Library', pos: { lat: 28.5440, lng: 77.1940 } },
  { name: 'SAC Building', pos: { lat: 28.5455, lng: 77.1958 } },
  { name: 'Lecture Hall Complex', pos: { lat: 28.5435, lng: 77.1915 } },
  { name: 'Hostel Block A', pos: { lat: 28.5470, lng: 77.1935 } },
]

const mockAlumniPulses = [
  {
    id: 1, name: 'Arjun Mehta', role: 'SDE @ Google', avatar: 'AM',
    location: LOCATIONS[0], duration: 30, capacity: 3, filled: 1,
    groupMode: false, rating: 4.8, tags: ['DSA', 'System Design'],
    status: 'available',
  },
  {
    id: 2, name: 'Priya Sharma', role: 'PM @ Flipkart', avatar: 'PS',
    location: LOCATIONS[1], duration: 45, capacity: 5, filled: 3,
    groupMode: true, rating: 4.9, tags: ['Product', 'Case Studies'],
    status: 'limited',
  },
  {
    id: 3, name: 'Rahul Verma', role: 'Data Scientist @ Amazon', avatar: 'RV',
    location: LOCATIONS[2], duration: 20, capacity: 2, filled: 0,
    groupMode: false, rating: 4.6, tags: ['ML', 'Python'],
    status: 'available',
  },
  {
    id: 4, name: 'Sneha Gupta', role: 'Frontend Lead @ Razorpay', avatar: 'SG',
    location: LOCATIONS[3], duration: 60, capacity: 4, filled: 3,
    groupMode: true, rating: 4.7, tags: ['React', 'UI/UX'],
    status: 'limited',
  },
]

/* ─── Walking time estimate ─── */
function getWalkingMinutes(from, to) {
  const R = 6371e3
  const toRad = d => d * Math.PI / 180
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lng - from.lng)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(1, Math.round(dist / 80)) // ~80m per minute walking
}

/* ─── Notification Toast ─── */
function NearbyNotification({ pulse, onDismiss }) {
  return (
    <motion.div
      initial={{ y: -80, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[340px]"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/60 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--mint-100)] flex items-center justify-center shrink-0">
          <Radio size={18} className="text-[var(--mint-500)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px] font-bold text-[var(--text-primary)]">{pulse.name}</span>
            <Badge variant="success" className="!text-[9px] !px-1.5 !py-0.5">LIVE</Badge>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-snug">
            is available at <strong className="text-[var(--text-secondary)]">{pulse.location.name}</strong> for {pulse.duration} min
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="primary" size="sm" className="!text-[10px] !px-2.5 !py-1" onClick={onDismiss}>
              <Navigation size={10} /> View on Map
            </Button>
            <button onClick={onDismiss} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer bg-transparent border-none font-[inherit]">
              Dismiss
            </button>
          </div>
        </div>
        <button onClick={onDismiss} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none mt-0.5">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Alumnus Pulse Panel (Bottom Sheet) ─── */
function PulsePanel({ onGoLive, isLive, onStopLive }) {
  const [expanded, setExpanded] = useState(false)
  const [location, setLocation] = useState(LOCATIONS[0].name)
  const [duration, setDuration] = useState(30)
  const [capacity, setCapacity] = useState(3)
  const [groupMode, setGroupMode] = useState(false)

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 z-[900] pointer-events-none"
      animate={{ y: 0 }}
    >
      <motion.div
        className="bg-white/92 backdrop-blur-2xl rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.08)] border-t border-white/70 pointer-events-auto"
        animate={{ height: expanded ? 380 : (isLive ? 100 : 72) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Handle bar */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
        </div>

        {/* Collapsed: quick status */}
        {!expanded && !isLive && (
          <div className="px-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[var(--mint-500)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Go Live on Campus</span>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-xs font-medium text-[var(--mint-500)] bg-transparent border-none cursor-pointer font-[inherit]"
            >
              Set up <ChevronUp size={14} />
            </button>
          </div>
        )}

        {!expanded && isLive && (
          <div className="px-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[var(--mint-400)] animate-[pulse_1.5s_ease-in-out_infinite]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">You're Live</span>
                <span className="text-[11px] text-[var(--text-muted)] ml-2">{location} · {duration} min · {capacity} slots</span>
              </div>
            </div>
            <Button variant="danger" size="sm" className="!text-[10px]" onClick={onStopLive}>Stop</Button>
          </div>
        )}

        {/* Expanded: full controls */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-5 pb-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[var(--text-primary)]">Set Your Pulse</span>
              <button
                onClick={() => setExpanded(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Location */}
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Location</label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => setLocation(loc.name)}
                    className={`
                      text-xs px-3 py-1.5 rounded-xl border cursor-pointer font-[inherit] transition-all duration-200
                      ${location === loc.name
                        ? 'bg-[var(--mint-400)] text-white border-[var(--mint-400)] shadow-[0_3px_12px_rgba(74,222,128,0.3)]'
                        : 'bg-white/50 text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--mint-300)]'
                      }
                    `}
                  >
                    <MapPin size={11} className="inline mr-1 -mt-0.5" />{loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Duration</label>
                <span className="text-sm font-bold text-[var(--mint-500)]">{duration} min</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={5}
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
                className="w-full accent-[var(--mint-400)] h-1.5 cursor-pointer"
                style={{ accentColor: 'var(--mint-400)' }}
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                <span>15 min</span><span>30</span><span>45</span><span>60 min</span>
              </div>
            </div>

            {/* Capacity + Group toggle */}
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Capacity</label>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setCapacity(c => Math.max(1, c - 1))}
                    className="w-8 h-8 rounded-xl bg-white/60 border border-[var(--glass-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--mint-50)] transition-colors"
                  >
                    <Minus size={14} className="text-[var(--text-secondary)]" />
                  </button>
                  <span className="text-lg font-bold text-[var(--text-primary)] w-6 text-center">{capacity}</span>
                  <button
                    onClick={() => setCapacity(c => Math.min(5, c + 1))}
                    className="w-8 h-8 rounded-xl bg-white/60 border border-[var(--glass-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--mint-50)] transition-colors"
                  >
                    <Plus size={14} className="text-[var(--text-secondary)]" />
                  </button>
                  <span className="text-[10px] text-[var(--text-muted)] ml-1">students</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5 block">Group Session</label>
                <button
                  onClick={() => setGroupMode(g => !g)}
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  {groupMode
                    ? <ToggleRight size={36} className="text-[var(--mint-400)]" />
                    : <ToggleLeft size={36} className="text-[var(--text-muted)]/40" />
                  }
                </button>
              </div>
            </div>

            {/* Go Live button */}
            <Button
              variant={isLive ? 'danger' : 'primary'}
              size="lg"
              className="w-full !rounded-2xl !py-3 !text-sm !font-bold"
              onClick={() => {
                if (isLive) { onStopLive(); }
                else { onGoLive({ location, duration, capacity, groupMode }); }
                setExpanded(false)
              }}
            >
              {isLive ? (
                <><X size={16} /> Stop Pulse</>
              ) : (
                <><Zap size={16} /> Go Live Now</>
              )}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ─── Student Request View ─── */
function StudentRequestSheet({ pulse, userPos, onRequest, onClose }) {
  const walkMins = getWalkingMinutes(userPos, pulse.location.pos)
  const slotsLeft = pulse.capacity - pulse.filled

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="absolute bottom-0 left-0 right-0 z-[950] pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.1)] border-t border-white/70 p-5">
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
        </div>

        {/* Alumni info */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--mint-100)] flex items-center justify-center text-[var(--mint-600)] font-bold text-sm shrink-0">
            {pulse.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[var(--text-primary)]">{pulse.name}</span>
              <div className="flex items-center gap-0.5">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{pulse.rating}</span>
              </div>
            </div>
            <span className="text-[12px] text-[var(--text-muted)] block">{pulse.role}</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {pulse.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-lg bg-[rgba(134,239,172,0.1)] text-[var(--text-secondary)] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-[rgba(134,239,172,0.06)] border border-[rgba(134,239,172,0.12)]">
          <div className="flex items-center gap-1.5 flex-1">
            <MapPin size={14} className="text-[var(--mint-500)]" />
            <div>
              <span className="text-[12px] font-semibold text-[var(--text-primary)] block">{pulse.location.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{pulse.duration} min session</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--glass-border)]" />
          <div className="flex items-center gap-1.5">
            <Footprints size={14} className="text-[var(--mint-500)]" />
            <div>
              <span className="text-[12px] font-bold text-[var(--text-primary)] block">~{walkMins} min</span>
              <span className="text-[10px] text-[var(--text-muted)]">walk</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--glass-border)]" />
          <div className="flex items-center gap-1.5">
            <Users size={14} className={slotsLeft <= 1 ? 'text-amber-500' : 'text-[var(--mint-500)]'} />
            <div>
              <span className={`text-[12px] font-bold block ${slotsLeft <= 1 ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
                {slotsLeft} of {pulse.capacity}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">slots left</span>
            </div>
          </div>
        </div>

        {/* Group badge */}
        {pulse.groupMode && (
          <div className="flex items-center gap-2 mb-4 text-[11px] text-[var(--text-secondary)] bg-[var(--mint-50)] rounded-xl px-3 py-2">
            <Users size={13} className="text-[var(--mint-500)]" />
            <span><strong>Group Session</strong> — Join {pulse.filled} other{pulse.filled !== 1 ? 's' : ''} already in</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 !rounded-2xl !py-3 !text-sm !font-bold"
            onClick={() => onRequest(pulse)}
            disabled={slotsLeft === 0}
          >
            <Navigation size={16} />
            {slotsLeft === 0 ? 'Session Full' : 'Request Interaction'}
          </Button>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/60 border border-[var(--glass-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--mint-50)] transition-colors"
          >
            <MessageCircle size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Physical Mentorship Component ─── */
export default function PhysicalMentorship({ addToast, isLoaded, loadError }) {
  const [selectedPulse, setSelectedPulse] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [liveConfig, setLiveConfig] = useState(null)
  const [notification, setNotification] = useState(null)
  const mapRef = useRef(null)
  const userPos = { lat: 28.5452, lng: 77.1930 } // simulated student position

  // Simulate a notification after 4 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setNotification(mockAlumniPulses[2])
    }, 4000)
    return () => clearTimeout(t)
  }, [])

  const panTo = useCallback((pos) => {
    if (mapRef.current) {
      mapRef.current.panTo(pos)
      mapRef.current.setZoom(17)
    }
  }, [])

  const handleGoLive = (config) => {
    setIsLive(true)
    setLiveConfig(config)
    addToast?.(`You're live at ${config.location}!`)
  }

  const handleStopLive = () => {
    setIsLive(false)
    setLiveConfig(null)
    addToast?.('Pulse stopped.', 'warning')
  }

  const handleRequest = (pulse) => {
    setSelectedPulse(null)
    addToast?.(`Request sent to ${pulse.name}!`)
  }

  const handleNotificationAction = () => {
    const pulse = notification
    setNotification(null)
    panTo(pulse.location.pos)
    setTimeout(() => setSelectedPulse(pulse), 600)
  }

  if (loadError) {
    console.error('Google Maps load error:', loadError)
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-10" style={{ height: 'calc(100vh - 160px)' }}>
        <div className="text-center max-w-sm">
          <MapPin size={40} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Failed to load Google Maps</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">Check your API key in <code className="bg-[var(--mint-50)] px-1 rounded">.env</code></p>
          <p className="text-[10px] text-red-400/80 bg-red-50 rounded-lg p-2 break-all">{loadError.message || String(loadError)}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)]" style={{ height: 'calc(100vh - 160px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--mint-400)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Loading Google Maps…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-[var(--card-shadow)]" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={CAMPUS_CENTER}
        zoom={16}
        options={MAP_OPTIONS}
        onLoad={(map) => { mapRef.current = map }}
      >
        {/* User location circle */}
        <CircleF
          center={userPos}
          radius={50}
          options={{
            strokeColor: '#3b82f6',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
          }}
        />

        {/* User marker */}
        <StudentMarker position={userPos} />

        {/* Alumni pulses */}
        {mockAlumniPulses.map(pulse => (
          <PulseMarker
            key={pulse.id}
            position={pulse.location.pos}
            color={pulse.status === 'available' ? '#4ade80' : '#f59e0b'}
            onClick={() => {
              setSelectedPulse(pulse)
              panTo(pulse.location.pos)
            }}
          />
        ))}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-[800] bg-white/85 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 p-3 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Legend</span>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <div className="w-3 h-3 rounded-full bg-[#4ade80]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span>Limited Slots</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <span>You</span>
        </div>
      </div>

      {/* Live indicator */}
      {isLive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 left-4 z-[800] bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 px-3 py-2 flex items-center gap-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--mint-400)] animate-[pulse_1.5s_ease-in-out_infinite]" />
          <span className="text-[11px] font-bold text-[var(--mint-600)]">LIVE</span>
        </motion.div>
      )}

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <NearbyNotification
            pulse={notification}
            onDismiss={handleNotificationAction}
          />
        )}
      </AnimatePresence>

      {/* Student Request Sheet */}
      <AnimatePresence>
        {selectedPulse && (
          <StudentRequestSheet
            pulse={selectedPulse}
            userPos={userPos}
            onRequest={handleRequest}
            onClose={() => setSelectedPulse(null)}
          />
        )}
      </AnimatePresence>

      {/* Alumni Pulse Panel (only when no request sheet is shown) */}
      {!selectedPulse && (
        <PulsePanel
          onGoLive={handleGoLive}
          isLive={isLive}
          onStopLive={handleStopLive}
        />
      )}
    </div>
  )
}
