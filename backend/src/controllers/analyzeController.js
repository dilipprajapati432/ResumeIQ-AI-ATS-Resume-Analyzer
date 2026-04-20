const { extractTextFromFile } = require('../services/fileService');
const { analyzeWithGemini, analyzeWithGroq } = require('../services/aiService');

const analyzeResume = async (req, res) => {
  try {
    let txt = req.body.resumeText || '';
    if (req.file) txt = await extractTextFromFile(req.file);
    const jd = req.body.jobDescription || '';

    if (!txt.trim() || !jd.trim()) return res.status(400).json({ error: 'Data missing' });

    console.log(`📩 Request: Resume(${txt.length}b), JD(${jd.length}b)`);

    const models = [
      process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash'
    ];

    let lastError = null;
    for (const m of models) {
      try {
        const data = await analyzeWithGemini(txt, jd, m);
        console.log(`✅ Success with ${m}`);
        return res.json({ success: true, data });
      } catch (e) {
        lastError = e.message || e;
        console.error(`❌ Gemini ${m} failed:`, lastError);
        if (lastError.includes('429') || lastError.includes('quota')) break;
      }
    }

    try {
      console.log(`📡 Falling back to Groq...`);
      const data = await analyzeWithGroq(txt, jd);
      return res.json({ success: true, data });
    } catch (e) {
      console.error('❌ Groq failed:', e.message || e);
      res.status(500).json({ error: 'AI models busy. Please wait 1-2 minutes.', details: lastError });
    }

  } catch (err) {
    console.error('System failure:', err);
    res.status(500).json({ error: 'System busy. Try again later.' });
  }
};

module.exports = {
  analyzeResume
};
