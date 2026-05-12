import styles from './SettingsPage.module.css';
import TierRuleCard from '../components/settings/TierRuleCard';
import ConditionRow from '../components/settings/ConditionRow';
import settingsStyles from '../components/settings/settings.module.css';
import Toggle from '../components/shared/Toggle';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <h1 className={styles.title}>Settings</h1>

        {/* Policy Documents */}
        <div className={styles.section}>
          <div className={styles.sectionHdr}>
            <div className={styles.sectionIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionTitle}>Policy Documents</div>
              <div className={styles.sectionDesc}>Upload your TPRM policy PDF — AI indexes the rules and uses them to classify vendors and explain tier decisions.</div>
            </div>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.policyFileRow}>
              <div className={styles.policyFileIcon}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.policyFileMeta}>
                <div className={styles.policyFileName}>TPRM_Policy_v3.pdf</div>
                <div className={styles.policyFileInfo}>Uploaded Apr 12, 2026 · 34 pages · Used in 8 assessments</div>
              </div>
              <span className={styles.aiIndexedPill}>AI indexed</span>
              <button className={styles.policyCloseBtn} title="Remove">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className={styles.uploadDropzone}>
              <div className={styles.uploadIconWrap}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4M7 9l5-5 5 5M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.uploadTitle}>Upload a new policy version</div>
              <div className={styles.uploadMeta}>PDF only · Max 100 MB · AI extracts tiering rules automatically on upload</div>
            </div>
          </div>
        </div>

        {/* Tiering Rules */}
        <div className={styles.section}>
          <div className={styles.sectionHdr}>
            <div className={styles.sectionIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionTitle}>Tiering Rules</div>
              <div className={styles.sectionDesc}>IF/AND/OR conditions that determine vendor tier. AI cites the matching rule when explaining its classification.</div>
            </div>
            <button className={styles.saveBtn}>Save</button>
          </div>
          <div className={styles.sectionBody}>
            <TierRuleCard tier={1} tierLabel="Tier 1 — Critical">
              <ConditionRow logic="IF" field="Data classification" operator="contains" value="PII / PHI" />
              <ConditionRow logic="OR" field="Annual spend" operator="≥" operatorSym value="$100,000" />
              <ConditionRow logic="OR" field="System access level" operator="=" operatorSym value="Infrastructure / admin" />
            </TierRuleCard>

            <TierRuleCard tier={2} tierLabel="Tier 2 — Standard">
              <ConditionRow logic="IF" field="Annual spend" operator="between" value="$25,000 – $100,000" />
              <ConditionRow logic="AND" field="Category" operator="=" operatorSym value="SaaS" />
              <ConditionRow logic="AND" field="Data classification" operator="does not contain" value="PII / PHI" />
            </TierRuleCard>

            <TierRuleCard tier={3} tierLabel="Tier 3 — Low Risk">
              <ConditionRow logic="IF" field="Annual spend" operator="<" operatorSym value="$25,000" />
              <ConditionRow logic="AND" field="Data classification" operator="=" operatorSym value="Public / non-sensitive" />
            </TierRuleCard>

            <div className={settingsStyles.addTier}>+ Add tier rule</div>

            <div className={settingsStyles.tierRulesFooter}>
              Rules are evaluated top to bottom. First match wins. AI cites the matching rule when explaining why a vendor was assigned a given tier.
            </div>
          </div>
        </div>

        {/* Assessment Defaults */}
        <div className={styles.section}>
          <div className={styles.sectionHdr}>
            <div className={styles.sectionIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.sectionMeta}>
              <div className={styles.sectionTitle}>Assessment Defaults</div>
              <div className={styles.sectionDesc}>Default questionnaire templates, reassessment cadence, and AI automation.</div>
            </div>
          </div>
          <div className={styles.sectionBody} style={{ paddingTop: 4, paddingBottom: 12 }}>
            <SettingRow title="Tier 1 questionnaire template" desc="Used for Critical vendors — full security + privacy + BCP" value="Extended Security Assessment v2" />
            <SettingRow title="Tier 2 questionnaire template" desc="Standard SaaS vendors" value="Standard Risk Assessment v3" />
            <SettingRow title="Tier 3 questionnaire template" desc="Low-risk, limited review" value="Lightweight Vendor Check v1" />
            <SettingRow title="Tier 1 reassessment cadence" value="Every 12 months" />
            <SettingRow title="Tier 2 reassessment cadence" value="Every 24 months" />
            <SettingRow title="Auto-fill questionnaires on review start" desc="AI agent begins answering as soon as review starts" toggle />
            <SettingRow title="Auto-assign TPRM owner on intake" desc="Assigns based on vendor category mapping" toggle />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingRowProps {
  title: string;
  desc?: string;
  value?: string;
  toggle?: boolean;
}

function SettingRow({ title, desc, value, toggle }: SettingRowProps) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingRowMeta}>
        <div className={styles.settingRowTitle}>{title}</div>
        {desc && <div className={styles.settingRowDesc}>{desc}</div>}
      </div>
      {toggle ? <Toggle defaultChecked /> : <div className={styles.settingRowValue}>{value}</div>}
    </div>
  );
}
