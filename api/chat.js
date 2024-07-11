const express = require('express');
const cors = require('cors');
const { OpenAIApi, Configuration } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;

const configuration = new Configuration({
  apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  console.log('Received request to /api/chat');
  const { message } = req.body;

  if (!message) {
    console.error('Message is required');
    return res.status(400).send({ error: 'Message is required' });
  }

  if (!apiKey) {
    console.error('OpenAI API key is missing');
    return res.status(500).send({ error: 'Internal Server Error: API key is missing' });
  }

  try {
    console.log('Sending request to OpenAI API with message:', message);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: message }],
    });

    console.log('Received response from OpenAI API');
    const botMessage = completion.data.choices[0].message.content;
    res.send({ botMessage });
  } catch (error) {
    console.error('Error when calling OpenAI API:', error);
    res.status(500).send({ error: 'Error fetching response from OpenAI' });
  }
});

app.get('/api/health', (req, res) => {
  res.send('Server is running');
});

module.exports = app;
