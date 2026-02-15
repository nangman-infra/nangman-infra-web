import { ContactMessage } from '../contact-message';

export const CONTACT_NOTIFIER = Symbol('CONTACT_NOTIFIER');

export interface ContactNotifierPort {
  send(contactMessage: ContactMessage): Promise<void>;
}
