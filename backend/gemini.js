// import axios from "axios"
// const geminiResponse=async (command,assistantName,userName)=>{
// try {
//     const apiUrl=process.env.GEMINI_API_URL
//     const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
// You are not Google. You will now behave like a voice-enabled assistant.

// Your task is to understand the user's natural language input and respond with a JSON object like this:

// {
//   "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show"
//   ,
//   "userInput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,

//   "response": "<a short spoken response to read out loud to the user>"
// }

// Instructions:
// - "type": determine the intent of the user.
// - "userinput": original sentence the user spoke.
// - "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

// Type meanings:
// - "general": if it's a factual or informational question. aur agar koi aisa question puchta hai jiska answer tume pata hai usko bhi general ki category me rakho bas short answer dena
// - "google-search": if user wants to search something on Google .
// - "youtube-search": if user wants to search something on YouTube.
// - "youtube-play": if user wants to directly play a video or song.
// - "calculator-open": if user wants to  open a calculator .
// - "instagram-open": if user wants to  open instagram .
// - "facebook-open": if user wants to open facebook.
// -"weather-show": if user wants to know weather
// - "get-time": if user asks for current time.
// - "get-date": if user asks for today's date.
// - "get-day": if user asks what day it is.
// - "get-month": if user asks for the current month.

// Important:
// - Use ${userName} agar koi puche tume kisne banaya 
// - Only respond with the JSON object, nothing else.


// now your userInput- ${command}
// `;





//     const result=await axios.post(apiUrl,{
//     "contents": [{
//     "parts":[{"text": prompt}]
//     }]
//     })
// return result.data.candidates[0].content.parts[0].text
// } catch (error) {
//     console.log(error)
// }
// }

// export default geminiResponse




import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiUrl) {
      throw new Error("GEMINI_API_URL is missing in .env");
    }

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.
You are not Google. You are a voice-enabled personal assistant.

Understand the user's natural language and return ONLY a valid JSON object.

Required JSON format:

{
  "type": "general",
  "userInput": "",
  "response": ""
}

Allowed "type" values:

- "general"
- "google-search"
- "youtube-search"
- "youtube-play"
- "get-time"
- "get-date"
- "get-day"
- "get-month"
- "calculator-open"
- "instagram-open"
- "facebook-open"
- "weather-show"

Rules:

1. "general"
   Use this for normal questions, conversations, greetings,
   and factual questions that you can answer.

2. "google-search"
   Use this when the user asks to search something on Google.
   userInput must contain ONLY the search query.

3. "youtube-search"
   Use this when the user asks to search something on YouTube.
   userInput must contain ONLY the search query.

4. "youtube-play"
   Use this when the user directly asks to play a song/video.
   userInput must contain ONLY the song/video name.

5. "calculator-open"
   Use this when the user asks to open a calculator.

6. "instagram-open"
   Use this when the user asks to open Instagram.

7. "facebook-open"
   Use this when the user asks to open Facebook.

8. "weather-show"
   Use this when the user asks about weather.

9. "get-time"
   Use this when the user asks for the current time.

10. "get-date"
    Use this when the user asks for today's date.

11. "get-day"
    Use this when the user asks what day it is.

12. "get-month"
    Use this when the user asks for the current month.

Important:

- If the user says your assistant name, remove the assistant name
  from userInput.
- For Google or YouTube searches, userInput must contain ONLY
  the actual search text.
- Keep response short and voice-friendly.
- If the user asks "who created you" or "who made you",
  mention that you were created by ${userName}.
- Return ONLY JSON.
- Do NOT use markdown.
- Do NOT wrap JSON inside \`\`\`json.
- Do NOT add explanations before or after the JSON.

Examples:

User: "what time is it"
{
  "type": "get-time",
  "userInput": "what time is it",
  "response": "Let me check the current time."
}

User: "search React tutorials on Google"
{
  "type": "google-search",
  "userInput": "React tutorials",
  "response": "Sure, I'll search Google for that."
}

User: "play Arijit Singh songs"
{
  "type": "youtube-play",
  "userInput": "Arijit Singh songs",
  "response": "Sure, playing it on YouTube."
}

User: "open Instagram"
{
  "type": "instagram-open",
  "userInput": "open Instagram",
  "response": "Opening Instagram."
}

User: "who made you"
{
  "type": "general",
  "userInput": "who made you",
  "response": "${userName} created me."
}

Now process this user input:

${command}
`;

    const result = await axios.post(
      apiUrl,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        timeout: 30000,
      }
    );

    const text =
      result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error(
        "Gemini returned an empty response:",
        JSON.stringify(result?.data, null, 2)
      );

      return {
        type: "general",
        userInput: command,
        response: "Sorry, I could not understand that.",
      };
    }

    let cleanedText = text.trim();

    // Remove markdown code fences if Gemini returns them anyway.
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Gemini returned invalid JSON:");
      console.error(cleanedText);

      return {
        type: "general",
        userInput: command,
        response: cleanedText,
      };
    }

    return {
      type: parsedResponse.type || "general",
      userInput: parsedResponse.userInput || command,
      response:
        parsedResponse.response ||
        "Sorry, I could not understand that.",
    };
  } catch (error) {
    console.error("========== GEMINI API ERROR ==========");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(
        "Response:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Message:", error.message);
    }

    console.error("======================================");

    // IMPORTANT:
    // Never return undefined. This prevents:
    // "Cannot destructure property 'type' of 'data' as it is undefined"
    return {
      type: "general",
      userInput: command,
      response:
        "Sorry, I am having trouble connecting to my AI service.",
    };
  }
};

export default geminiResponse;

