import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, Star, Trash2, Clock, Plus, Check, X, Shield, PlusCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminMentors, setAdminMentors] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin manual mentor assignment states
  const [assignMentor, setAssignMentor] = useState('');
  const [assignMentee, setAssignMentee] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignTime, setAssignTime] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');

  const [mentorProfile, setMentorProfile] = useState(null);
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorCompany, setMentorCompany] = useState('');
  const [mentorBio, setMentorBio] = useState('');
  const [mentorSkillsStr, setMentorSkillsStr] = useState('');
  const [mentorExp, setMentorExp] = useState(1);
  const [mentorEduc, setMentorEduc] = useState('');
  const [mentorAvail, setMentorAvail] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const handleMarkNotifRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      const notifRes = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(notifRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEditing = () => {
    if (mentorProfile) {
      setMentorTitle(mentorProfile.title || '');
      setMentorCompany(mentorProfile.company || '');
      setMentorBio(mentorProfile.bio || '');
      setMentorSkillsStr(mentorProfile.skills ? mentorProfile.skills.join(', ') : '');
      setMentorExp(mentorProfile.experience || 1);
      setMentorEduc(mentorProfile.education || '');
    }
    setIsEditing(false);
  };

  // Availability add helpers
  const [newDay, setNewDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('');

  // Review modal
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user.role === 'admin') {
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
        setAdminStats(statsRes.data);
        const usersRes = await axios.get('http://localhost:5000/api/admin/users');
        setAdminUsers(usersRes.data);
        const mentorsRes = await axios.get('http://localhost:5000/api/admin/mentors');
        setAdminMentors(mentorsRes.data);
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
        setAdminBookings(bookingsRes.data);
        const messagesRes = await axios.get('http://localhost:5000/api/admin/messages');
        setAdminMessages(messagesRes.data);
      } else {
        const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
        setBookings(bookingsRes.data);
        const notifRes = await axios.get('http://localhost:5000/api/notifications');
        setNotifications(notifRes.data);

        if (user.role === 'mentor') {
          const profileRes = await axios.get(`http://localhost:5000/api/mentors/${user._id}`);
          const prof = profileRes.data.profile;
          setMentorProfile(prof);
          setMentorTitle(prof.title || '');
          setMentorCompany(prof.company || '');
          setMentorBio(prof.bio || '');
          setMentorSkillsStr(prof.skills ? prof.skills.join(', ') : '');
          setMentorExp(prof.experience || 1);
          setMentorEduc(prof.education || '');
          setMentorAvail(prof.availability || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Status updates (accept, reject, cancel, complete)
  const updateBooking = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}`, { status });
      // Refresh list
      const { data } = await axios.get('http://localhost:5000/api/bookings');
      setBookings(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating booking status');
    }
  };

  // Mentor profile updates
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateSuccess('');
    try {
      const skillsArray = mentorSkillsStr.split(',').map(s => s.trim()).filter(s => s);
      const { data } = await axios.put(`http://localhost:5000/api/mentors/${user._id}`, {
        title: mentorTitle,
        company: mentorCompany,
        bio: mentorBio,
        skills: skillsArray,
        experience: mentorExp,
        education: mentorEduc,
        availability: mentorAvail,
      });
      setUpdateSuccess('Profile updated successfully!');
      setMentorProfile(data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  // Availability adder
  const addAvailabilitySlot = () => {
    if (!newSlot) return;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newSlot)) {
      alert('Please enter time in HH:MM format (e.g. 14:00)');
      return;
    }

    const updated = [...mentorAvail];
    const dayItem = updated.find(d => d.day === newDay);
    if (dayItem) {
      if (!dayItem.slots.includes(newSlot)) {
        dayItem.slots.push(newSlot);
        dayItem.slots.sort();
      }
    } else {
      updated.push({ day: newDay, slots: [newSlot] });
    }

    setMentorAvail(updated);
    setNewSlot('');
  };

  const removeSlot = (dayName, slotTime) => {
    const updated = mentorAvail.map(d => {
      if (d.day === dayName) {
        return {
          ...d,
          slots: d.slots.filter(s => s !== slotTime)
        };
      }
      return d;
    }).filter(d => d.slots.length > 0);

    setMentorAvail(updated);
  };

  // Submit reviews
  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await axios.post(`http://localhost:5000/api/bookings/${reviewBookingId}/review`, {
        rating: reviewRating,
        reviewText,
      });
      setReviewBookingId(null);
      setReviewText('');
      // refresh
      const { data } = await axios.get('http://localhost:5000/api/bookings');
      setBookings(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  // Admin delete users
  const deleteAdminUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user? This will delete their profiles.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      setAdminUsers(adminUsers.filter(u => u._id !== id));
      setAdminMentors(adminMentors.filter(m => m.user?._id !== id));
    } catch (err) {
      alert('Error deleting user');
    }
  };

  // Admin approve mentors
  const handleApproveMentor = async (mentorUserId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/mentors/${mentorUserId}/approve`);
      alert('Mentor approved successfully!');
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setAdminStats(statsRes.data);
      const mentorsRes = await axios.get('http://localhost:5000/api/admin/mentors');
      setAdminMentors(mentorsRes.data);
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      setAdminUsers(usersRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving mentor');
    }
  };

  // Admin approve users (mentee or mentor)
  const handleApproveUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/approve`);
      alert('User approved successfully!');
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      setAdminUsers(usersRes.data);
      const mentorsRes = await axios.get('http://localhost:5000/api/admin/mentors');
      setAdminMentors(mentorsRes.data);
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setAdminStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving user');
    }
  };

  // Admin manual mentor assignment
  const handleAssignMentorSubmit = async (e) => {
    e.preventDefault();
    setAssignSuccess('');
    setAssignError('');

    if (!assignMentor || !assignMentee || !assignDate || !assignTime) {
      setAssignError('Please fill in all assignment fields.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        mentorId: assignMentor,
        menteeId: assignMentee,
        date: assignDate,
        time: assignTime,
        notes: assignNotes,
      });

      setAssignSuccess('Mentor successfully assigned to mentee!');
      setAssignMentor('');
      setAssignMentee('');
      setAssignDate('');
      setAssignTime('');
      setAssignNotes('');

      // Refresh stats and bookings
      const bookingsRes = await axios.get('http://localhost:5000/api/bookings');
      setAdminBookings(bookingsRes.data);
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setAdminStats(statsRes.data);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Error assigning mentor.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}><p>Loading dashboard...</p></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
        <p>Manage your account, view stats, bookings, and activities.</p>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} />{error}</div>}

      {/* ======================================================== */}
      {/* 1. MENTEE INTERFACE */}
      {/* ======================================================== */}
      {user.role === 'mentee' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Bookings table list */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} />
              Your Mentorship Bookings
            </h3>

            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>No bookings scheduled yet.</p>
                <Link to="/mentors" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Explore Mentors</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map((booking) => (
                  <div key={booking._id} style={{
                    border: '1px solid var(--border-dark)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0' }}>Mentor: {booking.mentor?.name}</h4>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} />
                        Date: {booking.date} at {booking.time}
                      </p>
                      {booking.notes && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>
                          Notes: {booking.notes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                      
                      {/* Actions */}
                      {booking.status === 'pending' && (
                        <button onClick={() => updateBooking(booking._id, 'cancelled')} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Cancel
                        </button>
                      )}

                      {booking.status === 'accepted' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/chat?contactId=${booking.mentor?._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <MessageSquare size={14} />
                            Chat
                          </Link>
                          <button onClick={() => updateBooking(booking._id, 'completed')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            Complete
                          </button>
                        </div>
                      )}

                      {booking.status === 'completed' && (
                        <button onClick={() => setReviewBookingId(booking._id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links & resources / Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Notifications Card */}
            <div className="card">
              <h3>Notifications</h3>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No new notifications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div key={n._id} style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.06)',
                      borderLeft: n.read ? '2px solid transparent' : '2px solid var(--primary)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1, opacity: n.read ? 0.7 : 1 }}>{n.message}</div>
                      {!n.read && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleMarkNotifRead(n._id)}
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3>Learning Center</h3>
            <p style={{ fontSize: '0.9rem' }}>Follow these best practices to get the most value out of your mentoring sessions:</p>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Prepare 2-3 specific questions.</li>
              <li>Keep a notepad handy during call.</li>
              <li>Ask for feedback on your codebase or resume.</li>
              <li>Leave reviews to help other mentees.</li>
            </ul>
          </div>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* 2. MENTOR INTERFACE */}
      {/* ======================================================== */}
      {user.role === 'mentor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          
          {/* Bookings & Requests */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem' }}>Session Bookings & Requests</h3>
              {bookings.length === 0 ? (
                <p>No bookings requested yet. Make sure your availability is set!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {bookings.map((booking) => (
                    <div key={booking._id} style={{
                      border: '1px solid var(--border-dark)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Mentee: {booking.mentee?.name}</h4>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>Slot: {booking.date} at {booking.time}</p>
                        {booking.notes && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Notes: {booking.notes}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                        {booking.status === 'pending' && (
                          <>
                            <button onClick={() => updateBooking(booking._id, 'accepted')} className="btn btn-primary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                              <Check size={14} /> Accept
                            </button>
                            <button onClick={() => updateBooking(booking._id, 'rejected')} className="btn btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === 'accepted' && (
                          <>
                            <Link to={`/chat?contactId=${booking.mentee?._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                              <MessageSquare size={14} /> Chat
                            </Link>
                            <button onClick={() => updateBooking(booking._id, 'completed')} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                              Done
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Setup */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Edit Profile Details</h3>
                {!isEditing && (
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                )}
              </div>
              {updateSuccess && <div className="alert alert-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>{updateSuccess}</div>}
              
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Professional Title</label>
                    <input type="text" value={mentorTitle} onChange={(e) => setMentorTitle(e.target.value)} required disabled={!isEditing} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Company</label>
                    <input type="text" value={mentorCompany} onChange={(e) => setMentorCompany(e.target.value)} disabled={!isEditing} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Bio (Experience & Style)</label>
                  <textarea rows={4} value={mentorBio} onChange={(e) => setMentorBio(e.target.value)} required disabled={!isEditing} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Skills (Comma Separated)</label>
                    <input type="text" value={mentorSkillsStr} onChange={(e) => setMentorSkillsStr(e.target.value)} placeholder="React, Node, Python" disabled={!isEditing} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Years of Experience</label>
                    <input type="number" min={1} value={mentorExp} onChange={(e) => setMentorExp(e.target.value)} required disabled={!isEditing} />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Education / Credentials</label>
                  <input type="text" value={mentorEduc} onChange={(e) => setMentorEduc(e.target.value)} disabled={!isEditing} />
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={cancelEditing}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Profile Info</button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Availability Settings & Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Notifications Card */}
            <div className="card">
              <h3>Notifications</h3>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No new notifications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div key={n._id} style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.06)',
                      borderLeft: n.read ? '2px solid transparent' : '2px solid var(--primary)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1, opacity: n.read ? 0.7 : 1 }}>{n.message}</div>
                      {!n.read && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleMarkNotifRead(n._id)}
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3>Manage Availability</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Add timeslots for mentees to book sessions.</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <select value={newDay} onChange={(e) => setNewDay(e.target.value)} style={{ flex: 1 }}>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <input
                type="text"
                placeholder="14:00"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                style={{ width: '80px' }}
              />
              <button type="button" onClick={addAvailabilitySlot} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                <Plus size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mentorAvail.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No slots set. Mentees cannot schedule calls.</p>
              ) : (
                mentorAvail.map((avail, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>{avail.day}</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {avail.slots.map((slot, sIdx) => (
                        <span key={sIdx} style={{
                          background: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid var(--border-dark)',
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {slot}
                          <X size={12} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => removeSlot(avail.day, slot)} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* 3. ADMIN INTERFACE */}
      {/* ======================================================== */}
      {user.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stats widgets */}
          {adminStats && (
            <div className="grid-cols-4">
              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{adminStats.totalUsers}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Total Users</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{adminStats.totalMentors} / {adminStats.totalMentees}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Mentors / Mentees</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{adminStats.totalBookings}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Total Bookings</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.75rem', borderRadius: '12px' }}>
                  <Star size={24} fill="var(--warning)" color="var(--warning)" />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{adminStats.averageRating} / 5</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Avg Platform Rating</p>
                </div>
              </div>
            </div>
          )}

          {/* Vetting & Assignment Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }} className="grid-cols-2">
            
            {/* Manual Assignment Form */}
            <div className="card">
              <h3>Assign Mentor to Mentee</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Manually pair an approved mentor with an approved mentee.</p>
              
              {assignSuccess && <div className="alert alert-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{assignSuccess}</div>}
              {assignError && <div className="alert alert-error" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{assignError}</div>}

              <form onSubmit={handleAssignMentorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Select Mentor</label>
                    <select value={assignMentor} onChange={(e) => setAssignMentor(e.target.value)} required>
                      <option value="">-- Choose Mentor --</option>
                      {adminUsers.filter(u => u.role === 'mentor' && u.isApproved).map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Select Mentee</label>
                    <select value={assignMentee} onChange={(e) => setAssignMentee(e.target.value)} required>
                      <option value="">-- Choose Mentee --</option>
                      {adminUsers.filter(u => u.role === 'mentee' && u.isApproved).map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Date</label>
                    <input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Time Slot</label>
                    <input type="text" placeholder="14:00" value={assignTime} onChange={(e) => setAssignTime(e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Assignment Notes</label>
                  <input type="text" placeholder="Topic details or assignment notes..." value={assignNotes} onChange={(e) => setAssignNotes(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Schedule</button>
              </form>
            </div>

            {/* Pending Mentor Approvals */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h3>Pending Mentor Approvals</h3>
              {adminMentors.filter(m => !m.isApproved).length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', marginTop: '0.5rem' }}>No mentors awaiting approval.</p>
              ) : (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Title</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminMentors.filter(m => !m.isApproved).map((m) => (
                        <tr key={m._id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                          <td style={{ padding: '0.75rem' }}>{m.user?.name}</td>
                          <td style={{ padding: '0.75rem' }}>{m.title}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button onClick={() => handleApproveMentor(m.user?._id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                              <Check size={14} style={{ marginRight: '4px' }} />
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Manage Users table */}
          <div className="card">
            <h3>Manage Platform Users</h3>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                    <th style={{ padding: '0.75rem' }}>Name</th>
                    <th style={{ padding: '0.75rem' }}>Email</th>
                    <th style={{ padding: '0.75rem' }}>Role</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Created At</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <td style={{ padding: '0.75rem' }}>{u.name}</td>
                      <td style={{ padding: '0.75rem' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${u.role === 'mentor' ? 'badge-accepted' : u.role === 'admin' ? 'badge-completed' : 'badge-pending'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${u.isApproved || u.role === 'admin' ? 'badge-completed' : 'badge-pending'}`}>
                          {u.isApproved || u.role === 'admin' ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                        {u.role !== 'admin' && !u.isApproved && (
                          <button onClick={() => handleApproveUser(u._id)} className="btn btn-primary" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }} title="Approve User">
                            <Check size={14} />
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteAdminUser(u._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.5rem', borderRadius: '6px' }} title="Delete User">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitor Platform Bookings */}
          <div className="card">
            <h3>Monitor Platform Bookings</h3>
            {adminBookings.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', marginTop: '0.5rem' }}>No sessions booked yet.</p>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <th style={{ padding: '0.75rem' }}>Date & Time</th>
                      <th style={{ padding: '0.75rem' }}>Mentor</th>
                      <th style={{ padding: '0.75rem' }}>Mentee</th>
                      <th style={{ padding: '0.75rem' }}>Notes</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                        <td style={{ padding: '0.75rem' }}>{b.date} at {b.time}</td>
                        <td style={{ padding: '0.75rem' }}>{b.mentor?.name || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>{b.mentee?.name || '—'}</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{b.notes || '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge badge-${b.status}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Monitor Chat Logs */}
          <div className="card">
            <h3>Monitor Chat Logs</h3>
            {adminMessages.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', marginTop: '0.5rem' }}>No chat messages exchanged yet.</p>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <th style={{ padding: '0.75rem' }}>Timestamp</th>
                      <th style={{ padding: '0.75rem' }}>Sender</th>
                      <th style={{ padding: '0.75rem' }}>Receiver</th>
                      <th style={{ padding: '0.75rem' }}>Message Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminMessages.map((m) => (
                      <tr key={m._id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(m.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem' }}>{m.sender?.name || '—'} ({m.sender?.role || '—'})</td>
                        <td style={{ padding: '0.75rem' }}>{m.receiver?.name || '—'} ({m.receiver?.role || '—'})</td>
                        <td style={{ padding: '0.75rem', fontSize: '0.9rem', fontStyle: 'italic' }}>"{m.content}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REVIEW DIALOG MODAL */}
      {/* ======================================================== */}
      {reviewBookingId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', padding: '2rem' }}>
            <h3>Leave Platform Review</h3>
            {reviewError && <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>{reviewError}</div>}
            
            <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Rating (1 to 5 Stars)</label>
                <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Feedback Review</label>
                <textarea
                  rows={3}
                  required
                  placeholder="How was your mentoring session? What did you cover?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setReviewBookingId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
