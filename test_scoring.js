const fs = require('fs');
require('dotenv').config({ path: 'backend/.env' });
const { analyzeWithGemini } = require('./backend/src/services/aiService');

const resume = `
Profile
Seeking a challenging position as a Machine Learning Engineer...
Experience
Machine Learning Engineer Wiseyak Inc
- Spearheaded the rapid development of a versatile API...
- Led the fine-tuning of the Whisper largeV3 Model...
Data Science Intern Prodigy InfoTech
Machine Learning Engineer Varcons PVT LTD
Education
Bachelor of Computer Science Engineering with a CGPA of 8.7/10.
Technical Experience
Project
Chat With PDF
APS Failure Detection
Technical Stack
DS/ML/AI; Python,Langchain, ANN/CNN techniques, Transfer Learnings, ViT transformers etc.
Python Framework/Modules; Sklearn, Pytorch, keras, Numpy, Pandas, Opencv, NLTK, LLMs,
`;

const jd = `Machine Learning Engineer`;

analyzeWithGemini(resume, jd, 'gemini-1.5-flash').then(data => {
  console.log(JSON.stringify(data.scores, null, 2));
  console.log('Overall Score:', data.overall_score);
}).catch(console.error);
