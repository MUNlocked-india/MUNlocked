type FeatureVisualType = "conference" | "eb" | "research" | "dais";

export default function FeatureVisual({ type }: { type: FeatureVisualType }) {
  if (type === "conference") return <div className="feature-visual feature-visual-community" aria-hidden="true"><div className="community-core"><span>MUN</span><i /></div>{[0, 1, 2, 3, 4].map((person) => <span key={person} className={`community-person person-${person}`}><i /></span>)}<div className="community-ring" /></div>;
  if (type === "eb") return <div className="feature-visual feature-visual-gavel" aria-hidden="true"><div className="gavel-head"><i /></div><div className="gavel-handle" /><div className="gavel-block" /><span className="gavel-impact impact-one" /><span className="gavel-impact impact-two" /></div>;
  if (type === "research") return <div className="feature-visual feature-visual-books" aria-hidden="true"><div className="book book-one"><i>01</i></div><div className="book book-two"><i>OPEN</i></div><div className="book book-three"><i>LIBRARY</i></div><span className="book-page" /></div>;
  return <div className="feature-visual feature-visual-dais" aria-hidden="true"><div className="dais-screen"><span>GSL TIMER</span><strong>01:30</strong><i><b /><b /><b /><b /></i></div><div className="dais-score"><span>DELEGATE</span><em>8.5</em></div><div className="dais-live"><i /> LIVE</div></div>;
}
