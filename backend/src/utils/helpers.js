/**
 * Sanitizes experience tags to ensure they are short labels, not sentences.
 */
function sanitizeExpTag(val) {
  if (!val || typeof val !== 'string') return 'Not Specified';
  const clean = val.trim();
  if (clean.split(/\s+/).length <= 4) return clean;
  const patterns = [
    /(\d+\s*[-–to]+\s*\d+\s*years?)/i,
    /(\d+\+?\s*years?)/i,
    /(fresher|student|pre-final|entry\s*level|intern)/i,
  ];
  for (const p of patterns) {
    const match = clean.match(p);
    if (match) return match[1];
  }
  return clean.split(/\s+/).slice(0, 3).join(' ');
}

/**
 * Helper to check if a keyword exists as a discrete word/term in a text
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(textLower, keyword) {
  let kw = keyword.toLowerCase().trim();
  const synonymMap = {
    'react.js': ['react', 'reactjs'],
    'reactjs': ['react', 'react.js'],
    'react': ['react.js', 'reactjs'],
    'node.js': ['node', 'nodejs'],
    'nodejs': ['node', 'node.js'],
    'node': ['node.js', 'nodejs'],
    'express.js': ['express', 'expressjs'],
    'expressjs': ['express', 'express.js'],
    'express': ['express.js', 'expressjs'],
    'vue.js': ['vue', 'vuejs'],
    'vue': ['vue.js', 'vuejs'],
    'next.js': ['next', 'nextjs'],
    'next': ['next.js', 'nextjs'],
    'javascript': ['js'],
    'js': ['javascript'],
    'typescript': ['ts'],
    'ts': ['typescript'],
    'html5': ['html'],
    'css3': ['css'],
    'postgres': ['postgresql'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services'],
    'amazon web services': ['aws'],
    'gcp': ['google cloud platform'],
    'google cloud': ['gcp', 'google cloud platform'],
  };

  if (!kw) return false;
  
  let keywordsToCheck = [kw];
  if (synonymMap[kw]) {
    keywordsToCheck = keywordsToCheck.concat(synonymMap[kw]);
  }

  for (let k of keywordsToCheck) {
    const escaped = escapeRegExp(k);
    if (new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(textLower)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  sanitizeExpTag,
  escapeRegExp,
  hasKeyword
};
