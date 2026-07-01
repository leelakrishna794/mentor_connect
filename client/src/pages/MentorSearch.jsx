import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, Star, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

const MentorSearch = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('');

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (skill) params.skill = skill;
      if (experience) params.experience = experience;
      if (rating) params.rating = rating;
      if (sort) params.sort = sort;

      const { data } = await axios.get('http://localhost:5000/api/mentors', { params });
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [skill, experience, rating, sort]); // Auto-fetch when filters change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleReset = () => {
    setKeyword('');
    setSkill('');
    setExperience('');
    setRating('');
    setSort('');
    // Trigger reset fetch
    axios.get('http://localhost:5000/api/mentors')
      .then(res => setMentors(res.data));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>Discover <span className="gradient-text">Mentors</span></h1>
        <p>Find experienced professionals who can guide you on your technical career path.</p>
      </div>

      {/* Search and Filters panel */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Keyword Search */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-dark)' }} />
              <input
                type="text"
                placeholder="Search mentors by name, role or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          {/* Filtering dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="input-label" style={{ fontSize: '0.8rem' }}>Skill</span>
              <input
                type="text"
                placeholder="e.g. React, Python"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="input-label" style={{ fontSize: '0.8rem' }}>Min Experience</span>
              <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                <option value="">Any Experience</option>
                <option value="2">2+ Years</option>
                <option value="5">5+ Years</option>
                <option value="8">8+ Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="input-label" style={{ fontSize: '0.8rem' }}>Min Rating</span>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4">4.0+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.8">4.8+ Stars</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span className="input-label" style={{ fontSize: '0.8rem' }}>Sort By</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Default</option>
                <option value="rating">Highest Rating</option>
                <option value="experience">Most Experience</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading mentors...</p>
        </div>
      ) : mentors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-dark)', borderRadius: '16px' }}>
          <p>No mentors found matching your criteria. Try resetting the filters.</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {mentors.map((mentor) => (
            <div key={mentor._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                  }}>
                    {mentor.user?.name ? mentor.user.name[0] : 'M'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{mentor.user?.name}</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--primary)' }}>{mentor.title}</p>
                    {mentor.company && (
                      <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary-dark)' }}>at {mentor.company}</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={14} fill="var(--warning)" color="var(--warning)" />
                    {mentor.rating > 0 ? `${mentor.rating} (${mentor.numReviews})` : 'New'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Briefcase size={14} />
                    {mentor.experience} Years Exp
                  </span>
                </div>

                <p style={{
                  fontSize: '0.9rem',
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  {mentor.bio}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {mentor.skills.map((skill, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.75rem',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <Link to={`/mentors/${mentor.user?._id}`} className="btn btn-outline" style={{ width: '100%', padding: '0.6rem' }}>
                View Profile & Book
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSearch;
