// rewritten from https://github.com/ehn-digital-green-development/base45-js
// because it was not usable in typescript (erronous index.d.ts file)

const BASE45_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"
function fromCharCode(c : number) : string {
  return BASE45_CHARSET.charAt(c);
};

function divmod(a : number ,b : number) : [number,number] {
    var remainder = a
    var quotient = 0
    if (a > b) {
        remainder = a % b
    quotient = (a - remainder) / b
    }
    return [ quotient, remainder ]
  }


function encode(uint8array: Buffer) : string {
    var output = [];
    for (var i = 0, length = uint8array.length; i < length; i+=2) {
      if (uint8array.length -i > 1) {
          var x  = (uint8array[i]<<8)+ uint8array[i+1]
          var [ e, x ]  = divmod(x, 45*45)
          var [ d, c ] = divmod(x, 45)
          output.push(fromCharCode(c) + fromCharCode(d) + fromCharCode(e))
      } else {
          var x = uint8array[i]
          var [ d, c ] = divmod(x, 45)
          output.push(fromCharCode(c) + fromCharCode(d))
      }
    }
    return output.join('')
};
  
function decode(str : string) : Buffer {
    var output = []
    var buf = []

    for(var i = 0, length=str.length; i < length; i++) {
        var j = BASE45_CHARSET.indexOf(str[i])
        if (j < 0)
              throw new Error('Base45 decode: unknown character');
        buf.push(j)
    }

    for(var i = 0, length=buf.length; i < length; i+=3) {
        var x = buf[i] + buf[i + 1] * 45
        if (length - i >= 3) {
          var [d, c] = divmod(x + buf[i + 2] * 45 * 45,256)
          output.push(d)
          output.push(c)
        } else {
          output.push(x)
        }
    }
    return Buffer.from(output);
};
  
export default {
  encode, decode
}
  
  


