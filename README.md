# Resume Analyzer

Welcome to Resume Analyzer! This project is designed to help users get instant, AI-powered feedback on their resumes by comparing them to job descriptions. The goal is to make it easy for anyone to see how well their resume matches a job and get actionable suggestions for improvement.

---

## What Does This Project Do?

Resume Analyzer lets you:
- Upload your resume (in PDF format)
- Select a job description from a list
- Instantly see a skill match score and ATS (Applicant Tracking System) score
- Get feedback on matched and missing skills
- Receive tips and suggestions to improve your resume
- Download a professional PDF report of your analysis

All of this happens right in your browser—no server or backend required!

---

## Project Structure & File Usage

Here’s a breakdown of the files and folders, what they do, and why they’re here:

### `public/`
This is the main folder for everything the browser needs. All the files here are static and can be served directly by any web server.

#### `index.html`
- **What:** The main HTML file for the app.
- **Where:** Open this file in your browser to use Resume Analyzer.
- **Why:** It contains the structure of the web page, links to stylesheets and scripts, and all the UI elements (upload, dropdown, report, etc.).

#### `style.css`
- **What:** The main stylesheet for the app.
- **Where:** Linked in `index.html`.
- **Why:** Handles all the custom styling, including layout, colors, buttons, cards, and responsive design. It also includes styles for the dark mode toggle and the PDF report section.

#### `js/`
This folder contains all the JavaScript files that power the app’s functionality.

- **`app.js`**
  - **What:** The main logic for the Resume Analyzer.
  - **Where:** Linked at the bottom of `index.html`.
  - **Why:** Handles file uploads, job description selection, PDF text extraction, skill matching, scoring, feedback generation, and PDF report download. It’s the brain of the app.

- **`pdf.js`** and **`pdf.worker.js`**
  - **What:** PDF.js library files.
  - **Where:** Used by `app.js` to extract text from uploaded PDF resumes.
  - **Why:** Allows the app to read and analyze the content of PDF files directly in the browser.

- **`html2pdf.bundle.min.js`**
  - **What:** Library for converting HTML to PDF.
  - **Where:** Used when the user downloads the analysis report as a PDF.
  - **Why:** Makes it possible to generate a downloadable PDF report from the analysis results.

- **`compromise.min.js`**
  - **What:** Natural language processing library.
  - **Where:** Used in `app.js` for text analysis and skill matching.
  - **Why:** Helps with parsing and understanding resume content for more accurate feedback.

#### `data/`
This folder contains the data used for analysis.

- **`skills.json`**
  - **What:** A list of skills that can be matched in resumes.
  - **Where:** Loaded by `app.js` on page load.
  - **Why:** Provides the reference skills for matching against the resume text.

- **`job_descriptions.json`**
  - **What:** A list of job descriptions, each with associated skills.
  - **Where:** Used to populate the job description dropdown and for skill matching.
  - **Why:** Lets users select a job role to compare their resume against, making the analysis relevant and targeted.

#### `pdf-report.html`
- **What:** A separate HTML file for displaying the PDF report in a new tab.
- **Where:** Opened when the user clicks the download button.
- **Why:** Provides a clean, printable view of the analysis results, which can be saved as a PDF.

#### `package.json` and `package-lock.json`
- **What:** Standard files for managing dependencies (mainly for development or if you want to use npm).
- **Where:** In the `public/` folder.
- **Why:** Useful if you want to install or update libraries, or deploy the project using a build tool.

---

## JavaScript Files: What They Do and Why

### `public/js/app.js`
This is the main JavaScript file that powers the Resume Analyzer. Here’s a breakdown of the key functions and what they do:

- **`loadJSON(path)`**
  - *What:* Loads a JSON file from the given path using `fetch` and returns the parsed data.
  - *Why:* Used to load the skills and job descriptions data when the page loads, so the app knows what to compare your resume against.

- **Global Variables**
  - `skillsList`, `jobDescriptions`, `resumeText`, `selectedJD`: These hold the loaded data, the extracted resume text, and the currently selected job description. They make it easy to share data between functions.

- **Page Load Event**
  - When the page loads, it fetches the skills and job descriptions, then calls `populateJobDescDropdown()` to fill the dropdown menu.

- **`populateJobDescDropdown()`**
  - *What:* Fills the job description dropdown with options from the loaded job descriptions.
  - *Why:* Lets the user pick which job they want to compare their resume to. Also sets up a change event so that if you pick a new job, the analysis updates automatically.

- **Resume Upload Handler**
  - Listens for when a user uploads a PDF. When a file is selected, it calls `extractTextFromPDF()` to read the text, then runs the analysis.

- **`extractTextFromPDF(file)`**
  - *What:* Uses the PDF.js library to extract all the text from the uploaded PDF file.
  - *Why:* This is how the app reads your resume so it can analyze the content. It loops through every page of the PDF and grabs the text.

- **`analyzeResume()`**
  - *What:* The heart of the app. Compares the resume text to the selected job description’s skills, calculates scores, and generates feedback and tips.
  - *Why:* This is where the actual analysis happens. It checks which skills are present or missing, gives you a skill match score, and suggests improvements (like adding an education or awards section if missing).
  - *How:*
    - Finds matched and missing skills using regular expressions.
    - Calculates a skill match score and an ATS (Applicant Tracking System) score.
    - Generates positive feedback if your score is high.
    - Suggests tips for missing sections or skills.
    - Updates the UI with the results and fills in the PDF report section for download.

- **`renderScoreReport(skillScore, atsScore)`**
  - *What:* Updates the UI to show your skill match and ATS scores as progress bars.
  - *Why:* Gives you a visual, easy-to-understand summary of your resume’s performance.

- **Download Button Handler**
  - When you click the “Download PDF Report” button, it checks if you’ve uploaded a resume. If not, it shows a warning message.
  - If a resume is uploaded, it gathers the latest analysis data and opens the `pdf-report.html` page in a new tab, passing the results as URL parameters.

---

### `public/js/pdf.js` and `public/js/pdf.worker.js`
- **What:** These are part of the [PDF.js](https://mozilla.github.io/pdf.js/) library, which is an open-source project by Mozilla for reading and parsing PDF files in the browser.
- **Where:** Used by `app.js` in the `extractTextFromPDF()` function.
- **Why:** They allow the app to extract text from PDF resumes without needing any server-side processing. `pdf.worker.js` does the heavy lifting in a separate thread so the UI stays responsive.

---

### `public/js/html2pdf.bundle.min.js`
- **What:** A library that converts HTML content into a downloadable PDF file, combining [html2canvas](https://html2canvas.hertzen.com/) and [jsPDF](https://github.com/parallax/jsPDF).
- **Where:** Used when the user wants to download their resume analysis as a PDF report.
- **Why:** Makes it easy to generate a professional-looking PDF from the analysis results, so users can save or share their feedback.

---

### `public/js/compromise.min.js`
- **What:** [Compromise](https://github.com/spencermountain/compromise) is a lightweight natural language processing (NLP) library for JavaScript.
- **Where:** Included in the project for advanced text analysis and skill matching.
- **Why:** Helps the app understand and process the text in resumes more intelligently, such as recognizing skills, keywords, and context. This improves the accuracy of the analysis and feedback.

---

### `public/data/skills.json` and `public/data/job_descriptions.json`
- **What:** These are data files containing lists of skills and job descriptions (with associated skills for each job).
- **Where:** Loaded by `app.js` at startup.
- **Why:** They provide the reference data for matching and scoring resumes. You can easily add more skills or job roles by editing these files.

---

### `public/pdf-report.html`
- **What:** A separate HTML file that displays the analysis results in a clean, printable format.
- **Where:** Opened in a new tab when the user clicks the download button.
- **Why:** Designed for generating a PDF report using `html2pdf.bundle.min.js`, so users get a nicely formatted document.

---

### `public/style.css`
- **What:** The main stylesheet for the app.
- **Where:** Linked in `index.html`.
- **Why:** Handles all the custom styles, including layout, colors, dark mode, and the look of the PDF report.

---

### `public/index.html`
- **What:** The main entry point for the app.
- **Where:** Open this file in your browser to use Resume Analyzer.
- **Why:** Contains the structure of the web page, links to all scripts and styles, and the UI elements for uploading, selecting, viewing results, and downloading the report.

---

### `public/package.json` and `public/package-lock.json`
- **What:** Standard files for managing JavaScript dependencies (mainly for development or if you want to use npm).
- **Where:** In the `public/` folder.
- **Why:** Useful if you want to install or update libraries, or deploy the project using a build tool.

---

### `6848efa7655d1699433447.png`
- **What:** An image file (purpose depends on your usage; could be a logo or illustration).
- **Where:** In the root of the project.
- **Why:** Can be used for branding or visual enhancement.

---

## How All the Pieces Work Together

- When you open `index.html`, the app loads the necessary data and libraries.
- You upload your resume (PDF), which is read using PDF.js.
- The text is analyzed using custom logic and the Compromise NLP library.
- The app compares your resume to the selected job description, calculates scores, and generates feedback.
- You can view the results on the page or download a PDF report generated with html2pdf.

This setup keeps everything modular, easy to understand, and simple to extend. If you want to add new features, you can focus on one part at a time—whether it’s the data, the analysis logic, or the UI.

---

If you’re learning or want to contribute, reading through `app.js` is a great way to see how everything fits together. Each function is designed to be clear and focused, making it a solid example of real-world JavaScript in action. 