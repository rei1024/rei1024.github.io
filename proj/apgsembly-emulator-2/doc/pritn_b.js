// binary to bcd

// 110100110100011

// 123
// divmod by 10
// (12, 3)


// 1230
// 120

class Bits {
    constructor(n) {
        this.n = n;
    }
}

function printB(bits) {

}

/*

1010


001001110010100

   0
001001110010100
1010

   00
001001110010100
 1010

   000
001001110010100
  1010

   000

001001110010100
   1010
   1001
  1010と0010を比べる
0010が小さいので0を立てる

Bのカーソルは一番左の1のビットまたはそれより左にあるとする。

B0が変換するレジスタ
B1が商
U0が余り

*/