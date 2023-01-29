export function getZoneFileTemplate() {
  return '{$origin}\n\
{$ttl}\n\
{ns}\n\
{mx}\n\
{a}\n\
{aaaa}\n\
{cname}\n\
{ptr}\n\
{txt}\n\
{srv}\n\
{spf}\n\
{uri}\n\
';
}
