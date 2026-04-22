'use client'
import { useState } from 'react'
import PreferenceForm from '@/components/PreferenceForm'

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 40px', borderBottom: '1px solid var(--border)'
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '22px',
          fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px'
        }}>
          subleasy
        </span>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--accent)', color: '#000', border: 'none',
            padding: '10px 22px', borderRadius: '100px', fontFamily: 'var(--font-body)',
            fontWeight: 500, fontSize: '14px', cursor: 'pointer'
          }}
        >
          Get alerts →
        </button>
      </nav>

      {!showForm && !submitted && (
        <>
          {/* Hero */}
          <section style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 40px 60px' }}>

            {/* Live indicator */}
            <div className="animate-fade-up delay-1" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '100px', padding: '6px 14px', marginBottom: '40px'
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'pulse-dot 1.8s ease-in-out infinite',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Now live in Berkeley &amp; Seattle
              </span>
            </div>

            <h1 className="animate-fade-up delay-2" style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 88px)',
              fontWeight: 800, lineHeight: 1.0, letterSpacing: '-3px',
              marginBottom: '32px', color: 'var(--text)'
            }}>
              Stop hunting.<br />
              <span style={{ color: 'var(--accent)' }}>Get texted.</span>
            </h1>

            <p className="animate-fade-up delay-3" style={{
              fontSize: '20px', color: 'var(--text-muted)', lineHeight: 1.6,
              maxWidth: '520px', marginBottom: '48px', fontFamily: 'var(--font-body)'
            }}>
              Tell us your budget, dates, and city. We scan Craigslist, Zillow, and more every hour.
              The second something matches — you get a text.
            </p>

            <div className="animate-fade-up delay-4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: 'var(--accent)', color: '#000', border: 'none',
                  padding: '16px 36px', borderRadius: '100px', fontSize: '17px',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '-0.3px'
                }}
              >
                Set up my alerts →
              </button>
              <button
                onClick={() => window.open('https://forms.gle', '_blank')}
                style={{
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', padding: '16px 28px',
                  borderRadius: '100px', fontSize: '15px', fontFamily: 'var(--font-body)',
                  cursor: 'pointer'
                }}
              >
                List your place
              </button>
            </div>
          </section>

          {/* How it works */}
          <section style={{
            maxWidth: '900px', margin: '0 auto', padding: '60px 40px',
            borderTop: '1px solid var(--border)'
          }}>
            <p className="animate-fade-up delay-5" style={{
              fontSize: '12px', letterSpacing: '3px', color: 'var(--text-muted)',
              textTransform: 'uppercase', marginBottom: '48px', fontFamily: 'var(--font-body)'
            }}>
              How it works
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
              {[
                { step: '01', title: 'Set your criteria', body: 'Budget, dates, city, furnished or not. Takes 60 seconds.' },
                { step: '02', title: 'We scan everything', body: 'Craigslist, Zillow, user-submitted — checked every hour.' },
                { step: '03', title: 'Get a text instantly', body: 'A match hits? You hear about it before anyone else.' },
              ].map(({ step, title, body }) => (
                <div key={step} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '28px'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '12px',
                    color: 'var(--accent)', letterSpacing: '2px', marginBottom: '12px'
                  }}>{step}</div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '18px',
                    fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.3px'
                  }}>{title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Markets */}
          <section style={{
            maxWidth: '900px', margin: '0 auto', padding: '40px 40px 80px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #001a3a 0%, #003262 100%)',
                border: '1px solid #003a72', borderRadius: '20px', padding: '32px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐻</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px',
                  fontWeight: 800, marginBottom: '4px'
                }}>UC Berkeley</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  Semester subleases · Off-campus housing
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #051525 0%, #0a2a4a 100%)',
                border: '1px solid #0d3660', borderRadius: '20px', padding: '32px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⛰️</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px',
                  fontWeight: 800, marginBottom: '4px'
                }}>Seattle</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  Summer internships · 3-month subleases
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid var(--border)', padding: '24px 40px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>subleasy</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>© 2025 · Built for students & interns</span>
          </footer>
        </>
      )}

      {/* Preference Form Modal */}
      {showForm && !submitted && (
        <PreferenceForm onSuccess={() => { setShowForm(false); setSubmitted(true) }} />
      )}

      {/* Success State */}
      {submitted && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '40px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '42px',
            fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px'
          }}>You're on the list.</h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
            The moment we find something that matches your criteria, you'll get a text. Go touch some grass.
          </p>
          <div style={{
            marginTop: '40px', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '16px',
            padding: '20px 32px', fontSize: '14px', color: 'var(--text-muted)'
          }}>
            Know someone else who needs housing? <br />
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}
              onClick={() => { setSubmitted(false) }}>
              Send them here →
            </span>
          </div>
        </div>
      )}
    </main>
  )
}
