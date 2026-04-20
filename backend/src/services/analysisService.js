const { sanitizeExpTag, hasKeyword } = require('../utils/helpers');

/**
 * Normalizes AI output and applies Programmatic Reinforcement
 */
function normalizeAnalysis(data, resumeText = "", jdText = "") {
  let finalScore = 0;

  const defaults = {
    overall_score: 0,
    verdict: data.verdict || 'Good',
    verdict_color: data.verdict_color || 'yellow',
    summary: data.summary || "Comprehensive analysis complete. Focus on highlighting quantifiable achievements.",
    scores: {
      keyword_match: { score: 0, label: "Keyword Match", icon: "🔑" },
      format_ats: { score: 0, label: "ATS Format", icon: "📄" },
      experience_match: { score: 0, label: "Experience Fit", icon: "💼" },
      skills_alignment: { score: 0, label: "Skills Alignment", icon: "⚡" },
      education_match: { score: 0, label: "Education Match", icon: "🎓" },
      impact_results: { score: 0, label: "Impact & Results", icon: "📊" }
    },
    keywords: { found: [], missing: [], bonus: [] },
    issues: [],
    suggestions: [],
    strengths: [],
    job_title_match: data.job_title_match || 'Detected',
    experience_years_required: sanitizeExpTag(data.experience_years_required),
    candidate_experience_years: sanitizeExpTag(data.candidate_experience_years)
  };

  if (data.scores) {
    Object.keys(defaults.scores).forEach(key => {
      const s = data.scores[key];
      if (s !== undefined && s !== null) {
        const parsed = parseInt(s.score ?? s);
        defaults.scores[key].score = Math.min(100, Math.max(0, isNaN(parsed) ? 0 : parsed));
        if (s.reason) defaults.scores[key].reason = s.reason;
        if (s.evidence) defaults.scores[key].evidence = s.evidence;
      }
    });

    const weights = {
      keyword_match: 0.25,      // 25%
      skills_alignment: 0.20,   // 20%
      format_ats: 0.15,         // 15%
      experience_match: 0.15,   // 15%
      impact_results: 0.15,     // 15%
      education_match: 0.10     // 10%
    };

    let calculatedTotal = 0;
    Object.keys(weights).forEach(k => {
      calculatedTotal += (defaults.scores[k].score * weights[k]);
    });
    finalScore = Math.round(calculatedTotal);
  }

  // --- PROGRAMMATIC EDUCATION FLOOR ---
  const resumeLower = (resumeText || '').toLowerCase();
  const hasTechDegree = /(b\.?\s*tech|b\.?\s*e\.?|m\.?\s*tech|m\.?\s*s\.?|bachelor|master)/i.test(resumeLower) &&
    /(computer\s*science|cse|information\s*technology|it|ece|electronics|software|engineering)/i.test(resumeLower);
  if (hasTechDegree && defaults.scores.education_match.score < 60) {
    defaults.scores.education_match.score = 60;
    defaults.scores.education_match.reason = 'B.Tech/B.E. in CSE/IT is broadly relevant to all tech roles.';
    const weights = {
      keyword_match: 0.25, skills_alignment: 0.20, format_ats: 0.15,
      experience_match: 0.15, impact_results: 0.15, education_match: 0.10
    };
    let recalc = 0;
    Object.keys(weights).forEach(k => { recalc += (defaults.scores[k].score * weights[k]); });
    finalScore = Math.round(recalc);
  }

  // --- PROGRAMMATIC DOMAIN MISMATCH DETECTION ---
  const jdLower = (jdText || '').toLowerCase();

  const domainSignatures = {
    'machine_learning': {
      jdTriggers: ['machine learning', 'deep learning', 'neural network', 'nlp', 'natural language', 'computer vision',
        'data science', 'ml engineer', 'ai engineer', 'tensorflow', 'pytorch', 'scikit-learn', 'model training',
        'ml ops', 'mlops', 'feature engineering', 'model deployment', 'artificial intelligence', 'llm', 'genai'],
      coreSkills: ['tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'deep learning',
        'machine learning', 'neural network', 'nlp', 'computer vision', 'model', 'training', 'inference',
        'classification', 'regression', 'clustering', 'transformers', 'bert', 'gpt', 'llm', 'genai',
        'data science', 'feature engineering', 'xgboost', 'random forest', 'svm', 'langchain', 'ollama', 'huggingface'],
      minCoreSkillsNeeded: 4
    },
    'devops_cloud': {
      jdTriggers: ['devops', 'cloud engineer', 'site reliability', 'sre', 'infrastructure', 'kubernetes', 'terraform',
        'ci/cd pipeline', 'cloud architect', 'aws', 'azure', 'gcp', 'docker engineer'],
      coreSkills: ['kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'docker', 'aws', 'amazon web services', 
        'azure', 'gcp', 'google cloud', 'infrastructure as code', 'iac', 'helm', 'prometheus', 'grafana', 'linux admin', 
        'shell script', 'bash', 'yaml', 'nginx'],
      minCoreSkillsNeeded: 4
    },
    'cybersecurity': {
      jdTriggers: ['cybersecurity', 'security engineer', 'penetration test', 'soc analyst', 'security analyst',
        'vulnerability', 'threat', 'incident response', 'siem', 'ethical hack', 'information security', 'infosec', 'cyber security', 'network security'],
      coreSkills: ['penetration testing', 'pentest', 'vulnerability scan', 'firewall', 'siem', 'ids', 'ips', 'nmap', 'burp suite',
        'metasploit', 'wireshark', 'incident response', 'threat hunting', 'malware analysis', 'forensics', 'owasp', 'soc analyst', 
        'security audit', 'endpoint security', 'soc', 'kalilinux', 'wireshark', 'cybersecurity', 'information security'],
      minCoreSkillsNeeded: 4
    },
    'data_engineering': {
      jdTriggers: ['data engineer', 'etl', 'data pipeline', 'data warehouse', 'big data', 'spark engineer',
        'data platform', 'hadoop', 'snowflake engineer', 'databricks'],
      coreSkills: ['spark', 'hadoop', 'kafka', 'airflow', 'etl', 'data warehouse', 'redshift', 'bigquery',
        'snowflake', 'dbt', 'data pipeline', 'hive', 'presto', 'flink', 'databricks', 'nosql', 'sql server', 'pyspark'],
      minCoreSkillsNeeded: 4
    },
    'web_development': {
      jdTriggers: ['web developer', 'frontend', 'backend', 'fullstack', 'full stack', 'react developer', 'node developer', 'software engineer', 'web engineer'],
      coreSkills: ['javascript', 'typescript', 'react', 'node.js', 'express.js', 'html', 'css', 'sql', 'nosql', 'mongodb', 'rest api', 'git', 'github', 'responsive design'],
      minCoreSkillsNeeded: 3
    }
  };

  let detectedDomain = null;
  for (const [domain, config] of Object.entries(domainSignatures)) {
    if (config.jdTriggers.some(t => jdLower.includes(t))) {
      detectedDomain = domain;
      break;
    }
  }

  const domainTitles = ['Machine Learning', 'Data Science', 'Cybersecurity', 'Web Development', 'Data Engineering', 'Artificial Intelligence', 'Cyber Security'];
  if (data.keywords && Array.isArray(data.keywords.missing)) {
    data.keywords.missing = data.keywords.missing.filter(m => {
      const match = domainTitles.find(title => m.toLowerCase().includes(title.toLowerCase()));
      if (match) {
        const matchKey = match.toLowerCase().replace(/\s+/g, '_');
        return detectedDomain && (detectedDomain === matchKey || (detectedDomain === 'cybersecurity' && matchKey === 'cyber_security'));
      }
      return true;
    });
  }

  if (detectedDomain) {
    const domainConfig = domainSignatures[detectedDomain];
    const coreSkillsFound = domainConfig.coreSkills.filter(skill => hasKeyword(resumeLower, skill)).length;
    
    if (coreSkillsFound < domainConfig.minCoreSkillsNeeded) {
      const capScore = (key, maxCap, reason) => {
        if (defaults.scores[key].score > maxCap) {
          defaults.scores[key].score = maxCap;
          defaults.scores[key].reason = reason;
        }
      };

      const domainLabel = detectedDomain.replace(/_/g, ' ');
      capScore('keyword_match', 30, `Resume lacks core ${domainLabel} keywords. Found only ${coreSkillsFound} out of ${domainConfig.minCoreSkillsNeeded} required core skills.`);
      capScore('skills_alignment', 30, `Technical skillset does not align with the specialized requirements of ${domainLabel}.`);
      
      const isStudent = /student|fresher|pre-final/i.test(defaults.candidate_experience_years);
      const expCap = isStudent ? 20 : 35;
      capScore('experience_match', expCap, `No demonstrable experience in the ${domainLabel} domain.`);

      const missingCore = domainConfig.coreSkills.filter(skill => !hasKeyword(resumeLower, skill));
      if (!data.keywords) data.keywords = { found: [], missing: [], bonus: [] };
      if (!Array.isArray(data.keywords.missing)) data.keywords.missing = [];
      
      missingCore.slice(0, 8).forEach(m => {
        const readable = m.charAt(0).toUpperCase() + m.slice(1);
        if (!data.keywords.missing.includes(readable)) {
          data.keywords.missing.push(readable);
        }
      });

      defaults.issues.push({
        severity: 'critical',
        title: `Technical Domain Mismatch (${domainLabel})`,
        description: `The resume demonstrates strong skills in other areas, but lacks the specialized ${domainLabel} foundation required for professional roles in this domain.`
      });

      defaults.suggestions.push({
        priority: 'high',
        category: 'Experience & Certs',
        title: `Acquire ${domainLabel} Certifications`,
        action: `To bridge the technical gap, consider gaining industry-standard certifications such as ${detectedDomain === 'cybersecurity' ? 'CompTIA Security+, CEH, or CISSP-Associate' : detectedDomain === 'machine_learning' ? 'AWS Machine Learning Specialty or Google Professional ML Engineer' : 'relevant domain-specific certifications'} and building targeted projects.`
      });

      const weights = {
        keyword_match: 0.25, skills_alignment: 0.20, format_ats: 0.15,
        experience_match: 0.15, impact_results: 0.15, education_match: 0.10
      };
      let recalc = 0;
      Object.keys(weights).forEach(k => { recalc += (defaults.scores[k].score * weights[k]); });
      finalScore = Math.round(recalc);
    }
  }

  const finalVerdict = finalScore >= 85 ? 'Excellent' : finalScore >= 75 ? 'Strong' : finalScore >= 60 ? 'Good' : finalScore > 40 ? 'Fair' : 'Poor';

  const found = Array.isArray(data?.keywords?.found) ? [...new Set(data.keywords.found.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];
  let missing = Array.isArray(data?.keywords?.missing) ? [...new Set(data.keywords.missing.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];
  const bonus = Array.isArray(data?.keywords?.bonus) ? [...new Set(data.keywords.bonus.flatMap(k => typeof k === 'string' ? k.split(/[,;]/).map(s => s.trim()) : []).filter(Boolean))] : [];

  const categoryMap = {
    'Databases': ['mysql', 'mongodb', 'postgresql', 'oracle', 'sql', 'nosql', 'firebase', 'sqlite', 'redis'],
    'Backend Frameworks': ['node.js', 'express.js', 'django', 'flask', 'spring boot', 'fastapi', 'rails', 'php', 'laravel'],
    'Frontend Frameworks': ['react', 'angular', 'vue', 'next.js', 'svelte', 'tailwind', 'bootstrap', 'material-ui', 'chakra-ui'],
    'Cloud/Infrastructure': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'vercel', 'heroku'],
    'Security Tools': ['nmap', 'wireshark', 'metasploit', 'burp suite', 'soc', 'siem', 'penetration testing', 'kali linux', 'firewall']
  };

  const foundLower = found.map(f => f.toLowerCase());

  Object.values(categoryMap).flat().forEach(tech => {
    if (hasKeyword(resumeLower, tech) && !foundLower.some(f => f.includes(tech))) {
      found.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      foundLower.push(tech);
    }
  });

  const verifiedMissing = [];
  missing.forEach(m => {
    if (hasKeyword(resumeLower, m)) {
      if (!foundLower.includes(m.toLowerCase().trim())) {
        found.push(m);
        foundLower.push(m.toLowerCase().trim());
      }
    } else {
      verifiedMissing.push(m);
    }
  });

  const finalMissing = verifiedMissing.filter(m => {
    const mLower = m.toLowerCase().trim();
    for (const [cat, children] of Object.entries(categoryMap)) {
      if (mLower === cat.toLowerCase() || mLower.includes(cat.toLowerCase()) || cat.toLowerCase().includes(mLower)) {
        if (children.some(child => foundLower.some(f => f.includes(child)))) {
          return false;
        }
      }
    }
    return !foundLower.includes(mLower);
  });

  return {
    ...defaults,
    ...data,
    overall_score: finalScore,
    verdict: finalVerdict,
    scores: defaults.scores,
    keywords: {
      found: [...new Set(found)],
      missing: [...new Set(finalMissing)],
      bonus: [...new Set(bonus)]
    }
  };
}

module.exports = {
  normalizeAnalysis
};
