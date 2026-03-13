export type Visitor = {
  id: string;
  name: string;
  institutionalId: string;
  college: string;
  purpose: string;
  timeIn: string;
  status: 'Active' | 'Logged Out' | 'Blocked';
};

export type BlockedUser = {
  id: string;
  name: string;
  institutionalId: string;
  reason: string;
  dateBlocked: string;
};

export const MOCK_VISITORS: Visitor[] = [
  { id: '1', name: 'John Doe', institutionalId: '2021-1001', college: 'College of Computing', purpose: 'Research for Capstone', timeIn: '2024-05-20T08:30:00Z', status: 'Active' },
  { id: '2', name: 'Jane Smith', institutionalId: '2022-2045', college: 'College of Arts', purpose: 'Studying for Finals', timeIn: '2024-05-20T09:15:00Z', status: 'Active' },
  { id: '3', name: 'Mark Wilson', institutionalId: '2020-0552', college: 'College of Engineering', purpose: 'Group Meeting', timeIn: '2024-05-20T10:00:00Z', status: 'Logged Out' },
  { id: '4', name: 'Sarah Connor', institutionalId: '2023-3001', college: 'College of Science', purpose: 'Borrowing Books', timeIn: '2024-05-20T11:45:00Z', status: 'Active' },
  { id: '5', name: 'Tom Hardy', institutionalId: '2021-9988', college: 'College of Business', purpose: 'Print Documents', timeIn: '2024-05-20T13:20:00Z', status: 'Active' },
];

export const MOCK_BLOCKED: BlockedUser[] = [
  { id: 'b1', name: 'Robert Paulson', institutionalId: '2019-0001', reason: 'Repeated noise violations', dateBlocked: '2024-03-15' },
  { id: 'b2', name: 'Tyler Durden', institutionalId: '2019-0002', reason: 'Unauthorized access to restricted area', dateBlocked: '2024-04-10' },
];