// rewritten from https://github.com/ehn-digital-green-development/base45-js
// because it was not usable in typescript (erronous index.d.ts file)

const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";


const fromCharCode = (c: number): string => {
  return BASE45_CHARSET.charAt(c);
};


const divmod = (a: number, b: number): [number, number] => {

  let remainder = a;
  let quotient = 0;

  remainder = a % b;
  quotient = a / b | 0;

  return [quotient, remainder];
}


const _encode = (uint8array: Buffer): string => {

  let output = [];
  let x, y, e, d, c;

  for (let i = 0, length = uint8array.length; i < length; i += 2) {

    if (uint8array.length - i > 1) {
      x = (uint8array[i] << 8) + uint8array[i + 1];
      [e, y] = divmod(x, 45 * 45);
      [d, c] = divmod(y, 45);

      output.push(fromCharCode(c) + fromCharCode(d) + fromCharCode(e));
    }
    else {
      x = uint8array[i];
      [d, c] = divmod(x, 45);
      output.push(fromCharCode(c) + fromCharCode(d));
    }
  }

  return output.join('');
};


const _decode = (str: string): Buffer => {

  let output = [];
  let buf = [];

  for (let i = 0, length = str.length; i < length; i++) {

    let j = BASE45_CHARSET.indexOf(str[i]);

    if (j < 0) {
      throw new Error('Base45 decode: unknown character');
    }

    buf.push(j);
  }

  for (let i = 0, length = buf.length; i < length; i += 3) {

    let x = buf[i] + buf[i + 1] * 45;

    if (length - i >= 3) {
      let [d, c] = divmod(x + buf[i + 2] * 45 * 45, 256);

      output.push(d);
      output.push(c);

    }
    else {
      output.push(x);
    }
  }

  return Buffer.from(output);
};

const base45 = {
  encode: _encode,
  decode: _decode
}

export default base45;




