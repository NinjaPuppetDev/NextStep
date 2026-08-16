"use client";

import React, { useState } from "react";
import { useCustomizer } from "@/context/CustomizerContext";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { sound } from "@/utils/audio";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    setCheckoutOpen,
  } = useCustomizer();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  if (!cartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "NEO2026" || code === "ANTIGRAVITY" || code === "VIP15") {
      sound.playSuccess();
      setDiscountPercent(15);
      setPromoMsg("✓ 15% VIP Access Discount Applied!");
    } else {
      sound.playClick(300, 0.05);
      setDiscountPercent(0);
      setPromoMsg("✕ Invalid promotional code");
    }
  };

  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return (
    <div className="cart-drawer-overlay" onClick={() => setCartOpen(false)}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-title-wrap">
            <span className="cart-title">YOUR BESPOKE BAG</span>
            <span className="cart-count-pill">
              {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
            </span>
          </div>
          <button
            className="cart-close-btn"
            onClick={() => {
              sound.playClick(500, 0.02);
              setCartOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Indicator */}
        <div className="shipping-banner">
          <div className="shipping-info">
            <ShieldCheck size={15} color="#39ff14" />
            <span>Complimentary Insured Worldwide Shipping Unlocked</span>
          </div>
          <div className="shipping-progress-track">
            <div className="shipping-progress-fill" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-box">👟</div>
              <h3>Your bag is empty</h3>
              <p>Craft your one-of-a-kind 3D sneaker in the customizer studio.</p>
              <button
                className="explore-btn"
                onClick={() => {
                  sound.playSelect();
                  setCartOpen(false);
                }}
              >
                Launch 3D Studio
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="item-header">
                  <div>
                    <h4 className="item-title">{item.modelName}</h4>
                    <span className="item-size-badge">SIZE: {item.size}</span>
                    {item.engraving && (
                      <span className="item-engraving-badge">
                        ENGRAVING: &quot;{item.engraving}&quot;
                      </span>
                    )}
                  </div>
                  <button
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Swatches Visual Summary */}
                <div className="item-palette-summary">
                  <span className="palette-label">Palette Spec:</span>
                  <div className="palette-dots-row">
                    {Object.entries(item.colors).map(([part, hex]) => (
                      <div
                        key={part}
                        className="mini-swatch-dot"
                        style={{ backgroundColor: hex }}
                        title={`${part}: ${hex}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Pricing & Quantity Controls */}
                <div className="item-footer">
                  <div className="item-quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="item-price">
                    ${item.price * item.quantity} <span className="currency">USD</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="promo-code-form">
              <div className="promo-input-wrap">
                <Tag size={14} className="promo-icon" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="PROMO CODE (TRY 'NEO2026')"
                  className="promo-input"
                />
                <button type="submit" className="promo-submit-btn">
                  Apply
                </button>
              </div>
              {promoMsg && (
                <span
                  className={`promo-message ${discountPercent > 0 ? "success" : "error"}`}
                >
                  {promoMsg}
                </span>
              )}
            </form>

            {/* Total Breakdown */}
            <div className="price-summary-breakdown">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${cartTotal} USD</span>
              </div>
              {discountPercent > 0 && (
                <div className="summary-line discount">
                  <span>VIP Discount (15%)</span>
                  <span>-${discountAmount.toFixed(2)} USD</span>
                </div>
              )}
              <div className="summary-line">
                <span>Bespoke 3D Manufacturing</span>
                <span className="free-tag">Complimentary</span>
              </div>
              <div className="summary-line">
                <span>Worldwide Express Courier</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-line total-line">
                <span>Estimated Total</span>
                <span className="total-amount">${finalTotal.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              className="checkout-btn"
              onClick={() => {
                sound.playSuccess();
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            >
              <span>Proceed to Instant Checkout</span>
              <ArrowRight size={17} />
            </button>

            <p className="guarantee-note">
              30-Day Bespoke Fit Guarantee • Carbon-Neutral Production
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
