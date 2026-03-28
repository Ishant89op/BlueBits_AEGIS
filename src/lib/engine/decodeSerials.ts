export function decodeSerial(userAgent: string): { encoded: string; decoded: string }
{
  const tokens = userAgent.split(' ');
  const encoded = tokens[tokens.length - 1];
  try
  {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return { encoded, decoded };
  }
  catch
  {
    return { encoded, decoded: 'DECODE_ERROR' };
  }
}
