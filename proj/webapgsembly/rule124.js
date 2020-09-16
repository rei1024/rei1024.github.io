
const rule = [[1,1,1,0],[1,1,0,1],[1,0,1,1],[1,0,0,1],[0,1,1,1],[0,1,0,1],[0,0,1,0],[0,0,0,0]]
const array = []
array.push(`INITIAL; *; init.1; SET SQ, NOP`);
array.push(`init.1;*;init.2;INC SQX, INC SQY, SET SQ, NOP`);
array.push(`init.2;*;next.gen.01.1; DEC SQX`);
for (let i = 0; i <= 1; i++) {
    for (let j = 0; j <= 1; j++) {
        array.push(`next.gen.${i}${j}.1;*;next.gen.${i}${j}.2; INC SQX, DEC SQY`);
        array.push(`next.gen.${i}${j}.2;*;next.gen.${i}${j}.3; READ SQ`);
    }
}
for (let i = 0; i <= 1; i++) {
    for (let j = 0; j <= 1; j++) {
        array.push(`next.gen.${i}${j}.3;Z;next.gen.${i}${j}0.1;NOP`);
        array.push(`next.gen.${i}${j}.3;NZ;next.gen.${i}${j}1.1;SET SQ, NOP`);
    }
}
for (let i = 0; i <= 1; i++) {
    for (let j = 0; j <= 1; j++) {
        for (let k = 0; k <= 1; k++) {
            array.push(`next.gen.${i}${j}${k}.1;*;next.gen.${i}${j}${k}.2; INC SQY, DEC SQX`);
        }
    }
}
for (let i = 0; i <= 1; i++) {
    for (let j = 0; j <= 1; j++) {
        for (let k = 0; k <= 1; k++) {
            const res = rule.find(x => {
                return i == x[0] && j == x[1] && k == x[2];
            })[3]
            if (res === 0) {
                array.push(`next.gen.${i}${j}${k}.2;*;anchor.check.${j}${k}.1;NOP`);
            } else {
                array.push(`next.gen.${i}${j}${k}.2;*;anchor.check.${j}${k}.1;SET SQ, NOP`);
            }
        }
    }
}
for (let i = 0; i <= 1; i++) {
    for (let j = 0; j <= 1; j++) {
        array.push(`anchor.check.${i}${j}.1;*;anchor.check.${i}${j}.2; INC SQX, READ SQ`);

        array.push(`anchor.check.${i}${j}.2;Z;next.gen.${i}${j}.1;NOP`);
        array.push(`anchor.check.${i}${j}.2;NZ;anchor.set.1;SET SQ, NOP`);
    }
}
array.push(`anchor.set.1;*;return.prev.row;INC SQX, INC SQY, SET SQ, NOP`);
array.push(`return.prev.row;*;return; DEC SQY`);
array.push(`return;*;return.check;DEC SQX`);
array.push(`return.check;Z;next.gen.01.1;INC SQY, NOP`);
array.push(`return.check;NZ;return;NOP`);
console.log(array.join("\n"));
