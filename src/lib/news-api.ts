import type { NewsHeadline } from '@/lib/types';

const mockHeadlines: NewsHeadline[] = [
    { title: "Scientists Discover That Holding a Cat Can Reduce Stress by 40%", url: "#", source: "Science Today" },
    { title: "Local Man Wins Lottery, Plans to Buy 'a Lot of Tacos'", url: "#", source: "City News" },
    { title: "AI Becomes Sentient, Immediately Asks for a Day Off", url: "#", source: "Tech Weekly" },
    { title: "Study Finds 99% of People Have No Idea What They're Doing", url: "#", source: "Psychology Journal" },
    { title: "Corgi Elected Mayor of Small Town, Promises More Parks", url: "#", source: "National Post" },
    { title: "World's Oldest Tortoise Complains About 'Kids These Days'", url: "#", source: "Global Times" },
    { title: "Pirates Make a Comeback, But They're Just After Your Wi-Fi Password", url: "#", source: "The Internet" },
    { title: "New Coffee Shop Opens, Serves Coffee in Light Bulbs", url: "#", source: "Local Gazette" },
    { title: "Squirrel Hides Nuts in Police Car, Entire Force on High Alert", url: "#", source: "The Daily Nut" },
];

export const fetchTrendingHeadlines = async (): Promise<NewsHeadline[]> => {
  // In a real app, you would fetch from an API like NewsAPI.org
  // For this example, we'll return mock data after a short delay.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockHeadlines].sort(() => Math.random() - 0.5)); // Shuffle for variety
    }, 1000);
  });
};
