import type { VendorSource } from '../../types';
import styles from './pills.module.css';

const srcCls: Record<VendorSource, string> = {
  Zip: styles.zip,
  Jira: styles.jira,
  ServiceNow: styles.servicenow,
  Coupa: styles.coupa,
};

export default function SourcePill({ source }: { source: VendorSource }) {
  return <span className={`${styles.source} ${srcCls[source]}`}>{source}</span>;
}
