import styles from "./HomeHero.module.css";

export default function HomeHero({ astrologers }) {
  const onlineCount = astrologers.filter((astro) => astro.online).length;
  const consultants = astrologers.filter((astro) => !astro.isAi && astro.image);
  const featured = [...consultants].sort((a, b) => Number(b.online) - Number(a.online)).slice(0, 3);
  const lowestPrice = astrologers.length ? Math.min(...astrologers.map((astro) => astro.price)) : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <a href="#astrologers" className={styles.availability}>
            <span className={styles.status} aria-hidden="true" />
            <span><strong>{onlineCount}</strong> astrologers online now</span>
            <span className={styles.avatars} aria-hidden="true">
              {featured.map((astro) => <img key={astro.id} src={astro.image} alt="" referrerPolicy="no-referrer" />)}
            </span>
          </a>
          <h1 id="hero-title" className={styles.title}>Your questions.<br /><span>Cosmic clarity.</span></h1>
          <p className={styles.description}>A little guidance can change your perspective. Connect with an astrologer for love, career, and everything in between.</p>
          <ul className={styles.benefits}>
            <li><span aria-hidden="true">✓</span> First 5 minutes free for new users</li>
            <li><span aria-hidden="true">✓</span> Personal guidance, transparent pricing</li>
          </ul>
          <a className={styles.cta} href="#astrologers">Find your astrologer <span aria-hidden="true">→</span></a>
          <dl className={styles.stats}>
            <div><dt>{astrologers.length}</dt><dd>Astrologer profiles</dd></div>
            <div><dt>{onlineCount}</dt><dd>Online now</dd></div>
            <div><dt>{lowestPrice != null ? `₹${lowestPrice}` : "Chat"}</dt><dd>{lowestPrice != null ? "Starting per minute" : "Online consultations"}</dd></div>
          </dl>
        </div>
        <div className={styles.visual}>
          <svg className={styles.wheel} viewBox="0 0 600 600" fill="none" aria-hidden="true">
            <circle cx="300" cy="300" r="285" /><circle cx="300" cy="300" r="215" /><circle cx="300" cy="300" r="120" />
            {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 300 300)`}><path d="M300 15V585" /><circle cx="300" cy="82" r="35" /></g>)}
          </svg>
          <div className={styles.portraits}>
            {featured.map((astro, index) => (
              <a key={astro.id} href={`/astrologer/${astro.id}`} className={`${styles.portrait} ${index === 1 ? styles.center : styles.side}`} aria-label={`View ${astro.name}'s profile`}>
                <img src={astro.image} alt={astro.name} referrerPolicy="no-referrer" loading="eager" />
                <span className={styles.caption}>{astro.name}</span>
              </a>
            ))}
            {featured.length === 0 && <span className={styles.fallback} aria-hidden="true">✺</span>}
          </div>
        </div>
        <div className={styles.strip}>
          <span>✦ Guidance for your everyday</span><span>Love & relationships</span><span>Career & business</span><span>Family & personal growth</span>
        </div>
      </div>
    </section>
  );
}
