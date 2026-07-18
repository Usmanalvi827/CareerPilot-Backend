const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const InterviewSchema = z.object({
  matchScore: z.number().min(0).max(100),

  title: z.string().describe("The title of the job for which the interview report is generated"),

  technicalQuestionSchema: z
    .array(
      z.object({
        Question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .length(5),

  behavioralQuestionSchema: z
    .array(
      z.object({
        Question: z.string(),
        intention: z.string(),
        answer: z.string(),
      }),
    )
    .length(5),

  skillGap: z.array(
    z.object({
      skills: z.string(),
      severity: z.enum(["Low", "Medium", "High"]),
    }),
  ),

  preparationPlan: z
    .array(
      z.object({
        day: z.number(),
        foucus: z.string(),
        task: z.array(z.string()).length(3),
      }),
    )
    .length(7),
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert Technical Interviewer, Senior Software Engineer, HR Recruiter, and Career Coach.

Analyze the following information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Your tasks are:

1. Calculate a match score (0-100).
2. Generate exactly 5 technical interview questions.
3. Generate exactly 5 behavioral interview questions.
4. Identify the candidate's skill gaps.
5. Create a 7-day interview preparation plan.

Rules:

- Technical questions must be based on the Job Description.
- Behavioral questions should evaluate communication, teamwork, leadership, ownership and problem solving.
- Every question must include:
  - Question
  - intention
  - answer
- Each preparation day must contain exactly 3 tasks.
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanations.
- Follow the provided JSON schema exactly.
`;

  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log("Before Gemini API");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: z.toJSONSchema(InterviewSchema),
        },
      });
      console.log("After Gemini API");

      // console.log(response);

      // console.log("RESPONSE TEXT ===>>");
      console.log(response.text);

      // console.log("RESPONSE TYPE ===>>");
      // console.log(typeof response.text);

      // Uncomment this after checking the response
      return JSON.parse(response.text);

      // return response.text;
    } catch (error) {
      console.log(`Attempt ${attempt} failed`);

      if (error.status === 503 && attempt < MAX_RETRIES) {
        const wait = attempt * 3000;
        console.log(`Retrying in ${wait / 1000} seconds...`);
        await delay(wait);
        continue;
      }

      throw error;
    }
  }
}


async function generateTailoredResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert ATS Resume Writer.

Using ONLY the information below, create a professional resume.

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Rules:

- Do NOT invent experience.
- Do NOT invent companies.
- Do NOT invent projects.
- Do NOT invent dates.
- Improve wording only.
- Tailor the resume to the job description.
- Return ONLY a complete HTML document.

HTML Requirements:

- Start with <!DOCTYPE html>
- Include <html>, <head>, <style>, and <body>.
- Use ONLY inline CSS inside the <style> tag.
- Do NOT use Bootstrap.
- Do NOT use Tailwind.
- Do NOT use JavaScript.
- Do NOT use Google Fonts.
- Do NOT use external CSS.
- Do NOT use images.
- Do NOT use SVG.
- Do NOT use iframes.
- The HTML must be completely self-contained.
- Use Arial font.
- White background.
- Fit on 1–2 A4 pages.

Return HTML only.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

let html = response.text
  .replace(/```html/g, "")
  .replace(/```/g, "")
  .trim();

  

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  return pdfBuffer;
}
module.exports = {generateInterviewReport,generateTailoredResumePdf};
