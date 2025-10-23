export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.role || !body.seniority || !body.jdText || !body.cvText) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
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
            }
          ]
        }
      ],
      bonus: {
        red_flags: ["No specific examples provided"],
        homework_prompt: "Please prepare a technical demonstration of your skills."
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
