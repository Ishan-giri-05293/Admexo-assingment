export type LeadCategory = 'AI Automation' | 'Web Development' | 'Mobile App' | 'Marketing' | 'Other';
export type LeadPriority = 'High' | 'Medium' | 'Low';

export function classifyLead(requirement: string): { category: LeadCategory; priority: LeadPriority } {
  const req = requirement.toLowerCase();

  let category: LeadCategory = 'Other';

  if (req.includes('chatbot') || req.includes('ai') || req.includes('automation')) {
    category = 'AI Automation';
  } else if (req.includes('website') || req.includes('web') || req.includes('landing page')) {
    category = 'Web Development';
  } else if (req.includes('mobile') || req.includes('app') || req.includes('ios') || req.includes('android')) {
    category = 'Mobile App';
  } else if (req.includes('marketing') || req.includes('seo') || req.includes('social media')) {
    category = 'Marketing';
  }

  const priority: LeadPriority =
    category === 'AI Automation' ? 'High' :
    category === 'Web Development' ? 'Medium' :
    'Low';

  return { category, priority };
}
