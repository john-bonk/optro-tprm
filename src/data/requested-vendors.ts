import type { RequestedVendor } from '../types';

export const requestedVendorsSeed: RequestedVendor[] = [
  { id: 'acme',       name: 'Acme Cloud Co.',      source: 'Zip',        owner: 'Jorge Rivera',  category: 'SaaS',           spend: '$48,000',  date: 'Apr 28, 2026' },
  { id: 'datastream', name: 'DataStream Inc.',     source: 'Zip',        owner: 'Mia Park',      category: 'Data',           spend: '$120,000', date: 'Apr 27, 2026' },
  { id: 'pendo',      name: 'Pendo.io',            source: 'Zip',        owner: 'Sophie Chen',   category: 'Analytics',      spend: '$22,000',  date: 'Apr 25, 2026' },
  { id: 'legalsoft',  name: 'LegalSoft LLC',       source: 'Jira',       owner: 'Rachel Kim',    category: 'Legal Tech',     spend: '$35,000',  date: 'Apr 24, 2026' },
  { id: 'cloudhr',    name: 'CloudHR Systems',     source: 'Jira',       owner: 'Tom Bradley',   category: 'HR Tech',        spend: '$67,000',  date: 'Apr 23, 2026' },
  { id: 'secureid',   name: 'SecureID Partners',   source: 'ServiceNow', owner: 'Alex Moore',    category: 'Identity',       spend: '$90,000',  date: 'Apr 22, 2026' },
  { id: 'payedge',    name: 'PayEdge Financial',   source: 'ServiceNow', owner: 'Dana Nguyen',   category: 'Fintech',        spend: '$210,000', date: 'Apr 21, 2026' },
  { id: 'nexus',      name: 'Nexus Logistics',     source: 'Coupa',      owner: 'Chris Walters', category: 'Logistics',      spend: '$154,000', date: 'Apr 20, 2026' },
  { id: 'bright',     name: 'BrightAnalytics Co.', source: 'Coupa',      owner: 'Priya Sharma',  category: 'BI / Analytics', spend: '$41,000',  date: 'Apr 19, 2026' },
  { id: 'omni',       name: 'OmniCloud Services',  source: 'Coupa',      owner: 'Lena Torres',   category: 'Cloud Infra',    spend: '$310,000', date: 'Apr 18, 2026' },
];
