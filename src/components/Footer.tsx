"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Shield, Zap, Sparkles } from "lucide-react";
import { sound } from "@/utils/audio";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      sound.playSuccess();
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3500);
      setEmail("");
    }
  };

  return (
    <footer className="brand-footer">
      {/* Pre-footer VIP Access Banner */}
      <div className="footer-vip-strip">
        <div className="vip-container">
          <div className="vip-copy">
            <span className="vip-pill">VIP ALLOCATION ACCESS</span>
            <h3>Next Drop: Experimental Series // 02</h3>
            <p>Join the inner circle for early 3D CAD customization releases and limited lab runs.</p>
          </div>

          <form onSubmit={handleSubscribe} className="vip-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER ENCRYPTED EMAIL"
              className="vip-input"
            />
            <button type="submit" className="vip-btn">
              {subscribed ? (
                <>
                  <Check size={16} />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Join List</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <span className="logo-symbol">▲</span>
              <span className="logo-text">NEXTSTEP</span>
            </div>
            <p className="brand-mission">
              Pioneering additive bespoke footwear through real-time 3D computational design, bio-adaptive polymers, and zero-waste on-demand fabrication.
            </p>
            <div className="status-badge-live">
              <span className="live-dot" />
              <span>3D CAD ENGINE: ONLINE (THREE.JS / WEBGL 2.0)</span>
            </div>
          </div>

          <div className="footer-links-col">
            <span className="col-heading">EXPERIENCE</span>
            <ul>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  3D Sneaker Customizer
                </Link>
              </li>
              <li>
                <a href="#lookbook" onClick={() => sound.playClick(600, 0.02)}>
                  Editorial Lookbook
                </a>
              </li>
              <li>
                <a href="#technology" onClick={() => sound.playClick(600, 0.02)}>
                  Materials & Tech Lab
                </a>
              </li>
              <li>
                <a href="#manifesto" onClick={() => sound.playClick(600, 0.02)}>
                  Brand Manifesto
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <span className="col-heading">COLLECTIONS</span>
            <ul>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Nexus-01 Aeroknit
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Cyber Runner Pro
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Stealth Void Low
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Mars Terra High
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <span className="col-heading">ASSURANCE</span>
            <div className="assurance-badges">
              <div className="assurance-item">
                <Shield size={14} color="#39ff14" />
                <span>30-Day Fit Guarantee</span>
              </div>
              <div className="assurance-item">
                <Zap size={14} color="#00f0ff" />
                <span>Zero-Waste 3D Print</span>
              </div>
              <div className="assurance-item">
                <Sparkles size={14} color="#ffaa00" />
                <span>Carbon Neutral Courier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & System Status */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <span>© 2026 NEXTSTEP LABS INC. ALL RIGHTS RESERVED.</span>
          <div className="footer-meta-tags">
            <span>TERMS OF SPECIFICATION</span>
            <span>•</span>
            <span>PRIVACY PROTOCOL</span>
            <span>•</span>
            <span>GLOBAL DISPATCH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
