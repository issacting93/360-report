const chartData = {
  highly_motivated: {
    "Background": { score: 4.8 },
    "Education History": { score: 4.5 },
    "Job Expectations": { score: 4.7 },
    "Market Relevance and Job Readiness": { score: 4.9 },
    "Mindset": { score: 4.6 },
    "Proactivity in Upskilling and Job Search": { score: 5.0 }
  },
  struggling_users: {
    "Background": { score: 2.0 },
    "Education History": { score: 2.0 },
    "Job Expectations": { score: 1.5 },
    "Market Relevance and Job Readiness": { score: 1.0 },
    "Mindset": { score: 1.5 },
    "Proactivity in Upskilling and Job Search": { score: 1.8 }
  },
  in_transition: {
    "Background": { score: 3.5 },
    "Education History": { score: 3.0 },
    "Job Expectations": { score: 2.8 },
    "Market Relevance and Job Readiness": { score: 2.5 },
    "Mindset": { score: 3.0 },
    "Proactivity in Upskilling and Job Search": { score: 3.5 }
  }
};

let selectedChart = 'highly_motivated';

const size = 400;
const centerX = size / 2;
const centerY = size / 2;
const maxValue = 5;

const getCoordinates = (index, value) => {
  const angle = (Math.PI / 3) * index - Math.PI / 2;
  const x = centerX + (value / maxValue) * (size / 2 - 20) * Math.cos(angle);
  const y = centerY + (value / maxValue) * (size / 2 - 20) * Math.sin(angle);
  return { x, y };
};

const renderChart = (data) => {
  const chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = '';

  const dimensions = Object.keys(data);
  const points = dimensions.map((dim, index) => getCoordinates(index, data[dim].score));
  const pathData = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`).join(' ') + 'Z';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', centerX);
  circle.setAttribute('cy', centerY);
  circle.setAttribute('r', size / 2 - 10);
  circle.setAttribute('fill', '#f0f0f0');
  svg.appendChild(circle);

  for (let value = 1; value <= 5; value++) {
    const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const gridPathData = dimensions.map((_, index) => {
      const { x, y } = getCoordinates(index, value);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ') + 'Z';
    gridPath.setAttribute('d', gridPathData);
    gridPath.setAttribute('fill', 'none');
    gridPath.setAttribute('stroke', '#ccc');
    gridPath.setAttribute('stroke-width', '1');
    svg.appendChild(gridPath);
  }

  dimensions.forEach((_, index) => {
    const { x, y } = getCoordinates(index, maxValue);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', x);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#999');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  const dataPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  dataPath.setAttribute('d', pathData);
  dataPath.setAttribute('fill', 'rgba(255, 99, 132, 0.2)');
  dataPath.setAttribute('stroke', 'rgb(255, 99, 132)');
  dataPath.setAttribute('stroke-width', '2');
  svg.appendChild(dataPath);

  dimensions.forEach((dim, index) => {
    const { x, y } = getCoordinates(index, maxValue + 0.5);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '12');
    text.textContent = dim;
    svg.appendChild(text);

    const scoreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    scoreText.setAttribute('x', x);
    scoreText.setAttribute('y', y + 15);
    scoreText.setAttribute('text-anchor', 'middle');
    scoreText.setAttribute('dominant-baseline', 'middle');
    scoreText.setAttribute('font-size', '10');
    scoreText.setAttribute('fill', 'rgb(255, 99, 132)');
    scoreText.textContent = data[dim].score.toFixed(2);
    svg.appendChild(scoreText);
  });

  chartContainer.appendChild(svg);
};

document.querySelectorAll('input[name="chart"]').forEach((input) => {
  input.addEventListener('change', (event) => {
    selectedChart = event.target.value;
    renderChart(chartData[selectedChart]);
  });
});

renderChart(chartData[selectedChart]);

const chatOutput = document.getElementById('chat-output');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', async () => {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage('User', userMessage);
  userInput.value = '';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Analyze this JSON data. Provide a detailed explanation of how the individual items in each dimension affect the score. The explanation should include possible reasons for the positive or negative impact on the score and suggest interventions to help improve the job seeker's chances of reemployment.

        Here's what you'll get:
        1. Analysis of Each Dimension: An explanation of how individual items in the dimensions affect the score.
        2. Possible Reasons: Insights into why these features have a positive or negative impact.
        3. Interventions: Suggestions on how job seekers can improve their scores and increase their chances of finding employment.

        JSON Data:
        ${JSON.stringify(chartData[selectedChart])}`
      })
    });

    const data = await response.json();
    if (data.error) {
      appendMessage('ChatGPT', 'Error: ' + data.error);
    } else {
      appendMessage('ChatGPT', data.botMessage);
    }
  } catch (error) {
    appendMessage('ChatGPT', 'Error: Could not connect to the server.');
  }
});

function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatOutput.appendChild(messageElement);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}
