import React, { useEffect, useState } from 'react';
import '../styles/Footer.css';
import { getPageContent } from '../utils/supabaseClient';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [globalContent, setGlobalContent] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getPageContent('global');
      if (data) setGlobalContent(data);
    })();
  }, []);

  const social = globalContent?.social || {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com'
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Quyen. Tất cả quyền được bảo lưu.</p>
        <div className="social-links">
          {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" title="GitHub">GitHub</a>}
          {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">LinkedIn</a>}
          {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">Twitter</a>}
          {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">Facebook</a>}
        </div>
      </div>
    </footer>
  );
}

export default Footer;