import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, Briefcase, GraduationCap, Calendar, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

const MentorProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking fields
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/mentors/${id}`);
      setMentorData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching mentor details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [id]);

  const handleDateChange = (e) => {
    const chosenDate = e.target.value;
    setBookingDate(chosenDate);
    setSelectedSlot('');
    
    if (!chosenDate || !mentorData?.profile) {
      setAvailableSlots([]);
      return;
    }
    
    // Find the day name for the selected date
    const dateObj = new Date(chosenDate);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[dateObj.getDay()];
    
    // Find matching availability from mentor profile
    const dayAvailability = mentorData.profile.availability?.find(a => a.day === dayName);
    setAvailableSlots(dayAvailability ? dayAvailability.slots : []);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'mentee') {
      setError('Only logged-in mentees can book mentoring slots.');
      return;
    }
    if (!bookingDate || !selectedSlot) {
      setError('Please select an available date and time slot.');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        mentorId: id,
        date: bookingDate,
        time: selectedSlot,
        notes,
      });

      setSuccess('Session booked successfully! Awaiting mentor approval.');
      setBookingDate('');
      setSelectedSlot('');
      setAvailableSlots([]);
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book session. The slot might be taken.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}><p>Loading profile details...</p></div>;
  }

  if (error && !mentorData) {
    return (
      <div className="alert alert-error" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const { profile, reviews } = mentorData;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      {/* Left Column: Bio, Info, Reviews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '2.5rem',
            fontWeight: '800',
            textTransform: 'uppercase'
          }}>
            {profile.user?.name ? profile.user.name[0] : 'M'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{profile.user?.name}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{profile.title}</p>
            {profile.company && (
              <p style={{ margin: '0 0 1rem 0' }}>at <strong style={{ color: 'var(--text-primary-dark)' }}>{profile.company}</strong></p>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} fill="var(--warning)" color="var(--warning)" />
                <strong>{profile.rating > 0 ? profile.rating : 'New'}</strong> ({profile.numReviews} Reviews)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Briefcase size={16} />
                <strong>{profile.experience}</strong> Years Experience
              </span>
            </div>
          </div>
        </div>

        {/* About / Bio */}
        <div className="card">
          <h3 style={{ borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>About Me</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{profile.bio}</p>

          <h4 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Skills & Expertise</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {profile.skills.map((skill, idx) => (
              <span key={idx} style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                padding: '0.25rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {skill}
              </span>
            ))}
          </div>

          {profile.education && (
            <>
              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={20} />
                Education
              </h4>
              <p>{profile.education}</p>
            </>
          )}
        </div>

        {/* Reviews Section */}
        <div className="card">
          <h3 style={{ borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p>No reviews yet for this mentor.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviews.map((rev) => (
                <div key={rev._id} style={{ borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{rev.mentee?.name}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />
                      ))}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{rev.reviewText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Scheduling & Messaging */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Call to actions */}
        {user && user._id !== id && (
          <Link to={`/chat?contactId=${id}`} className="btn btn-secondary" style={{ width: '100%' }}>
            <MessageSquare size={18} />
            Message Mentor
          </Link>
        )}

        {/* Booking slot scheduling Form */}
        <div className="card">
          <h3>Schedule Session</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select an available date and time slot below to request a session.</p>

          {error && (
            <div className="alert alert-error" style={{ fontSize: '0.85rem', padding: '0.75rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ fontSize: '0.85rem', padding: '0.75rem' }}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Date Selection */}
            <div className="input-group">
              <label className="input-label">Select Session Date</label>
              <input 
                type="date" 
                value={bookingDate} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={handleDateChange} 
                required 
              />
              {profile.availability && profile.availability.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)', margin: '0.25rem 0 0 0' }}>
                  Weekly availability: {profile.availability.map(a => a.day).join(', ')}
                </p>
              )}
            </div>

            {/* Time Slot Selection */}
            {bookingDate && (
              <div>
                <span className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Available Slots for this Day</span>
                {availableSlots.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--danger)', fontStyle: 'italic' }}>
                    No slots set for this day of the week. Please choose a different date.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {availableSlots.map((slot, sIdx) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setSelectedSlot(slot)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px' }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Describe your Goals</label>
              <textarea
                rows={3}
                placeholder="What topics or questions would you like to discuss during the session?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={bookingLoading || !bookingDate || !selectedSlot}
            >
              <Calendar size={18} />
              Book Selected Slot
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileView;
