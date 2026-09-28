const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const adminPassword = process.env.ADMIN_PASSWORD || 'Jimmy123';
const dataFile = path.join(__dirname, 'data', 'portfolio.json');

app.use(express.json({ limit: '1mb' }));

function defaultData() {
  return {
    site: {
      brand: 'Alex Morgan',
      github: 'github.com/alexmorgan',
      githubUrl: 'https://github.com/alexmorgan'
    },
    hero: {
      eyebrow: 'Data Analyst • Storyteller',
      title: 'I turn raw data into business momentum.',
      description: 'I help teams make faster, smarter decisions by combining advanced analytics, clear dashboards, and operational insight. My work bridges data strategy and business execution across product, marketing, and operations.'
    },
    profile: {
      name: 'Alex Morgan',
      image: './dummy-profile.jpg',
      githubText: 'github.com/alexmorgan',
      githubUrl: 'https://github.com/alexmorgan'
    },
    stats: [
      { value: '5+', label: 'Years experience' },
      { value: '40+', label: 'Dashboards shipped' },
      { value: '$2.4M', label: 'Revenue impact' }
    ],
    summary: {
      title: 'Professional Summary',
      text: 'I design meaningful analytics systems that help teams see trends, act on opportunities, and build confidence in decision-making. My expertise sits at the intersection of SQL, business intelligence, marketing analytics, and experimentation.'
    },
    skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'A/B Testing', 'Forecasting'],
    contact: {
      email: 'alex.morgan@email.com',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/alexmorgan',
      phone: '+1 (415) 224-9901'
    },
    experience: [
      {
        period: '2024 — Present',
        title: 'Lead Analytics Architect — FinTech Corp',
        text: 'Leading the design of cloud-based forecasting, self-serve dashboards, and executive insight systems across the organization.'
      },
      {
        period: '2021 — 2024',
        title: 'Senior Data Analyst — E-Commerce Global',
        text: 'Partnered with marketing and product teams to optimize performance reporting, lifecycle analysis, and experimentation loops.'
      },
      {
        period: '2018 — 2021',
        title: 'Data Analyst — Retail Insights',
        text: 'Delivered actionable business intelligence for sales, inventory, and customer behavior, supporting strategic planning.'
      }
    ]
  };
}

function readPortfolioData() {
  try {
    const fileContents = fs.readFileSync(dataFile, 'utf8');
    if (!fileContents.trim()) return defaultData();
    return JSON.parse(fileContents);
  } catch (error) {
    return defaultData();
  }
}

function writePortfolioData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('/api/portfolio', (_req, res) => {
  res.json(readPortfolioData());
});

app.post('/api/portfolio', (req, res) => {
  const { password, data } = req.body || {};

  if (password !== adminPassword) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ ok: false, message: 'Invalid payload' });
  }

  writePortfolioData(data);
  return res.json({ ok: true, message: 'Portfolio updated successfully' });
});

app.get('/admin', (_req, res) => {
  const adminHtmlPath = path.join(__dirname, 'public', 'admin.html');
  const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
  const injectedHtml = adminHtml.replace(
    '</head>',
    `  <script>window.ADMIN_PASSWORD = ${JSON.stringify(adminPassword)};</script>\n</head>`
  );
  res.send(injectedHtml);
});

app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Portfolio Admin API running on http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/portfolio`);
  console.log(`Admin: http://localhost:${port}/admin`);
});
