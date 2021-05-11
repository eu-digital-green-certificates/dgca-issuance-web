import base45 from '../misc/wbase45'

it('encode-decode45', () => {
    const buf = Buffer.from('test');
    const encoded = base45.encode(buf);
    const decoded = base45.decode(encoded);
    expect(buf).toEqual(decoded);
    expect(encoded).not.toBeNull();
});

it('encode-decode-bytes', () => {
    const barr = [];
    for (let i = 0; i < 255; i++) {
        barr.push(i);
    }
    const buf = Buffer.from(barr);
    const encoded = base45.encode(buf);
    const decoded = base45.decode(encoded);
    expect(buf).toEqual(decoded);
});

it('encode-decode-rnd', () => {
    for (let x = 0; x < 100; x++) {
        const barr = [];
        for (let i = 0; i < 1000; i++) {
            barr.push((Math.random() * 255) | 0);
        }
        const buf = Buffer.from(barr);
        const encoded = base45.encode(buf);
        const decoded = base45.decode(encoded);
        expect(buf).toEqual(decoded);
    }
});