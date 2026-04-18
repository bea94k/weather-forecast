import styles from "./State.module.scss";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <p className={styles.error} role="alert">
      Could not load weather data. {message}
    </p>
  );
}
