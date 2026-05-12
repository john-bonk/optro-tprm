import styles from './pills.module.css';

export default function RiskScorePill({ score }: { score: number }) {
  const cls = score <= 30 ? styles.scoreLow : score <= 60 ? styles.scoreMed : styles.scoreHigh;
  return <span className={`${styles.score} ${cls}`}>{score}</span>;
}
