export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }

export interface NewsArticle {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  readingMinutes: number
  content: NewsBlock[]
}

const AUTHOR = "Githogoro Team"

export const newsArticles: NewsArticle[] = [
  {
    slug: "guide-to-githogoro-nairobi",
    title: "Living in Githogoro, Nairobi: A Complete Community Guide",
    description:
      "A local guide to Githogoro in Karura Ward, Nairobi — where it is, how to get around, and how residents connect, work, and do business.",
    date: "2026-10-14",
    author: AUTHOR,
    tags: ["Githogoro", "Nairobi", "Community Guide"],
    readingMinutes: 5,
    content: [
      {
        type: "p",
        text: "Githogoro is a lively community in Karura Ward, Nairobi County, located close to the Northern Bypass and the Runda area. It is home to thousands of residents who make their living through small businesses, casual work, and the everyday hustle that keeps the neighbourhood moving. This guide is for anyone new to Githogoro, thinking of visiting, or looking for a way to plug into the community.",
      },
      { type: "h2", text: "Where is Githogoro?" },
      {
        type: "p",
        text: "Githogoro sits on the northern side of Nairobi, within easy reach of Westlands, Runda, and the Northern Bypass. Its location places residents close to major roads, bus routes, and the employment opportunities that come with being near some of the city's most active suburbs. The community is well known as a place where new arrivals can find affordable housing and a strong social network.",
      },
      { type: "h2", text: "Why community matters here" },
      {
        type: "p",
        text: "In a fast-growing city, the people around you are your biggest support system. In Githogoro, neighbours share information, recommend each other for work, and come together in difficult moments. That same spirit is what the Githogoro community app was built to extend online — a place to chat with neighbours, find local opportunities, and stay informed about what is happening in your zone.",
      },
      { type: "h2", text: "Staying connected" },
      {
        type: "p",
        text: "Whether you have lived in Githogoro for years or just moved in, staying connected makes everything easier. You can:",
      },
      {
        type: "ul",
        items: [
          "Chat with neighbours in your zone and keep up with community updates.",
          "Find and post jobs in Githogoro and surrounding areas such as Runda and along the Northern Bypass.",
          "Discover and support local businesses, from shops and salons to food and services.",
          "Buy and sell goods in the community marketplace.",
          "Receive alerts for security, fire, water, and other emergencies.",
        ],
      },
      { type: "h2", text: "Get started" },
      {
        type: "p",
        text: "Githogoro is free for residents to join. Create a profile in under a minute, pick your zone, and start connecting with the people around you. The app is available in English and Kiswahili, so everyone can take part.",
      },
    ],
  },
  {
    slug: "find-a-job-in-githogoro",
    title: "How to Find a Job in Githogoro and Around Runda",
    description:
      "Practical tips for finding casual and full-time work in Githogoro, Runda, and along the Northern Bypass, using the Githogoro job board.",
    date: "2026-10-11",
    author: AUTHOR,
    tags: ["Githogoro Jobs", "Employment", "Runda"],
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "Finding work close to home saves time and transport money, and Githogoro's location near Runda, Westlands, and the Northern Bypass means there is demand for many kinds of labour. From casual work to full-time positions, the key is being visible and ready when an opportunity appears.",
      },
      { type: "h2", text: "Where to look" },
      {
        type: "p",
        text: "Most opportunities in and around Githogoro come through word of mouth, neighbours, and community groups. The Githogoro job board brings those opportunities into one place, so you can browse local listings without relying on chance.",
      },
      {
        type: "ul",
        items: [
          "Casual work: cleaning, laundry, gardening, construction, and loading.",
          "Domestic and care work in nearby estates such as Runda.",
          "Skilled trades: tailoring, repairs, plumbing, electrical work, and beauty services.",
          "Delivery and transport, including boda boda and errands.",
          "Retail, food, and hospitality roles in local shops and eateries.",
        ],
      },
      { type: "h2", text: "How to stand out" },
      {
        type: "p",
        text: "First impressions matter, even in casual work. Keep a simple, complete profile with your skills and the areas you can work in. When you contact an employer, be clear about your availability, your experience, and how you can be reached. Follow up politely and show up on time — reliability is the quality employers value most.",
      },
      { type: "h2", text: "If you are hiring" },
      {
        type: "p",
        text: "Githogoro residents are ready to work. Posting a job on the board is free and reaches people who live nearby and can start quickly. Be specific about the role, the pay, and what you expect, and you will get better responses.",
      },
      {
        type: "p",
        text: "Visit the Githogoro jobs page to browse openings or post a role in your area.",
      },
    ],
  },
  {
    slug: "local-businesses-in-githogoro",
    title: "Shopping Local: A Guide to Businesses in Githogoro",
    description:
      "Supporting local businesses in Githogoro keeps money in the community. Here is how to find shops, services, food, and more near you.",
    date: "2026-10-08",
    author: AUTHOR,
    tags: ["Githogoro Businesses", "Local Economy", "Shopping"],
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "Every shilling spent with a local business in Githogoro helps a neighbour, a family, and the wider community. Local traders know their customers, offer flexible service, and are there when you need them — often within walking distance.",
      },
      { type: "h2", text: "What you can find locally" },
      {
        type: "p",
        text: "Githogoro's business community is diverse. A typical walk through the neighbourhood will reveal a wide range of useful services:",
      },
      {
        type: "ul",
        items: [
          "Shops and kiosks for everyday groceries, airtime, and household items.",
          "Food vendors, small eateries, and home kitchens.",
          "Salons, barbers, and beauty services.",
          "Tailors, cobblers, and repair services.",
          "Boda boda and transport providers.",
          "Water vendors, gas suppliers, and other essential services.",
        ],
      },
      { type: "h2", text: "Why shop local" },
      {
        type: "p",
        text: "Buying locally keeps money circulating within Githogoro, creates jobs for residents, and strengthens the businesses that sponsor community activities. It also saves you the cost and time of travelling to distant malls and markets.",
      },
      { type: "h2", text: "For business owners" },
      {
        type: "p",
        text: "If you run a business in Githogoro, listing it in the local directory makes it easier for neighbours and nearby residents to find you. A simple profile with your location, opening hours, and the services you offer is often enough to bring in new customers. The directory is free to join.",
      },
      {
        type: "p",
        text: "Explore the Githogoro businesses directory to discover shops and services, or add your own business today.",
      },
    ],
  },
  {
    slug: "buy-and-sell-githogoro-marketplace",
    title: "Buying and Selling in the Githogoro Marketplace",
    description:
      "How the Githogoro marketplace helps residents buy, sell, and trade goods safely with neighbours instead of strangers.",
    date: "2026-10-05",
    author: AUTHOR,
    tags: ["Githogoro Marketplace", "Buy and Sell", "Community"],
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "There is a lot of value sitting in homes and shops around Githogoro: items you no longer use, goods you can resell, and products people nearby are already looking for. The Githogoro marketplace connects buyers and sellers within the community, so deals stay local and trust stays high.",
      },
      { type: "h2", text: "What you can trade" },
      {
        type: "ul",
        items: [
          "Electronics and phones.",
          "Furniture and household goods.",
          "Clothing, shoes, and fabric.",
          "Kitchen and cooking equipment.",
          "Farm produce, food, and household supplies.",
        ],
      },
      { type: "h2", text: "Tips for a good listing" },
      {
        type: "p",
        text: "Clear, honest listings sell faster. Take a photo in good light, describe the item accurately including its condition, and state a fair price. Mention your general location so buyers know how far they will need to travel. Respond quickly to messages — a fast reply often makes the sale.",
      },
      { type: "h2", text: "Buying safely" },
      {
        type: "p",
        text: "Meeting a neighbour face to face is one of the safest ways to trade online. Choose a public, familiar place to inspect the item, agree on the price before you travel, and confirm the details in a message. Because sellers are part of the Githogoro community, there is real accountability behind every deal.",
      },
      {
        type: "p",
        text: "Visit the Githogoro marketplace to see what is for sale near you.",
      },
    ],
  },
  {
    slug: "staying-safe-in-githogoro",
    title: "Community Safety and Emergency Alerts in Githogoro",
    description:
      "How Githogoro residents use community alerts and safety features to respond quickly to fires, security issues, and other emergencies.",
    date: "2026-10-02",
    author: AUTHOR,
    tags: ["Githogoro Safety", "Emergency Alerts", "Community"],
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "Emergencies rarely announce themselves. In a dense and close-knit community like Githogoro, the fastest and most effective response usually comes from neighbours, not from distant responders. That is why real-time community alerts matter so much.",
      },
      { type: "h2", text: "Why alerts work" },
      {
        type: "p",
        text: "When a fire breaks out, water is cut off, or a security concern arises, minutes count. A community alert reaches many residents at once, helping people respond together: alerting those nearby, sharing accurate information, and coordinating help before the situation worsens.",
      },
      { type: "h2", text: "What you can do" },
      {
        type: "ul",
        items: [
          "Keep community alerts turned on so you are notified as events unfold.",
          "Share only verified information to avoid spreading false alarms.",
          "Know your neighbours and agree on how to raise help in your zone.",
          "Save emergency contacts for your area and keep them handy.",
        ],
      },
      { type: "h2", text: "Building a safer neighbourhood" },
      {
        type: "p",
        text: "Safety is a shared responsibility. When residents communicate clearly and look out for one another, the whole community benefits. Using the Githogoro app to stay informed is a simple step that makes a real difference.",
      },
    ],
  },
  {
    slug: "githogoro-events-and-community-life",
    title: "Events and Community Life in Githogoro",
    description:
      "From sports and meetings to celebrations and clean-ups, Githogoro's community calendar keeps neighbours connected all year round.",
    date: "2026-09-29",
    author: AUTHOR,
    tags: ["Githogoro Events", "Community Life"],
    readingMinutes: 4,
    content: [
      {
        type: "p",
        text: "What makes Githogoro feel like home is not just the place — it is the people and the moments they share. Community events, whether large or small, are where those connections are built.",
      },
      { type: "h2", text: "Types of community events" },
      {
        type: "ul",
        items: [
          "Sports and football matches that bring out the whole neighbourhood.",
          "Public meetings and community forums.",
          "Seminars, training, and skills sessions.",
          "Clean-ups and joint community projects.",
          "Celebrations, fundraisers, and harambees.",
        ],
      },
      { type: "h2", text: "Why showing up matters" },
      {
        type: "p",
        text: "Attending events helps you build relationships, learn about opportunities, and have a say in decisions that affect the community. For businesses, events are also a chance to meet customers. For young people, they are a way to find mentorship and showcase talent.",
      },
      { type: "h2", text: "Stay in the loop" },
      {
        type: "p",
        text: "The Githogoro events calendar lists upcoming gatherings so you never miss out. Check it regularly, RSVP to what interests you, and consider organising something of your own — every event starts with one person willing to bring people together.",
      },
    ],
  },
]

export function getAllArticles(): NewsArticle[] {
  return [...newsArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((article) => article.slug === slug)
}

export function getArticleSlugs(): string[] {
  return newsArticles.map((article) => article.slug)
}

export function formatArticleDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
