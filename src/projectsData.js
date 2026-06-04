export const projectsData = {
  // ==================== CUSTOMER BEHAVIOUR ANALYSIS ====================
  rfm_segmentation: {
    structure: 3,
    category: 'Customer Behaviour',
    accent: 'var(--accent-customer)',
    title: 'RFM Segmentation in Ecommerce',
    client: 'EcommerceU (RevoU Labs)',
    timeline: '2023',
    role: 'Data Analyst',
    caseOverview: 'The marketing team at EcommerceU uses a uniform marketing approach across all users. The treatment is the same for everyone, which misses the opportunity to maximize customer value. The objective is to conduct customer segmentation analysis to understand the characteristics of different segments, improve marketing performance, and increase transactions.',
    scopeGoals: 'Create user segmentation for EcommerceU. Analyze user behavior based on Recency, Frequency, and Monetary (RFM) metrics from 2020-2022 data, and create action recommendations for each segment.',
    summary: 'Four customer segments were created: Royal, Absent, Current, and Sleeping. Suggested actions include: pushing notifications for promos/sales/product recommendations aligned with popular visiting times; introducing promo with cashback vouchers; increasing basket size by offering promos with minimum/median purchase requirements; and combining popular products to be bought together.',
    tools: ['Python', 'BigQuery (SQL)', 'Tableau', 'Adobe Illustrator'],
    methodology: [
      { title: 'Business Understanding', desc: 'Gather data from RevoU and define the main problem using Root Cause Analysis.' },
      { title: 'Data Preparation & Cleaning', desc: 'Perform data cleaning and manipulation using BigQuery (SQL).' },
      { title: 'Data Analysis & Modeling', desc: 'Create an RFM Segmentation using Python.' },
      { title: 'Data Visualization', desc: 'Create dashboards in Tableau and custom presentation assets in Illustrator.' }
    ],
    analysisPlaceholder: 'RFM Segment Distribution & Correlation Matrix',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/Segmentationdeck'
  },
  funnel_analysis: {
    structure: 3,
    category: 'Customer Behaviour',
    accent: 'var(--accent-customer)',
    title: 'Funnel Application Journey Analysis',
    client: 'EcommerceU (RevoU Labs)',
    timeline: '2023',
    role: 'Data Analyst',
    caseOverview: 'EcommerceU wants to understand the application journey of its customers during the 2021-2022 period through funnel analysis, since they want to improve user conversion and address specific flow dropouts.',
    scopeGoals: 'Perform Funnel Analysis in Ecommerce Apps. Analyze user behavior based on conversion rates, exit rates, and session durations from 2021-2022 data generally and across segments (Royal, Absent, Current, Sleeping). Create UI/UX improvement recommendations.',
    summary: 'Identified major bottlenecks in the product view and checkout process. Key recommendations include: simplifying the address and payment steps into a single page flow; introducing saved address prioritization; recommending payment methods based on balance; and displaying recommendations based on search history to reduce cancellation rates.',
    tools: ['BigQuery (SQL)', 'Tableau', 'Figma', 'Adobe Illustrator'],
    methodology: [
      { title: 'Business Understanding', desc: 'Explore datasets to understand application flow and user touchpoints.' },
      { title: 'Data Prep & Cleaning', desc: 'Clean and manipulate log datasets using BigQuery (SQL).' },
      { title: 'Data Analysis', desc: 'Execute funnel analytics calculating conversion rates, Exit rates, and average durations.' },
      { title: 'Data Visualization', desc: 'Design UI prototypes in Figma and custom icons for visual recommendations.' }
    ],
    analysisPlaceholder: 'App Conversion Funnel & Exit Rate Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/FunnelDeck'
  },
  market_basket: {
    structure: 3,
    category: 'Customer Behaviour',
    accent: 'var(--accent-customer)',
    title: 'Market Basket Association Rules (Apriori)',
    client: 'EcommerceU (RevoU Labs)',
    timeline: '2023',
    role: 'Data Analyst',
    caseOverview: 'EcommerceU wants to analyze customer purchase combinations during the 2021-2022 period to optimize cross-selling, product placements, and bundle campaigns.',
    scopeGoals: 'Perform purchase behavior and market basket analysis across categories. Identify patterns across customer tiers (Royal, Absent, Current, Sleeping) and propose product bundles.',
    summary: 'Royal and Absent segments frequently redeemed Cashback and Delivery Fee discounts and tended to purchase Clothing and Health & Beauty. Current and Sleeping segments used Delivery Fee discounts and bought Hobbies and Sports Equipment. Proposed targeting product bundles combined with Delivery Fee discounts.',
    tools: ['Python', 'Pandas', 'NumPy', 'Mlxtend (Apriori)'],
    methodology: [
      { title: 'Business Understanding', desc: 'Define target cross-selling metrics and product groupings.' },
      { title: 'Data Preparation', desc: 'Clean and preprocess transaction data using Pandas and NumPy in Python.' },
      { title: 'Data Analysis & Modeling', desc: 'Build association rules utilizing the Apriori algorithm in Python.' },
      { title: 'Recommendation', desc: 'Formulate specific bundling promotions for customer tiers.' }
    ],
    analysisPlaceholder: 'Association Rules Network Graph & Lift Values Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/MBAPythonlink'
  },

  // ==================== END-TO-END ANALYSIS ====================
  nyc_accident: {
    structure: 3,
    category: 'End-to-End Analysis',
    accent: 'var(--accent-customer)',
    title: 'NYC Traffic Accident End-to-End Analysis',
    client: 'NYC Police Department (RevoU Group Project)',
    timeline: '2023',
    role: 'Project Lead',
    caseOverview: 'This project analyzes NYC traffic accidents during Jan-Aug 2020. It evaluates factors driving accidents and casualties, investigating the 70% drop in accidents during the initial COVID-19 lockdown (Jan-Apr) and the subsequent 53% surge in accident frequency once restriction phases eased (May-Aug).',
    scopeGoals: 'Lead the visualization and technical team to map accident frequency and severity, identify contributing factors (causes, vehicle types, street types, and times), and formulate traffic safety policy recommendations.',
    summary: 'Led the team to achieve Top 2 performance in the final group project. Formulated a dual strategy: Internal updates (optimize personnel deployment, GDL/ETLE systems, driving safety education) and External updates (toll/public service infrastructure upgrades).',
    tools: ['BigQuery (SQL)', 'Python (Reverse Geocoding)', 'Google Sheets', 'Tableau', 'Adobe Illustrator'],
    methodology: [
      { title: 'Business Understanding', desc: 'Explore Kaggle dataset to define evaluation goals.' },
      { title: 'Data Prep & Cleaning', desc: 'Clean logs via BigQuery SQL and enrich spatial data (Reverse Geocoding) via Python.' },
      { title: 'Data Analysis', desc: 'Conduct EDA in Tableau to isolate primary accident drivers.' },
      { title: 'Data Visualization', desc: 'Design interactive Tableau dashboards and custom templates.' }
    ],
    analysisPlaceholder: 'Accident Frequency Trend & Causality Analysis Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/DeckTrafﬁcAnalysisDeck'
  },
  annual_report: {
    structure: 3,
    category: 'End-to-End Analysis',
    accent: 'var(--accent-customer)',
    title: 'Company Annual Report Analysis 2021-2022',
    client: 'EcommerceU (RevoU Labs)',
    timeline: '2023',
    role: 'Data Analyst',
    caseOverview: 'EcommerceU experienced a 15.6% drop in GMV (Gross Merchandise Value) from 2021 to 2022. The business needs a comprehensive evaluation of annual company performance to share with key stakeholders and guide future strategy.',
    scopeGoals: 'Evaluate annual performance through funnel activity and basket size, integrate user segmentation models, and propose action plans to increase AOV and customer retention.',
    summary: 'Developed short-term actions (targeted campaigns, cross-selling bundles, loyalty programs) and long-term actions (UI/UX updates to checkout flows) to address cart dropouts and customer retention decay.',
    tools: ['BigQuery (SQL)', 'Python', 'Tableau', 'Figma', 'Adobe Illustrator'],
    methodology: [
      { title: 'Business Understanding', desc: 'Identify core business metrics (GMV, retention, checkout funnels).' },
      { title: 'Data Prep & Cleaning', desc: 'Preprocess large datasets using BigQuery SQL and Python (Pandas/NumPy).' },
      { title: 'Data Analysis & Modeling', desc: 'Run EDA, RFM clustering, and Apriori association rules.' },
      { title: 'Data Visualization', desc: 'Build Tableau dashboards and design presentation deck assets.' }
    ],
    analysisPlaceholder: 'GMV Decay & User Funnel Retention Curves',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/DeckAnnualReportDeck'
  },
  socia_buzz: {
    structure: 3,
    category: 'End-to-End Analysis',
    accent: 'var(--accent-customer)',
    title: 'Popular Category Content & Engagement Analysis',
    client: 'SociaBuzz (Accenture Virtual Experience)',
    timeline: '2023',
    role: 'Data Analyst',
    caseOverview: 'SociaBuzz has scaled rapidly and lacks internal resources to analyze content popularity. The project aims to evaluate content category performance over a 3-month period to identify the top 5 most engaging categories.',
    scopeGoals: 'Analyze SociaBuzz content and user reaction data from June 2020 - June 2021. Identify the top 5 most popular categories and develop content curation and marketing recommendations.',
    summary: 'Identified the top 5 categories: Animals, Science, Healthy Eating, Technology, and Food. Recommended highlighting these categories on the main page, recruiting niche influencers, and encouraging posts during peak engagement times (6-9 AM and 9 PM-12 AM).',
    tools: ['BigQuery (SQL)', 'Excel', 'Tableau', 'Adobe Illustrator'],
    methodology: [
      { title: 'Business Understanding', desc: 'Understand the reaction scoring system and database structures.' },
      { title: 'Data Prep & Cleaning', desc: 'Join content, reaction, and category tables via BigQuery.' },
      { title: 'Data Analysis', desc: 'Aggregate scores to establish category rankings.' },
      { title: 'Data Visualization', desc: 'Create charts and dashboards in Tableau.' }
    ],
    analysisPlaceholder: 'Top Content Categories by Reaction Score',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/DeckAccentureDeck'
  },

  // ==================== MACHINE LEARNING ====================
  f1_predictor: {
    structure: 3,
    category: 'Machine Learning',
    accent: 'var(--accent-ml)',
    title: 'F1 Bayesian Predictor & Live Tracker 2026',
    client: 'Personal Project / GitHub',
    timeline: 'Jan 2026 - Present',
    role: 'Lead ML Engineer',
    caseOverview: 'Predicting qualifying grid rankings and simulating race configurations under the new 2026 F1 regulations is highly complex. Standard methods fail to account for weather uncertainties, dynamic constructor upgrades, and physical track rules.',
    scopeGoals: 'Train a LightGBM LambdaMART ranker on practice timings to predict starting positions, estimate weather-dependent lap thresholds with Bayesian Quantile Regression, and build a vectorized Monte Carlo race simulator (10,000 runs) for race projections.',
    summary: 'Achieved high correlation with actual grids. The physics-based Monte Carlo engine runs stochastically in under 1 second, dynamically enforcing mid-race DNFs, tyre wear rates, and Safety Car probabilities.',
    tools: ['Python', 'LightGBM', 'NumPy', 'SciPy', 'Streamlit', 'FastF1 API'],
    methodology: [
      { title: 'Data Ingestion & Filtering', desc: 'Pull practice timings and tire telemetry using the FastF1 API.' },
      { title: 'Predictive Grid Ranking', desc: 'Execute LightGBM Learning-to-Rank algorithms (85% ranker, 15% practice form).' },
      { title: 'Monte Carlo Race Simulation', desc: 'Simulate 10,000 races stochastically with custom physics and degradation models in NumPy.' }
    ],
    analysisPlaceholder: 'SHAP Feature Importances & Lap Credible Intervals Chart',
    githubLink: 'https://github.com/fbudimannn/F1_PREDICTION',
    liveLink: 'https://f1predict.streamlit.app/'
  },
  kmeans_mutual_fund: {
    structure: 3,
    category: 'Machine Learning',
    accent: 'var(--accent-ml)',
    title: 'K-Means Clustering Analysis in Mutual Fund Company',
    client: 'Mutual Fund Firm (RevoU Labs)',
    timeline: '2023',
    role: 'Data Scientist',
    caseOverview: 'A mutual fund company plans to expand its product offerings to include government bond investments (SBN). The marketing team wants to design a targeted communication campaign, dividing customers into distinct segments to tailor the marketing message.',
    scopeGoals: 'Create client segmentation based on historical balance data from August-September 2021. Analyze user characteristics and balance patterns. Develop actionable marketing strategies for the upcoming SBN campaign.',
    summary: 'Divided clients into 3 clusters: Gold, Silver, and Bronze. Recommended specific advertising, referral cashback models with payment partners, and partnerships with financial platforms (Stockbit) to target the most prospective tiers.',
    tools: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'Seaborn'],
    methodology: [
      { title: 'Business Understanding', desc: 'Understand the marketing parameters and investor demographics.' },
      { title: 'Data Prep & Cleaning', desc: 'Clean and format transaction/balance histories using Pandas.' },
      { title: 'Modeling', desc: 'Evaluate cluster quality using Elbow & Silhouette methods; apply K-Means.' },
      { title: 'Data Visualization', desc: 'Generate scatter plots and distribution charts of clusters.' }
    ],
    analysisPlaceholder: 'Elbow Curve & Silhouette Score Analysis Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/ClustersMutualFund'
  },
  bond_purchasing: {
    structure: 3,
    category: 'Machine Learning',
    accent: 'var(--accent-ml)',
    title: 'Classification Modeling: Logistic Regression on Bond Purchasing',
    client: 'Mutual Fund Firm (RevoU Labs)',
    timeline: '2023',
    role: 'Data Scientist',
    caseOverview: 'Following a September bond campaign, the company decides to run targeted advertising to existing users for a second round of government bonds in October 2022. However, the budget is limited and can only cover ads for 30% of the customer base. The goal is to identify the most prospective 30% of customers.',
    scopeGoals: 'Predict which existing users are most likely to purchase bonds. Provide a list of the top 30% prospective users using September 2021 data. Perform a cost-benefit analysis of the campaign.',
    summary: 'The Logistic Regression model achieved 56% accuracy. Identified 2,544 prospective users representing the top 30% probability pool (above 60% buy probability). Target Audience: 53% are Millennials with incomes of 10-50M IDR. Expected ROI: 2.29 (estimated return of 213,699,000 IDR based on CBA).',
    tools: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Excel'],
    methodology: [
      { title: 'Business Understanding', desc: 'Formulate campaign ROI goals and conversion rate parameters.' },
      { title: 'Data Prep & Cleaning', desc: 'Clean data and construct feature vectors using Pandas.' },
      { title: 'Modeling & Evaluation', desc: 'Train Logistic Regression model, evaluating accuracy via Confusion Matrix.' },
      { title: 'Cost-Benefit Analysis', desc: 'Calculate ROI matrix in Excel based on probability scoring.' }
    ],
    analysisPlaceholder: 'Correlation Heatmap & ROC Curve Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/LogsiticsPythonPython'
  },
  rating_predictions: {
    structure: 3,
    category: 'Machine Learning',
    accent: 'var(--accent-ml)',
    title: 'Hyperparameter Classification Modeling in Rating Predictions',
    client: 'Nile Marketplace (eCommerce Pitch)',
    timeline: '2023',
    role: 'Data Scientist',
    caseOverview: 'Nile, a Brazilian eCommerce marketplace, is selecting a data analytics collaborator to build a model that predicts which customers are likely to leave positive reviews (rating 4-5) on the platform. The company with the highest performing model prototype will win the contract.',
    scopeGoals: 'Build classification models to predict review ratings based on purchase and demographic history. Tune hyperparameter values for both linear and non-linear classifiers. Generate a predicted positive-review candidate list.',
    summary: 'Evaluated multiple classifiers. The best model was Random Forest optimized via Random Search, achieving ~75% average accuracy/recall and 82% recall for positive reviews. The model predicted 81,398 positive-review clients.',
    tools: ['Python', 'Scikit-learn', 'XGBoost', 'Pandas', 'NumPy', 'SHAP'],
    methodology: [
      { title: 'Business Understanding', desc: 'Frame satisfaction indicators and review triggers.' },
      { title: 'Data Prep & Cleaning', desc: 'Preprocess transactional records, text scores, and demographic variables.' },
      { title: 'Modeling & Hyperparameter Tuning', desc: 'Train models and run random search hyperparameter sweeps.' },
      { title: 'Evaluation', desc: 'Evaluate accuracy, recall, ROC-AUC, and extract SHAP feature importances.' }
    ],
    analysisPlaceholder: 'Feature Importance Graph & ROC-AUC Chart',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/PythonlinkPython'
  },

  // ==================== APPLIED AI & INTELLIGENT SYSTEMS ====================
  talent_match: {
    structure: 3,
    category: 'Applied AI',
    accent: 'var(--accent-ai)',
    title: 'Talent Match Intelligence System',
    client: 'Enterprise Sourcing Solution',
    timeline: 'Dec 2025',
    role: 'AI Engineer',
    caseOverview: 'Subjective hiring and manual talent mapping inside organizations leads to role misalignment and high recruiting overheads.',
    scopeGoals: 'Build an end-to-end dashboard that uses LLMs (Llama 3 via OpenRouter) to write structured job descriptions and Key Competencies, connected to a Postgres weighted competency formula query to rank candidates dynamically.',
    summary: 'Eliminated subjective screening. Implemented custom 300+ line SQL matching engine and interactive Plotly radar charts, identifying candidate capabilities and training gaps.',
    tools: ['Python', 'PostgreSQL', 'Supabase', 'Streamlit', 'Plotly', 'Llama 3', 'SQLAlchemy'],
    methodology: [
      { title: 'AI Role Generation', desc: 'LLM prompt pipelines convert simple role inputs into detailed JD & Competency maps.' },
      { title: 'SQL Sourcing Engine', desc: 'Write queries weighting competency fits (67.5%) and contextual factors (17.5%).' },
      { title: 'Gap Mapping', desc: 'Generate radar charts contrasting candidate profiles with target benchmark averages.' }
    ],
    analysisPlaceholder: 'Competency Radar Correlation Chart',
    githubLink: 'https://github.com/fbudimannn/talent-intelligence-system',
    liveLink: 'https://talent-intelligence-system-fakhri.streamlit.app/'
  },
  text_summarization: {
    structure: 3,
    category: 'Applied AI',
    accent: 'var(--accent-ai)',
    title: 'Financial Text Summarization (LLM Fine-tuning)',
    client: 'Academic Research / GitHub',
    timeline: '2025',
    role: 'AI Research Engineer',
    caseOverview: 'Financial documents like SEC 10-K filings are dense and long. Standard summarization models like BART have input limitations (e.g., 1024 tokens) and cannot process long financial documents. Fine-tuning a Longformer Encoder-Decoder (LED) model, which supports up to 16,384 tokens, can improve the quality of long financial report summaries.',
    scopeGoals: 'Parse and preprocess SEC 10-K filings from the EDGAR-CORPUS dataset. Compare model performance (BART vs. base LED vs. fine-tuned LED). Fine-tune an LED model to summarize financial documents.',
    summary: 'Fine-tuned the led-large-book-summary model on financial datasets. The fine-tuned LED model outperformed pre-trained models on ROUGE evaluation metrics. Training Setup: Batch size 1, 3 epochs, AdamW optimizer with 8-bit precision, max input length of 8,000 tokens, global attention enabled on the first token, run on an NVIDIA L4 GPU.',
    tools: ['Python', 'PyTorch', 'Hugging Face', 'BitsAndBytes', 'SEC EDGAR Dataset'],
    methodology: [
      { title: 'Data Preparation', desc: 'Extract and clean SEC 10-K report blocks.' },
      { title: 'Baseline Comparison', desc: 'Evaluate pre-tuned ROUGE scores using BART and base LED models.' },
      { title: 'Fine-Tuning', desc: 'Train the model in PyTorch using FP16 mixed precision on an L4 GPU.' },
      { title: 'Deployment', desc: 'Save and push optimized weights to Hugging Face Model Hub.' }
    ],
    analysisPlaceholder: 'Training Loss Curves & ROUGE Validation Table',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://huggingface.co/fahil2631/led-ﬁnancial_summarization-genai15'
  },
  rag_system: {
    structure: 3,
    category: 'Applied AI',
    accent: 'var(--accent-ai)',
    title: 'Advanced RAG System (Medical PubMed Pipeline)',
    client: 'Clinical Query Solution',
    timeline: '2025',
    role: 'AI Engineer',
    caseOverview: 'Medical research on cardiovascular disease (CVD), stroke, and diabetes grows rapidly, but standard LLMs have knowledge cutoff dates (e.g., late 2023 or mid-2024), preventing clinical practitioners from accessing recent research. This project builds a RAG system to query PubMed articles published between January 2023 and May 2025.',
    scopeGoals: 'Build a document retrieval and question-answering pipeline using PubMed articles. Implement advanced RAG techniques: semantic chunking, hybrid search, and re-ranking. Evaluate the RAG pipeline using the RAGAS framework.',
    summary: 'Integrates semantic chunking, hybrid retrieval (BM25 + BGE dense embeddings), BGE-M3 CrossEncoder re-ranking, and Mistral-7B-Instruct for generation. The RAGAS framework verified retrieval quality and answer accuracy. The system helps clinicians retrieve recent evidence-based answers.',
    tools: ['Python', 'LlamaIndex', 'LangChain', 'BM25', 'BGE Embeddings', 'RAGAS', 'Mistral-7B-Instruct'],
    methodology: [
      { title: 'Document Ingestion', desc: 'Filter PubMed abstracts based on keyword relevance and abstract lengths.' },
      { title: 'Chunking & Indexing', desc: 'Apply semantic chunking to retain clinical context, storing embeddings.' },
      { title: 'Retrieval & Re-ranking', desc: 'Execute hybrid search (BM25 + Dense) and re-rank with BGE CrossEncoder.' },
      { title: 'Evaluation', desc: 'Assess generation faithfulness and answer relevancy via RAGAS.' }
    ],
    analysisPlaceholder: 'RAGAS Score Metrics & Retrieval Fidelity Chart',
    githubLink: 'https://github.com/fbudimannn/ADVANCED_RAG',
    liveLink: 'https://github.com/fbudimannn/ADVANCED_RAG'
  },

  // ==================== DATABASE BUILDING ====================
  e_ticketing_db: {
    structure: 3,
    category: 'Database Building',
    accent: 'var(--accent-db)',
    title: 'E-Ticketing System Database Creation & Normalization',
    client: 'EventsGo Platform',
    timeline: '2023',
    role: 'Database Engineer',
    caseOverview: 'EventsGo is a hypothetical ticketing company seeking to optimize ticket sales and venue allocations. This project builds a synthetic database to support personalized recommendations and audience engagement analytics.',
    scopeGoals: 'Design a relational database schema for an e-ticketing platform. Generate and clean synthetic operational datasets (Users, Venues, Events, Bookings). Extract business insights using intermediate and advanced SQL.',
    summary: 'Designed an ERD and set up relational tables in SQLite. Wrote complex analytical queries (CTEs, joins, subqueries, and window functions) to compute ticket sales trends, venue booking rates, and user retention metrics.',
    tools: ['Mockaroo (Data Gen)', 'SQLite', 'PostgreSQL', 'Tableau', 'Excel'],
    methodology: [
      { title: 'Database Design', desc: 'Construct ERD diagrams and define normalizations (1NF, 2NF, 3NF).' },
      { title: 'Data Generation', desc: 'Generate synthetic datasets mimicking real transaction scales in Mockaroo.' },
      { title: 'SQL Implementation', desc: 'Build tables and run queries inside Google Colab (SQLite).' },
      { title: 'Insights & Dashboards', desc: 'Visualize transaction metrics in Tableau.' }
    ],
    analysisPlaceholder: 'Database ERD Diagram & Table Relationships Schema',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/DatabaseDashboard'
  },

  // ==================== A/B TESTING ====================
  loan_ab_testing: {
    structure: 3,
    category: 'A/B Testing',
    accent: 'var(--accent-ab)',
    title: 'Loan Approval A/B Testing Optimization',
    client: 'Consumer Lending Firm',
    timeline: '2023',
    role: 'Analytics Consultant',
    caseOverview: 'A consumer lending company wants to minimize losses from bad loans and maximize profits from repaid loans. Due to manual processing errors, loan officers are approving bad loans (Type II errors) and rejecting good loans (Type I errors). This experiment evaluates a new predictive model designed to assist loan officers.',
    scopeGoals: 'Evaluate the new predictive model\'s impact on loan approval error rates. Compare control group (using old model) and treatment group (using new model) error rates. Run statistical hypothesis testing to verify the significance of the results.',
    summary: 'The new model reduced bad loan approvals. The treatment group achieved a 16.48% error reduction compared to 1.66% in the control group. Welch\'s t-test confirmed high significance (p-value < 0.001) with a large effect size (Cohen\'s d = 1.18).',
    tools: ['R', 'RStudio', 'ggplot2', 'stats package'],
    methodology: [
      { title: 'Data Cleaning', desc: 'Import officer logs and remove missing or inconsistent variables.' },
      { title: 'Aggregation', desc: 'Group datasets by loan officer and model version (control vs treatment).' },
      { title: 'Statistical Testing', desc: 'Perform Welch\'s t-test and calculate Cohen\'s d effect size in RStudio.' },
      { title: 'Visualization', desc: 'Plot error rate histograms via ggplot2.' }
    ],
    analysisPlaceholder: 'Welch T-Test Output & Cohen\'s d Calculation Summary',
    githubLink: 'https://github.com/fbudimannn',
    liveLink: 'https://intip.in/ABTestingR'
  },

  // ==================== DATA VISUALIZATION ====================
  tata_retail: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'Tata Online Retail Power BI Dashboard',
    client: 'Tata Group Analytics Challenge',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Power BI', 'Excel', 'Data Modeling'],
    description: 'This Power BI dashboard visualizes global online retail transactions. It tracks regional sales metrics, transaction volume, and customer spending habits to help management drive revenue.',
    pages: [
      { name: 'Home Page', purpose: 'Displays high-level operational KPIs: total sales revenue, total transactions, and unique active customers.' },
      { name: 'Geo Map Page', purpose: 'Interactive map displaying global transaction distribution to identify top revenue countries.' },
      { name: 'Customer Activity Page', purpose: 'Tracks customer retention, monthly active trends, and buyer behavior.' }
    ],
    liveLink: 'https://intip.in/PowerBIdashboard'
  },
  revou_labs_kpi: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'RevoU Labs KPI Dashboard',
    client: 'RevoU Apprenticeship Program',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'BigQuery (SQL)', 'Excel'],
    description: 'Developed as part of a RevoU Labs apprenticeship. This dashboard provides tailored views for different organizational tiers (C-level, Mid-level, and Operational) to track core business performance metrics and revenue targets.',
    pages: [
      { name: 'C-Level View', purpose: 'Monitors high-level business KPIs, GMV trends, and annual performance comparisons for executive decision-making.' },
      { name: 'Mid-Level View', purpose: 'Tracks marketing campaigns, user acquisition, and conversion trends to evaluate target efficacy.' },
      { name: 'Operational View', purpose: 'Provides granular transaction logs and specific product category tracking.' }
    ],
    liveLink: 'https://intip.in/DashboardAnnualReport'
  },
  kpmg_segmentation: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'Customer Segmentation Dashboard (KPMG)',
    client: 'KPMG Virtual Experience Program',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'Excel', 'RFM Modeling'],
    description: 'Created to segment customer bases using the RFM method to identify high-value target profiles among a list of 1,000 potential customers.',
    pages: [
      { name: 'Customer EDA Page', purpose: 'Visualizes customer demographics: age distributions, gender ratios, job industries, and wealth segments.' },
      { name: 'Customer Details Page', purpose: 'Interactive table listing customer details and RFM scores for targeted marketing outreach.' }
    ],
    liveLink: 'https://intip.in/KPMGDashboard'
  },
  accenture_content: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'Content Performance Dashboard (Accenture)',
    client: 'SociaBuzz (Accenture Virtual Experience)',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'SQL (PostgreSQL)', 'Excel'],
    description: 'Developed during an Accenture Virtual Experience. This dashboard analyzes content categories on the SociaBuzz platform to identify the top 5 most popular categories.',
    pages: [
      { name: 'Main Dashboard', purpose: 'Tracks monthly content reaction counts, category rankings, and post-type performance.' }
    ],
    liveLink: 'https://intip.in/DashboardAccenture'
  },
  nyc_accident_viz: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'NYC Traffic Accident Analysis Dashboard',
    client: 'NYC Police Department (RevoU Group Project)',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'BigQuery (SQL)', 'Python'],
    description: 'This dashboard evaluates traffic accident frequency and severity across New York City in 2020. It helps the NYC Police Department identify high-risk locations and times.',
    pages: [
      { name: 'Frequency Tab', purpose: 'Maps accident counts by ZIP code, street type, and hour of the day.' },
      { name: 'Severity Tab', purpose: 'Tracks casualty rates, contributing factors, and vehicle types involved.' }
    ],
    liveLink: 'https://intip.in/TableauDashboardTrafﬁcAnalysis'
  },
  covid_vaccine: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'COVID-19 Vaccine Distribution Dashboard',
    client: 'Global Health Tracker',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'Excel'],
    description: 'Tracks global COVID-19 vaccination progress across Asia, Africa, South/North America, Oceania, and Europe, helping health officials monitor immunization rates.',
    pages: [
      { name: 'Main Dashboard', purpose: 'Displays global maps showing vaccination rates, doses administered, and fully vaccinated population percentages.' }
    ],
    liveLink: 'https://intip.in/VaccineDashboard'
  },
  airbnb_singapore: {
    structure: 2,
    category: 'Data Visualization',
    accent: 'var(--accent-viz)',
    title: 'Airbnb Singapore Listing Dashboard',
    client: 'Singapore Hospitality Study',
    timeline: '2023',
    role: 'BI Developer',
    tools: ['Tableau', 'Excel'],
    description: 'Visualizes Singapore Airbnb listings to help users analyze price distributions, host performance, price locations, and reviews.',
    pages: [
      { name: 'Main Dashboard', purpose: 'Interactive map displaying listing locations. Includes filters for price range, neighborhood, room type, and host details.' }
    ],
    liveLink: 'https://intip.in/Airbnbdashboard'
  },

  // ==================== IMPACT PROJECTS ====================
  kemensos_bansos: {
    structure: 1,
    category: 'Impact Projects',
    accent: 'var(--accent-impact)',
    title: 'Kemensos Social Aid (Bansos) Distribution Pipeline',
    client: 'Ministry of Social Affairs (Sukoharjo Region)',
    timeline: 'Dec 2022 - Apr 2023',
    role: 'Data & Dashboard Analyst',
    tools: ['Python', 'Pandas', 'Tableau Prep', 'Looker Studio', 'Excel'],
    overviewText: 'Collaborated with social aid officials to pre-process over 1.5 million demographic and spatial records. Built Python parsers and Tableau Prep scripts to combine raw text records with GADM spatial data, automating the reporting structure for local social aid distributions.',
    impactText: 'Automated daily distribution trackers, saving social services officials 80% manual reporting overhead. Empowered Grogol district teams to track real-time recipient status on clean dashboards.',
    quoteText: '"Fakhri\'s expertise in manipulating and transforming large data points made the analysis process much easier." — Deri Afianto, Ministry of Social Affairs Sukoharjo',
    links: [
      { label: 'Looker Studio Dashboard', url: 'https://intip.in/TableauDashboardTrafﬁcAnalysis' }
    ]
  },
  lpdp_pk239: {
    structure: 1,
    category: 'Impact Projects',
    accent: 'var(--accent-impact)',
    title: 'LPDP PK 239 Centralized Database Management',
    client: 'LPDP Executive Committee (PK 239)',
    timeline: 'June - August 2024',
    role: 'Head of Database Management',
    tools: ['Google Sheets', 'Excel', 'SQL QUERY Functions', 'Import Range'],
    overviewText: 'Served as the Head of the Database Management Directorate for the LPDP PK 239 program from June to August 2024. Led a 5-member team in designing and maintaining a centralized database system for 316 participants. The system consolidated participant demographics, health records, and financial requirements into a single, real-time update dashboard.',
    impactText: 'Re-architected data structures using a star schema model. Automated weekly data updates by integrating Google Form submissions. Achieved 100% data accuracy and improved cross-divisional efficiency by 70%. Designed automated query tables for group leaders to track participants.',
    quoteText: '"Fakhri\'s dedication and database engineering skills provided our committee with real-time analytics, streamlining our operational tasks immensely." — PK 239 Database Team Representative',
    links: [
      { label: 'Database Overview Page', url: 'https://github.com/fbudimannn' }
    ]
  },
  sql_academy: {
    structure: 1,
    category: 'Impact Projects',
    accent: 'var(--accent-impact)',
    title: 'SQL Academy PPI UK Curriculum & Mentorship',
    client: 'PPI UK (Education Initiative)',
    timeline: 'May - July 2025',
    role: 'SQL Instructor & Curriculum Developer',
    tools: ['BigQuery SQL', 'Slack', 'WhatsApp', 'PowerPoint'],
    overviewText: 'Served as one of six team members designing and delivering the SQL Academy curriculum for Indonesian students in the UK (May-July 2025). Instructed a cohort of 35 students, delivering lectures on advanced SQL concepts and providing daily 1-on-1 mentoring.',
    impactText: 'Designed a retail-based learning database containing over 10,000 transaction rows. Developed advanced course modules covering Subqueries, CTEs, and Window Functions. Boosted students\' technical proficiency by 80-90%. Achieved a 4.5/5.0 average instructor satisfaction rating.',
    quoteText: '"Fakhri\'s ability to explain advanced SQL window functions and subqueries helped our UK cohort gain confidence in quantitative database tasks." — SQL Academy Program Manager',
    links: [
      { label: 'Curriculum Repo Link', url: 'https://github.com/fbudimannn' }
    ]
  }
};
