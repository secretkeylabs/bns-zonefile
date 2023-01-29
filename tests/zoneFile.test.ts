import { getDefaultAddress, getAddresses, addAddress, removeAddress, removeCoin, setAddresses } from "../src/zoneFile";
import { parseZoneFile, makeZoneFile } from "../src/zoneFile";

const file1 = `$ORIGIN muneeb.id
$TTL 3600
_http._tcp URI 10 1 "https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"
`
const file2 = `$ORIGIN muneeb.id
$TTL 3600
_http._tcp URI 10 1 "https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"
_btc._addr.muneeb.id. IN TXT "1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS"
_stx._addr.muneeb.id. IN TXT "SPTESTWZ9EJMHV4PHVS0C8H3B3E4Q079ZHY6CXDS1"
`

describe('zone file without txt', () => {
    test('initial state', () => {
        let zoneFileJson = parseZoneFile(file1);

        expect(zoneFileJson.$origin).toEqual('muneeb.id');
        expect(zoneFileJson.txt).toEqual(undefined);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(null);
        expect(getAddresses(zoneFileJson, 'stx')).toEqual([]);
    });
    test('add and remove address', () => {
        let zoneFileJson = parseZoneFile(file1);
        let address1 = '1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS';
        let address2 = '2TESTdxfbSnmCYYNdeYpUnztiYzVfBEQeC';

        addAddress(zoneFileJson, 'btc', address1, true);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address1);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address1]);

        addAddress(zoneFileJson, 'btc', address2, true);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address2);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address2, address1]);

        removeAddress(zoneFileJson, 'eth', address2);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address2, address1]);

        removeAddress(zoneFileJson, 'btc', address2);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address1]);

        removeCoin(zoneFileJson, 'btc');
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(null);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([]);
    });
    test('set addresses', () => {
        let zoneFileJson = parseZoneFile(file1);
        let address1 = '1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS';
        let address2 = '2TESTdxfbSnmCYYNdeYpUnztiYzVfBEQeC';
        let address3 = '3TESTZjwamWJXThX2Y8C2d47QqhAkkc5os';

        setAddresses(zoneFileJson, 'btc', [address1]);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address1);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address1]);

        setAddresses(zoneFileJson, 'btc', [address2, address3]);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address2);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address2, address3]);

        setAddresses(zoneFileJson, 'btc', []);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(null);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([]);
    });
});

describe('zone file with txt', () => {
    test('initial state', () => {
        let zoneFileJson = parseZoneFile(file2);
        let address1 = '1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS';
        let address2 = 'SPTESTWZ9EJMHV4PHVS0C8H3B3E4Q079ZHY6CXDS1';

        expect(zoneFileJson.$origin).toEqual('muneeb.id');
        expect(zoneFileJson.txt?.length).toEqual(2);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address1);
        expect(getAddresses(zoneFileJson, 'stx')).toEqual([address2]);
    });
    test('add and remove address', () => {
        let zoneFileJson = parseZoneFile(file2);
        let address1 = '1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS';
        let address2 = '2TESTdxfbSnmCYYNdeYpUnztiYzVfBEQeC';
        let address3 = 'SPTESTWZ9EJMHV4PHVS0C8H3B3E4Q079ZHY6CXDS1';
        let address4 = 'SPNEWTX4KMNMCX8Q047K1XMY5XQG7HD9WRZSDCHB';

        addAddress(zoneFileJson, 'btc', address2, true);
        addAddress(zoneFileJson, 'stx', address4, false);
        expect(getDefaultAddress(zoneFileJson, 'btc')).toEqual(address2);
        expect(getAddresses(zoneFileJson, 'stx')).toEqual([address3, address4]);

        addAddress(zoneFileJson, 'BTC', address2, false);
        addAddress(zoneFileJson, 'STX', address4, true);
        expect(getAddresses(zoneFileJson, 'btc')).toEqual([address1, address2]);
        expect(getDefaultAddress(zoneFileJson, 'STx')).toEqual(address4);

        removeCoin(zoneFileJson, 'btc');
        expect(getDefaultAddress(zoneFileJson, 'Btc')).toEqual(null);

        removeAddress(zoneFileJson, 'stx', address4);
        expect(getDefaultAddress(zoneFileJson, 'stx')).toEqual(address3);
        expect(getAddresses(zoneFileJson, 'stx')).toEqual([address3]);
    });
    test('set addresses', () => {
        let zoneFileJson = parseZoneFile(file2);
        let address1 = '0x1TESTA9E9aa1C9dB991C7721a92d351Db4FaC990';
        let address2 = '0x2TEST18CA8B9251b393131C08a736A67ccB19297';

        setAddresses(zoneFileJson, 'eth', [address1, address2]);
        expect(getDefaultAddress(zoneFileJson, 'eth')).toEqual(address1);

        addAddress(zoneFileJson, 'eth', address2, true);
        expect(getAddresses(zoneFileJson, 'ETH')).toEqual([address2, address1]);

    });
    test('make zone file', () => {
        let zoneFileJson = parseZoneFile(file2);
        let address1 = '0x1TESTA9E9aa1C9dB991C7721a92d351Db4FaC990';
        let address2 = '0x2TEST18CA8B9251b393131C08a736A67ccB19297';

        setAddresses(zoneFileJson, 'ETH', [address1, address2]);
        removeCoin(zoneFileJson, 'STx');
        expect(makeZoneFile(zoneFileJson)).toEqual(`$ORIGIN muneeb.id
$TTL 3600

_btc._addr.muneeb.id.\tIN\tTXT\t"1TESTqAqVWQhEsfQz7zEQL1EuSx5tyNLNS"
_eth._addr.muneeb.id.\tIN\tTXT\t"0x1TESTA9E9aa1C9dB991C7721a92d351Db4FaC990,0x2TEST18CA8B9251b393131C08a736A67ccB19297"

_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/1J3PUxY5uDShUnHRrMyU6yKtoHEUPhKULs/0/profile.json"

`
);
    });
});
