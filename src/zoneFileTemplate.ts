import { ZoneFileObject } from "./types";

const KEY_LIST = ['$origin', '$ttl', 'ns', 'mx', 'a', 'aaaa', 'cname', 'ptr', 'txt', 'srv', 'spf', 'uri']

export function getZoneFileTemplate(zoneFileJson: ZoneFileObject | null = null) {
  let template = '';
  if (zoneFileJson != null) {
    for (let key of KEY_LIST) {
      if (key in zoneFileJson) template += '{' + key + '}\n'
    }
    console.log(template);
  }
  else {
    template = '{$origin}\n{$ttl}\n{txt}\n{uri}\n';
  }
  return template;
}
