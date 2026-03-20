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

export const MOCK_VISITORS: Visitor[] = [
  { id: 'v1', name: 'Caspian Anderson', institutionalId: '2021-1001', college: 'College of Engineering', purpose: 'Research in thesis', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v2', name: 'Elaria Smith', institutionalId: '2022-2045', college: 'College of Arts', purpose: 'Research in thesis', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v3', name: 'Althea Soleil', institutionalId: '2020-0552', college: 'College of Nursing', purpose: 'Research in thesis', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v4', name: 'Luna Belle Blake', institutionalId: '2023-3001', college: 'College of Business', purpose: 'Reading books', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v5', name: 'Aiden Blake', institutionalId: '2021-9988', college: 'College of Informatics and Computing Science', purpose: 'Use of computer', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v6', name: 'Elena Gilbert', institutionalId: '2022-5566', college: 'College of Nursing', purpose: 'Reading books', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v7', name: 'Mateo Gabriel Silva', institutionalId: '2021-4422', college: 'College of Informatics and Computing Science', purpose: 'Use of computer', timeIn: STATIC_NOW, status: 'Active' },
  { id: 'v8', name: 'Sofia Isabel Luna', institutionalId: '2022-1199', college: 'College of Arts', purpose: 'Doing assignments', timeIn: STATIC_NOW, status: 'Active' },
];

export const MOCK_BLOCKED: BlockedUser[] = [
  { id: 'b1', name: 'Jane Doe', institutionalId: '2019-0001', reason: 'Repeated noise violations', dateBlocked: '2024-03-15' },
  { id: 'b2', name: 'Lucian Cole Anderson', institutionalId: '2019-0002', reason: 'Unauthorized access', dateBlocked: '2024-04-10' },
  { id: 'b3', name: 'Adriel Knox Bennett', institutionalId: '2019-0003', reason: 'Policy violation', dateBlocked: '2024-05-01' },
  { id: 'b4', name: 'Aurelia Skye Everly', institutionalId: '2019-0004', reason: 'Safety concern', dateBlocked: '2024-05-05' },
  { id: 'b5', name: 'Mira Sol Hayes', institutionalId: '2019-0005', reason: 'Unreturned library property', dateBlocked: '2024-05-12' },
  { id: 'b6', name: 'Nyx Aurora Kingsley', institutionalId: '2019-0006', reason: 'Administrative ban', dateBlocked: '2024-05-15' },
  { id: 'b7', name: 'Seraphina Moon Sinclair', institutionalId: '2019-0007', reason: 'Behavioral issue', dateBlocked: '2024-05-20' },
];