export default function handler(req, res) {
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const { role, seniority, jdText, cvText } = req.body;

      // Simple validation
      if (!role || !seniority || !jdText || !cvText) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Return working interview questions
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
              },
              {
                q: "Describe a project where you had to learn a new technology quickly.",
                why_it_matters: "Demonstrates adaptability and learning agility.",
                what_good_sounds_like: "Clear example with timeline, challenges, and successful outcome."
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
              },
              {
                q: "How do you approach debugging a complex issue?",
                why_it_matters: "Shows systematic thinking and troubleshooting skills.",
                what_good_sounds_like: "Structured approach with specific techniques and tools used."
              }
            ]
          },
          {
            name: "Communication & Collaboration",
            questions: [
              {
                q: "Tell me about a time you had to explain a technical concept to a non-technical person.",
                why_it_matters: "Tests communication skills and ability to work with diverse teams.",
                what_good_sounds_like: "Clear example with specific techniques used to simplify complex topics."
              },
              {
                q: "Describe a situation where you disagreed with a team member. How did you handle it?",
                why_it_matters: "Assesses conflict resolution and teamwork skills.",
                what_good_sounds_like: "Professional approach focusing on the issue, not the person."
              }
            ]
          }
        ],
        bonus: {
          red_flags: ["No specific examples provided", "Vague responses", "Unable to explain technical concepts"],
          homework_prompt: "Please prepare a technical demonstration of your skills relevant to this role."
        }
      };

      res.status(200).json(response);
      return;

    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
      return;
    }
  }

  // Handle other methods
  res.status(405).json({ error: 'Method not allowed' });
}
