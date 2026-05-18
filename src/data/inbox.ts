export type InboxType = 'expiring' | 'gaps' | 'signoff';

export interface InboxItem {
  id: string;
  type: InboxType;
  vendor: string;
  title: string;
  subtitle: string;
  whenLabel: string;
  whenSub?: string;
  whenAccent?: boolean;
  action: 'review' | 'signoff';
}

export const inboxItems: InboxItem[] = [
  { id: '1',  type: 'expiring', vendor: 'Salesforce Inc.',           title: '2 documents expiring within 30 days',     subtitle: 'SOC 2 Type II (17 days · May 28) · Cyber Liability Insurance (21 days · Jun 1) · AI drafted batched refresh', whenLabel: 'May 28', whenSub: 'earliest',     whenAccent: true, action: 'review'  },
  { id: '2',  type: 'expiring', vendor: 'Workday',                   title: 'ISO 27001 Certificate expires in 16 days', subtitle: 'Source: Magic link · AI drafted refresh request',  whenLabel: 'May 27', whenSub: '16 days',     whenAccent: true, action: 'review'  },
  { id: '3',  type: 'expiring', vendor: 'Okta Inc.',                 title: 'Penetration Test Report expires in 24 days', subtitle: 'Source: Manual upload · AI drafted refresh request', whenLabel: 'Jun 4',  whenSub: '24 days', whenAccent: true, action: 'review'  },
  { id: '4',  type: 'expiring', vendor: 'AWS',                       title: 'SOC 2 Type II expires in 27 days',          subtitle: 'Source: Trust Center · AI drafted refresh request', whenLabel: 'Jun 7',  whenSub: '27 days', whenAccent: true, action: 'review'  },
  { id: '5',  type: 'expiring', vendor: 'Snowflake',                 title: 'SOC 2 Type II expires in 28 days',          subtitle: 'Source: Magic link · AI drafted refresh request',  whenLabel: 'Jun 8',  whenSub: '28 days', whenAccent: true, action: 'review'  },
  { id: '6',  type: 'expiring', vendor: 'Microsoft Azure',           title: 'Insurance Certificate expires in 19 days',  subtitle: 'Source: Manual upload · AI drafted refresh request', whenLabel: 'May 30', whenSub: '19 days', whenAccent: true, action: 'review'  },
  { id: '7',  type: 'expiring', vendor: 'Zoom Video Communications', title: 'ISO 27001 Certificate expires in 30 days',  subtitle: 'Source: Trust Center · AI drafted refresh request', whenLabel: 'Jun 10', whenSub: '30 days', whenAccent: true, action: 'review'  },
  { id: '8',  type: 'expiring', vendor: 'Stripe',                    title: 'PCI DSS Attestation expires in 11 days',    subtitle: 'Source: Magic link · AI drafted refresh request',  whenLabel: 'May 22', whenSub: '11 days', whenAccent: true, action: 'review'  },
  { id: '9',  type: 'gaps',     vendor: 'DataStream Inc.',           title: '18 of 84 questions unanswered after AI pass', subtitle: 'SIG Lite · AI drafted gap request',        whenLabel: '2 days old',                                                  action: 'review'  },
  { id: '10', type: 'gaps',     vendor: 'CloudHR Systems',           title: '7 of 42 questions unanswered after AI pass',  subtitle: 'Privacy questionnaire · AI drafted gap request', whenLabel: 'today',                                                  action: 'review'  },
  { id: '11', type: 'gaps',     vendor: 'LegalSoft LLC',             title: '4 of 28 questions unanswered after AI pass',  subtitle: 'InfoSec questionnaire · AI drafted gap request', whenLabel: '1 day old',                                              action: 'review'  },
  { id: '12', type: 'signoff',  vendor: 'PayEdge Financial',         title: 'All 4 questionnaires certified by reviewers', subtitle: 'Ready for TPRM final signoff to approve vendor',  whenLabel: '1 day waiting',                                          action: 'signoff' },
  { id: '13', type: 'signoff',  vendor: 'BrightAnalytics Co.',       title: 'All 3 questionnaires certified by reviewers', subtitle: 'Ready for TPRM final signoff to approve vendor',  whenLabel: '4 hours waiting',                                        action: 'signoff' },
];

export const INBOX_TOTAL = inboxItems.length;

export const INBOX_COUNTS = {
  all:      inboxItems.length,
  expiring: inboxItems.filter(i => i.type === 'expiring').length,
  gaps:     inboxItems.filter(i => i.type === 'gaps').length,
  signoff:  inboxItems.filter(i => i.type === 'signoff').length,
};
