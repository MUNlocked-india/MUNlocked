import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { CommitteeProfile } from "@/lib/committee-data";
import styles from "./CommitteeCarousel.module.css";

const svgProps = { viewBox: "0 0 240 190", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": true } as const;

function LineGraphic({ children }: { children: ReactNode }) {
  return <svg {...svgProps}>{children}</svg>;
}

function customGraphic(code: string) {
  switch (code) {
    case "UNHRC": return <LineGraphic><path d="M119 160c-48-9-65-45-45-77 8-13 22-22 32-35 7-9 11-20 11-31 25 20 43 43 45 70 2 29-14 59-43 73Z" fill="currentColor" opacity=".2"/><path d="M120 159c-26-17-32-39-18-58 11-15 20-24 18-48 24 19 36 38 31 61-4 20-14 35-31 45Z" stroke="currentColor" strokeWidth="4"/><path d="M121 148c-12-12-13-25-5-36 7-9 11-16 10-28 12 11 18 23 15 36-2 13-9 22-20 28Z" fill="currentColor"/></LineGraphic>;
    case "DISEC": return <LineGraphic><circle cx="120" cy="95" r="13" fill="currentColor"/><ellipse cx="120" cy="95" rx="91" ry="34" stroke="currentColor" strokeWidth="3"/><ellipse cx="120" cy="95" rx="91" ry="34" stroke="currentColor" strokeWidth="3" transform="rotate(60 120 95)"/><ellipse cx="120" cy="95" rx="91" ry="34" stroke="currentColor" strokeWidth="3" transform="rotate(120 120 95)"/><circle cx="35" cy="84" r="6" fill="currentColor"/><circle cx="191" cy="53" r="6" fill="currentColor"/><circle cx="135" cy="183" r="6" fill="currentColor"/></LineGraphic>;
    case "UNGA": return <LineGraphic><circle cx="120" cy="89" r="58" stroke="currentColor" strokeWidth="3"/><ellipse cx="120" cy="89" rx="26" ry="58" stroke="currentColor" strokeWidth="2"/><path d="M63 75h114M62 103h116M120 31v116" stroke="currentColor" strokeWidth="2"/><path d="M54 56C29 69 22 106 40 134m146-78c25 13 32 50 14 78M44 120l-17-3m26 21-13 11m156-29 17-3m-26 21 13 11" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></LineGraphic>;
    case "SOCHUM": return <LineGraphic><circle cx="120" cy="53" r="22" fill="currentColor"/><circle cx="58" cy="74" r="16" fill="currentColor" opacity=".65"/><circle cx="182" cy="74" r="16" fill="currentColor" opacity=".65"/><path d="M78 151v-26c0-27 18-43 42-43s42 16 42 43v26M25 151v-20c0-21 14-35 33-35 11 0 21 5 27 14m130 41v-20c0-21-14-35-33-35-11 0-21 5-27 14" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/></LineGraphic>;
    case "WHO": return <LineGraphic><path d="M120 17v156M91 39h58M120 30c-29 18-40 33-24 46 13 11 46 8 48 25 2 15-23 18-43 28-17 9-13 25 19 36" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><path d="M103 78c-22-18-47-6-54 10 20-5 34 2 46 16m42-12c22-18 47-6 54 10-20-5-34 2-46 16" stroke="currentColor" strokeWidth="3" opacity=".65"/><circle cx="120" cy="20" r="9" fill="currentColor"/></LineGraphic>;
    case "UNEP": return <LineGraphic><path d="M119 164C72 142 55 101 74 62c15-30 50-43 97-40-2 48-17 91-52 142Z" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="4"/><path d="M66 168c27-44 56-76 93-126M93 123c-2-21-1-40 5-57m22 26c18 1 33-3 48-11" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></LineGraphic>;
    case "UN WOMEN": return <LineGraphic><circle cx="118" cy="72" r="47" stroke="currentColor" strokeWidth="7"/><path d="M118 119v56m-27-24h54M88 42l-24-24m0 0v27m0-27h27" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/><path d="M82 94c19 8 53 7 72-14" stroke="currentColor" strokeWidth="3" opacity=".62"/></LineGraphic>;
    case "UNICEF": return <LineGraphic><circle cx="120" cy="49" r="20" fill="currentColor"/><path d="M69 157c3-43 20-75 51-75s48 32 51 75M47 103c17 1 31 11 41 27m105-27c-17 1-31 11-41 27" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/><path d="M91 157c5-27 14-43 29-43s24 16 29 43" fill="currentColor" opacity=".24"/></LineGraphic>;
    case "ECOSOC": return <LineGraphic><circle cx="120" cy="94" r="25" fill="currentColor" opacity=".22"/><circle cx="120" cy="94" r="14" fill="currentColor"/><circle cx="46" cy="47" r="12"/><circle cx="194" cy="47" r="12"/><circle cx="46" cy="143" r="12"/><circle cx="194" cy="143" r="12"/><path d="m58 54 48 31m76-31-48 31m-76 51 48-31m76 31-48-31M46 59v72m148-72v72" stroke="currentColor" strokeWidth="4"/><circle cx="46" cy="47" r="12" fill="currentColor"/><circle cx="194" cy="47" r="12" fill="currentColor"/><circle cx="46" cy="143" r="12" fill="currentColor"/><circle cx="194" cy="143" r="12" fill="currentColor"/></LineGraphic>;
    case "UNODC": return <LineGraphic><path d="M94 28h52M104 28v46l-49 77c-6 10 1 20 13 20h104c12 0 19-10 13-20l-49-77V28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><path d="M76 135h88l21 33H55l21-33Z" fill="currentColor" opacity=".28"/><circle cx="99" cy="121" r="7" fill="currentColor"/><circle cx="139" cy="145" r="9" fill="currentColor"/><circle cx="124" cy="111" r="4" fill="currentColor"/></LineGraphic>;
    case "LOK SABHA": case "RAJYA SABHA": return <LineGraphic><path d="M35 151h170M49 139h142M62 74h116l13 65H49l13-65Z" stroke="currentColor" strokeWidth="5"/><path d="M52 74h136c-10-28-34-45-68-45S62 46 52 74Z" fill="currentColor" opacity=".25" stroke="currentColor" strokeWidth="4"/><path d="M78 86v43m28-43v43m28-43v43m28-43v43M120 29V15" stroke="currentColor" strokeWidth="5"/></LineGraphic>;
    case "AIPPM": return <LineGraphic><path d="M50 152h140M76 140h88l-8-45H84l-8 45Z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="4"/><path d="m67 83 31 23m75-23-31 23M50 43l46 34m94-34-46 34" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/><circle cx="50" cy="43" r="13" fill="currentColor"/><circle cx="190" cy="43" r="13" fill="currentColor"/><path d="M120 37v77m-19-66h38" stroke="currentColor" strokeWidth="5"/></LineGraphic>;
    case "HISTORIC": return <LineGraphic><path d="M95 148h71l-8-19c-3-9-11-15-20-17l-2-14c15-8 24-24 23-43-1-25-17-40-40-40-24 0-41 17-41 43 0 17 8 32 22 40l-2 14c-10 3-18 10-21 20l-5 16h23Z" fill="currentColor" opacity=".22" stroke="currentColor" strokeWidth="4"/><path d="M91 49c15 4 42-5 54-20 10 15 14 29 12 43M87 148h84M78 161h102" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><path d="M103 66c5 3 9 3 14 0m18 0c5 3 9 3 13 0m-27 25c9 5 17 5 25-1" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></LineGraphic>;
    default: return null;
  }
}

export default function CommitteeGraphic({ committee }: { committee: CommitteeProfile }) {
  const custom = customGraphic(committee.code);
  return (
    <div className={styles.committeeGraphic} style={{ "--committee-accent": committee.accent } as CSSProperties} role="img" aria-label={`${committee.code} visual identity`}>
      <div className={styles.graphicGlow} aria-hidden />
      {custom ?? <Image src={committee.logo} alt="" width={270} height={210} className={styles.officialGraphic} />}
      <strong data-long-code={committee.code.length > 7 || undefined}>{committee.code}</strong>
    </div>
  );
}
