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
  { id: 'v1', name: 'James Patrick Chen', institutionalId: '2021-1001', college: 'College of Computing', purpose: 'Research for Capstone', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v2', name: 'Maria Leonora Santos', institutionalId: '2022-2045', college: 'College of Arts', purpose: 'Studying for Finals', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v3', name: 'Antonio Miguel Reyes', institutionalId: '2020-0552', college: 'College of Engineering', purpose: 'Group Meeting', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v4', name: 'Sarah Jane Connor', institutionalId: '2023-3001', college: 'College of Science', purpose: 'Borrowing Books', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v5', name: 'Ricardo Dalisay', institutionalId: '2021-9988', college: 'College of Business', purpose: 'Print Documents', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v6', name: 'Elena Gilbert', institutionalId: '2022-5566', college: 'College of Nursing', purpose: 'Clinical Research', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v7', name: 'Mateo Gabriel Silva', institutionalId: '2021-4422', college: 'College of Computing', purpose: 'Programming Lab', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v8', name: 'Sofia Isabel Luna', institutionalId: '2022-1199', college: 'College of Arts', purpose: 'Art History Thesis', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v9', name: 'Lucas Alexander Tan', institutionalId: '2023-7733', college: 'College of Engineering', purpose: 'CAD Project', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v10', name: 'Isabella Marie Cruz', institutionalId: '2021-2288', college: 'College of Science', purpose: 'Chemistry Review', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v11', name: 'Nathaniel Joseph Go', institutionalId: '2020-3344', college: 'College of Business', purpose: 'Market Analysis', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v12', name: 'Chloe Francesca Sy', institutionalId: '2022-6677', college: 'College of Nursing', purpose: 'Medical Journals', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v13', name: 'Benjamin David Lee', institutionalId: '2021-8855', college: 'College of Computing', purpose: 'Web Development', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v14', name: 'Victoria Rose Ong', institutionalId: '2023-1122', college: 'College of Arts', purpose: 'Literature Review', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v15', name: 'Sebastian Paul Lim', institutionalId: '2022-9900', college: 'College of Engineering', purpose: 'Robotics Design', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v16', name: 'Aurora Grace Beltran', institutionalId: '2021-7766', college: 'College of Science', purpose: 'Biology Lab Report', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v17', name: 'Julian Marcus Perez', institutionalId: '2020-4411', college: 'College of Business', purpose: 'Accounting Finals', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v18', name: 'Emilia Jane Valdez', institutionalId: '2022-3388', college: 'College of Nursing', purpose: 'Pharmacology Study', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v19', name: 'Gabriel Angelo Ramos', institutionalId: '2023-5544', college: 'College of Computing', purpose: 'Database Management', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v20', name: 'Clara Beatrice Diaz', institutionalId: '2021-6633', college: 'College of Arts', purpose: 'Philosophy Essay', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v21', name: 'Adrian Kyle Mendoza', institutionalId: '2021-1234', college: 'College of Computing', purpose: 'System Testing', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v22', name: 'Bianca Marie Tolentino', institutionalId: '2022-5678', college: 'College of Science', purpose: 'Lab Data Review', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v23', name: 'Christian Dave Pineda', institutionalId: '2020-9101', college: 'College of Engineering', purpose: 'Thesis Defense Prep', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v24', name: 'Dianne Rose Flores', institutionalId: '2023-1121', college: 'College of Business', purpose: 'Economic Research', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v25', name: 'Edward Joseph Garcia', institutionalId: '2021-3141', college: 'College of Arts', purpose: 'Fine Arts Studio', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v26', name: 'Faith Hope Angeles', institutionalId: '2022-1618', college: 'College of Nursing', purpose: 'Nursing Seminar', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v27', name: 'Gian Carlo Delos Santos', institutionalId: '2020-2718', college: 'College of Computing', purpose: 'Algorithm Design', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v28', name: 'Hannah Grace Bautista', institutionalId: '2023-1414', college: 'College of Science', purpose: 'Physics Problem Set', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v29', name: 'Ivan Gabriel Castro', institutionalId: '2021-2121', college: 'College of Engineering', purpose: 'Structural Analysis', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v30', name: 'Jasmine Joy Villanueva', institutionalId: '2022-2323', college: 'College of Business', purpose: 'Business Plan Draft', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v31', name: 'Kevin Mark Solis', institutionalId: '2021-5511', college: 'College of Computing', purpose: 'AI Ethics Research', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v32', name: 'Louise Anne Lopez', institutionalId: '2022-4422', college: 'College of Arts', purpose: 'Creative Writing', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v33', name: 'Mark Anthony Cruz', institutionalId: '2023-3322', college: 'College of Engineering', purpose: 'Solid Works Demo', timeIn: new Date().toISOString(), status: 'Active' },
  { id: 'v34', name: 'Nicole Sophia Tan', institutionalId: '2020-2211', college: 'College of Science', purpose: 'Data Analysis', timeIn: new Date().toISOString(), status: 'Logged Out' },
  { id: 'v35', name: 'Oliver James Sy', institutionalId: '2021-1155', college: 'College of Business', purpose: 'Marketing Project', timeIn: new Date().toISOString(), status: 'Active' },
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
  { id: 'b9', name: 'Ramon Magsaysay Jr.', institutionalId: '2014-9988', reason: 'Harassment of students', dateBlocked: '2024-05-21' },
  { id: 'b10', name: 'Corazon Aquino III', institutionalId: '2013-7766', reason: 'Unauthorized food distribution', dateBlocked: '2024-05-22' },
];
