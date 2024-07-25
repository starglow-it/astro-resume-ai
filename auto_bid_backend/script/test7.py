from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
import json

# Load pre-trained model and tokenizer
model_name = "deepset/roberta-base-squad2"
model = AutoModelForQuestionAnswering.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Create a QA pipeline
qa_pipeline = pipeline("question-answering", model=model, tokenizer=tokenizer)

# Sample resume data in JSON format
resume_data = {
  "personal_information": {
    "full_name": "James Kai",
    "birth_date": "November 12, 1989",
    "address": "8248 Lansdowne Rd, Richmond, BC V6X 3Y9, Canada",
    "phone": "+1 (604) 243-7330",
    "email": "lightstar.it.golden@gmail.com",
    "whatsapp": "+1 6042437330",
    "linkedin": "https://www.linkedin.com/in/james-kai/"
  },
  "profile": {
    "overview": "Highly skilled and experienced full-stack developer proficient in Python, Django, Node.js, Express.js, React, Vue, Angular, TypeScript, JavaScript, PHP, Laravel, Yii2, Spring, AWS, Redis, GraphQL, and PostgreSQL. Excels in creating scalable and maintainable code and has a track record of leading multiple projects to successful funding and revenue milestones. Ideal role combines front-end and back-end technologies. Committed to delivering high-quality work with a focus on quick support and on-time delivery."
  },
  "education": [
    {
      "degree": "Master's Degree in Computer Science (M.Comp.Sc.)",
      "institution": "University of Toronto",
      "dates": "April 2012 - April 2016",
      "address": "27 King's College Circle, Toronto, ON, M5S 1A1, Canada"
    },
    {
      "degree": "Bachelor's Degree in Computer Science (B.Comp.Sc.)",
      "institution": "Nanjing University",
      "dates": "April 2007 - April 2011",
      "address": "22 Hankou Road, Nanjing, Jiangsu, 210093, China"
    }
  ],
  "open_work_permit": "Post-Graduation Work Permit (PGWP)",
  "experience": [
    {
      "title": "Lead Full Stack Developer",
      "company": "Trigma",
      "location": "Vancouver, Canada",
      "dates": "Nov 2022 - Oct 2023",
      "responsibilities": [
        "Led the development of a social travel platform, using Python, Django, Vue.js, and Vuex. Successfully integrated Google Maps API, allowing users to add trip locations visually and boosting user engagement by 30%.",
        "Implemented link-based access with secure authentication libraries, utilizing JWT, Node.js, Express.js, and Bcrypt, resulting in a 30% reduction in unauthorized access attempts and a 22% improvement in user trust through enhanced privacy measures.",
        "Developed a website for selling electric scooters with headless eCommerce and CMS integrations, based on Gatsby. Integrated Calendly, BigCommerce API, Salesforce, and Contentful. Ensured full responsiveness and multiple localizations.",
        "Built a Node.js-based library to act as middleware for Express.js and Koa, capturing and sending user errors to a platform for aggregation and visualization.",
        "Created the front end of an invoice management app in React, featuring full responsiveness, custom inputs, and dynamically generated pages."
      ]
    },
    {
      "title": "Senior Full Stack Developer",
      "company": "Trigma",
      "location": "Vancouver, Canada",
      "dates": "Jan 2020 - Nov 2022",
      "responsibilities": [
        "Developed Termis, an in-house tool for managing and updating thousands of POS systems. Built with React, Redux, Apollo Client, and Apollo GraphQL.",
        "Built HushtagsApp, a web app with cart and checkout functionality for purchasing tags, using React, Redux, and UIkit, with Braintree API integration for one-click checkouts.",
        "Constructed two mobile apps for Matkraft using React Native and Redux, deployed on Google Play and the App Store for construction companies and their customers.",
        "Developed Sou Server, a Dialogflow bot with an external Node.js API for business logic, along with an admin interface powered by React, Redux, and Apollo.",
        "Developed Eatos, an AI-powered meal planner app using React Native, Firebase for authentication, analytics, and push notifications, and a landing page and admin interface using Next.js, GraphQL, and Apollo."
      ]
    },
    {
      "title": "Full Stack Developer",
      "company": "EchoGlobal",
      "location": "Toronto, Canada",
      "dates": "Nov 2017 - Jun 2019",
      "responsibilities": [
        "Led the development of multiple websites, including booking platforms, healthcare solutions, and e-commerce websites, using the MERN (MongoDB, Express.js, React, Node.js) Stack.",
        "Integrated secure payment gateways into various projects, ensuring smooth and reliable transactions for e-commerce clients.",
        "Utilized Google Maps API to implement location-based features and enhance user experiences on multiple platforms.",
        "Implemented real-time communication features, enabling seamless interactions and notifications for users.",
        "Collaborated closely with cross-functional teams, including UI/UX designers and backend developers, to create feature-rich and user-centric applications.",
        "Ensured the scalability and maintainability of code while focusing on delivering high-quality work within project timelines.",
        "Kept updated with the latest trends and best practices in full-stack development to provide cutting-edge solutions."
      ]
    },
    {
      "title": "Frontend Developer",
      "company": "EchoGlobal",
      "location": "Toronto, Canada",
      "dates": "Sep 2016 - Nov 2017",
      "responsibilities": [
        "Developed the admin application of the web store in React.",
        "Replaced Redux with Apollo Client for GraphQL integration against a Python, Django back-end.",
        "Implemented a HOC architecture to reuse common GraphQL functionality for listing and filtering.",
        "Created a custom UI library with styled components."
      ]
    },
    {
      "title": "IT Intern",
      "company": "Naturality Digital",
      "location": "Shenzhen, China",
      "dates": "Apr 2011 - Mar 2012",
      "responsibilities": [
        "Automated the monthly supplier payments billing cycle using Python, Django, PHP, Laravel, MySQL, and PostgreSQL.",
        "Wrote PHP and Python scripts to automate analyst and pricing workflows.",
        "Gained experience in various Git workflows.",
        "Collaborated with a lead software engineer on the development of pricing and procurement software API.",
        "Worked with a systems engineer to understand network security and maintainable infrastructure, including AWS."
      ]
    }
  ]
}

# Convert JSON data to text for the QA model
resume_text = json.dumps(resume_data, indent=2)

# Define a function to answer questions with confidence threshold
def answer_question(question, context, threshold=0.5):
    result = qa_pipeline(question=question, context=context)
    # if result['score'] < threshold:
    #     return False
    return result['answer']

# Example questions
questions = [
    "Address?",
    "City?",
    "State?",
    "What is your citizenship / employment eligibility?"  # This question cannot be answered from the resume
]

# Get answers
for question in questions:
    answer = answer_question(question, resume_text)
    print(f"Question: {question}")
    print(f"Answer: {answer}\n")
