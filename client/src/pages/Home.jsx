import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, MessageSquare, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
        borderRadius: '24px',
        border: '1px solid var(--border-dark)',
      }}>
        <span style={{
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary)',
          padding: '0.4rem 1rem',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'inline-block',
          marginBottom: '1.5rem'
        }}>
          🚀 Accelerate Your Career Path
        </span>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>
          Find the Perfect <span className="gradient-text">Expert Mentor</span>
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto 2.5rem', lineHeight: '1.7' }}>
          Connect 1-on-1 with senior developers, engineering leads, and technical founders. Book slots, message in real-time, and supercharge your learning journey.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/mentors" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Browse Mentors
            <ArrowRight size={20} />
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Register as Mentor
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid-cols-3">
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>50+</h3>
          <p>Verified Industry Mentors</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>1,200+</h3>
          <p>Successful Sessions Booked</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>4.9/5</h3>
          <p>Average Session Satisfaction</p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>How MentorConnect Works</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>Getting started is simple. Just complete three steps and begin your growth journey.</p>
        </div>
        <div className="grid-cols-4">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <h4>1. Choose Mentor</h4>
            <p style={{ fontSize: '0.9rem' }}>Search by title, skillset, experience, or rating to discover matching professionals.</p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <Award size={24} />
            </div>
            <h4>2. Pick a Slot</h4>
            <p style={{ fontSize: '0.9rem' }}>Select from the mentor's scheduled availability and book instantly.</p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <MessageSquare size={24} />
            </div>
            <h4>3. Chat & Connect</h4>
            <p style={{ fontSize: '0.9rem' }}>Discuss details through our built-in real-time chat service before the session.</p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
              <Shield size={24} />
            </div>
            <h4>4. Grow Together</h4>
            <p style={{ fontSize: '0.9rem' }}>Receive expert advice, code reviews, architectural advice, and track progress.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
