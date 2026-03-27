import { HttpStatus } from '@/types';
import type { StatusInfo } from '@/types';

export function classifyHttpStatus(code: number): StatusInfo
{
  switch (code)
  {
    case 200:
      return {
        status: HttpStatus.OPERATIONAL,
        label: 'OPERATIONAL',
        color: 'green',
      };
    case 206:
      return {
        status: HttpStatus.HIJACKED,
        label: 'HIJACKED',
        color: 'red',
      };
    case 429:
      return {
        status: HttpStatus.DDOS,
        label: 'DDOS',
        color: 'amber',
      };
    default:
      return {
        status: HttpStatus.UNKNOWN,
        label: 'UNKNOWN',
        color: 'gray',
      };
  }
}
