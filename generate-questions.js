export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { role, seniority, jdText, cvText } = req.body;

    // Simple validation
    if (!role || !seniority || !jdText || !cvText) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // For now, return a simple response to test the API
    const response = {
      categories: [
        {
          name: "Technical Skills",
          questions: [
            {
              q: "Can you walk me through your experience with the technologies mentioned in the job description?",
              why_it_matters: "This helps assess the candidate's hands-on experience with relevant technologies.",
              what_good_sounds_like: "A good answer would include specific examples, challenges faced, and solutions implemented."
            },
            {
              q: "How do you stay updated with the latest developments in your field?",
              why_it_matters: "Shows the candidate's commitment to continuous learning and professional growth.",
              what_good_sounds_like: "Mentions specific resources, communities, or practices they follow."
            }
          ]
        },
        {
          name: "Problem Solving",
          questions: [
            {
              q: "Describe a challenging technical problem you solved recently.",
              why_it_matters: "Demonstrates analytical thinking and problem-solving approach.",
              what_good_sounds_like: "Clear problem description, approach taken, and outcome achieved."
            }
          ]
        }
      ],
      bonus: {
        red_flags: ["No specific examples provided", "Vague responses"],
        homework_prompt: "Please prepare a technical demonstration of your skills."
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
