import { parseZoneFile, makeZoneFile } from "zone-file";
import * as fs from 'fs';

export function getDefaultAddress(coin: string, text: any | string): { [key: string]: string } | null {
    let addresses = getAddresses(coin, text);
    return (addresses == null ? null : addresses[0]);
}

export function getAddresses(coin: string, text: any | string): { [key: string]: string }[] | null {
    // what type to use for text?
    let zoneFileJson = (typeof text === 'string' ? parseZoneFile(text) : text);
    let origin = zoneFileJson.$origin;
    let txts = zoneFileJson.txt;

    if (origin == null || txts == null) return null;
    let rrName = getResourceRecordName(coin, origin);

    for (const txt of txts) {
        if (txt.name == rrName) { // if there are 2 rr of the same name?
            let data = txt.txt;
            if (Array.isArray(data)) {
                data = data[0];
            }
            let addresses = data.split(',');

            let ret = [];
            for (const addr of addresses) {
                ret.push({
                    'coin': coin.toUpperCase(),
                    'address': addr,
                })
            }
            return ret;
        }
    }

    return null;
}

export function updateAddresses(coin: string, text: any | string, addresses: string[]) {
    // if addresses = [], then the entry will be removed
    // returns a zone file JSON
    let zoneFileJson = (typeof text === 'string' ? parseZoneFile(text) : text);
    let origin = zoneFileJson.$origin;
    let txts = zoneFileJson.txt;

    if (origin == null || txts == null) return zoneFileJson;
    let rrName = getResourceRecordName(coin, origin);

    txts = txts.filter((x: any) => x.name != rrName);

    if (addresses.length > 0) {
        txts.push({
            'name': rrName,
            'txt': addresses.join(',')
        })
    }
    zoneFileJson.txt = txts;
    return zoneFileJson;
}

function getResourceRecordName(coin: string, name: string): string {
    // TODO: need name.toLowerCase()?
    return '_' + coin.toLowerCase() + '._addr.' + name + '.';
}

// --- Testing ---

console.log(getResourceRecordName('BTC', 'muneeb.id'));

let text = fs.readFileSync('zonefile.txt', 'utf8');
console.log(parseZoneFile(text));
console.log(getAddresses('BTC', text));
console.log(getAddresses('BTC', updateAddresses('btc', text, [])));
let text2 = updateAddresses('stx', text, ['1234', '5678']);
console.log(text2);
console.log(getDefaultAddress('STX', text2));

// this output file contains a lot of comments
// console.log(makeZoneFile(text2)); 
