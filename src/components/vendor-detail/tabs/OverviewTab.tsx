import StatusBanner from '../StatusBanner';
import AITierBlock from '../overview/AITierBlock';
import RequiredDocsBlock from '../overview/RequiredDocsBlock';
import AssessmentsBlock from '../overview/AssessmentsBlock';
import ActivityTimeline from '../overview/ActivityTimeline';
import HealthGrid from '../overview/HealthGrid';
import KeyDatesStakeholders from '../overview/KeyDatesStakeholders';
import DetailsBlock from '../overview/DetailsBlock';
import overviewStyles from '../overview/overview.module.css';

export default function OverviewTab() {
  return (
    <div className={overviewStyles.body}>
      <StatusBanner />
      <AITierBlock />
      <RequiredDocsBlock />
      <AssessmentsBlock />

      <div className={overviewStyles.widgets}>
        <ActivityTimeline />
        <HealthGrid />
        <KeyDatesStakeholders />
      </div>

      <DetailsBlock />
    </div>
  );
}
