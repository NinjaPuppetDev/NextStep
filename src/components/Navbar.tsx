"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCustomizer } from "@/context/CustomizerContext";
import { ShoppingBag, Volume2, VolumeX, Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { sound } from "@/utils/audio";

export default function Navbar() {
  const pathname = usePathname();
  const { cart, setCartOpen, soundEnabled, toggleSound } = useCustomizer();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className={`navbar-header ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link
            href="/"
            className="navbar-brand"
            onClick={() => sound.playClick(600, 0.02)}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <Image
              src="/images/NextStepLogo.png"
              alt="NextStep Logo"
              width={130}
              height={32}
              style={{ objectFit: "contain", height: "auto" }}
              priority
            />
            <div className="live-drop-tag">
              <span className="pulse-dot" />
              <span>DROP 01</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links">
            <Link
              href="/"
              className={`nav-link ${pathname === "/" ? "active" : ""}`}
              onClick={() => sound.playClick(600, 0.02)}
            >
              Overview
            </Link>
            <Link
              href="/store"
              className={`nav-link highlight-link ${pathname === "/store" ? "active" : ""}`}
              onClick={() => sound.playClick(700, 0.03)}
            >
              <Sparkles size={13} />
              <span>3D Customizer</span>
            </Link>
            <a
              href="#lookbook"
              className="nav-link"
              onClick={() => sound.playClick(600, 0.02)}
            >
              Lookbook
            </a>
            <a
              href="#technology"
              className="nav-link"
              onClick={() => sound.playClick(600, 0.02)}
            >
              Materials & Tech
            </a>
            <a
              href="#manifesto"
              className="nav-link"
              onClick={() => sound.playClick(600, 0.02)}
            >
              Manifesto
            </a>
          </nav>

          {/* Header Action Tools */}
          <div className="navbar-actions">
            {/* Audio Toggle */}
            <button
              className="nav-icon-btn"
              onClick={toggleSound}
              title={soundEnabled ? "Mute Haptics Audio" : "Enable Haptics Audio"}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              className="nav-icon-btn cart-btn"
              onClick={() => {
                sound.playClick(600, 0.03);
                setCartOpen(true);
              }}
              title="View Shopping Bag"
            >
              <ShoppingBag size={17} />
              {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
            </button>

            {/* Launch Studio CTA */}
            {pathname !== "/store" && (
              <Link
                href="/store"
                className="nav-cta-btn"
                onClick={() => sound.playSuccess()}
              >
                <span>Enter 3D Studio</span>
                <ArrowRight size={14} />
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <Image
                src="/images/NextStepLogo.png"
                alt="NextStep Logo"
                width={110}
                height={28}
                style={{ objectFit: "contain", height: "auto" }}
              />
              <button
                className="mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav className="mobile-nav-links">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Overview
              </Link>
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link highlight"
              >
                <Sparkles size={16} />
                <span>3D Customizer Studio</span>
              </Link>
              <Link
                href="/#lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Editorial Lookbook
              </Link>
              <Link
                href="/#technology"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Materials & Tech Lab
              </Link>
              <Link
                href="/#manifesto"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
              >
                Brand Manifesto
              </Link>
            </nav>
            <div className="mobile-menu-footer">
              <Link
                href="/store"
                className="mobile-cta-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Configure Custom 3D Shoe</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}