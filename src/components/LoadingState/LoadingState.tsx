import styles from "./LoadingState.module.scss";

export function LoadingState() {
  return (
    <p className={styles.message} role="status" aria-live="polite">
      Loading latest weather data...
    </p>
  );
}
