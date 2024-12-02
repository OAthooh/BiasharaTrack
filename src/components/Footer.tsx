import React from 'react';
import { Facebook, Twitter, MessageCircle } from 'lucide-react';
import FooterSection from './FooterSection';
import { colors } from '../utils/colors';

const quickLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
];

const supportLinks = [
  { label: 'Help Center', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Privacy Policy', href: '#' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
];

export default function Footer() {
  return (
    <footer className="bg-[#011627] text-[#FDFFFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">BiasharaTrack</h3>
            <p className="opacity-90">Empowering traders with smart business tools</p>
          </div>
          <FooterSection title="Quick Links" links={quickLinks} />
          <FooterSection title="Support" links={supportLinks} />
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a key={index} href={social.href} className="hover:text-[#FF9F1C]" aria-label={social.label}>
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[#FDFFFC]/20 text-center">
          <p>&copy; {new Date().getFullYear()} BiasharaTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}