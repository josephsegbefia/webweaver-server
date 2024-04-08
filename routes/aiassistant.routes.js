const mongoose = require('mongoose');
const router = require('express').Router();
// const { Schema, model } = mongoose;
const { isAuthenticated } = require('../middleware/jwt.middleware');
const OpenAIApi  = require("openai");

// const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi( { apiKey: process.env.OPENAI_API_KEY } );



// async function runCompletion(prompt) {
//   const systemMessage = {
//     role: 'system',
//     content: `You will be provided with a basic portfolio of a job seeker,
//     including his name, email, phone and skills. Craft a basic universal
//     resume for him as a junior software developer.`
//   }

//   const userMessage = {
//     role: 'user',
//     content: "Who are you?",
//   }

//   const messages = [systemMessage, userMessage];

//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: messages,
//       temperature: 0,
//       max_tokens: 500,
//       top_p: 1,
//       frequency_penalty: 1,
//       presence_penalty: 0,
//     });

//     console.log("Model Response", response.data.choices[0].message.content);
//     const useableResponse = response.data.choices[0].message.content;
//     return useableResponse;
//   }catch(error){
//     console.error(
//       "Error sending the message to the AI:", error.message
//     )
//   }
// }

// async function main(firstName, lastName, email, skills, jobTitle, jobDescription, gitHubURL, linkedInURL, bio, phone) {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content:`Use the provided information to create a formatted CV for the candidate. Ensure that each section is properly labeled and formatted for readability. Follow the guidelines below:
//     Ensure that each section is correctly spaced and formatted. Remove any unnecessary line breaks or bullet points from the final result.
//     - Follow this format:
//     "#Name: ${name}
//     #Email: ${email}
//     #Skills: ${skills}
//     #Job Title: ${job_title}
//      return it as a json` }],
//     model: "gpt-3.5-turbo",
//   });

//   return completion

//   // const cv = completion.data.choices[0].message["content"].split("\n");
//   // console.log("cv:", cv);
//   // return cv;
// }

async function main(firstName, lastName, email, skills, jobTitle, jobDescription, gitHubURL, linkedInURL, bio, phone) {
  const prompt = `Use the provided information to create a formatted CV for the candidate. Ensure that each section is properly labeled and formatted for readability. Follow the guidelines below:\n\n- Follow this format:\n  "#Name: ${firstName} ${lastName}\n  #Email: ${email}\n  #Skills: ${skills}\n  #Job Title: ${jobTitle}"`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  // Process the completion to remove unnecessary line breaks

  const formattedCV = completion.aiResponse.choices[0].message.content.replace(/\n+/g, '\n');

  return formattedCV;
}

router.post('/ai-assistant', async (req, res, next) => {
  try {
    const {firstName, lastName, email, skills, jobTitle, jobDescription, gitHubURL, linkedInURL, bio, phone} = req.body;
    const aiResponse = await main(firstName, lastName, email, skills, jobTitle, jobDescription, gitHubURL, linkedInURL, bio, phone);
    console.log("AI Response:", aiResponse);

    if(!aiResponse){
      return res.status(400).json({ success: false, error: "Something went wrong."})
    }
    return res.status(200).json({ success: true, aiResponse });
  }catch(error){
    console.error(error);
    return res.status(500).json({ success: false, error: "Something went wrong"})
  }
})

module.exports = router;
