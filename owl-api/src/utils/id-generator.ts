import { randomBytes } from 'crypto';

export function generateUserId(): string {
  const randomPart = randomBytes(8).toString('hex');
  return `usr_${randomPart}`;
}

export function generateProjectId(): string {
  const randomPart = randomBytes(8).toString('hex');
  return `pjr_${randomPart}`;
}

export function generateSubmissionId(): string {
  const randomPart = randomBytes(8).toString('hex');
  return `sub_${randomPart}`;
}
