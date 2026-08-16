"use client";

import React, { useState } from "react";
import { useCustomizer } from "@/context/CustomizerContext";
import confetti from "canvas-confetti";
import { X, CheckCircle2, CreditCard, ShieldCheck, ArrowRight, Package } from "lucide-react";
import { sound } from "@/utils/audio";

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, cart, cartTotal } = useCustomizer();
  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [orderId, setOrderId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "Alex Vance",
    email: "alex.vance@aetherkinetics.io",
    address: "742 Evergreen Terrace",
    city: "San Francisco",
    postal: "94107",
    cardNumber: "•••• •••• •••• 8842",
  });

  if (!checkoutOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    sound.playSelect();

    setTimeout(() => {
      setLoading(false);
      const generatedId = "AK-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(generatedId);
      setStep("confirmed");
      sound.playSuccess();

      // Launch victory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#39ff14", "#00f0ff", "#ffffff", "#e11d48"],
        });
      } catch {
        // Fallback
      }
    }, 1200);
  };

  const handleClose = () => {
    sound.playClick(500, 0.02);
    setCheckoutOpen(false);
    setStep("form");
  };

  return (
    <div className="checkout-overlay" onClick={handleClose}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={handleClose}>
          <X size={18} />
        </button>

        {step === "form" ? (
          <div className="checkout-form-body">
            <div className="checkout-header">
              <span className="checkout-badge">AETHER SECURE CHECKOUT</span>
              <h2>Instant Bespoke Order</h2>
              <p>Your custom 3D sneaker specs will be queued into our automated additive manufacturing lab.</p>
            </div>

            <form onSubmit={handlePay} className="checkout-form">
              <div className="form-section">
                <span className="form-section-title">1. Shipping Destination</span>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postal}
                      onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <span className="form-section-title">2. Payment Method</span>
                <div className="payment-method-card">
                  <CreditCard size={18} color="#39ff14" />
                  <div className="payment-details">
                    <span>Card ending in 8842 (Encrypted via Apple Pay / Stripe)</span>
                    <span className="payment-sub">256-bit TLS Zero-Knowledge Protocol</span>
                  </div>
                  <ShieldCheck size={18} color="#39ff14" />
                </div>
              </div>

              <div className="checkout-total-summary">
                <div className="total-row">
                  <span>Order Items:</span>
                  <span>{cart.reduce((s, i) => s + i.quantity, 0)} Pair(s)</span>
                </div>
                <div className="total-row main">
                  <span>Total Billed:</span>
                  <span className="total-amount">${cartTotal} USD</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="pay-submit-btn">
                {loading ? (
                  <span>Transmitting 3D Specs...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize ${cartTotal} USD</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="order-confirmed-body">
            <div className="confirmed-icon-wrap">
              <CheckCircle2 size={54} color="#39ff14" />
            </div>
            <span className="order-status-tag">ORDER CONFIRMED & QUEUED</span>
            <h2>Thank You For Your Order</h2>
            <p className="order-msg">
              Your bespoke 3D CAD profile has been compiled and sent to the additive manufacturing cleanroom.
            </p>

            <div className="order-receipt-card">
              <div className="receipt-line">
                <span className="receipt-label">Order Reference:</span>
                <span className="receipt-val font-mono">{orderId}</span>
              </div>
              <div className="receipt-line">
                <span className="receipt-label">Estimated Dispatch:</span>
                <span className="receipt-val">3-5 Business Days</span>
              </div>
              <div className="receipt-line">
                <span className="receipt-label">Delivery Courier:</span>
                <span className="receipt-val">DHL Carbon-Neutral Express</span>
              </div>
              <div className="receipt-line">
                <span className="receipt-label">Tracking Notifications:</span>
                <span className="receipt-val">{formData.email}</span>
              </div>
            </div>

            <div className="production-timeline">
              <div className="timeline-step active">
                <div className="step-dot" />
                <span>3D Spec Synthesis</span>
              </div>
              <div className="timeline-step">
                <div className="step-dot" />
                <span>Additive Sole 3D Print</span>
              </div>
              <div className="timeline-step">
                <div className="step-dot" />
                <span>Aeroknit Assembly</span>
              </div>
              <div className="timeline-step">
                <div className="step-dot" />
                <span>Laser QC & Delivery</span>
              </div>
            </div>

            <button className="return-store-btn" onClick={handleClose}>
              <Package size={16} />
              <span>Back to Customizer Studio</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
