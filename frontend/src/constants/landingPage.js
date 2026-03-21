import { Target, Wallet, UserRound, Zap, MessagesSquare, MonitorCog, ArrowRight, BookOpen, Building2, Clock3, GraduationCap, MapPin, School, Search, Star, Globe2} from 'lucide-react';

export const BG_SLIDES = [
  { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80',  label: 'Universities'  },
  { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80', label: 'Graduation'   },
  { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=80', label: 'Scholarships' },
  { url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80', label: 'Student Life' },
];

export const SCHOLARSHIPS = [
  { emoji: '🇯🇵', title: 'MEXT Japanese Government Scholarship', org: 'Government of Japan', type: 'Full Funding', deadline: 'Apr 30, 2026', color: '#1B3A6B', link: '/opportunities/japanese-government-mext-scholarship-2026' },
  { emoji: '🇰🇷', title: 'Korean Government Scholarship (GKS)', org: 'Government of Korea', type: 'Full Funding', deadline: 'Mar 31, 2026', color: '#1B3A6B', link: '/opportunities/korean-government-gks-scholarship-2026' },
  { emoji: '🏛️', title: 'RUPP Excellence Scholarship 2026',      org: 'Royal Univ. of Phnom Penh', type: 'Full Funding', deadline: 'Jun 30, 2026', color: '#1B3A6B', link: '/opportunities/rupp-excellence-scholarship-2026' },
  { emoji: '⚙️', title: 'ITC STEM Full Scholarship 2026',        org: 'Institute of Tech. Cambodia', type: 'Full Funding', deadline: 'Jul 15, 2026', color: '#1B3A6B', link: '/opportunities/itc-stem-scholarship-2026' },
];

export const HOW_IT_WORKS = [
  { step: '01', icon: Search, title: 'Search & Explore',    desc: 'Browse 50+ universities filtered by type, province, tuition range, and available scholarships.',     color: '#1B3A6B' },
  { step: '02', icon: Target, title: 'Take the Major Quiz', desc: 'Answer a short guided quiz and get personalized major recommendations that match your interests.',       color: '#4AAEE0' },
  { step: '03', icon: Wallet, title: 'Find Scholarships',   desc: 'Discover funding opportunities from local universities, government programs, and international bodies.', color: '#F47B20' },
  { step: '04', icon: GraduationCap, title: 'Apply & Succeed',     desc: 'Follow the latest campus feed, connect with universities directly, and start your journey.',    color: '#3DAE6B' },
];

export const TESTIMONIALS = [
  { name: 'Srey Leak Heng', role: 'CS Graduate · RUPP 2024',          avatar: UserRound, content: 'UniSites helped me discover RUPP\'s computer science program and apply for their excellence scholarship. I landed a tech job within 3 months of graduating!',                    rating: 5, uni: 'RUPP',   color: '#1B3A6B' },
  { name: 'Dara Pich',      role: 'Electrical Eng. Graduate · ITC',   avatar: UserRound, content: 'Found ITC through UniSites and used the Major Quiz to confirm engineering was right for me. The scholarship finder saved me hours of research.',                           rating: 5, uni: 'ITC',    color: '#4AAEE0' },
  { name: 'Channary Ros',   role: 'Tourism Student · PUC',            avatar: UserRound, content: 'The UniSites feed helped me keep up with hospitality events, scholarships, and student updates from PUC. It made choosing my program much easier.',           rating: 5, uni: 'PUC',    color: '#3DAE6B' },
  { name: 'Kevin Phon',     role: 'Business Graduate · AUPP 2024',    avatar: UserRound, content: 'UniSites made comparing AUPP vs other universities so easy. The detailed program info and student reviews helped me make a confident decision.',                             rating: 5, uni: 'AUPP',   color: '#F47B20' },
];

export const FUN_FACTS = [
  { icon: Globe2, stat: '#1',      desc: 'Platform for Cambodian university discovery',        color: '#1B3A6B', bg: '#eff6ff' },
  { icon: Zap, stat: '< 5 min', desc: 'Average time to find and compare top universities',  color: '#F47B20', bg: '#fff7ed' },
  { icon: Target, stat: '94%',     desc: 'Students found their match using our Major Quiz',    color: '#3DAE6B', bg: '#f0fdf4' },
  { icon: MessagesSquare, stat: '10,000+', desc: 'Students helped and counting across Cambodia',       color: '#4AAEE0', bg: '#f0f9ff' },
];

export const PLACEHOLDER_UNIS = [
  { id: '1', slug: 'royal-university-of-phnom-penh',        name: 'Royal University of Phnom Penh',        university_type: 'public',        province: 'Phnom Penh', program_count: 80,  rating_avg: 4.2, icon: Building2, color: '#1B3A6B' },
  { id: '2', slug: 'institute-of-technology-of-cambodia',   name: 'Institute of Technology of Cambodia',   university_type: 'public',        province: 'Phnom Penh', program_count: 35,  rating_avg: 4.5, icon: MonitorCog, color: '#4AAEE0' },
  { id: '3', slug: 'norton-university',                     name: 'Norton University',                     university_type: 'private',       province: 'Phnom Penh', program_count: 45,  rating_avg: 4.1, icon: GraduationCap, color: '#3DAE6B' },
  { id: '4', slug: 'american-university-of-phnom-penh',     name: 'American University of Phnom Penh',     university_type: 'international', province: 'Phnom Penh', program_count: 20,  rating_avg: 4.6, icon: Globe2, color: '#F47B20' },
];

export const PLACEHOLDER_MAJORS = [
  { id: '1', slug: 'computer-science',      name: 'Computer Science',      icon: '💻', category: 'Technology',  color: '#1B3A6B', jobs: 'Software Engineer, Data Scientist, DevOps' },
  { id: '2', slug: 'business-administration', name: 'Business Administration', icon: '📊', category: 'Business',   color: '#F47B20', jobs: 'Manager, Entrepreneur, Consultant' },
  { id: '3', slug: 'civil-engineering',     name: 'Civil Engineering',     icon: '🏗️', category: 'Engineering', color: '#4AAEE0', jobs: 'Structural Engineer, Project Manager' },
  { id: '4', slug: 'medicine',              name: 'Medicine',              icon: '🏥', category: 'Health',      color: '#ef4444', jobs: 'Doctor, Surgeon, Medical Researcher' },
  { id: '5', slug: 'law',                   name: 'Law',                   icon: '⚖️', category: 'Law',         color: '#8b5cf6', jobs: 'Lawyer, Judge, Legal Consultant' },
  { id: '6', slug: 'hospitality-tourism',   name: 'Hospitality & Tourism', icon: '✈️', category: 'Tourism',     color: '#3DAE6B', jobs: 'Hotel Manager, Tour Guide, Event Planner' },
];

export const TYPE_COLORS = { public: '#1B3A6B', private: '#3DAE6B', international: '#F47B20' };
export const TYPE_BG     = { public: '#eff6ff',  private: '#f0fdf4',  international: '#fff7ed'  };

