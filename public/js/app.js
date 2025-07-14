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
// console.log("analyzeResume called");

// --- Main Analysis Function ---
function analyzeResume() {
  if (!resumeText || !selectedJD) return;
  const feedback = [];
  const tips = [];
  // --- Keyword/Skill Matching ---
  // Only match skills from the selected job description
  const matchedSkills = selectedJD.skills.filter(skill => {
    if (skill.length <= 2) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      return regex.test(resumeText);
    }
    const regex = new RegExp(skill, 'i');
    return regex.test(resumeText);
  });
  const missingSkills = selectedJD.skills.filter(skill => {
    if (skill.length <= 2) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      return !regex.test(resumeText);
    }
    const regex = new RegExp(skill, 'i');
    return !regex.test(resumeText);
  });
  // --- Scoring ---
  const skillScore = Math.round((matchedSkills.length / selectedJD.skills.length) * 100);

  // --- ATS Score Calculation ---
  let atsScore = skillScore;
  if (resumeText.match(/educat|degree|univer|academic|qualification/i)) atsScore += 10;
  if (resumeText.match(/experience|work|project|internship|employment/i)) atsScore += 10;
  atsScore = Math.min(atsScore, 100);

  // --- Positive Points ---
  if (skillScore >= 90) {
    feedback.push(`<span style='color:green'><b>Excellent!</b> Your skill match score is in the top 2% of applicants.</span>`);
  } else if (skillScore >= 80) {
    feedback.push(`<span style='color:green'><b>Great!</b> Your skill match score is in the top 4% of applicants.</span>`);
  } else if (skillScore >= 70) {
    feedback.push(`<span style='color:green'><b>Good!</b> Your skill match score is in the top 5% of applicants.</span>`);
  }

  // --- Feedback ---
  feedback.push(`<b>Matched Skills:</b> ${matchedSkills.join(', ') || 'None'}`);
  feedback.push(`<b>Missing Skills:</b> ${missingSkills.join(', ') || 'None'}`);

  // --- Awards/Certifications Suggestion ---
  if (!resumeText.match(/award|certificat|honou?r|achievement|recognition/i)) {
    tips.push('Consider adding an Awards or Certifications section to highlight your achievements.');
  }

  // --- Tips Section ---
  if (missingSkills.length > 0) tips.push('Consider adding these skills: ' + missingSkills.join(', '));
  if (!resumeText.match(/educat|degree|univer|academic|qualification/i)) {
    tips.push('Add an Education section.');
  }
  if (!resumeText.match(/experience|work|project|internship|employment/i)) {
    tips.push('Add a Work Experience or Projects section.');
  }

  // --- Render ---
  renderScoreReport(skillScore, atsScore);
  document.getElementById('feedbackDisplay').innerHTML = feedback.join('<br>');
  document.getElementById('tipsSection').innerHTML = '<ul>' + tips.map(t => `<li>${t}</li>`).join('') + '</ul>';

  // --- Fill PDF Report Section ---
  const pdfAtsScore = document.getElementById('pdfAtsScore');
  const pdfSkillScore = document.getElementById('pdfSkillScore');
  const pdfMatchedSkills = document.getElementById('pdfMatchedSkills');
  const pdfMissingSkills = document.getElementById('pdfMissingSkills');
  const pdfTips = document.getElementById('pdfTips');
  if (pdfAtsScore && pdfSkillScore && pdfMatchedSkills && pdfMissingSkills && pdfTips) {
    pdfAtsScore.textContent = atsScore + '%';
    pdfSkillScore.textContent = skillScore + '%';
    pdfMatchedSkills.innerHTML = matchedSkills.map(s => `<li>${s}</li>`).join('');
    pdfMissingSkills.innerHTML = missingSkills.map(s => `<li>${s}</li>`).join('');
    pdfTips.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
  }
}

// --- Render Score Report ---
function renderScoreReport(skillScore, atsScore) {
  const cappedSkillScore = Math.min(skillScore, 100);
  const cappedATSScore = Math.min(atsScore, 100);
  document.getElementById('scoreReport').innerHTML = `
    <div class="mb-2">Skill Match</div>
    <div class="progress mb-3">
      <div class="progress-bar bg-success" role="progressbar" style="width: ${cappedSkillScore}%">${cappedSkillScore}%</div>
    </div>
    <div class="mb-2">ATS Score</div>
    <div class="progress">
      <div class="progress-bar bg-info" role="progressbar" style="width: ${cappedATSScore}%">${cappedATSScore}%</div>
    </div>
  `;
}

// --- Download Report ---
document.getElementById('downloadBtn').addEventListener('click', () => {
  // Check if resume is uploaded
  if (!resumeText) {
    // Show warning message near the button
    let warning = document.getElementById('resumeWarning');
    if (!warning) {
      warning = document.createElement('div');
      warning.id = 'resumeWarning';
      warning.className = 'alert alert-warning mt-2';
      warning.textContent = 'Kindly upload the resume before downloading the report!';
      document.getElementById('downloadBtn').parentNode.appendChild(warning);
    } else {
      warning.style.display = 'block';
    }
    setTimeout(() => { if (warning) warning.style.display = 'none'; }, 3000);
    return;
  }
  // Gather data from the latest analysis
  const scoreReport = document.getElementById('scoreReport');
  const feedbackDisplay = document.getElementById('feedbackDisplay');
  const tipsSection = document.getElementById('tipsSection');

  // ATS and Skill Score
  const atsScore = scoreReport.querySelector('.progress-bar.bg-info')?.textContent.trim() || '';
  const skillScore = scoreReport.querySelector('.progress-bar.bg-success')?.textContent.trim() || '';

  // Matched and Missing Skills
  let matchedSkills = '';
  let missingSkills = '';
  const feedbackHtml = feedbackDisplay.innerHTML;
  const matchedMatch = feedbackHtml.match(/Matched Skills:<\/b> ([^<]*)/i);
  const missingMatch = feedbackHtml.match(/Missing Skills:<\/b> ([^<]*)/i);
  if (matchedMatch && matchedMatch[1].trim() && matchedMatch[1].trim() !== 'None') {
    matchedSkills = matchedMatch[1].split(',').map(s => s.trim()).join(',');
  }
  if (missingMatch && missingMatch[1].trim() && missingMatch[1].trim() !== 'None') {
    missingSkills = missingMatch[1].split(',').map(s => s.trim()).join(',');
  }

  // Tips (pipe-separated)
  let tips = '';
  const tipsList = tipsSection.querySelectorAll('li');
  if (tipsList.length > 0) {
    tips = Array.from(tipsList).map(li => li.textContent.trim()).join('|');
  }

  // Build URL
  const url = `pdf-report.html?ats=${encodeURIComponent(atsScore)}&skill=${encodeURIComponent(skillScore)}&matched=${encodeURIComponent(matchedSkills)}&missing=${encodeURIComponent(missingSkills)}&tips=${encodeURIComponent(tips)}`;

  // Open in new tab
  window.open(url, '_blank');
});
