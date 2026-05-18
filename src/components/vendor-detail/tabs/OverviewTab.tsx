import ProfileConfigBlock from '../overview/ProfileConfigBlock';
import TierCalloutBlock from '../overview/TierCalloutBlock';
import RequiredDocsBlock from '../overview/RequiredDocsBlock';
import AssessmentsBlock from '../overview/AssessmentsBlock';
import ReportBlock from '../overview/ReportBlock';
import ActivityTimeline from '../overview/ActivityTimeline';
import HealthGrid from '../overview/HealthGrid';
import RequestContextCard from '../overview/RequestContextCard';
import KeyDatesCard from '../overview/KeyDatesCard';
import StakeholdersCard from '../overview/StakeholdersCard';
import overviewStyles from '../overview/overview.module.css';

export default function OverviewTab() {
  return (
    <div className={overviewStyles.body}>
      <div className={overviewStyles.mainColumn}>
        <ProfileConfigBlock />
        <TierCalloutBlock />
        <RequiredDocsBlock />
        <AssessmentsBlock />
        <ReportBlock />
        <ActivityTimeline />
      </div>
      <aside className={overviewStyles.sidebar}>
        <RequestContextCard />
        <HealthGrid />
        <KeyDatesCard />
        <StakeholdersCard />
      </aside>
    </div>
  );
}
