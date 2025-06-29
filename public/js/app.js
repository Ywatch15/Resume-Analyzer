// --- Helper: Load JSON data ---
async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

// --- Globals ---
let skillsList = [];
let jobDescriptions = [];
let resumeText = '';
let selectedJD = null;

// --- On Page Load ---
document.addEventListener('DOMContentLoaded', async () => {
  skillsList = await loadJSON('data/skills.json');
  jobDescriptions = await loadJSON('data/job_descriptions.json');
  populateJobDescDropdown();
});

// --- Populate Job Description Dropdown ---
function populateJobDescDropdown() {
  const select = document.getElementById('jobDescSelect');
  select.innerHTML = jobDescriptions.map((jd, i) => `<option value="${i}">${jd.title}</option>`).join('');
  select.addEventListener('change', () => {
    selectedJD = jobDescriptions[select.value];
    if (resumeText) analyzeResume();
  });
  selectedJD = jobDescriptions[0];
}

// --- Resume Upload Handler ---
document.getElementById('resumeUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  resumeText = await extractTextFromPDF(file);
  analyzeResume();
});

// --- PDF Text Extraction (using pdf.js) ---
async function extractTextFromPDF(file) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + ' ';
  }
  return text;
}

// --- Main Analysis Function ---
function analyzeResume() {
  if (!resumeText || !selectedJD) return;
  const feedback = [];
  const tips = [];
  // --- Keyword/Skill Matching ---
  const matchedSkills = skillsList.filter(skill => {
    // Match skill as a word or prefix (e.g., html matches html5)
    const regex = new RegExp(`\\b${skill}`, 'i');
    return regex.test(resumeText);
  });
  const missingSkills = selectedJD.skills.filter(skill => {
    const regex = new RegExp(`\\b${skill}`, 'i');
    return !regex.test(resumeText);
  });
  // --- Scoring ---
  const skillScore = Math.round((matchedSkills.length / selectedJD.skills.length) * 100);
  // --- Feedback ---
  feedback.push(`<b>Matched Skills:</b> ${matchedSkills.join(', ') || 'None'}`);
  feedback.push(`<b>Missing Skills:</b> ${missingSkills.join(', ') || 'None'}`);
  // --- Tips Section ---
  if (missingSkills.length > 0) tips.push('Consider adding these skills: ' + missingSkills.join(', '));
  if (!resumeText.match(/educat|degree|univer|academic|qualification/i)) {
    tips.push('Add an Education section.');
  }
  if (!resumeText.match(/experience|work|project|internship|employment/i)) {
    tips.push('Add a Work Experience or Projects section.');
  }
  // --- Render ---
  renderScoreReport(skillScore);
  document.getElementById('feedbackDisplay').innerHTML = feedback.join('<br>');
  document.getElementById('tipsSection').innerHTML = '<ul>' + tips.map(t => `<li>${t}</li>`).join('') + '</ul>';
}

// --- Render Score Report ---
function renderScoreReport(skillScore) {
  document.getElementById('scoreReport').innerHTML = `
    <div class="mb-2">Skill Match</div>
    <div class="progress mb-3">
      <div class="progress-bar bg-success" role="progressbar" style="width: ${skillScore}%">${skillScore}%</div>
    </div>
    <div class="mb-2">ATS Score</div>
    <div class="progress">
      <div class="progress-bar bg-info" role="progressbar" style="width: ${skillScore}%">${skillScore}%</div>
    </div>
  `;
}

// --- Download Report ---
document.getElementById('downloadBtn').addEventListener('click', () => {
  const originalBodyBg = document.body.style.backgroundImage;
  const analyzeSection = document.getElementById('analyze');
  const originalAnalyzeBg = analyzeSection.style.backgroundImage;

  // Remove background images from all children
  const cards = analyzeSection.querySelectorAll('*');
  const originalCardBgs = [];
  cards.forEach(card => {
    originalCardBgs.push(card.style.backgroundImage);
    card.style.backgroundImage = 'none';
  });

  document.body.style.backgroundImage = 'none';
  analyzeSection.style.backgroundImage = 'none';

  html2pdf().from(analyzeSection).save('Resume-Feedback.pdf').then(() => {
    document.body.style.backgroundImage = originalBodyBg;
    analyzeSection.style.backgroundImage = originalAnalyzeBg;
    // Restore card backgrounds
    cards.forEach((card, i) => {
      card.style.backgroundImage = originalCardBgs[i];
    });
  });
}); 