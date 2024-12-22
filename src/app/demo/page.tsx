"use client";

import { useState } from "react";
import styles from "./letter.module.css";

export default function Letter() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center">
      <div className={styles["envlope-wrapper"]}>
        <div
          id={styles.envelope}
          className={isOpen ? styles.open : styles.close}
        >
          <div className={`${styles.front} ${styles.flap}`}></div>
          <div className={`${styles.front} ${styles.pocket}`}></div>
          <div className={styles.letter}>
            <p>Dear friend,</p>
            <br />
            <p>
              I hope this letter finds you well. I wanted to take a moment to
              share something special with you.
            </p>
            <br />
            <p>
              Sometimes the simplest gestures can mean the most. This letter
              might be short or long, but it will always fit perfectly in this
              envelope.
            </p>
            <br />
            <p>Best wishes,</p>
            <p className={styles.signature}>Eugene</p>
          </div>
        </div>
      </div>
      <div className={styles.reset}>
        <button id="open" onClick={() => setIsOpen(!isOpen)}>
          Toggle
        </button>
      </div>
    </main>
  );
}
