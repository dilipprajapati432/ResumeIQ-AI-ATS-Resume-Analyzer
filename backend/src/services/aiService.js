const { genAI, groq, GROQ_MODEL } = require('../config/ai');
const { normalizeAnalysis } = require('./analysisService');

const SCHEMA_PROMPT = `
CRITICAL: You are an Expert Career Coach & Recruiter. You must score strictly, consistently, and FAIRLY using the rubrics below.

=== RUBRIC FOR EACH SCORE ===

KEYWORD MATCH RUBRIC (scoring for 'keyword_match'):
Count how many JD-required keywords/phrases appear verbatim in the resume.
- 90-100: 80%+ of JD keywords found in resume
- 75-89:  60-79% of JD keywords found
- 55-74:  40-59% of JD keywords found
- 30-54:  20-39% found
- 0-29:   Under 20% found
Synonyms and variations count (e.g., "ML" = "Machine Learning", "React.js" = "React").

ATS FORMAT RUBRIC (scoring for 'format_ats'):
100% INDEPENDENT of job description content. Score ONLY on structural integrity:
- 90-100: Has all standard sections (Education, Experience, Skills, Projects), clean parsable layout, complete contact info, consistent formatting
- 75-89:  Has most standard sections, good parsability, minor formatting issues
- 55-74:  Missing some sections OR has minor parsability issues (e.g., some icons, slight inconsistency)
- 30-54:  Missing key sections OR uses complex tables/multi-columns that break ATS parsers
- 0-29:   Severely broken format, no standard sections, completely unparsable
Most well-structured resumes should score 80+. A standard single-column resume with clear headers = minimum 85.

EXPERIENCE MATCH RUBRIC (scoring for 'experience_match'):
- 90-100: Years of experience meet/exceed JD requirement AND domain matches exactly
- 75-89:  Experience is close to requirement OR same domain but slightly fewer years
- 55-74:  Some relevant experience but different domain or significantly fewer years
- 30-54:  Minimal relevant experience
- 0-29:   No relevant experience
If JD doesn't specify years, score based on domain relevance of past roles/projects.

SKILLS ALIGNMENT RUBRIC (scoring for 'skills_alignment'):
- 90-100: Candidate has 80%+ of required technical skills AND core domain skills match
- 75-89:  Candidate has 60-79% of required skills, core skills present
- 55-74:  Candidate has 40-59% of required skills
- 30-54:  Under 40% skill overlap
- 0-29:   Almost no skill overlap
Consider BOTH listed skills AND skills demonstrated in project/experience descriptions.

EDUCATION MATCH RUBRIC (scoring for 'education_match'):
- B.Tech/B.E./M.Tech/MS in Computer Science, IT, ECE, or any Engineering = minimum 60 for ANY tech role
- Exact degree match (e.g., Cybersecurity degree for Cybersecurity role) = 90-100
- Related STEM degree (Physics, Math) = 40-60
- Unrelated degree (Arts, Commerce) for a tech role = 10-30
- NEVER give 0 for Education if candidate has B.Tech/B.E. in CSE/IT applying for any tech role

IMPACT & RESULTS RUBRIC (scoring for 'impact_results'):
- 90-100: Multiple quantified achievements (%, $, metrics) with clear business impact
- 75-89:  Some quantified results OR strong action verbs with clear project outcomes
- 55-74:  Describes responsibilities with some outcomes but lacks quantification
- 35-54:  Mostly lists duties without outcomes
- 0-34:   No evidence of impact
431: FOR STUDENTS/FRESHERS: Score based on project complexity, technologies used, and deployment evidence (GitHub links, Live links). Do NOT penalize for lacking corporate metrics.

=== RESPONSE FORMAT ===

Respond ONLY with a JSON object:
{
  "overall_score": (int),
  "verdict": "Excellent|Strong|Good|Fair|Poor",
  "summary": "A detailed 3-4 sentence recruiter-style evaluation. Start with the candidate's core strengths (e.g., education, specific technologies), then provide a clear, constructive critique of what they are missing (e.g., quantified achievements, domain-specific projects, or certification gaps).",
  "scores": {
    "keyword_match": {"score": (int), "reason": "...", "evidence": "..."},
    "format_ats": {"score": (int), "reason": "...", "evidence": "..."},
    "experience_match": {"score": (int), "reason": "...", "evidence": "..."},
    "skills_alignment": {"score": (int), "reason": "...", "evidence": "..."},
    "education_match": {"score": (int), "reason": "...", "evidence": "..."},
    "impact_results": {"score": (int), "reason": "...", "evidence": "..."}
  },
  "keywords": {
    "found":["Exact words/phrases verbatim in BOTH resume and JD."],
    "missing":["Exact words/phrases verbatim in JD but absent from Resume."],
    "bonus":["Extra skills in Resume NOT requested in JD (additional certs, languages, tools, etc)."]
  },
  "issues": [{"severity":"critical|warning|info", "title":"Concise issue title", "description":"Detailed explanation of the problem and its specific impact on the scorecard."}],
  "suggestions": [{"priority":"high|medium|low", "category":"Formatting|Keywords|Experience", "title":"Short improvement title", "action":"Specific, actionable step to fix the issue."}],
  "job_title_match": "Matched Job Title ONLY. Max 3 words. Example: 'Software Engineer'",
  "experience_years_required": "ONE short tag: 'Entry Level' | '1-2 Years' | '2-3 Years' | '3-5 Years' | '5+ Years' | '10+ Years' | 'Not Specified'",
  "candidate_experience_years": "ONE short tag: 'Current Student' | 'Pre-final Year' | 'Fresher' | '1-2 Years' | '2-3 Years' | '3-5 Years' | '5+ Years' | '10+ Years'"
}

=== LOGICAL RULES ===
1. If a technology is found in resume, it MUST NOT be listed as missing.
2. Synonyms count as matches (React = React.js, ML = Machine Learning, etc.)
3. Specific technologies satisfy general categories (MySQL found → "Databases" is NOT missing).
4. 'experience_years_required' and 'candidate_experience_years' MUST be SHORT TAGS ONLY (max 3 words).`;

async function analyzeWithGemini(resume, jd, modelName) {
  const prompt = `Evaluate this resume against the JD.
  MANDATORY RULES:
  1. STUDENT MODE: Grade 'Impact & Results' on project depth. Ignore corporate metrics for students.
  2. DECOUPLE ATS FORMAT: 'format_ats' is independent of job fit.
  3. DOMAIN PENALTY: Penalize if domain mismatch.
  4. RECRUITER MODE: Word choice influences impact score.
  5. EDUCATION RULE: B.Tech/B.E. in CSE/IT/ECE is ALWAYS relevant (min 60) for ANY tech role including Cybersecurity, Data Science, AI, Cloud, etc.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { temperature: 0 } });
  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return normalizeAnalysis(JSON.parse(text), resume, jd);
}

async function analyzeWithGroq(resume, jd) {
  const prompt = `Evaluate this resume against the JD.
  MANDATORY RULES:
  1. STUDENT MODE: Grade on project depth.
  2. DECOUPLE ATS FORMAT: 'format_ats' is independent.
  3. EDUCATION RULE: B.Tech/B.E. in CSE/IT/ECE is ALWAYS relevant (min 60) for ANY tech role.
  RESUME: ${resume}
  JD: ${jd}
  ${SCHEMA_PROMPT}`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: GROQ_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' }
  });
  return normalizeAnalysis(JSON.parse(chat.choices[0].message.content), resume, jd);
}

module.exports = {
  analyzeWithGemini,
  analyzeWithGroq
};
