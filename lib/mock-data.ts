export const mockCategories = [
  {
    id: "sales",
    name: "Sales",
    subcategories: [
      { id: "discovery", name: "Discovery" },
      { id: "objections", name: "Objections" },
      { id: "closing", name: "Closing" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    subcategories: [
      { id: "social", name: "Social Media" },
      { id: "email", name: "Email" },
      { id: "content", name: "Content" },
    ],
  },
  {
    id: "customer-success",
    name: "Customer Success",
    subcategories: [
      { id: "onboarding", name: "Onboarding" },
      { id: "support", name: "Support" },
      { id: "retention", name: "Retention" },
    ],
  },
  {
    id: "product",
    name: "Product",
    subcategories: [
      { id: "research", name: "Research" },
      { id: "messaging", name: "Messaging" },
    ],
  },
]

export const mockPrompts = [
  {
    id: "discovery-pain-points",
    title: "Pain Point Discovery",
    description: "Uncover customer pain points and challenges",
    whenToUse: "Early in sales cycle to understand prospect challenges",
    content: `I need to uncover the key pain points of a prospect during a discovery call for {{company_name}}. 

Generate 5-7 open-ended questions that will help me identify:
1. Their current challenges with {{product_category}}
2. The impact these challenges have on their business
3. Previous solutions they've tried
4. The ideal outcome they're seeking for {{target_audience}}
5. Timeline and urgency for solving these problems

Make the questions conversational and non-leading. Include follow-up prompts for each question to dig deeper.`,
    categoryId: "discovery",
    variables: {
      company_name: {
        name: "Company Name",
        description: "The name of your company",
        example: "Acme Corporation",
      },
      product_category: {
        name: "Product Category",
        description: "The category of product or service you're selling",
        example: "CRM software",
      },
      target_audience: {
        name: "Target Audience",
        description: "The specific audience or department you're targeting",
        example: "marketing teams",
      },
    },
  },
  {
    id: "discovery-qualification",
    title: "BANT Qualification",
    description: "Qualify prospects using the BANT framework",
    whenToUse: "Mid-sales cycle to assess fit and prioritize opportunities",
    content: `Help me create a BANT qualification framework for my next sales call with {{prospect_company}}.

Generate questions for each BANT category that feel conversational and natural:

Budget:
- Questions to understand their budget allocation process for {{product_category}}
- How to uncover budget range without asking directly

Authority:
- Questions to identify decision-makers and influencers at {{prospect_company}}
- How to map the buying committee

Need:
- Questions to validate and quantify their pain points around {{pain_point}}
- How to connect their challenges to our solution

Timeline:
- Questions to understand their decision timeline
- How to create urgency appropriately

For each question, provide a brief explanation of what I'm looking for and how to interpret different responses.`,
    categoryId: "discovery",
    variables: {
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're qualifying",
        example: "Acme Inc.",
      },
      product_category: {
        name: "Product Category",
        description: "The category of your product/service",
        example: "marketing automation",
      },
      pain_point: {
        name: "Pain Point",
        description: "The main pain point you're addressing",
        example: "lead conversion rates",
      },
    },
  },
  {
    id: "objection-pricing",
    title: "Price Objection Handling",
    description: "Respond effectively to pricing objections",
    whenToUse: "When prospect says your solution is too expensive",
    content: `I need help handling price objections for our {{product_name}} which costs {{price_point}}.

Generate a framework for responding to price objections that includes:

1. Initial acknowledgment response that validates their concern
2. 3-5 questions I should ask to better understand their price objection at {{prospect_company}}
3. 4-6 value-based talking points that shift focus from price to ROI
4. Specific examples of how to quantify the value/ROI for {{industry}} companies
5. 2-3 comparison frameworks (cost of doing nothing, cost of alternatives)
6. Suggested compromise positions or alternative packages if needed
7. Language to use when standing firm on price

Make all responses conversational, empathetic, and focused on value rather than defensive.`,
    categoryId: "objections",
    variables: {
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "Enterprise CRM Suite",
      },
      price_point: {
        name: "Price Point",
        description: "The price of your product/service",
        example: "$25,000 per year",
      },
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "TechCorp",
      },
      industry: {
        name: "Industry",
        description: "The industry of your prospect",
        example: "healthcare",
      },
    },
  },
  {
    id: "objection-timing",
    title: "Timing Objection Handling",
    description: "Address objections about timing and priorities",
    whenToUse: "When prospect says 'now is not a good time'",
    content: `I need help handling the "now is not a good time" objection from {{prospect_name}} at {{prospect_company}}.

Create a framework for responding that includes:

1. Empathetic acknowledgment of their timing concern
2. 4-5 probing questions to understand the real reason behind the timing objection
3. Approaches for each of these potential underlying issues:
   - Budget cycle misalignment for {{product_category}}
   - Competing priorities with {{competing_project}}
   - Recent negative experience
   - Organizational changes
   - Lack of perceived urgency
4. Value statements that create urgency without being pushy
5. Specific examples of opportunity costs of waiting for {{industry}} companies
6. A follow-up plan with specific timeframes
7. Language to use when suggesting a smaller initial engagement

Make all responses consultative rather than pushy, focusing on helping them make the best decision for their business.`,
    categoryId: "objections",
    variables: {
      prospect_name: {
        name: "Prospect Name",
        description: "The name of your prospect",
        example: "John Smith",
      },
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "Acme Corp",
      },
      product_category: {
        name: "Product Category",
        description: "The category of your product/service",
        example: "marketing automation",
      },
      competing_project: {
        name: "Competing Project",
        description: "A project that might be competing for resources",
        example: "CRM implementation",
      },
      industry: {
        name: "Industry",
        description: "The industry of your prospect",
        example: "retail",
      },
    },
  },
  {
    id: "closing-next-steps",
    title: "Next Steps Close",
    description: "Close for concrete next steps",
    whenToUse: "End of sales meetings to maintain momentum",
    content: `I need help creating effective "next steps" closes for the end of my sales meeting with {{prospect_company}} about {{product_name}}.

Generate a framework for securing next steps that includes:

1. 5-7 phrases to naturally transition to discussing next steps
2. Language to propose specific next steps for different sales stages:
   - After initial discovery with {{decision_maker}}
   - After demo/presentation
   - After technical validation
   - After sending proposal
3. How to secure commitment to specific dates and times
4. How to involve other stakeholders in next steps
5. How to create mutual action plans for {{implementation_timeline}}
6. Follow-up language if they're vague about next steps
7. How to confirm next steps in writing after the call

Make all language collaborative rather than pushy, focusing on advancing the process together.`,
    categoryId: "closing",
    variables: {
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "TechCorp",
      },
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "Enterprise CRM Suite",
      },
      decision_maker: {
        name: "Decision Maker",
        description: "The primary decision maker's name and title",
        example: "Sarah Johnson, CTO",
      },
      implementation_timeline: {
        name: "Implementation Timeline",
        description: "The expected timeline for implementation",
        example: "Q3 rollout",
      },
    },
  },
  {
    id: "social-linkedin-post",
    title: "LinkedIn Thought Leadership",
    description: "Create engaging LinkedIn posts that position you as a thought leader",
    whenToUse: "Weekly to maintain LinkedIn presence",
    content: `Help me create a LinkedIn post that positions me as a thought leader in {{industry}} focusing on {{topic}}.

The post should:
1. Start with an attention-grabbing hook (question, statistic, or contrarian statement)
2. Share a valuable insight about {{specific_topic}}
3. Include a personal perspective or experience with {{company_name}}
4. Provide 1-2 actionable takeaways for {{target_audience}}
5. End with an engaging question to prompt comments
6. Include 3-5 relevant hashtags

Keep the post under 1,300 characters, use short paragraphs with line breaks for readability, and maintain a conversational but authoritative tone.`,
    categoryId: "social",
    variables: {
      industry: {
        name: "Industry",
        description: "Your industry or sector",
        example: "B2B SaaS",
      },
      topic: {
        name: "Topic",
        description: "The general topic area",
        example: "customer retention",
      },
      specific_topic: {
        name: "Specific Topic",
        description: "A more specific aspect of the topic",
        example: "reducing churn through onboarding",
      },
      company_name: {
        name: "Company Name",
        description: "Your company name",
        example: "Acme Solutions",
      },
      target_audience: {
        name: "Target Audience",
        description: "The audience you're targeting",
        example: "customer success managers",
      },
    },
  },
  {
    id: "email-follow-up",
    title: "Sales Follow-up Email",
    description: "Craft effective follow-up emails after meetings",
    whenToUse: "Within 24 hours after sales meetings",
    content: `Create a follow-up email template for after a {{meeting_type}} with {{prospect_name}} from {{prospect_company}}.

The email should:
1. Reference something specific from our conversation about {{conversation_topic}}
2. Summarize 2-3 key points/takeaways
3. Clearly state the agreed-upon next steps with timeline
4. Include any promised resources or information about {{product_name}}
5. Add one new piece of value (insight, article, case study)
6. End with a clear call-to-action

Keep the email concise (150-200 words), conversational, and focused on them rather than us. Avoid generic language and make it feel personalized.`,
    categoryId: "email",
    variables: {
      meeting_type: {
        name: "Meeting Type",
        description: "The type of meeting you had",
        example: "discovery call",
      },
      prospect_name: {
        name: "Prospect Name",
        description: "The name of your prospect",
        example: "John Smith",
      },
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "Acme Corp",
      },
      conversation_topic: {
        name: "Conversation Topic",
        description: "A specific topic discussed in the meeting",
        example: "their marketing automation challenges",
      },
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "MarketPro Suite",
      },
    },
  },
  {
    id: "content-case-study",
    title: "Customer Case Study",
    description: "Structure a compelling customer success story",
    whenToUse: "When showcasing customer success to prospects",
    content: `Help me create a structured case study about our customer {{customer_name}} who achieved success with our {{product_name}}.

The case study should follow this structure:

1. Customer Overview (100-150 words)
   - Brief description of the company, industry, and size
   - Their primary business challenges before our solution in {{industry}}

2. The Challenge (150-200 words)
   - Specific pain points and problems they faced with {{pain_point}}
   - Impact of these challenges on their business
   - Previous solutions they tried

3. The Solution (150-200 words)
   - How they discovered and implemented our solution
   - Key features/services they utilized
   - Implementation process and timeline for {{implementation_time}}

4. Results (200-250 words)
   - Specific, quantifiable results achieved ({{key_metric}})
   - Before and after comparisons
   - ROI or time-to-value metrics
   - Unexpected benefits discovered

5. Customer Quote (50-75 words)
   - A compelling testimonial highlighting the impact from {{customer_contact}}

6. Future Plans (75-100 words)
   - How they plan to expand usage or achieve more results

Include 3-5 subheadings, 2-3 bullet point lists for scannable content, and suggestions for sidebar callouts highlighting key metrics.`,
    categoryId: "content",
    variables: {
      customer_name: {
        name: "Customer Name",
        description: "The name of the customer company",
        example: "TechCorp Inc.",
      },
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "CloudAnalytics Platform",
      },
      industry: {
        name: "Industry",
        description: "The customer's industry",
        example: "healthcare",
      },
      pain_point: {
        name: "Pain Point",
        description: "The main challenge the customer faced",
        example: "data silos and reporting inefficiency",
      },
      implementation_time: {
        name: "Implementation Time",
        description: "How long implementation took",
        example: "6 weeks",
      },
      key_metric: {
        name: "Key Metric",
        description: "A key performance metric that improved",
        example: "43% reduction in reporting time",
      },
      customer_contact: {
        name: "Customer Contact",
        description: "Name and title of customer contact for quote",
        example: "Sarah Johnson, CIO",
      },
    },
  },
  {
    id: "onboarding-welcome",
    title: "Customer Welcome Sequence",
    description: "Create a warm, informative welcome email sequence",
    whenToUse: "For new customer onboarding",
    content: `Design a 5-email welcome sequence for new customers of our {{product_name}}.

For each email, provide:
1. Subject line (and 1 alternative)
2. Greeting to {{customer_name}}
3. Main body content (150-250 words)
4. Call-to-action
5. Signature from {{account_manager}}

Email 1: Welcome & Getting Started (Day 0)
- Express excitement and appreciation
- Outline immediate next steps for {{implementation_goal}}
- Introduce their account manager/support contact
- Link to essential resources

Email 2: Key Features & Quick Wins (Day 2)
- Highlight 2-3 features for immediate value
- Include tips for quick success with {{key_feature}}
- Link to relevant tutorials

Email 3: Support Resources (Day 5)
- Outline available support channels
- Link to knowledge base, community, training for {{product_name}}
- Introduce success team

Email 4: Success Stories & Use Cases (Day 8)
- Share relevant customer success stories
- Provide use case examples relevant to their {{industry}}
- Suggest advanced features based on their goals

Email 5: Check-in & Feedback (Day 14)
- Check on their progress with {{implementation_goal}}
- Request initial feedback
- Offer additional assistance
- Preview what's coming next

Make the emails conversational, concise, and focused on customer success rather than feature promotion.`,
    categoryId: "onboarding",
    variables: {
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "CloudAnalytics Platform",
      },
      customer_name: {
        name: "Customer Name",
        description: "The name of the customer",
        example: "Acme Corp",
      },
      account_manager: {
        name: "Account Manager",
        description: "Name of the account manager",
        example: "John Smith",
      },
      implementation_goal: {
        name: "Implementation Goal",
        description: "The main implementation goal",
        example: "dashboard setup",
      },
      key_feature: {
        name: "Key Feature",
        description: "An important feature to highlight",
        example: "automated reporting",
      },
      industry: {
        name: "Industry",
        description: "The customer's industry",
        example: "retail",
      },
    },
  },
  // Adding new prompts for missing categories
  {
    id: "closing-proposal-template",
    title: "Sales Proposal Template",
    description: "Create a compelling sales proposal structure",
    whenToUse: "When preparing a formal proposal for a qualified prospect",
    content: `Help me create a sales proposal template for {{prospect_company}} for our {{product_name}} solution.

The proposal should include the following sections:

1. Executive Summary (150-200 words)
   - Brief overview of {{prospect_company}}'s challenges with {{pain_point}}
   - High-level solution overview
   - Expected outcomes and ROI summary

2. Current Situation Analysis (200-250 words)
   - Detailed breakdown of challenges identified during discovery
   - Quantification of the problem's impact on {{prospect_company}}
   - Implications of not addressing these challenges

3. Proposed Solution (300-350 words)
   - Detailed description of our {{product_name}} solution
   - Specific features/modules that address their {{pain_point}}
   - Implementation approach and timeline for {{implementation_timeline}}
   - Required resources and commitments

4. Expected Outcomes (200-250 words)
   - Specific, measurable results they can expect
   - Timeline for achieving these results
   - Success metrics and KPIs we'll track

5. Investment and ROI (150-200 words)
   - Pricing structure for {{product_tier}}
   - ROI calculation based on {{expected_value}}
   - Payment terms and options

6. Next Steps (100-150 words)
   - Clear action items with owners and deadlines
   - Decision timeline
   - Implementation kickoff process

7. Appendix
   - Case studies from similar {{industry}} companies
   - Team bios
   - Technical specifications
   - Legal terms

For each section, provide specific language and formatting guidance to make the proposal compelling, value-focused, and tailored to {{prospect_company}}'s specific situation.`,
    categoryId: "closing",
    variables: {
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "Acme Corporation",
      },
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "Enterprise Analytics Suite",
      },
      pain_point: {
        name: "Pain Point",
        description: "The main challenge the prospect is facing",
        example: "data fragmentation across departments",
      },
      implementation_timeline: {
        name: "Implementation Timeline",
        description: "Expected timeline for implementation",
        example: "90 days",
      },
      product_tier: {
        name: "Product Tier",
        description: "The specific product tier or package",
        example: "Enterprise Plan",
      },
      expected_value: {
        name: "Expected Value",
        description: "The expected financial value or benefit",
        example: "$500,000 in annual savings",
      },
      industry: {
        name: "Industry",
        description: "The prospect's industry",
        example: "healthcare",
      },
    },
  },
  {
    id: "objection-competitor",
    title: "Competitor Objection Handling",
    description: "Address objections about choosing a competitor",
    whenToUse: "When prospect mentions they're considering or leaning toward a competitor",
    content: `I need help handling objections when {{prospect_name}} at {{prospect_company}} mentions they're considering our competitor {{competitor_name}} instead of our {{product_name}}.

Create a framework for responding that includes:

1. Acknowledgment response that validates their consideration process
2. 3-5 questions to better understand what's attracting them to {{competitor_name}}
3. Approaches for addressing these common competitor-related objections:
   - Lower pricing from {{competitor_name}}
   - Specific feature advantages they perceive
   - Existing relationships with {{competitor_name}}
   - Market perception/analyst rankings
   - Implementation concerns

4. Differentiation points:
   - 5-7 key differentiators between our {{product_name}} and {{competitor_name}}
   - How to position these differences as advantages for {{prospect_company}}'s specific use case
   - Success stories from companies that switched from {{competitor_name}} to us

5. Handling "column fodder" situations (when they're just using you to compare)
   - How to identify if you're being used as a comparison point
   - Strategies to reposition the conversation
   - Questions to ask to determine true buying intent

Make all responses consultative and focused on the prospect's specific needs rather than generic competitor bashing. Include language for gracefully conceding points where the competitor is genuinely stronger.`,
    categoryId: "objections",
    variables: {
      prospect_name: {
        name: "Prospect Name",
        description: "The name of your prospect",
        example: "John Smith",
      },
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're selling to",
        example: "Acme Corp",
      },
      competitor_name: {
        name: "Competitor Name",
        description: "The name of your competitor",
        example: "RivalTech",
      },
      product_name: {
        name: "Product Name",
        description: "The name of your product or service",
        example: "CloudSuite Pro",
      },
    },
  },
  {
    id: "discovery-needs-assessment",
    title: "Comprehensive Needs Assessment",
    description: "Conduct a thorough needs assessment to understand prospect requirements",
    whenToUse: "During discovery phase to gather detailed requirements",
    content: `Help me create a comprehensive needs assessment framework for {{prospect_company}} regarding their {{department}} operations.

Generate a structured approach that includes:

1. Current State Analysis (5-7 questions)
   - Questions about their current processes for {{business_process}}
   - How to uncover inefficiencies and pain points
   - Questions about current tools and systems they use
   - How to quantify the impact of current challenges

2. Future State Vision (4-6 questions)
   - Questions to understand their ideal scenario
   - How to uncover their definition of success
   - Questions about specific outcomes they want to achieve
   - How to identify their priorities and must-haves vs. nice-to-haves

3. Stakeholder Analysis (3-5 questions)
   - Questions to map key stakeholders and their concerns
   - How to understand different perspectives within {{prospect_company}}
   - Questions about potential internal resistance
   - How to identify champions and detractors

4. Technical Requirements (4-6 questions)
   - Questions about integration needs with {{existing_system}}
   - How to uncover security and compliance requirements
   - Questions about data migration needs
   - How to understand their technical constraints

5. Implementation Considerations (3-5 questions)
   - Questions about timeline expectations
   - How to uncover resource availability
   - Questions about training and change management needs
   - How to understand their implementation concerns

6. Success Metrics (3-4 questions)
   - Questions to define how they'll measure success
   - How to establish baseline metrics
   - Questions about ROI expectations
   - How to set realistic expectations

For each section, provide follow-up questions and guidance on how to interpret responses. Make all questions open-ended, conversational, and designed to uncover both explicit and implicit needs.`,
    categoryId: "discovery",
    variables: {
      prospect_company: {
        name: "Prospect Company",
        description: "The company you're assessing",
        example: "Acme Corporation",
      },
      department: {
        name: "Department",
        description: "The specific department you're focusing on",
        example: "marketing",
      },
      business_process: {
        name: "Business Process",
        description: "The specific business process you're addressing",
        example: "lead generation and qualification",
      },
      existing_system: {
        name: "Existing System",
        description: "A key system they currently use",
        example: "Salesforce CRM",
      },
    },
  },
  {
    id: "social-twitter-content",
    title: "Twitter Content Calendar",
    description: "Create a strategic Twitter content calendar",
    whenToUse: "When planning Twitter content strategy for a brand",
    content: `Help me create a 2-week Twitter content calendar for {{brand_name}} in the {{industry}} industry.

The content calendar should include:

1. Content Strategy Overview
   - Primary content themes for {{brand_name}}
   - Target engagement metrics
   - Voice and tone guidelines specific to Twitter
   - Hashtag strategy including 5-7 primary hashtags for {{industry}}

2. Daily Content Mix (for each day, provide):
   - 1 thought leadership tweet related to {{topic_area}}
   - 1 engagement tweet (question, poll, or conversation starter)
   - 1 content promotion tweet for {{brand_name}}'s resources
   - 1 curated industry content share
   - Recommendations for optimal posting times

3. Weekly Special Content
   - 1 video content idea for maximum engagement
   - 1 Twitter thread concept on a trending {{industry}} topic
   - 1 user-generated content prompt
   - 1 partnership or influencer engagement opportunity

4. Engagement Strategy
   - Guidelines for responding to comments
   - Accounts to engage with regularly
   - Trending topics to monitor and join
   - Crisis response protocol

5. Growth Tactics
   - Twitter chat or Space concept related to {{topic_area}}
   - Contest or giveaway idea
   - Follower milestone celebration concepts
   - Cross-promotion strategies with other platforms

For each tweet, provide the exact copy (under 280 characters), recommended hashtags, and any image/video content descriptions. Include variations for A/B testing key messages.`,
    categoryId: "social",
    variables: {
      brand_name: {
        name: "Brand Name",
        description: "Your brand or company name",
        example: "TechSolutions Inc.",
      },
      industry: {
        name: "Industry",
        description: "Your industry or sector",
        example: "B2B SaaS",
      },
      topic_area: {
        name: "Topic Area",
        description: "Primary topic area for thought leadership",
        example: "digital transformation",
      },
    },
  },
  {
    id: "email-nurture-sequence",
    title: "Lead Nurture Email Sequence",
    description: "Create a strategic email nurture sequence for leads",
    whenToUse: "When developing an email nurture campaign for new leads",
    content: `Design a 6-email nurture sequence for new leads who downloaded our {{lead_magnet}} about {{topic}}.

For each email, provide:
1. Subject line (with 2 A/B test variations)
2. Preview text (40-90 characters)
3. Main body content (200-300 words)
4. Call-to-action
5. Recommended send timing

Email 1: Welcome & Lead Magnet Delivery (Day 0)
- Thank them for their interest
- Deliver the promised {{lead_magnet}}
- Introduce your company briefly
- Set expectations for the upcoming emails
- Primary CTA: Consume the lead magnet

Email 2: Problem Expansion (Day 3)
- Expand on the problem addressed in the {{lead_magnet}}
- Share a relevant statistic or insight about {{topic}}
- Introduce how your {{product_name}} addresses this problem
- Primary CTA: Read a related blog post or case study

Email 3: Solution Introduction (Day 7)
- Introduce your solution approach
- Share a brief success story from a similar {{industry}} company
- Address common objections about {{common_objection}}
- Primary CTA: Watch a product demo or explainer video

Email 4: Social Proof (Day 10)
- Share 2-3 customer testimonials or case study snippets
- Focus on results achieved by similar companies in {{industry}}
- Include relevant metrics and outcomes
- Primary CTA: Read full case study or schedule a call

Email 5: Overcome Objections (Day 14)
- Address the top 3 objections prospects have
- Provide evidence to counter these objections
- Share FAQs about implementation or getting started
- Primary CTA: Book a consultation call

Email 6: Final Offer (Day 18)
- Make a compelling offer (free trial, discount, bonus)
- Create urgency with a deadline or limited availability
- Summarize key benefits of {{product_name}}
- Primary CTA: Take advantage of the offer
- Secondary CTA: Schedule a call with sales

For each email, include personalization opportunities and segmentation recommendations based on recipient behavior. Make the sequence conversational, value-focused, and designed to gradually build trust.`,
    categoryId: "email",
    variables: {
      lead_magnet: {
        name: "Lead Magnet",
        description: "The content piece they downloaded",
        example: "Ultimate Guide to Data Security",
      },
      topic: {
        name: "Topic",
        description: "The main topic of the lead magnet",
        example: "data security compliance",
      },
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "SecureShield Pro",
      },
      industry: {
        name: "Industry",
        description: "The industry you're targeting",
        example: "financial services",
      },
      common_objection: {
        name: "Common Objection",
        description: "A common objection prospects have",
        example: "implementation complexity",
      },
    },
  },
  {
    id: "content-blog-post",
    title: "SEO Blog Post Structure",
    description: "Create a comprehensive, SEO-optimized blog post",
    whenToUse: "When creating content for organic traffic and thought leadership",
    content: `Help me create a comprehensive structure for an SEO-optimized blog post about {{blog_topic}} targeting the keyword "{{target_keyword}}".

The blog post should include:

1. Title Options (provide 5)
   - Include the target keyword naturally
   - Make it compelling and click-worthy
   - Keep under 60 characters for SEO

2. Introduction (250-300 words)
   - Hook that grabs attention
   - Clear statement of the problem or opportunity related to {{blog_topic}}
   - Brief overview of what the reader will learn
   - Include the target keyword in the first 100 words
   - End with a transition to the main content

3. Table of Contents
   - List of 5-7 main sections with descriptive headings
   - Each heading should incorporate semantic keywords related to {{target_keyword}}

4. Main Content Sections (for each section, provide):
   - H2 heading that includes semantic keywords
   - Key points to cover (300-400 words per section)
   - Ideas for relevant examples or case studies from {{industry}}
   - Suggestions for data points, statistics, or research to include
   - Ideas for visual content (infographics, charts, images)

5. Practical Application Section
   - How-to steps or actionable advice
   - Common mistakes to avoid
   - Tools or resources recommendations

6. Conclusion (150-200 words)
   - Summary of key takeaways
   - Reinforcement of main benefits
   - Call-to-action

7. SEO Recommendations
   - Secondary keywords to incorporate
   - Internal linking suggestions
   - External linking suggestions
   - Meta description (150-160 characters)
   - Image alt text examples
   - Suggested word count for optimal SEO (typically 1,500-2,500 words)

8. Content Promotion Ideas
   - Social media post suggestions
   - Email newsletter blurb
   - Potential outreach targets for backlinks

Make the structure comprehensive enough to rank well for {{target_keyword}} while providing genuine value to {{target_audience}}.`,
    categoryId: "content",
    variables: {
      blog_topic: {
        name: "Blog Topic",
        description: "The main topic of the blog post",
        example: "customer data platforms",
      },
      target_keyword: {
        name: "Target Keyword",
        description: "The primary keyword you're targeting",
        example: "how to implement a customer data platform",
      },
      industry: {
        name: "Industry",
        description: "The industry you're writing for",
        example: "e-commerce",
      },
      target_audience: {
        name: "Target Audience",
        description: "The primary audience for this content",
        example: "marketing directors",
      },
    },
  },
  {
    id: "support-troubleshooting",
    title: "Technical Troubleshooting Guide",
    description: "Create a comprehensive troubleshooting guide for customer support",
    whenToUse: "When creating support documentation or handling technical issues",
    content: `Create a comprehensive troubleshooting guide for the common issue "{{common_issue}}" with our {{product_name}} that customers frequently report to support.

The troubleshooting guide should include:

1. Issue Overview
   - Clear description of the "{{common_issue}}" problem
   - Symptoms and how to identify the issue
   - Potential causes
   - Impact on user experience
   - Affected versions or configurations

2. Prerequisites
   - Required access levels or permissions
   - Backup recommendations before attempting fixes
   - Tools needed for troubleshooting
   - Estimated time to resolve

3. Step-by-Step Troubleshooting Process
   - Initial diagnostics to confirm the issue
   - Tier 1 solutions (quick fixes for common causes)
     * Step-by-step instructions with screenshots or diagrams
     * Expected outcomes at each step
     * Verification methods to confirm resolution
   
   - Tier 2 solutions (more advanced troubleshooting)
     * Detailed technical steps for more complex scenarios
     * Potential side effects or warnings
     * Required technical knowledge
   
   - Tier 3 solutions (last resort options)
     * Steps requiring advanced intervention
     * When to escalate to engineering team

4. Common Mistakes to Avoid
   - Pitfalls during the troubleshooting process
   - Actions that could worsen the situation
   - Misdiagnosis patterns to be aware of

5. Prevention Recommendations
   - How to prevent this issue in the future
   - Best practices for {{product_name}} usage
   - Configuration recommendations
   - Maintenance procedures

6. Related Issues
   - Similar problems that might be confused with this one
   - How to differentiate between them
   - Links to related troubleshooting guides

7. FAQ Section
   - Answers to common questions about this issue
   - Edge cases and their solutions
   - Compatibility notes with {{integration_point}}

Format the guide to be easily scannable, with clear headings, bullet points, code snippets where relevant, and visual indicators for important warnings or notes.`,
    categoryId: "support",
    variables: {
      common_issue: {
        name: "Common Issue",
        description: "The specific issue being troubleshooted",
        example: "authentication failures after password reset",
      },
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "CloudAccess Portal",
      },
      integration_point: {
        name: "Integration Point",
        description: "A common integration point",
        example: "Active Directory",
      },
    },
  },
  {
    id: "support-customer-inquiry",
    title: "Customer Inquiry Response Templates",
    description: "Create response templates for common customer inquiries",
    whenToUse: "When standardizing customer support responses",
    content: `Create a set of response templates for handling common customer inquiries about {{product_name}} for our support team.

For each inquiry type, provide:
1. Initial response template
2. Follow-up response template
3. Resolution/closing response template
4. Key points to customize for each customer
5. Internal notes for support agents

Inquiry Type 1: Billing Questions about {{pricing_plan}}
- Template for responding to billing cycle questions
- Template for handling payment method updates
- Template for addressing pricing discrepancies
- Template for explaining invoice items
- Escalation criteria and process

Inquiry Type 2: Account Access Issues
- Template for password reset assistance
- Template for account lockout situations
- Template for permission/role adjustment requests
- Template for multi-user access questions
- Security verification procedures

Inquiry Type 3: Feature Requests for {{product_feature}}
- Template for acknowledging feature requests
- Template for explaining feature roadmap status
- Template for collecting detailed requirements
- Template for alternative solutions with existing features
- Process for routing valuable feedback to product team

Inquiry Type 4: Technical Issues with {{common_problem}}
- Template for initial troubleshooting steps
- Template for requesting logs or screenshots
- Template for escalating to technical support
- Template for explaining known issues and timelines
- Documentation links to include

Inquiry Type 5: Cancellation Requests
- Template for understanding cancellation reasons
- Template for retention offers
- Template for explaining cancellation process
- Template for post-cancellation data access
- Feedback collection process

For each template, include:
- Appropriate greeting and sign-off
- Empathetic language acknowledging the customer's situation
- Clear next steps and expectations
- Relevant knowledge base links
- Options for further assistance

Make all templates conversational, solution-oriented, and adaptable to different customer sentiment levels (from satisfied to highly frustrated).`,
    categoryId: "support",
    variables: {
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "MarketPro Suite",
      },
      pricing_plan: {
        name: "Pricing Plan",
        description: "A specific pricing plan",
        example: "Enterprise Annual Plan",
      },
      product_feature: {
        name: "Product Feature",
        description: "A specific product feature",
        example: "custom reporting",
      },
      common_problem: {
        name: "Common Problem",
        description: "A common technical issue",
        example: "data import errors",
      },
    },
  },
  {
    id: "retention-at-risk-outreach",
    title: "At-Risk Customer Outreach",
    description: "Create outreach templates for at-risk customers",
    whenToUse: "When reaching out to customers showing signs of churn",
    content: `Create a framework for reaching out to at-risk customers of our {{product_name}} who are showing signs of potential churn based on {{risk_indicator}}.

For each outreach channel, provide:

1. Email Outreach
   - Subject line options (3-5 variations)
   - Email body template that:
     * Acknowledges their status without using alarming language
     * Expresses genuine concern and desire to help
     * Offers specific value based on their situation with {{product_name}}
     * Includes clear call-to-action
   - Follow-up email sequence (2-3 emails) if no response
   - Timing recommendations between touchpoints

2. Phone Call Framework
   - Opening script that's conversational and non-threatening
   - Key questions to understand their current challenges with {{product_name}}
   - Talking points to address common issues related to {{risk_indicator}}
   - Value reinforcement statements specific to their use case
   - Objection handling for common churn reasons
   - Next steps and commitment request options

3. In-App Messaging
   - Triggered message content based on {{risk_indicator}}
   - Offer of assistance that feels helpful, not desperate
   - Resources or quick wins to re-engage them
   - Path to human interaction if needed

4. Customer Success Meeting Agenda
   - Structure for a "relationship rescue" meeting
   - Discovery questions to uncover the root causes
   - Preparation checklist for the CS manager
   - Account review components to include
   - Action plan template for addressing concerns
   - Follow-up documentation template

5. Winback Approach (if they do cancel)
   - Timing for winback attempts
   - Incentive options based on their {{customer_tier}}
   - Messaging that acknowledges their departure respectfully
   - New feature or improvement announcements relevant to their previous concerns
   - Process for maintaining relationship for future reconsideration

For each approach, include:
- Personalization points
- Success metrics to track
- Internal escalation criteria
- Specific value propositions based on customer segment and use case

Make all communication templates empathetic, value-focused, and designed to rebuild the relationship rather than just retain the revenue.`,
    categoryId: "retention",
    variables: {
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "DataSync Pro",
      },
      risk_indicator: {
        name: "Risk Indicator",
        description: "The indicator showing risk of churn",
        example: "declining usage over 30 days",
      },
      customer_tier: {
        name: "Customer Tier",
        description: "The customer's tier or segment",
        example: "Enterprise",
      },
    },
  },
  {
    id: "retention-quarterly-review",
    title: "Quarterly Business Review Template",
    description: "Create a comprehensive QBR framework for customer success",
    whenToUse: "When preparing for quarterly business reviews with key customers",
    content: `Create a comprehensive Quarterly Business Review (QBR) template for our {{customer_tier}} customers using our {{product_name}}.

The QBR presentation should include:

1. Executive Summary Slide
   - Account health summary with visual indicator (green/yellow/red)
   - Key wins from the past quarter
   - Critical areas requiring attention
   - Strategic goals for the upcoming quarter
   - Renewal/expansion opportunities

2. Relationship Overview Section
   - Key stakeholders map with roles and engagement levels
   - Support ticket summary and resolution metrics
   - Recent interactions and engagement highlights
   - Changes in the customer's organization relevant to our partnership
   - Relationship health assessment

3. Usage & Adoption Analysis
   - Key usage metrics compared to benchmarks for {{product_name}}
   - User adoption rates by department/team
   - Feature utilization heat map
   - Trend analysis showing usage patterns over time
   - Identification of underutilized high-value features
   - User engagement scoring

4. Success Metrics & ROI Section
   - Progress against defined success metrics
   - ROI calculation based on {{value_metric}}
   - Comparison to industry benchmarks
   - Business impact stories and wins
   - Unrealized value opportunities

5. Support & Implementation Review
   - Open and resolved support issues
   - Implementation/project status updates
   - Outstanding technical concerns
   - Health metrics for integrations with {{integration_point}}
   - Technical debt or risk areas

6. Strategic Roadmap Alignment
   - Customer's business initiatives for upcoming quarters
   - Our product roadmap highlights relevant to their use case
   - Strategic recommendations for better alignment
   - Expansion opportunities based on their business direction
   - Training or enablement recommendations

7. Action Plan & Next Steps
   - Clearly defined action items with owners and due dates
   - Success criteria for each action item
   - Resources required
   - Follow-up meeting schedule
   - Escalation path for critical items

For each section, provide:
- Key questions to prepare for in advance
- Data points to gather before the meeting
- Visualization recommendations
- Talking points for the customer success manager
- Common customer questions and how to address them

The QBR should be strategic rather than just a status update, focused on demonstrating and expanding value.`,
    categoryId: "retention",
    variables: {
      customer_tier: {
        name: "Customer Tier",
        description: "The customer's tier or segment",
        example: "Enterprise",
      },
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "AnalyticsPro Platform",
      },
      value_metric: {
        name: "Value Metric",
        description: "The primary metric for measuring value",
        example: "time saved in reporting process",
      },
      integration_point: {
        name: "Integration Point",
        description: "A key integration point",
        example: "Salesforce CRM",
      },
    },
  },
  {
    id: "research-competitor-analysis",
    title: "Competitor Analysis Framework",
    description: "Create a comprehensive competitor analysis framework",
    whenToUse: "When conducting competitive research for product or marketing strategy",
    content: `Create a comprehensive competitor analysis framework for comparing our {{product_name}} against key competitors in the {{industry}} space, particularly focusing on {{competitor_name}} and other market players.

The competitor analysis should include:

1. Market Positioning Analysis
   - Positioning statements comparison
   - Target customer segments for each competitor
   - Value proposition comparison
   - Brand perception and market reputation
   - Market share estimates and growth trajectories
   - Pricing strategy comparison for {{product_tier}}

2. Product Capability Comparison
   - Feature comparison matrix with scoring system
   - Strengths and weaknesses analysis for key features
   - User experience and interface comparison
   - Technical architecture differences
   - Integration capabilities, especially with {{integration_point}}
   - Product roadmap intelligence (if available)
   - Innovation assessment and R&D focus areas

3. Marketing Strategy Analysis
   - Messaging and communication themes
   - Content strategy and thought leadership positioning
   - SEO performance for key terms like "{{seo_keyword}}"
   - Social media presence and engagement metrics
   - Event participation and sponsorships
   - Partner ecosystem and channel strategy
   - Case studies and social proof approach

4. Sales Approach Comparison
   - Sales methodology and process
   - Team structure and go-to-market approach
   - Proposal and pricing tactics
   - Discounting strategies and patterns
   - Sales enablement resources
   - Objection handling approaches for common objections

5. Customer Success & Support Evaluation
   - Onboarding process comparison
   - Customer support channels and availability
   - Training and education resources
   - Customer community engagement
   - Renewal and expansion strategies
   - Churn rates and retention tactics (if available)

6. SWOT Analysis for Each Competitor
   - Strengths relative to our offering
   - Weaknesses and vulnerability points
   - Opportunities for differentiation
   - Threats they pose to our business

7. Strategic Recommendations
   - Immediate tactical opportunities
   - Messaging differentiation recommendations
   - Feature prioritization insights
   - Competitive defense strategies
   - Market positioning adjustments
   - Sales enablement needs for competitive deals

For each section, provide specific data points to gather, research methodologies, and analysis frameworks. Include guidance on how to present findings visually and how to maintain this as a living document that evolves with the competitive landscape.`,
    categoryId: "research",
    variables: {
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "MarketInsight Pro",
      },
      industry: {
        name: "Industry",
        description: "Your industry or market segment",
        example: "marketing automation",
      },
      competitor_name: {
        name: "Competitor Name",
        description: "A primary competitor",
        example: "HubSpot",
      },
      product_tier: {
        name: "Product Tier",
        description: "A specific product tier to analyze",
        example: "Enterprise Plan",
      },
      integration_point: {
        name: "Integration Point",
        description: "A key integration capability",
        example: "Salesforce",
      },
      seo_keyword: {
        name: "SEO Keyword",
        description: "An important SEO keyword in your industry",
        example: "marketing automation platform",
      },
    },
  },
  {
    id: "research-user-interview",
    title: "User Research Interview Guide",
    description: "Create a comprehensive user interview script",
    whenToUse: "When conducting user research for product development",
    content: `Create a comprehensive user research interview guide for conducting interviews with {{user_persona}} about their experience with {{product_feature}} or similar solutions in the market.

The interview guide should include:

1. Introduction (5 minutes)
   - Interviewer introduction script
   - Purpose of the research explanation
   - Confidentiality and recording permissions
   - Setting expectations for the interview format
   - Icebreaker questions to build rapport

2. Background Questions (5-10 minutes)
   - Role and responsibilities exploration
   - Daily workflow and processes related to {{product_feature}}
   - Current tools and solutions being used
   - Level of experience with similar technologies
   - Key challenges in their role related to {{pain_point}}

3. Current Experience Deep Dive (15-20 minutes)
   - Detailed exploration of how they currently accomplish tasks related to {{product_feature}}
   - Step-by-step walkthrough of their process
   - Pain points and frustrations with current solutions
   - Workarounds they've developed
   - What's working well in their current approach
   - Specific questions about their experience with {{competitor_product}} if used

4. Needs and Desires Exploration (15 minutes)
   - Ideal solution characteristics
   - Must-have vs. nice-to-have features
   - Decision criteria when evaluating solutions
   - Integration requirements with {{existing_system}}
   - Success metrics and how they measure value
   - Budget and purchasing process insights

5. Concept Testing (if applicable) (15 minutes)
   - Introduction to new concept or prototype
   - Initial reaction questions
   - Guided exploration of key features
   - Value perception questions
   - Likelihood to use/purchase questions
   - Pricing reaction questions

6. Scenario-Based Questions (10 minutes)
   - "Imagine you are trying to accomplish X, how would you..."
   - "Tell me about a time when you had to..."
   - "What would you do if..."
   - "Walk me through how you would..."

7. Wrap-up (5 minutes)
   - Summary of key insights
   - Any additional thoughts they want to share
   - Next steps and follow-up information
   - Thank you and incentive information

For each section, provide:
- Primary questions to ask
- Follow-up probes to dig deeper
- Transition statements between sections
- Note-taking guidance for the interviewer
- Time management suggestions

Include guidance on:
- Active listening techniques
- How to avoid leading questions
- When and how to probe deeper
- How to handle off-topic conversations
- Capturing non-verbal feedback

The interview should be conversational while ensuring all key research objectives are met.`,
    categoryId: "research",
    variables: {
      user_persona: {
        name: "User Persona",
        description: "The type of user being interviewed",
        example: "Marketing Operations Manager",
      },
      product_feature: {
        name: "Product Feature",
        description: "The feature or capability being researched",
        example: "automated campaign attribution",
      },
      pain_point: {
        name: "Pain Point",
        description: "A specific pain point to explore",
        example: "manual reporting processes",
      },
      competitor_product: {
        name: "Competitor Product",
        description: "A competitor's product they might use",
        example: "Marketo",
      },
      existing_system: {
        name: "Existing System",
        description: "A system they currently use",
        example: "Salesforce",
      },
    },
  },
  {
    id: "messaging-value-proposition",
    title: "Value Proposition Framework",
    description: "Create a compelling value proposition framework",
    whenToUse: "When developing core messaging for products or services",
    content: `Create a comprehensive value proposition framework for our {{product_name}} targeting {{target_audience}} in the {{industry}} industry.

The value proposition framework should include:

1. Core Value Proposition Statement
   - Primary benefit-focused statement (30 words or less)
   - 3-5 alternative formulations for testing
   - Guidance on when to use each variation
   - Before/after customer state description

2. Problem Statement Section
   - Clear articulation of the primary problem {{product_name}} solves
   - Market evidence validating the problem exists (statistics, trends)
   - Cost of inaction for {{target_audience}}
   - Emotional impact of the problem
   - Current alternatives and their limitations

3. Solution Description
   - How {{product_name}} solves the identified problem
   - Unique approach or methodology
   - Key differentiators from alternatives like {{competitor_solution}}
   - Technical explanation translated into business benefits
   - Proprietary elements or intellectual property

4. Benefits Breakdown
   - Primary benefits (3-5) with supporting evidence
   - Secondary benefits (3-5) for different stakeholders
   - Quantifiable outcomes and metrics ({{key_metric}})
   - Emotional/qualitative benefits
   - Short-term vs. long-term benefits
   - Department-specific benefits for key stakeholders

5. Proof Points
   - Customer success metrics and outcomes
   - Case study summaries and key results
   - Third-party validation (analysts, reviews)
   - Technical validation points
   - Comparison metrics against industry benchmarks
   - ROI calculation framework

6. Audience-Specific Messaging
   - C-level executive messaging focus
   - Director/VP-level messaging focus
   - Manager/practitioner messaging focus
   - Industry-specific value points for {{industry}}
   - Company size-specific considerations
   - Messaging for different stages of buyer journey

7. Objection Handling
   - Responses to top 5 objections or concerns
   - Competitive positioning against {{competitor_solution}}
   - Risk mitigation messaging
   - Cost justification frameworks
   - Implementation concerns addressing

For each section, provide specific language examples, formatting guidance, and usage recommendations for different marketing channels (website, sales decks, emails, etc.). Include guidance on voice, tone, and terminology to ensure consistency across all communications.`,
    categoryId: "messaging",
    variables: {
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "DataInsight Pro",
      },
      target_audience: {
        name: "Target Audience",
        description: "Your primary target audience",
        example: "Marketing Directors",
      },
      industry: {
        name: "Industry",
        description: "The industry you're targeting",
        example: "financial services",
      },
      competitor_solution: {
        name: "Competitor Solution",
        description: "A key competitor's solution",
        example: "Tableau",
      },
      key_metric: {
        name: "Key Metric",
        description: "A key performance metric your product improves",
        example: "reporting time reduction",
      },
    },
  },
  {
    id: "messaging-sales-battlecard",
    title: "Sales Battlecard Template",
    description: "Create comprehensive sales battlecards for competitive selling",
    whenToUse: "When equipping sales teams to compete against specific competitors",
    content: `Create a comprehensive sales battlecard for our {{product_name}} when competing against {{competitor_name}} in the {{industry}} market.

The battlecard should include:

1. Competitor Overview
   - Company background and recent developments
   - Market position and target customer profile
   - Key strengths and weaknesses summary
   - Recent news, acquisitions, or strategic shifts
   - Funding status and financial health indicators

2. Product Comparison
   - Feature comparison table with our advantages highlighted
   - Areas where {{competitor_name}} has an advantage
   - Pricing model comparison for {{product_tier}}
   - Architecture and technical differences
   - Implementation and time-to-value comparison
   - Integration capabilities, especially with {{integration_point}}
   - User experience and interface differences

3. Competitive Positioning
   - Our key differentiators and unique value proposition
   - How to position against {{competitor_name}}'s marketing claims
   - Value messaging that resonates with {{target_audience}}
   - ROI comparison and value demonstration
   - Total cost of ownership analysis
   - Customer success metrics comparison

4. Win/Loss Analysis
   - Common reasons we win against {{competitor_name}}
   - Common reasons we lose to {{competitor_name}}
   - Key decision criteria for prospects
   - Buyer personas most favorable to us vs. them
   - Deal patterns and trends

5. Objection Handling
   - Top 5 objections when competing with {{competitor_name}}
   - Effective responses with evidence and proof points
   - Questions to ask to shift focus to our strengths
   - How to reframe comparison discussions
   - Handling pricing objections specifically

6. Customer Evidence
   - Customers who switched from {{competitor_name}} to us
   - Success metrics and outcomes from these customers
   - Testimonial quotes and case study references
   - Common pain points that drove the switch
   - Implementation success stories

7. Sales Plays
   - Discovery questions to identify {{competitor_name}} vulnerabilities
   - Demo guidance to highlight our advantages
   - Proof of concept approach when competing directly
   - Evaluation criteria to suggest that favor our solution
   - Negotiation tactics when {{competitor_name}} is incumbent
   - Strategies for different competitive scenarios (head-to-head, displacement, etc.)

8. Competitive Landmines
   - Topics or comparisons to avoid
   - Potential traps in the sales process
   - How {{competitor_name}}'s sales team typically positions against us
   - Common FUD (Fear, Uncertainty, Doubt) tactics they use
   - How to respond if they offer significant discounting

Make the battlecard concise, actionable, and easy to reference during sales preparation. Include links to additional resources, competitive intelligence, and subject matter experts for deeper questions.`,
    categoryId: "messaging",
    variables: {
      product_name: {
        name: "Product Name",
        description: "Your product or service name",
        example: "CloudSecure Platform",
      },
      competitor_name: {
        name: "Competitor Name",
        description: "The competitor being analyzed",
        example: "SecureWorks",
      },
      industry: {
        name: "Industry",
        description: "The industry you're competing in",
        example: "cybersecurity",
      },
      product_tier: {
        name: "Product Tier",
        description: "A specific product tier to compare",
        example: "Enterprise Plan",
      },
      integration_point: {
        name: "Integration Point",
        description: "A key integration capability",
        example: "Microsoft Azure",
      },
      target_audience: {
        name: "Target Audience",
        description: "Your primary target audience",
        example: "CISOs",
      },
    },
  },
]
