import { KumaStatusSource } from '../models/kuma-source.model';

export const KUMA_STATUS_READER = Symbol('KUMA_STATUS_READER');

export interface KumaStatusReaderPort {
  read(): Promise<KumaStatusSource>;
}
