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
            <span className="vip-pill">STAY CONNECTED</span>
            <h3>Join the Future of Footwear</h3>
            <p>Be the first to know about new drops, customization features, and exclusive releases.</p>
          </div>

          <form onSubmit={handleSubscribe} className="vip-form">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
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
                  <span>Join Waitlist</span>
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
              Customizable 3D-printed footwear designed around you and crafted on demand through digital manufacturing.
            </p>
            <div className="status-badge-live">
              <span className="live-dot" />
              <span>3D PREVIEW ENGINE: ONLINE</span>
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
                  Technology & Materials
                </a>
              </li>
              <li>
                <a href="#manifesto" onClick={() => sound.playClick(600, 0.02)}>
                  Our Philosophy
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-links-col">
            <span className="col-heading">COLLECTIONS</span>
            <ul>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Runners
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Trainers
                </Link>
              </li>
              <li>
                <Link href="/store" onClick={() => sound.playClick(600, 0.02)}>
                  Lifestyle
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
          <span>© 2026 NEXTSTEP FOOTWEAR. ALL RIGHTS RESERVED.</span>
          <div className="footer-meta-tags">
            <span>TERMS OF SERVICE</span>
            <span>•</span>
            <span>PRIVACY POLICY</span>
            <span>•</span>
            <span>SHIPPING & RETURNS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
