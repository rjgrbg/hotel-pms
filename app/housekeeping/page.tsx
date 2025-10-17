import React from 'react';
import styles from './housekeeping.module.css';

export default function Housekeeping() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <img src="/celestia-logo.png" alt="Logo" className={styles.logo} />
            </div>
            
            <h1 className={styles.hotelName}>THE CELESTIA HOTEL</h1>
          </div>
          <div className={styles.userIcon}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.topSection}>
          <h2 className={styles.pageTitle}>HOUSEKEEPING</h2>

          {/* Filters */}
          <div className={styles.filterSection}>
            <select className={styles.filterDropdown}>
              <option>Floor</option>
            </select>
            <select className={styles.filterDropdown}>
              <option>Room</option>
            </select>
            <select className={styles.filterDropdown}>
              <option>Status</option>
            </select>

            <div className={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
              />
              <button className={styles.searchButton}>🔍</button>
            </div>

            <button className={styles.refreshButton}>🔄</button>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th>Floor</th>
                <th>Room</th>
                <th>Guest</th>
                <th>Date</th>
                <th>Request Time</th>
                <th>Last Cleaned</th>
                <th>Status</th>
                <th>Staff In Charge</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(10)].map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}