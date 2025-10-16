import styles from './page.module.css';

export default function LoginPage() {
  return (
    <main>
    <div className={styles.frontPage}>

      {/* Login button */}
      <button className={styles.loginButton}>LOGIN</button>

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
          <div className={styles.card}>
            <img src="/housekeeping.png" width="50" alt="Housekeeping Icon" />
            <h3>Housekeeping</h3>
            <p>Impeccable care, timeless comfort.</p>
          </div>

          <div className={styles.card}>
            <img src="/maintenance.png" width="50" alt="Maintenance Icon" />
            <h3>Maintenance</h3>
            <p>Excellence preserved in every detail.</p>
          </div>

          <div className={styles.card}>
            <img src="/parking.png" width="50" alt="Parking Icon" />
            <h3>Parking</h3>
            <p>Effortless organization, maximum convenience.</p>
          </div>

          <div className={styles.card}>
            <img src="/inventory.png" width="50" alt="Inventory Icon" />
            <h3>Inventory</h3>
            <p>Smart tracking, seamless control.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
