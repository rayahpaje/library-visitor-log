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

export const MOCK_VISITORS: Visitor[] = [
  { id: 'v1', name: 'James Patrick Chen', institutionalId: '2021-1001', college: 'College of Computing', purpose: 'Research in thesis', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v2', name: 'Maria Leonora Santos', institutionalId: '2022-2045', college: 'College of Arts', purpose: 'Doing assignments', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v3', name: 'Antonio Miguel Reyes', institutionalId: '2020-0552', college: 'College of Engineering', purpose: 'Use of computer', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v4', name: 'Sarah Jane Connor', institutionalId: '2023-3001', college: 'College of Science', purpose: 'Reading books', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v5', name: 'Ricardo Dalisay', institutionalId: '2021-9988', college: 'College of Business', purpose: 'Reading books', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v6', name: 'Elena Gilbert', institutionalId: '2022-5566', college: 'College of Nursing', purpose: 'Research in thesis', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v7', name: 'Mateo Gabriel Silva', institutionalId: '2021-4422', college: 'College of Computing', purpose: 'Use of computer', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v8', name: 'Sofia Isabel Luna', institutionalId: '2022-1199', college: 'College of Arts', purpose: 'Reading books', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v9', name: 'Lucas Alexander Tan', institutionalId: '2023-7733', college: 'College of Engineering', purpose: 'Doing assignments', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v10', name: 'Isabella Marie Cruz', institutionalId: '2021-2288', college: 'College of Science', purpose: 'Doing assignments', timeIn: new Date().toISOString(), status: 'Active' },
];

export const MOCK_BLOCKED: BlockedUser[] = [
  { id: 'b1', name: 'Robert Paulson', institutionalId: '2019-0001', reason: 'Repeated noise violations in Quiet Zone', dateBlocked: '2024-03-15' },
  { id: 'b2', name: 'Tyler Durden', institutionalId: '2019-0002', reason: 'Unauthorized access to restricted Archives', dateBlocked: '2024-04-10' },
];
