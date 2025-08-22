// components/Profile/index.ts
export { default as Profile } from './Profile';
export { default as ProfileHeader } from './ProfileHeader';

// Section components
export { default as BasicInformation } from './sections/BasicInformation';
export { default as ContactInformation } from './sections/ContactInformation';
export { default as ProfessionalDetails } from './sections/ProfessionalDetails';
export { AddressInformation } from './sections/AddressInformation';
export { EmergencyContact } from './sections/EmergencyContact';
export { SkillsCertifications } from './sections/SkillsCertification';
export {  SocialLinks } from './sections/SocialLinks';
export { ActivityLog } from './sections/ActivityLog';

export { default as AdminActions } from './sections/AdminActions';

// Re-export main component as default
export { default } from './Profile';