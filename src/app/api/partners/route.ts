import { NextResponse } from "next/server"

const NEWS_URL = "https://brilliant-angel-cbo.vercel.app/news"

const AUSTINE_URL = "https://austine-omondi.vercel.app"

interface NewsItem {
  title: string
  description: string
  category: string
  year: string
}

const hardcodedNews: NewsItem[] = [
  {
    title: "Brilliant Angels CBO Officially Registered",
    description: "After years of community service, Brilliant Angels CBO was officially registered in 2024, marking a new chapter in our mission to serve Githogoro.",
    category: "Milestone",
    year: "2024",
  },
  {
    title: "Sulwe Mentorship and Scholarship Programme Launches",
    description: "Our flagship Sulwe Mentorship and Scholarship programme was launched to identify and support top-performing students from Githogoro schools with exposure visits to Makini School.",
    category: "Programme",
    year: "2024",
  },
  {
    title: "Community Tree Planting Drive",
    description: "Brilliant Angels organised a major tree planting exercise in Githogoro as part of our environmental stewardship programme, planting over 200 trees.",
    category: "Environment",
    year: "2023",
  },
  {
    title: "Medical Camp for Githogoro Residents",
    description: "A free medical camp was held in the community providing health screenings, HIV testing, and reproductive health education to hundreds of residents.",
    category: "Health",
    year: "2023",
  },
  {
    title: "Youth Empowerment Training Graduates",
    description: "Over 30 young women completed tailoring, soap making, and entrepreneurship training through our youth and women empowerment programme.",
    category: "Empowerment",
    year: "2022",
  },
  {
    title: "Brilliant Angels Community School Opens",
    description: "Brilliant Angels Community School was established to provide quality education to vulnerable children in Githogoro Slums.",
    category: "Education",
    year: "2018",
  },
]

const partners = [
  {
    id: "brilliant-angels",
    name: "Brilliant Angels Academy",
    description: "Community-Based Organisation transforming lives in Githogoro through education, environmental stewardship, youth empowerment, and community development since 2018.",
    category: "education",
    contactPhone: "+254796595995",
    contactEmail: "brilliantangelacademy@gmail.com",
    website: "https://brilliant-angel-cbo.vercel.app",
    location: "Githogoro Slums, Westlands, Nairobi",
    isVerified: true,
  },
  {
    id: "austine-omondi",
    name: "Austine Omondi",
    description: "MCA Aspirant, Karura Ward 2027 and founder of Brilliant Angels CBO — championing progressive leadership, quality education support, environmental sustainability, and youth empowerment across Karura Ward.",
    category: "leadership",
    contactPhone: "+254796595995",
    contactEmail: "austineomondi2020@gmail.com",
    website: AUSTINE_URL,
    location: "Karura Ward, Westlands, Nairobi",
    isVerified: true,
  },
]

export async function GET() {
  return NextResponse.json({
    partner: "Brilliant Angels Academy",
    url: "https://brilliant-angel-cbo.vercel.app",
    newsUrl: NEWS_URL,
    lastSynced: new Date().toISOString(),
    partners,
    items: hardcodedNews,
  })
}
