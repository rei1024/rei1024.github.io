export const mullookup = {
	     "MUL0 00000":["Z", "00000"],"MUL1 00000":["Z", "00101"],"MUL0 00001":["NZ", "00000"],"MUL1 00001":["NZ", "00101"],
	     "MUL0 00010":["Z", "00001"],"MUL1 00010":["Z", "00110"],"MUL0 00011":["NZ", "00001"],"MUL1 00011":["NZ", "00110"],
	     "MUL0 00100":["Z", "00010"],"MUL1 00100":["Z", "00111"],"MUL0 00101":["NZ", "00010"],"MUL1 00101":["NZ", "00111"],
	     "MUL0 00110":["Z", "00011"],"MUL1 00110":["Z", "01000"],"MUL0 00111":["NZ", "00011"],"MUL1 00111":["NZ", "01000"],
	     "MUL0 01000":["Z", "00100"],"MUL1 01000":["Z", "01001"],"MUL0 01001":["NZ", "00100"],"MUL1 01001":["NZ", "01001"],
	     "MUL0 01010":["Z", "00101"],"MUL1 01010":["Z", "01010"],"MUL0 01011":["NZ", "00101"],"MUL1 01011":["NZ", "01010"],
	     "MUL0 01100":["Z", "00110"],"MUL1 01100":["Z", "01011"],"MUL0 01101":["NZ", "00110"],"MUL1 01101":["NZ", "01011"],
	     "MUL0 01110":["Z", "00111"],"MUL1 01110":["Z", "01100"],"MUL0 01111":["NZ", "00111"],"MUL1 01111":["NZ", "01100"],
	     "MUL0 10000":["Z", "01000"],"MUL1 10000":["Z", "01101"],"MUL0 10001":["NZ", "01000"],"MUL1 10001":["NZ", "01101"],
	     "MUL0 10010":["Z", "01001"],"MUL1 10010":["Z", "01110"],"MUL0 10011":["NZ", "01001"],"MUL1 10011":["NZ", "01110"],
	     "MUL0 10100":["Z", "01010"],"MUL1 10100":["Z", "01111"],"MUL0 10101":["NZ", "01010"],"MUL1 10101":["NZ", "01111"],
	     "MUL0 10110":["Z", "01011"],"MUL1 10110":["Z", "00000"],"MUL0 10111":["NZ", "01011"],"MUL1 10111":["NZ", "00000"],
	     "MUL0 11000":["Z", "01100"],"MUL1 11000":["Z", "00001"],"MUL0 11001":["NZ", "01100"],"MUL1 11001":["NZ", "00001"],
	     "MUL0 11010":["Z", "01101"],"MUL1 11010":["Z", "00010"],"MUL0 11011":["NZ", "01101"],"MUL1 11011":["NZ", "00010"],
	     "MUL0 11100":["Z", "01110"],"MUL1 11100":["Z", "00011"],"MUL0 11101":["NZ", "01110"],"MUL1 11101":["NZ", "00011"],
	     "MUL0 11110":["Z", "01111"],"MUL1 11110":["Z", "00100"],"MUL0 11111":["NZ", "01111"],"MUL1 11111":["NZ", "00100"]}

export const addlookup = {"000 bit0 A1":["NONE","010 bit1"],"000 bit0 B1":["NZ","000 bit0"],"000 bit0 B0":["Z","000 bit0"],
	     "000 bit1 A1":["NONE","010 bit0"],"000 bit1 B1":["Z","000 bit0"],"000 bit1 B0":["NZ","000 bit0"],
	     "001 bit0 A1":["NONE","011 bit1"],"001 bit0 B1":["NZ","000 bit0"],"001 bit0 B0":["Z","000 bit0"],
	     "001 bit1 A1":["NONE","011 bit0"],"001 bit1 B1":["Z","000 bit0"],"001 bit1 B0":["NZ","000 bit0"],
	     "010 bit0 A1":["NONE","000 bit1"],"010 bit0 B1":["NZ","100 bit1"],"010 bit0 B0":["Z","000 bit0"],
	     "010 bit1 A1":["NONE","000 bit0"],"010 bit1 B1":["Z","100 bit1"],"010 bit1 B0":["NZ","000 bit0"],
	     "011 bit0 A1":["NONE","001 bit1"],"011 bit0 B1":["NZ","000 bit0"],"011 bit0 B0":["Z","100 bit1"],
	     "011 bit1 A1":["NONE","001 bit0"],"011 bit1 B1":["Z","000 bit0"],"011 bit1 B0":["NZ","100 bit1"],
	     "100 bit0 A1":["NONE","110 bit1"],"100 bit0 B1":["NZ","100 bit1"],"100 bit0 B0":["Z","000 bit0"],
	     "100 bit1 A1":["NONE","110 bit0"],"100 bit1 B1":["Z","100 bit1"],"100 bit1 B0":["NZ","000 bit0"],
	     "101 bit0 A1":["NONE","111 bit1"],"101 bit0 B1":["NZ","000 bit0"],"101 bit0 B0":["Z","100 bit1"],
	     "101 bit1 A1":["NONE","111 bit0"],"101 bit1 B1":["Z","000 bit0"],"101 bit1 B0":["NZ","100 bit1"],
	     "110 bit0 A1":["NONE","100 bit1"],"110 bit0 B1":["NZ","100 bit1"],"110 bit0 B0":["Z","100 bit1"],
	     "110 bit1 A1":["NONE","100 bit0"],"110 bit1 B1":["Z","100 bit1"],"110 bit1 B0":["NZ","100 bit1"],
	     "111 bit0 A1":["NONE","101 bit1"],"111 bit0 B1":["NZ","100 bit1"],"111 bit0 B0":["Z","100 bit1"],
	     "111 bit1 A1":["NONE","101 bit0"],"111 bit1 B1":["Z","100 bit1"],"111 bit1 B0":["NZ","100 bit1"]}

export const sublookup = {"000 stopper0 bit0 A1":["NONE","000 stopper1 bit1"],"000 stopper0 bit0 B0":["Z","000 stopper0 bit0"],
	     "000 stopper0 bit0 B1":["NZ","100 stopper0 bit1"],"000 stopper0 bit1 A1":["NONE","000 stopper1 bit0"],
	     "000 stopper0 bit1 B0":["NZ","000 stopper0 bit0"],"000 stopper0 bit1 B1":["Z","100 stopper0 bit1"],
	     "000 stopper1 bit0 A1":["NONE","FAILURE"],"000 stopper1 bit0 B0":["Z","000 stopper0 bit0"],
	     "000 stopper1 bit0 B1":["NZ","000 stopper0 bit0"],"000 stopper1 bit1 A1":["NONE","FAILURE"],
	     "000 stopper1 bit1 B0":["NZ","000 stopper0 bit0"],"000 stopper1 bit1 B1":["Z","000 stopper0 bit0"],
	     "001 stopper0 bit0 A1":["NONE","001 stopper1 bit1"],"001 stopper0 bit0 B0":["Z","100 stopper0 bit1"],
	     "001 stopper0 bit0 B1":["NZ","000 stopper0 bit0"],"001 stopper0 bit1 A1":["NONE","001 stopper1 bit0"],
	     "001 stopper0 bit1 B0":["NZ","100 stopper0 bit1"],"001 stopper0 bit1 B1":["Z","000 stopper0 bit0"],
	     "001 stopper1 bit0 A1":["NONE","FAILURE"],"001 stopper1 bit0 B0":["Z","000 stopper0 bit0"],
	     "001 stopper1 bit0 B1":["NZ","000 stopper0 bit0"],"001 stopper1 bit1 A1":["NONE","FAILURE"],
	     "001 stopper1 bit1 B0":["NZ","000 stopper0 bit0"],"001 stopper1 bit1 B1":["Z","000 stopper0 bit0"],
	     "010 stopper0 bit0 A1":["NONE","010 stopper1 bit1"],"010 stopper0 bit0 B0":["Z","000 stopper0 bit0"],
	     "010 stopper0 bit0 B1":["NZ","000 stopper0 bit0"],"010 stopper0 bit1 A1":["NONE","010 stopper1 bit0"],
	     "010 stopper0 bit1 B0":["NZ","000 stopper0 bit0"],"010 stopper0 bit1 B1":["Z","000 stopper0 bit0"],
	     "010 stopper1 bit0 A1":["NONE","FAILURE"],"010 stopper1 bit0 B0":["Z","000 stopper0 bit0"],
	     "010 stopper1 bit0 B1":["NZ","100 stopper0 bit1"],"010 stopper1 bit1 A1":["NONE","FAILURE"],
	     "010 stopper1 bit1 B0":["NZ","000 stopper0 bit0"],"010 stopper1 bit1 B1":["Z","100 stopper0 bit1"],
	     "011 stopper0 bit0 A1":["NONE","011 stopper1 bit1"],"011 stopper0 bit0 B0":["Z","000 stopper0 bit0"],
	     "011 stopper0 bit0 B1":["NZ","000 stopper0 bit0"],"011 stopper0 bit1 A1":["NONE","011 stopper1 bit0"],
	     "011 stopper0 bit1 B0":["NZ","000 stopper0 bit0"],"011 stopper0 bit1 B1":["Z","000 stopper0 bit0"],
	     "011 stopper1 bit0 A1":["NONE","FAILURE"],"011 stopper1 bit0 B0":["Z","100 stopper0 bit1"],
	     "011 stopper1 bit0 B1":["NZ","000 stopper0 bit0"],"011 stopper1 bit1 A1":["NONE","FAILURE"],
	     "011 stopper1 bit1 B0":["NZ","100 stopper0 bit1"],"011 stopper1 bit1 B1":["Z","000 stopper0 bit0"],
	     "100 stopper0 bit0 A1":["NONE","100 stopper1 bit1"],"100 stopper0 bit0 B0":["Z","100 stopper0 bit1"],
	     "100 stopper0 bit0 B1":["NZ","100 stopper0 bit1"],"100 stopper0 bit1 A1":["NONE","100 stopper1 bit0"],
	     "100 stopper0 bit1 B0":["NZ","100 stopper0 bit1"],"100 stopper0 bit1 B1":["Z","100 stopper0 bit1"],
	     "100 stopper1 bit0 A1":["NONE","FAILURE"],"100 stopper1 bit0 B0":["Z","000 stopper0 bit0"],
	     "100 stopper1 bit0 B1":["NZ","100 stopper0 bit1"],"100 stopper1 bit1 A1":["NONE","FAILURE"],
	     "100 stopper1 bit1 B0":["NZ","000 stopper0 bit0"],"100 stopper1 bit1 B1":["Z","100 stopper0 bit1"],
	     "101 stopper0 bit0 A1":["NONE","101 stopper1 bit1"],"101 stopper0 bit0 B0":["Z","100 stopper0 bit1"],
             "101 stopper0 bit0 B1":["NZ","100 stopper0 bit1"],"101 stopper0 bit1 A1":["NONE","101 stopper1 bit0"],
	     "101 stopper0 bit1 B0":["NZ","100 stopper0 bit1"],"101 stopper0 bit1 B1":["Z","100 stopper0 bit1"],
	     "101 stopper1 bit0 A1":["NONE","FAILURE"],"101 stopper1 bit0 B0":["Z","100 stopper0 bit1"],
	     "101 stopper1 bit0 B1":["NZ","000 stopper0 bit0"],"101 stopper1 bit1 A1":["NONE","FAILURE"],
	     "101 stopper1 bit1 B0":["NZ","100 stopper0 bit1"],"101 stopper1 bit1 B1":["Z","000 stopper0 bit0"],
	     "110 stopper0 bit0 A1":["NONE","110 stopper1 bit1"],"110 stopper0 bit0 B0":["Z","000 stopper0 bit0"],
	     "110 stopper0 bit0 B1":["NZ","100 stopper0 bit1"],"110 stopper0 bit1 A1":["NONE","110 stopper1 bit0"],
	     "110 stopper0 bit1 B0":["NZ","000 stopper0 bit0"],"110 stopper0 bit1 B1":["Z","100 stopper0 bit1"],
	     "110 stopper1 bit0 A1":["NONE","FAILURE"],"110 stopper1 bit0 B0":["Z","100 stopper0 bit1"],
	     "110 stopper1 bit0 B1":["NZ","100 stopper0 bit1"],"110 stopper1 bit1 A1":["NONE","FAILURE"],
	     "110 stopper1 bit1 B0":["NZ","100 stopper0 bit1"],"110 stopper1 bit1 B1":["Z","100 stopper0 bit1"],
	     "111 stopper0 bit0 A1":["NONE","111 stopper1 bit1"],"111 stopper0 bit0 B0":["Z","100 stopper0 bit1"],
	     "111 stopper0 bit0 B1":["NZ","000 stopper0 bit0"],"111 stopper0 bit1 A1":["NONE","111 stopper1 bit0"],
	     "111 stopper0 bit1 B0":["NZ","100 stopper0 bit1"],"111 stopper0 bit1 B1":["Z","000 stopper0 bit0"],
	     "111 stopper1 bit0 A1":["NONE","FAILURE"],"111 stopper1 bit0 B0":["Z","100 stopper0 bit1"],
	     "111 stopper1 bit0 B1":["NZ","100 stopper0 bit1"],"111 stopper1 bit1 A1":["NONE","FAILURE"],
             "111 stopper1 bit1 B0":["NZ","100 stopper0 bit1"],"111 stopper1 bit1 B1":["Z","100 stopper0 bit1"]}

// function parseBin(str) {
// 	return parseInt(str, 2);
// }
/*
        this.mul_reg = "00000";
        this.sub_reg = "000 stopper0 bit0";
        this.add_reg = "000 bit0"
*/
/*
export const mullookup2 = (() => {
	const mul0 = Object.entries(mullookup).filter(([key, value]) => {
		return key.startsWith("MUL0");
	}).map(([key, value]) => [value[0] === "Z" ? 0 : 1, parseBin(value[1]) ] );
	console.log(mul0);

	const mul1 = Object.entries(mullookup).filter(([key, value]) => {
		return key.startsWith("MUL1");
	}).map(([key, value]) => [value[0] === "Z" ? 0 : 1, parseBin(value[1]) ] );
	console.log(mul1);
	return 
})()

export const addlookup2 = (() => {
	const a1 = Object.entries(addlookup).filter(([key, value]) => {
		return key.endsWith("A1");
	}).map(([key, value]) => parseBin(value[1].substring(0, 3) + value[1][7]) );
	console.log(a1);

	const b0 = Object.entries(addlookup).filter(([key, value]) => {
		return key.endsWith("B0");
	}).map(([key, value]) => parseBin(value[1].substring(0, 3) + value[1][7]) );
	console.log(b0);

	const b1 = Object.entries(addlookup).filter(([key, value]) => {
		return key.endsWith("B1");
	}).map(([key, value]) => parseBin(value[1].substring(0, 3) + value[1][7]) );
	console.log(b1);
})()
*/

// export const sublookup2 = (() => {
// 	// key.substring(0, 3) + key[11] + key[16] + ":" + 
// 	const f = x => Object.entries(sublookup).filter(([key, value]) => {
// 		return key.endsWith(x);
// 	}).map(([key, value]) => {
// 		const v = value[1]
// 		if (v.startsWith("F")) {
// 			return -1
// 		}
// 		return parseBin(v.substring(0, 3) + v[11] + v[16] );
// 	} )
// 	const a1 = f("A1") // NONE
// 	console.log(a1);
// 	const b0 = f("B0"); // Z NZ
// 	console.log(b0)
// 	const b1 = f("B1"); // NZ Z
// 	console.log(b1)

// })()


export const addlookup_a1 = [5, 4, 7, 6, 1, 0, 3, 2, 13, 12, 15, 14, 9, 8, 11, 10];
export const addlookup_b0 = [0, 0, 0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9, 9, 9];
export const addlookup_b1 = [0, 0, 0, 0, 9, 9, 0, 0, 9, 9, 0, 0, 9, 9, 9, 9];

/**
 * `-1` is `"FAILURE"`
 */
export const sublookup_a1 = [3, 2, -1, -1, 7, 6, -1, -1, 11, 10, -1, -1, 15, 14, -1, -1, 19, 18, -1, -1, 23, 22, -1, -1, 27, 26, -1, -1, 31, 30, -1, -1];
export const sublookup_b0 = [0, 0, 0, 0, 17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 17, 17];
export const sublookup_b1 = [17, 17, 0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 0, 0, 0, 0, 17, 17, 17, 17, 17, 17, 0, 0, 17, 17, 17, 17, 0, 0, 17, 17];
