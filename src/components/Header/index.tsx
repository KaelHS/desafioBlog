import styles from './header.module.scss';

export default function Header() {
  return(
    <header className={styles.header}>
      <div>
        <img src="/Logo.svg" alt="logo" />
      </div>
    </header>
  );
}
