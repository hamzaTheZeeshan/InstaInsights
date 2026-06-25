import './CreatorsPage.css';
import Layout from '../components/Layout/Layout';

const creators = [
  {
    name: 'Hamza Zeeshan',
    role: 'Developer & Co-creator',
    bio: 'Passionate about building meaningful products and turning data into insights. Co-created InstaInsights to make chat analytics accessible and private for everyone.',
    github: 'https://github.com/hamzaTheZeeshan',
    linkedin: 'https://www.linkedin.com/in/hamza-zeeshan-0a1407332/',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    initial: 'H',
  },
  {
    name: 'Habib Ahmed',
    role: 'Developer & Co-creator',
    bio: 'Loves crafting clean user experiences and writing efficient code. Co-built InstaInsights with a focus on privacy-first design and real-world usability.',
    github: 'https://github.com/Habib332',
    linkedin: 'https://www.linkedin.com/in/habibahmed5ba3004/',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    initial: 'H',
  },
];

export default function CreatorsPage() {
  return (
    <Layout>
      <div className="creators-page">

        <div className="creators-header">
          <h1 className="creators-title">About the Creators</h1>
          <p className="creators-subtitle">
            InstaInsights was built by two friends who wanted to explore their own
            conversations and in this process ended up building something everyone could use.
          </p>
        </div>

        <div className="creators-grid">
          {creators.map(c => (
            <div key={c.name} className="creator-card">
              <div className="creator-avatar" style={{ background: c.gradient }}>
                {c.initial}
              </div>
              <h2 className="creator-name">{c.name}</h2>
              <p className="creator-role">{c.role}</p>
              <p className="creator-bio">{c.bio}</p>
              <div className="creator-links">
                <a href={c.github} className="creator-link creator-link--github" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={c.linkedin} className="creator-link creator-link--linkedin" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="creators-project-card">
          <h3 className="creators-project-title">About InstaInsights</h3>
          <p className="creators-project-text">
            InstaInsights is a fully private, browser-based Instagram chat analyzer.
            No servers, no data uploads, no tracking — everything runs locally on your device.
            Built with React, TypeScript, and a lot of curiosity about what the numbers say
            about how we talk to the people we care about.
          </p>
          <div className="creators-project-tags">
            {['React', 'TypeScript', 'Vite', 'Recharts', 'Tailwind CSS', '100% Private'].map(tag => (
              <span key={tag} className="project-tag">{tag}</span>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}