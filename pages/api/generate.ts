import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getReleases = async (repo: string) => {
  // get releases from github with token
  const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    headers: {
      Authorization: `Bearer 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`,
    },
  });

  // get releases from github without token
  const data = await res.json();
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
  return data
    .filter((release) => new Date(release.published_at) > threeDaysAgo)
    .map(
      (release) => `
  ${release.name}
  ${release.body}
  `
    )
    .join("\n\n");
};

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const unguessApi = await getReleases("Appquality/unguess-api");
  const unguessReact = await getReleases("AppQuality/unguess-react");

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: generatePrompt(`
${unguessApi}
${unguessReact}
      `),
        },
      ],
    });
    const result = completion.data.choices[0].message?.content;

    const rapSong = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: generatePrompt(`
${unguessApi}
${unguessReact}
      `),
        },
        {
          role: "assistant",
          content: result || "",
        },
        { role: "user", content: "Great, now write a rap song about it" },
      ],
    });
    const rapResult = rapSong.data.choices[0].message?.content;

    res.status(200).json({
      result: `
${result}

Here's a rap song about it:
${rapResult}
      `,
    });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(text: string) {
  return `
  This is a list of commits for the last release of unguess-api and unguess-react.
  
  ${text}

  Generate a description of 800 words for this release catered to a sales team
  `;
}
