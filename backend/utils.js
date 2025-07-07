const fetch = require('node-fetch');

/**
 * Calls the Gemini API with the provided prompt.
 * @param {string} prompt The prompt to send to the Gemini API.
 * @returns {Promise<any>} The response from the Gemini API.
 */
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Safely access the nested text property
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      return text;
    } else {
      console.error('Unexpected Gemini API response structure:', JSON.stringify(data, null, 2));
      return ''; // Return an empty string if the structure is not as expected
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

module.exports = { callGeminiAPI };