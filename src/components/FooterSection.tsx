import React from 'react';
import { colors } from '../utils/colors';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  title: string;
  links: FooterLink[];
}

export default function FooterSection({ title, links }: FooterSectionProps) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="hover:text-[#FF9F1C] transition-colors">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}