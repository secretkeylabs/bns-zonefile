import { getDefaultAddress, getAddresses, addAddress, removeAddress, removeCoin, setAddresses } from "../src/zone";
import { parseZoneFile, makeZoneFile } from "../src/zone";

const file1 = `$ORIGIN muneeb.id
$TTL 3600
_http._tcp URI 10 1 "https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"
`
const file2 = `$ORIGIN muneeb.id
$TTL 3600
_http._tcp URI 10 1 "https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"
_btc._addr.muneeb.id. IN TXT "0x123"
_stx._addr.muneeb.id. IN TXT "0xABC"
`
const zoneFileJson1 = parseZoneFile(file1);
const zoneFileJson2 = parseZoneFile(file2);

describe('zone file without txt', () => {
    test('initial state', () => {
        let testJson = parseZoneFile(file1);

        expect(testJson.$origin).toEqual('muneeb.id');
        expect(testJson.txt).toEqual(undefined);
        expect(getDefaultAddress(testJson, 'btc')).toEqual(null);
        expect(getAddresses(testJson, 'stx')).toEqual([]);
    });
    test('add and remove address', () => {
        let testJson = parseZoneFile(file1);

        addAddress(testJson, 'btc', '1234', true);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('1234');
        expect(getAddresses(testJson, 'btc')).toEqual(['1234']);

        addAddress(testJson, 'btc', '5678', true);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('5678');
        expect(getAddresses(testJson, 'btc')).toEqual(['5678', '1234']);

        removeAddress(testJson, 'stx', '5678');
        expect(getAddresses(testJson, 'btc')).toEqual(['5678', '1234']);

        removeAddress(testJson, 'btc', '5678');
        expect(getAddresses(testJson, 'btc')).toEqual(['1234']);

        removeCoin(testJson, 'btc');
        expect(getDefaultAddress(testJson, 'btc')).toEqual(null);
        expect(getAddresses(testJson, 'btc')).toEqual([]);
    });
    test('set addresses', () => {
        let testJson = parseZoneFile(file1);

        setAddresses(testJson, 'btc', ['1234']);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('1234');
        expect(getAddresses(testJson, 'btc')).toEqual(['1234']);

        setAddresses(testJson, 'btc', ['5678', '1111']);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('5678');
        expect(getAddresses(testJson, 'btc')).toEqual(['5678', '1111']);

        setAddresses(testJson, 'btc', []);
        expect(getDefaultAddress(testJson, 'btc')).toEqual(null);
        expect(getAddresses(testJson, 'btc')).toEqual([]);
    });
});

describe('zone file with txt', () => {
    test('initial state', () => {
        let testJson = parseZoneFile(file2);

        expect(testJson.$origin).toEqual('muneeb.id');
        expect(testJson.txt?.length).toEqual(2);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('0x123');
        expect(getAddresses(testJson, 'stx')).toEqual(['0xABC']);
    });
    test('add and remove address', () => {
        let testJson = parseZoneFile(file2);

        addAddress(testJson, 'btc', '0x456', true);
        addAddress(testJson, 'stx', '0xXYZ', false);
        expect(getDefaultAddress(testJson, 'btc')).toEqual('0x456');
        expect(getAddresses(testJson, 'stx')).toEqual(['0xABC', '0xXYZ']);

        addAddress(testJson, 'BTC', '0x456', false);
        addAddress(testJson, 'STX', '0xXYZ', true);
        expect(getAddresses(testJson, 'btc')).toEqual(['0x123', '0x456']);
        expect(getDefaultAddress(testJson, 'STx')).toEqual('0xXYZ');

        removeCoin(testJson, 'btc');
        expect(getDefaultAddress(testJson, 'Btc')).toEqual(null);

        removeAddress(testJson, 'stx', '0xXYZ');
        expect(getDefaultAddress(testJson, 'stx')).toEqual('0xABC');
        expect(getAddresses(testJson, 'stx')).toEqual(['0xABC']);
    });
    test('set addresses', () => {
        let testJson = parseZoneFile(file2);

        setAddresses(testJson, 'eth', ['1234', '5678']);
        expect(getDefaultAddress(testJson, 'eth')).toEqual('1234');

        addAddress(testJson, 'eth', '5678', true);
        expect(getAddresses(testJson, 'ETH')).toEqual(['5678', '1234']);

    });
    test('make zone file', () => {
        let testJson = parseZoneFile(file2);

        setAddresses(testJson, 'ETH', ['1234', '5678']);
        removeCoin(testJson, 'STx');
        expect(makeZoneFile(testJson)).toEqual(`$ORIGIN muneeb.id
$TTL 3600

_btc._addr.muneeb.id.\tIN\tTXT\t"0x123"
_eth._addr.muneeb.id.\tIN\tTXT\t"1234,5678"

_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"

`
);
    });
});
