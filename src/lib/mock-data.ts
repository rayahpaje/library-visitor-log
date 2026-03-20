export type Visitor = {
  id: string;
  name: string;
  institutionalId: string;
  college: string;
  purpose: string;
  timeIn: string;
  status: 'Active' | 'Logged Out';
};

export type BlockedUser = {
  id: string;
  name: string;
  institutionalId: string;
  reason: string;
  dateBlocked: string;
};

// We use static ISO strings here to avoid hydration mismatches between server and client.
const STATIC_NOW = "2024-05-24T10:30:00.000Z";

/**
 * MOCK_VISITORS is now empty to ensure the Live Activity Logs 
 * only show real-time entries from the database.
 */
export const MOCK_VISITORS: Visitor[] = [];

export const MOCK_BLOCKED: BlockedUser[] = [
  { id: 'b1', name: 'Jane Doe', institutionalId: '2019-0001', reason: 'Repeated noise violations', dateBlocked: '2024-03-15' },
  { id: 'b2', name: 'Lucian Cole Anderson', institutionalId: '2019-0002', reason: 'Unauthorized access', dateBlocked: '2024-04-10' },
  { id: 'b3', name: 'Adriel Knox Bennett', institutionalId: '2019-0003', reason: 'Policy violation', dateBlocked: '2024-05-01' },
  { id: 'b4', name: 'Aurelia Skye Everly', institutionalId: '2019-0004', reason: 'Safety concern', dateBlocked: '2024-05-05' },
  { id: 'b5', name: 'Mira Sol Hayes', institutionalId: '2019-0005', reason: 'Unreturned library property', dateBlocked: '2024-05-12' },
  { id: 'b6', name: 'Nyx Aurora Kingsley', institutionalId: '2019-0006', reason: 'Administrative ban', dateBlocked: '2024-05-15' },
  { id: 'b7', name: 'Seraphina Moon Sinclair', institutionalId: '2019-0007', reason: 'Behavioral issue', dateBlocked: '2024-05-20' },
];
