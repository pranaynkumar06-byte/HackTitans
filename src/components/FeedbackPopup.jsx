/**
 * FeedbackPopup.jsx
 * 5-star rating feedback popup shown after every test.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackPopup({ isOpen, onClose, testName }) {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit() {
        // Save feedback (would go to backend)
        console.log('Feedback:', { testName, rating, comment });
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setRating(0);
            setComment('');
            onClose();
        }, 1500);
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 300, padding: '20px',
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="glass-card"
                    style={{ maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}
                    onClick={e => e.stopPropagation()}
                >
                    {submitted ? (
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Thank you!</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                                Your feedback helps us improve.
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📝</div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                                How was your experience?
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
                                Rate the {testName || 'test'} module
                            </p>

                            {/* Stars */}
                            <div className="star-rating" style={{ justifyContent: 'center', marginBottom: '20px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`star ${star <= (hoveredStar || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            {/* Rating label */}
                            {rating > 0 && (
                                <div style={{
                                    fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px',
                                    fontWeight: 600,
                                }}>
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                                </div>
                            )}

                            {/* Comment */}
                            <textarea
                                placeholder="Any additional feedback? (optional)"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                                    border: '1px solid var(--glass-border)', background: 'var(--navy-mid)',
                                    color: 'var(--text-primary)', fontSize: '0.85rem', resize: 'vertical',
                                    minHeight: '70px', outline: 'none', marginBottom: '16px',
                                }}
                            />

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-secondary" onClick={onClose}
                                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                                    Skip
                                </button>
                                <button className="btn-primary" onClick={handleSubmit} disabled={rating === 0}
                                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem', opacity: rating === 0 ? 0.5 : 1 }}>
                                    Submit
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
