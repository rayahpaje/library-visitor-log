<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>

<h1>NEU Library Visitor Log Application</h1>

<div class="section">
  <h2>Project Goal</h2>
  <p>
    The goal of this project is to develop the NEU Library Visitor Log Application,
    a system that records all visitor entries in the NEU Library. The application
    captures the date and time of each visit and provides administrators with a
    dashboard that displays visitor statistics. These statistics can be viewed daily,
    weekly, monthly, or within a customized date range.
  </p>
</div>

<div class="section">
  <h2>System Inputs</h2>

  <h3>1. NEU School ID (RFID-Based Access)</h3>
  <p>
    Students, faculty members, and employees will tap their RFID-enabled NEU ID
    upon entering the library. A terminal will display the visitor’s name, and
    the visitor must select their purpose of visit:
  </p>
  <ul>
    <li>Reading books</li>
    <li>Research for a thesis</li>
    <li>Use of computers</li>
    <li>Doing assignments</li>
  </ul>

  <h3>2. User Types</h3>
  <ul>
    <li>Admin</li>
    <li>Visitor</li>
  </ul>

  <h3>3. Visitor Management</h3>
  <p>
    Administrators can block a visitor’s access through the application when necessary.
  </p>

  <h3>4. Alternative Login Method</h3>
  <p>
    Visitors may log in using their institutional email account (Google-based email)
    if RFID is not available.
  </p>
</div>

<div class="section">
  <h2>System Outputs</h2>

  <h3>1. Visitor Information Display</h3>
  <p>After a successful login, the terminal will display the visitor’s:</p>
  <ul>
    <li>Name</li>
    <li>College or office affiliation</li>
  </ul>

  <h3>2. Welcome Message</h3>
  <p><strong>“Welcome to the NEU Library!”</strong></p>

  <h3>3. Admin Dashboard</h3>
  <p>Administrators can monitor visitor statistics based on:</p>
  <ul>
    <li>Daily visits</li>
    <li>Weekly visits</li>
    <li>Monthly visits</li>
    <li>Custom date range</li>
  </ul>

  <h3>4. Report Generation</h3>
  <p>
    The system allows administrators to generate reports in PDF format based on
    selected statistics. These reports can be downloaded for documentation and analysis.
  </p>
</div>

<div class="section">
  <h2>Vibe Coding Approach</h2>
  <ol>
    <li>Create an initial draft of prompts for system generation.</li>
    <li>Use Google AI Studio to generate the user interface (UI).</li>
    <li>Refine and improve prompts using Gemini AI for better system output and design.</li>
  </ol>
</div>

<div class="section">
  <h2>Live Application</h2>
  <p>
    <a href="https://library-visitor-log-84h8.vercel.app/">
      Open NEU Library Visitor Log System
    </a>
  </p>
</div>

</body>
</html>
