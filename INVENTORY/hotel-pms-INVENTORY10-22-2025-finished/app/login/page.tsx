'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  const handleOpenRecovery = () => {
    setShowLogin(false);
    setShowRecovery(true);
  };

  const handleCloseRecovery = () => {
    setShowRecovery(false);
  };

  const handleBackToLogin = () => {
    setShowRecovery(false);
    setShowLogin(true);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowLogin(false);
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login submitted');
  };

  return (
    <main>
      <div className={styles.frontPage}>
        {/* Login button */}
        <button className={styles.loginButton} onClick={handleLoginClick}>LOGIN</button>

        {/* Logo */}
        <div className={styles.logocontainer}>
          <img src="/celestia-logo.png" alt="Logo" className={styles.logo} />
          <h2 className={styles.logoName}>THE CELESTIA HOTEL</h2>
          <p className={styles.subtitle}>
            Housekeeping · Maintenance · Parking · Inventory
          </p>
        </div>
      </div>

      {/* --- Property Management Section --- */}
      <section className={styles.propertySection}>
        <h2>Property Management</h2>
        <hr />
        <p>
          Where management meets sophistication. <br />
          Elevate housekeeping, maintenance, parking, and inventory with ease.
        </p>

        <div className={styles.cardsContainer}>
          <div className={styles.card} onClick={handleLoginClick}>
            <img src="/housekeeping.png" width="50" alt="Housekeeping Icon" />
            <h3>Housekeeping</h3>
            <p>Impeccable care, timeless comfort.</p>
          </div>

          <div className={styles.card} onClick={handleLoginClick}>
            <img src="/maintenance.png" width="50" alt="Maintenance Icon" />
            <h3>Maintenance</h3>
            <p>Excellence preserved in every detail.</p>
          </div>

          <div className={styles.card} onClick={handleLoginClick}>
            <img src="/parking.png" width="50" alt="Parking Icon" />
            <h3>Parking</h3>
            <p>Effortless organization, maximum convenience.</p>
          </div>

          <div className={styles.card} onClick={handleLoginClick}>
            <img src="/inventory.png" width="50" alt="Inventory Icon" />
            <h3>Inventory</h3>
            <p>Smart tracking, seamless control.</p>
          </div>
        </div>
      </section>

      {/* --- Footer Section --- */}
      <footer className={styles.footer}>
        <img src="/celestia-logo.png" alt="Celestia Hotel Logo" />

        <p><strong>THE CELESTIA HOTEL</strong></p>
        <p>Housekeeping · Maintenance · Parking · Inventory</p>

        <div className={styles.footerLinks}>
          <a href="#">Terms of Service</a> | <a href="#">Privacy Policy</a>
        </div>

        <p className={styles.footerInfo}>
          thecelestiahotel.com <br />
          100 Grade St. Villa Celestia, Flat Uno Please, Quezon City
        </p>

        <p style={{ marginTop: '10px', fontSize: '12px', color: '#a38b6d' }}>
          ©2025 SBIT-3F ALL RIGHTS RESERVED
        </p>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
          <div className={styles.loginModal}>
            <button className={styles.closeButton} onClick={handleCloseLogin}>×</button>
            
            <div className={styles.loginHeader}>
              <img src="/celestia-logo.png" alt="Logo" className={styles.modalLogo} />
              <h2>THE CELESTIA HOTEL</h2>
              <p>Property Management System</p>
            </div>

            <div className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Enter your username"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password"
                />
              </div>

              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotPassword} onClick={(e) => { e.preventDefault(); handleOpenRecovery(); }}>Forgot Password?</a>
              </div>

              <button type="button" className={styles.submitButton} onClick={handleSubmit}>
                Sign In
              </button>
            </div>

            <div className={styles.loginFooter}>
              <p>Don't have an account? <a href="#">Contact Administrator</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Account Recovery Modal */}
      {showRecovery && (
        <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) handleCloseRecovery(); }}>
          <div className={styles.recoveryModal}>
            <button className={styles.closeButton} onClick={handleCloseRecovery}>×</button>
            
            <div className={styles.recoveryHeader}>
              <h2>Account Recovery Options</h2>
              <p>Please choose which account detail you want to recover or change.</p>
            </div>

            <div className={styles.recoveryOptions}>
              <button className={styles.recoveryButton}>
                RECOVER USERNAME
              </button>
              
              <div className={styles.orDivider}>or</div>
              
              <button className={styles.recoveryButton}>
                RECOVER PASSWORD
              </button>
            </div>

            <div className={styles.recoveryFooter}>
              <button className={styles.backButton} onClick={handleBackToLogin}>
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}