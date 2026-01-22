"use client";

import { CompanyProfile } from "./CompanyProfile";
import { TermsOfService } from "./TermsOfService";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { LegalNotice } from "./LegalNotice";

export default function StaticPage({ type }: { type: 'company' | 'terms' | 'privacy' | 'legal' }) {
  const Component = {
    company: CompanyProfile,
    terms: TermsOfService,
    privacy: PrivacyPolicy,
    legal: LegalNotice
  }[type];

  return (
    <div className="pt-20 bg-white min-h-screen">
      <Component />
    </div>
  );
}
