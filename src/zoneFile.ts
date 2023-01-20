import * as ZF from "zone-file";
import * as fs from 'fs';
import { ZoneFileObject } from "./types";
import { getZoneFileTemplate } from "./zoneFileTemplate";

export function getDefaultAddress(zoneFileJson: ZoneFileObject, coin: string): string | null {
    //returns null if there's no address

    let addresses = getAddresses(zoneFileJson, coin);
    return (addresses.length == 0 ? null : addresses[0]);
}

export function getAddresses(zoneFileJson: ZoneFileObject, coin: string): string[] {
    // returns empty list if there's no address

    let origin = zoneFileJson.$origin;
    let txts = zoneFileJson.txt;

    if (origin == undefined || txts == undefined) return [];
    let rrName = getResourceRecordName(coin, origin);

    for (const record of txts) {
        if (record.name == rrName) {
            let data = record.txt;
            if (Array.isArray(data)) {
                data = data[0];
            }
            let addresses = data.split(',');

            return addresses;
        }
    }

    return [];
}

export function addAddress(zoneFileJson: ZoneFileObject, coin: string, address: string, isDefault: boolean) {
    // if address already exists, the default setting can be changed

    let addresses = getAddresses(zoneFileJson, coin);

    if (addresses.includes(address)) {
        if (isDefault && addresses[0] != address) {
            // change address to default
            addresses = addresses.filter(x => x != address);
            addresses.unshift(address);
            setAddresses(zoneFileJson, coin, addresses);
        }
        else if (!isDefault && addresses[0] == address) {
            // next address becomes default
            addresses = addresses.filter(x => x != address);
            addresses.push(address);
            setAddresses(zoneFileJson, coin, addresses);
        }
    }
    else {
        if (isDefault) {
            addresses.unshift(address);
        }
        else {
            addresses.push(address);
        }
        setAddresses(zoneFileJson, coin, addresses);
    }
}

export function removeAddress(zoneFileJson: ZoneFileObject, coin: string, address: string) {

    let addresses = getAddresses(zoneFileJson, coin);

    if (addresses.includes(address)) {
        addresses = addresses.filter(x => x != address);
        setAddresses(zoneFileJson, coin, addresses);
    }
    // else do we want to throw an error

}

export function removeCoin(zoneFileJson: ZoneFileObject, coin: string) {
    // removes the txt entry corresponding to the coin

    setAddresses(zoneFileJson, coin, []);
}

export function setAddresses(zoneFileJson: ZoneFileObject, coin: string, addresses: string[]) {
    // if addresses = [], then the txt entry will be removed
    // returns the resulting zone file JSON

    let origin = zoneFileJson.$origin;
    let txts = zoneFileJson.txt;

    if (origin == undefined) return;
    let rrName = getResourceRecordName(coin, origin);

    if (txts == undefined) txts = [];
    else txts = txts.filter((x: any) => x.name != rrName);

    if (addresses.length > 0) {
        txts.push({
            'name': rrName,
            'txt': addresses.join(',')
        })
    }
    zoneFileJson.txt = txts;
}

export function parseZoneFile(zoneFile: string) {
    // converts zone file text to json
    return ZF.parseZoneFile(zoneFile);
}

export function makeZoneFile(zoneFileJson: ZoneFileObject) {
    // converts zone file json to text
    return ZF.makeZoneFile(zoneFileJson, getZoneFileTemplate());
}

function getResourceRecordName(coin: string, name: string): string {
    return '_' + coin.toLowerCase() + '._addr.' + name + '.';
}
