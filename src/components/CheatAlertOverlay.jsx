/**
 * CheatAlertOverlay.jsx
 * Red overlay + alert text shown when cheat/malpractice detected.
 * Shows over the camera feed.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function CheatAlertOverlay({ alerts = [], visible = false }) {
    if (!visible || alerts.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="cheat-alert-overlay"
            >
                <div style={{
                    background: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '16px 24px',
                    textAlign: 'center', maxWidth: '320px',
                }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🚨</div>
                    {alerts.map((a, i) => (
                        <div key={i} style={{
                            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
                            marginBottom: '4px', lineHeight: 1.4,
                        }}>
                            {a}
                        </div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
