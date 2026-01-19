'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { Metadata } from 'next'
import './presentation.css'

const TABSPresentationPage = () => {
  const [currentSlide, setCurrentSlide] = useState(1)
  const totalSlides = 8

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1)
    }
  }, [currentSlide, totalSlides])

  const prevSlide = useCallback(() => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1)
    }
  }, [currentSlide])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  return (
    <div className="presentation-wrapper">
      {/* Slide 1: Title Slide */}
      <div className={`slide-container ${currentSlide === 1 ? 'active' : ''}`} id="slide1">
        <div style={{ textAlign: 'center' }}>
          <div className="code-tag">&lt;initiate_sequence type=&quot;survey&quot; /&gt;</div>
          <h1>
            Technology Adoption
            <br />
            Barriers Survey (TABS)
          </h1>
          <p className="subtitle">Know the Barriers, Break the Barriers</p>
          <div className="divider-line">
            <p style={{ marginBottom: '15px' }}>
              <strong>Clarke Moyer</strong>, Lead Researcher
            </p>
            <div>
              <a href="mailto:cbm6118@psu.edu" className="contact-link">
                <i className="fa-solid fa-envelope"></i> cbm6118@psu.edu
              </a>
              <span className="separator">|</span>
              <a href="tel:5202228104" className="contact-link">
                <i className="fa-solid fa-phone"></i> 520-222-8104
              </a>
            </div>
          </div>
          <a href="https://technologyadoptionbarriers.org/" className="website-pill">
            technologyadoptionbarriers.org
          </a>
        </div>
      </div>

      {/* Slide 2: The Challenge & The Solution */}
      <div className={`slide-container ${currentSlide === 2 ? 'active' : ''}`} id="slide2">
        <h2 className="slide-title">From Obstacle to Opportunity</h2>
        <div className="content-area">
          <div className="two-column tiled">
            <div>
              <h3>
                <i className="fa-solid fa-bug bug-icon"></i> The Bug (Challenge)
              </h3>
              <p>
                <strong>Error:</strong> Organizations fail to adopt essential technologies despite
                clear strategic imperatives.
              </p>
              <p>
                <strong>Missing Dependency:</strong> Leaders lack accessible data to benchmark their
                struggles.
              </p>
            </div>
            <div>
              <h3>
                <i className="fa-solid fa-code-branch branch-icon"></i> The Patch (Solution)
              </h3>
              <p>
                <strong>TABS v1.0:</strong> A longitudinal, open-access intelligence tool to
                democratize data.
              </p>
              <p>
                <strong>Output:</strong> Actionable benchmarking and strategic clarity for the
                C-Suite.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 3: Strategic Context */}
      <div className={`slide-container ${currentSlide === 3 ? 'active' : ''}`} id="slide3">
        <h2 className="slide-title">Adopt or Risk Obsolescence</h2>
        <div className="content-area">
          <div className="two-column">
            <div>
              <ul>
                <li>
                  <strong>Competitive Disadvantage:</strong> Barriers to adoption negatively affect
                  competitive advantage.
                </li>
                <li>
                  <strong>Existential Risk:</strong> Without continuous adoption, enterprises risk
                  market share loss and obsolescence.
                </li>
                <li>
                  <strong>Leadership Void:</strong> Critical need for updated insights from senior
                  leadership decision-makers.
                </li>
              </ul>
            </div>
            <div className="ascii-wrapper">
              <div className="ascii-art">
                {`   MARKET SHARE
      ^
  100%|    ___
      |   /   \\      (Adoption Gap)
   75%|  /     \\      |
      | /       \\     |   SYSTEM
   50%|/         \\____v_  FAILURE
      |          |      |
   25%|          |      |
      |          |      |
    0%|__________|______|____> TIME
      2024      2025   2026`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: The Market Gap */}
      <div className={`slide-container ${currentSlide === 4 ? 'active' : ''}`} id="slide4">
        <h2 className="slide-title">The Data Gap: Paywalls</h2>
        <div className="content-area">
          <div className="tiled-content">
            <div className="tile">
              <div className="icon">
                <i className="fa-solid fa-scroll"></i>
              </div>
              <h3>Theory</h3>
              <p>Academic models (TAM, TOE) exist but are abstract.</p>
            </div>
            <div className="tile paywall-tile">
              <div className="icon">
                <i className="fa-solid fa-file-invoice-dollar paywall-icon"></i>
              </div>
              <h3>Paywalls</h3>
              <p>Industry benchmarks locked behind consultancy fees.</p>
            </div>
            <div className="tile open-source-tile">
              <div className="icon">
                <i className="fa-solid fa-folder-open open-source-icon"></i>
              </div>
              <h3>Open Source</h3>
              <p>Our mission: Democratize adoption data for all.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: The Solution (TABS) */}
      <div className={`slide-container ${currentSlide === 5 ? 'active' : ''}`} id="slide5">
        <h2 className="slide-title">A Longitudinal Insights Tool</h2>
        <div className="content-area">
          <div className="two-column">
            <div>
              <h3>Modeled on Success</h3>
              <p>
                Following the trajectory of <em>The CMO Survey</em>.
              </p>
              <h3>Core Purpose</h3>
              <p>Understand barriers, assess readiness, and explore capability maturity.</p>
              <h3>Outcome</h3>
              <p>A repeatable, annual dataset tracking dynamics over time.</p>
            </div>
            <div className="ascii-wrapper">
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot terminal-dot-red"></div>
                  <div className="terminal-dot terminal-dot-yellow"></div>
                  <div className="terminal-dot terminal-dot-green"></div>
                  <span className="terminal-title">tabs_terminal — bash</span>
                </div>
                <div className="terminal-body">
                  <p>&gt; init TABS_Survey_Protocol</p>
                  <p className="terminal-ok">[OK] Protocol Loaded.</p>
                  <p>&gt; scanning_barriers...</p>
                  <p>[....................] 10%</p>
                  <p>[||||||||............] 45%</p>
                  <p>[||||||||||||||||||||] 100%</p>
                  <p>&gt; generating_insights.json</p>
                  <p className="terminal-warning">Warning: High Resistance Detected in Sector 7G</p>
                  <p>
                    &gt; _<span className="cursor"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: Project Roadmap */}
      <div className={`slide-container ${currentSlide === 6 ? 'active' : ''}`} id="slide6">
        <h2 className="slide-title">Roadmap to Insight</h2>
        <div className="content-area">
          <div className="timeline-layout">
            <div className="timeline-item">
              <div className="timeline-marker">v1.0</div>
              <h3>Dev</h3>
              <p>Survey creation & validation.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">v2.0</div>
              <h3>Distro</h3>
              <p>Partnerships & collection.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">v3.0</div>
              <h3>Analyze</h3>
              <p>Stats & public report.</p>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">v4.0</div>
              <h3>Scale</h3>
              <p>Longitudinal benchmarks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 7: Scope & Focus */}
      <div className={`slide-container ${currentSlide === 7 ? 'active' : ''}`} id="slide7">
        <h2 className="slide-title">Measuring Leadership Perceptions</h2>
        <div className="content-area">
          <div className="two-column">
            <div>
              <ul>
                <li>
                  <strong>Identify:</strong> Barriers hindering strategic tech.
                </li>
                <li>
                  <strong>Assess:</strong> Organizational readiness.
                </li>
                <li>
                  <strong>Evaluate:</strong> Capability maturity.
                </li>
                <li>
                  <strong>Inform:</strong> Integration strategies.
                </li>
              </ul>
            </div>
            <div className="ascii-wrapper">
              <div className="ascii-art">
                {`     ( C-SUITE )
         |
    [ Strategy ]
         |
    +----+----+
    |         |
 ( CIO )   ( CTO )
    |         |
 [ Inf ]   [ Dev ]
    |         |
    +----+----+
         |
     ( VALUE )`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: The Benchmark Model */}
      <div className={`slide-container ${currentSlide === 8 ? 'active' : ''}`} id="slide8">
        <h2 className="slide-title">Benchmarking Excellence</h2>
        <div className="content-area">
          <div className="two-column">
            <div>
              <h3>Inspiration</h3>
              <p>
                Since 2008, <em>The CMO Survey</em> has collected opinions and expectations on
                marketing spending, priorities, and economic outlook. TABS aims to replicate this
                longitudinal success for the Technology sector.
              </p>
            </div>
            <div className="ascii-wrapper">
              <div className="ascii-art">
                {`      ^
      |           |
      |          / \\
      |         / _ \\
      |        |.o '.|
      |        |'._.'|
      |        |     |
      |      ,'|  |  |'.
      |     /  |  |  |  \\
      |     |,-'--|--'-.|
      |     ----------------
      |         LAUNCH
      +------------------->`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="controls">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 1}
          className="nav-btn"
          aria-label="Previous slide"
        >
          ← Prev
        </button>
        <span className="slide-counter">
          {currentSlide} / {totalSlides}
        </span>
        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides}
          className="nav-btn"
          aria-label="Next slide"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default TABSPresentationPage
