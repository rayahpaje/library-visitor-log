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
  { id: '1', name: 'James Patrick Chen', institutionalId: '2021-1001', college: 'College of Computing', purpose: 'Research for Capstone', timeIn: '2024-05-20T08:30:00Z', status: 'Active' },
  { id: '2', name: 'Maria Leonora Santos', institutionalId: '2022-2045', college: 'College of Arts', purpose: 'Studying for Finals', timeIn: '2024-05-20T09:15:00Z', status: 'Active' },
  { id: '3', name: 'Antonio Miguel Reyes', institutionalId: '2020-0552', college: 'College of Engineering', purpose: 'Group Meeting', timeIn: '2024-05-20T10:00:00Z', status: 'Logged Out' },
  { id: '4', name: 'Sarah Jane Connor', institutionalId: '2023-3001', college: 'College of Science', purpose: 'Borrowing Books', timeIn: '2024-05-20T11:45:00Z', status: 'Active' },
  { id: '5', name: 'Ricardo Dalisay', institutionalId: '2021-9988', college: 'College of Business', purpose: 'Print Documents', timeIn: '2024-05-20T13:20:00Z', status: 'Active' },
  { id: '6', name: 'Elena Gilbert', institutionalId: '2022-5566', college: 'College of Nursing', purpose: 'Clinical Research', timeIn: '2024-05-20T14:10:00Z', status: 'Active' },
  { id: '7', name: 'Mateo Gabriel Silva', institutionalId: '2021-4422', college: 'College of Computing', purpose: 'Programming Lab', timeIn: '2024-05-20T08:45:00Z', status: 'Active' },
  { id: '8', name: 'Sofia Isabel Luna', institutionalId: '2022-1199', college: 'College of Arts', purpose: 'Art History Thesis', timeIn: '2024-05-20T09:30:00Z', status: 'Active' },
  { id: '9', name: 'Lucas Alexander Tan', institutionalId: '2023-7733', college: 'College of Engineering', purpose: 'CAD Project', timeIn: '2024-05-20T10:15:00Z', status: 'Logged Out' },
  { id: '10', name: 'Isabella Marie Cruz', institutionalId: '2021-2288', college: 'College of Science', purpose: 'Chemistry Review', timeIn: '2024-05-20T11:00:00Z', status: 'Active' },
  { id: '11', name: 'Nathaniel Joseph Go', institutionalId: '2020-3344', college: 'College of Business', purpose: 'Market Analysis', timeIn: '2024-05-20T12:30:00Z', status: 'Active' },
  { id: '12', name: 'Chloe Francesca Sy', institutionalId: '2022-6677', college: 'College of Nursing', purpose: 'Medical Journals', timeIn: '2024-05-20T13:45:00Z', status: 'Active' },
  { id: '13', name: 'Benjamin David Lee', institutionalId: '2021-8855', college: 'College of Computing', purpose: 'Web Development', timeIn: '2024-05-20T14:30:00Z', status: 'Active' },
  { id: '14', name: 'Victoria Rose Ong', institutionalId: '2023-1122', college: 'College of Arts', purpose: 'Literature Review', timeIn: '2024-05-20T15:15:00Z', status: 'Active' },
  { id: '15', name: 'Sebastian Paul Lim', institutionalId: '2022-9900', college: 'College of Engineering', purpose: 'Robotics Design', timeIn: '2024-05-20T16:00:00Z', status: 'Active' },
  { id: '16', name: 'Aurora Grace Beltran', institutionalId: '2021-7766', college: 'College of Science', purpose: 'Biology Lab Report', timeIn: '2024-05-20T08:15:00Z', status: 'Logged Out' },
  { id: '17', name: 'Julian Marcus Perez', institutionalId: '2020-4411', college: 'College of Business', purpose: 'Accounting Finals', timeIn: '2024-05-20T09:45:00Z', status: 'Active' },
  { id: '18', name: 'Emilia Jane Valdez', institutionalId: '2022-3388', college: 'College of Nursing', purpose: 'Pharmacology Study', timeIn: '2024-05-20T10:30:00Z', status: 'Active' },
  { id: '19', name: 'Gabriel Angelo Ramos', institutionalId: '2023-5544', college: 'College of Computing', purpose: 'Database Management', timeIn: '2024-05-20T11:15:00Z', status: 'Active' },
  { id: '20', name: 'Clara Beatrice Diaz', institutionalId: '2021-6633', college: 'College of Arts', purpose: 'Philosophy Essay', timeIn: '2024-05-20T12:00:00Z', status: 'Logged Out' },
  { id: '21', name: 'Adrian Kyle Mendoza', institutionalId: '2021-1234', college: 'College of Computing', purpose: 'System Testing', timeIn: '2024-05-20T13:00:00Z', status: 'Active' },
  { id: '22', name: 'Bianca Marie Tolentino', institutionalId: '2022-5678', college: 'College of Science', purpose: 'Lab Data Review', timeIn: '2024-05-20T13:30:00Z', status: 'Active' },
  { id: '23', name: 'Christian Dave Pineda', institutionalId: '2020-9101', college: 'College of Engineering', purpose: 'Thesis Defense Prep', timeIn: '2024-05-20T14:00:00Z', status: 'Active' },
  { id: '24', name: 'Dianne Rose Flores', institutionalId: '2023-1121', college: 'College of Business', purpose: 'Economic Research', timeIn: '2024-05-20T14:30:00Z', status: 'Logged Out' },
  { id: '25', name: 'Edward Joseph Garcia', institutionalId: '2021-3141', college: 'College of Arts', purpose: 'Fine Arts Studio', timeIn: '2024-05-20T15:00:00Z', status: 'Active' },
  { id: '26', name: 'Faith Hope Angeles', institutionalId: '2022-1618', college: 'College of Nursing', purpose: 'Nursing Seminar', timeIn: '2024-05-20T15:30:00Z', status: 'Active' },
  { id: '27', name: 'Gian Carlo Delos Santos', institutionalId: '2020-2718', college: 'College of Computing', purpose: 'Algorithm Design', timeIn: '2024-05-20T16:00:00Z', status: 'Active' },
  { id: '28', name: 'Hannah Grace Bautista', institutionalId: '2023-1414', college: 'College of Science', purpose: 'Physics Problem Set', timeIn: '2024-05-20T16:30:00Z', status: 'Active' },
  { id: '29', name: 'Ivan Gabriel Castro', institutionalId: '2021-2121', college: 'College of Engineering', purpose: 'Structural Analysis', timeIn: '2024-05-20T17:00:00Z', status: 'Active' },
  { id: '30', name: 'Jasmine Joy Villanueva', institutionalId: '2022-2323', college: 'College of Business', purpose: 'Business Plan Draft', timeIn: '2024-05-20T17:30:00Z', status: 'Logged Out' },
];

export const MOCK_BLOCKED: BlockedUser[] = [
  { id: 'b1', name: 'Robert Paulson', institutionalId: '2019-0001', reason: 'Repeated noise violations in Quiet Zone', dateBlocked: '2024-03-15' },
  { id: 'b2', name: 'Tyler Durden', institutionalId: '2019-0002', reason: 'Unauthorized access to restricted Archives', dateBlocked: '2024-04-10' },
  { id: 'b3', name: 'Arturo Romano', institutionalId: '2018-4433', reason: 'Failure to return premium library materials', dateBlocked: '2024-05-02' },
  { id: 'b4', name: 'Marco Antonio Sison', institutionalId: '2017-1122', reason: 'Vandalism of library property', dateBlocked: '2024-05-10' },
  { id: 'b5', name: 'Luzviminda Garcia', institutionalId: '2019-8877', reason: 'Multiple lost book penalties unpaid', dateBlocked: '2024-05-15' },
  { id: 'b6', name: 'Fernando Jose Po', institutionalId: '2018-0099', reason: 'Behavioral misconduct with staff', dateBlocked: '2024-05-18' },
  { id: 'b7', name: 'Xander Ford', institutionalId: '2016-0123', reason: 'Public disturbance during exam week', dateBlocked: '2024-05-19' },
  { id: 'b8', name: 'Giselle Sanchez', institutionalId: '2015-4321', reason: 'Attempted theft of university archives', dateBlocked: '2024-05-20' },
];
