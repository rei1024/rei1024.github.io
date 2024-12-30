// @ts-check

// https://conwaylife.com/book

const part1 = `
#COMPONENTS NOP,OUTPUT,B0-3,U0-9,ADD,SUB,MUL
#REGISTERS {"U1":1, "U6":6, "B0":2, "B2":1}
# State Input Next state Actions
# ---------------------------------------
INITIAL; ZZ; ITER1; NOP
# Iterate 4 times per digit.
ITER1; ZZ; ITER2; INC U5, NOP
ITER2; ZZ; ITER3; INC U5, NOP
ITER3; ZZ; ITER4; INC U5, NOP
ITER4; ZZ; ITER5; INC U5, NOP
ITER5; ZZ; ITER6; TDEC U5
# Each iteration, set U0 = U0 + 1, U1 = U1 + 2.
ITER6; Z;  ITER11; TDEC U3
ITER6; NZ; ITER7; INC U0, INC U1, NOP
ITER7; ZZ; MULA1; INC U1, NOP
## The MULA states set B3 = B1, B1 = U1 * B1.
# Copy B1 into B3, without erasing B1.
MULA1; ZZ; MULA2; TDEC U6
MULA2; Z;  MULA3; TDEC U9
MULA2; NZ; MULA2; TDEC U6, INC U9
MULA3; Z;  MULA4; TDEC U7
MULA3; NZ; MULA3; TDEC U9, INC U6, INC U7
MULA4; Z;  MULA7; TDEC B1
MULA4; NZ; MULA5; READ B1

#### ! FIXME: broken
# MULA5; Z;  MULA6; READ B3
# MULA5; NZ; MULA6; SET B1, SET B3, NOP

MULA5; Z;  MULA6; READ B3
MULA5; NZ; MULA6_TEMP; SET B1, READ B3
MULA6_TEMP; *;  MULA6; SET B3, NOP

#### ! ENDFIXME:

MULA6; *;  MULA4; INC B1, INC B3, TDEC U7
MULA7; Z;  MULA8; TDEC B3
MULA7; NZ; MULA7; TDEC B1
MULA8; Z;  MULA9; TDEC U1
MULA8; NZ; MULA8; TDEC B3
# Copy U1 to temporary register U8.
MULA9; Z;  MULA10; TDEC U7
MULA9; NZ; MULA9; TDEC U1, INC U7
MULA10; Z;  MULA11; TDEC U8
MULA10; NZ; MULA10; TDEC U7, INC U1, INC U8
# Set B1 = U1 * B3 and U8 = 0.
MULA11; *;  MULA12; TDEC U8
MULA12; Z;  MULB1; TDEC U6
MULA12; NZ; MULA13; TDEC U6
MULA13; Z;  MULA14; TDEC U9
MULA13; NZ; MULA13; TDEC U6, INC U9
MULA14; Z;  MULA15; TDEC U7
MULA14; NZ; MULA14; TDEC U9, INC U6, INC U7
MULA15; Z;  MULA19; TDEC B3
MULA15; NZ; MULA16; READ B3
MULA16; Z;  MULA17; READ B1
MULA16; NZ; MULA17; READ B1, SET B3, ADD A1
MULA17; Z;  MULA18; ADD B0
MULA17; NZ; MULA18; ADD B1
MULA18; Z;  MULA15; TDEC U7, INC B1, INC B3
MULA18; NZ; MULA18; SET B1, NOP
MULA19; Z;  MULA20; TDEC B1
MULA19; NZ; MULA19; TDEC B3
MULA20; Z;  MULA12; TDEC U8
MULA20; NZ; MULA20; TDEC B1
## The MULB states set B3 = B0, B0 = U0 * B0.
# Copy B0 into B3, without erasing B0.
MULB1; Z;  MULB2; TDEC U9
MULB1; NZ; MULB1; TDEC U6, INC U9
MULB2; Z;  MULB3; TDEC U7
MULB2; NZ; MULB2; TDEC U9, INC U6, INC U7
MULB3; Z;  MULB6; TDEC B0
MULB3; NZ; MULB4; READ B3
MULB4; *;  MULB5; READ B0
MULB5; Z;  MULB3; INC B0, INC B3, TDEC U7
MULB5; NZ; MULB5; SET B0, SET B3, NOP
MULB6; Z;  MULB7; TDEC B3
MULB6; NZ; MULB6; TDEC B0
MULB7; Z;  MULB8; TDEC U0
MULB7; NZ; MULB7; TDEC B3
# Copy U0 to temporary register U8.
MULB8; Z;  MULB9; TDEC U7
MULB8; NZ; MULB8; TDEC U0, INC U7
MULB9; Z;  MULB10; TDEC U8
MULB9; NZ; MULB9; TDEC U7, INC U0, INC U8
`;

const part2 = `
# Set B0 = U0 * B3 and U8 = 0.
MULB10; *;  MULB11; TDEC U8
MULB11; Z;  MULC1; TDEC U1
MULB11; NZ; MULB12; TDEC U6
MULB12; Z;  MULB13; TDEC U9
MULB12; NZ; MULB12; TDEC U6, INC U9
MULB13; Z;  MULB14; TDEC U7
MULB13; NZ; MULB13; TDEC U9, INC U6, INC U7
MULB14; Z;  MULB18; TDEC B3
MULB14; NZ; MULB15; READ B3
MULB15; Z;  MULB16; READ B0
MULB15; NZ; MULB16; READ B0, SET B3, ADD A1
MULB16; Z;  MULB17; ADD B0
MULB16; NZ; MULB17; ADD B1
MULB17; Z;  MULB14; TDEC U7, INC B0, INC B3
MULB17; NZ; MULB17; SET B0, NOP
MULB18; Z;  MULB19; TDEC B0
MULB18; NZ; MULB18; TDEC B3
MULB19; Z;  MULB11; TDEC U8
MULB19; NZ; MULB19; TDEC B0
## The MULC states set B1 = B1 + (U1 * B0).
# Copy U1 to temporary register U8.
MULC1; Z;  MULC2; TDEC U7
MULC1; NZ; MULC1; TDEC U1, INC U7
MULC2; Z;  MULC3; TDEC U8
MULC2; NZ; MULC2; TDEC U7, INC U1, INC U8
# Set B1 = B1 + (U1 * B3) and U8 = 0.
MULC3; Z;  MULD1; TDEC U6
MULC3; NZ; MULC4; TDEC U6
MULC4; Z;  MULC5; TDEC U9
MULC4; NZ; MULC4; TDEC U6, INC U9
MULC5; Z;  MULC6; TDEC U7
MULC5; NZ; MULC5; TDEC U9, INC U6, INC U7
MULC6; Z;  MULC10; TDEC B3
MULC6; NZ; MULC7; READ B3
MULC7; Z;  MULC8; READ B1
MULC7; NZ; MULC8; READ B1, SET B3, ADD A1
MULC8; Z;  MULC9; ADD B0
MULC8; NZ; MULC9; ADD B1
MULC9; Z;  MULC6; TDEC U7, INC B1, INC B3
MULC9; NZ; MULC9; SET B1, NOP
MULC10; Z;  MULC11; TDEC B1
MULC10; NZ; MULC10; TDEC B3
MULC11; Z;  MULC3; TDEC U8
MULC11; NZ; MULC11; TDEC B1
## The MULD states set B2 = U1 * B2.
# Copy B2 into B3, without erasing B2.
MULD1; Z;  MULD2; TDEC U9
MULD1; NZ; MULD1; TDEC U6, INC U9
MULD2; Z;  MULD3; TDEC U7
MULD2; NZ; MULD2; TDEC U9, INC U6, INC U7
MULD3; Z;  MULD6; TDEC B2
MULD3; NZ; MULD4; READ B3
MULD4; *;  MULD5; READ B2
MULD5; Z;  MULD3; INC B2, INC B3, TDEC U7
MULD5; NZ; MULD5; SET B2, SET B3, NOP
MULD6; Z;  MULD7; TDEC B3
MULD6; NZ; MULD6; TDEC B2
MULD7; Z;  MULD8; TDEC U1
MULD7; NZ; MULD7; TDEC B3
# Copy U1 to temporary register U8.
MULD8; Z;  MULD9; TDEC U7
MULD8; NZ; MULD8; TDEC U1, INC U7
MULD9; Z;  MULD10; TDEC U8
MULD9; NZ; MULD9; TDEC U7, INC U1, INC U8
# Set B2 = U1 * B3 and U8 = 0.
MULD10; *;  MULD11; TDEC U8
MULD11; Z;  ITER8; INC U4, NOP
MULD11; NZ; MULD12; TDEC U6
MULD12; Z;  MULD13; TDEC U9
MULD12; NZ; MULD12; TDEC U6, INC U9
MULD13; Z;  MULD14; TDEC U7
MULD13; NZ; MULD13; TDEC U9, INC U6, INC U7
MULD14; Z;  MULD18; TDEC B3
MULD14; NZ; MULD15; READ B3
MULD15; Z;  MULD16; READ B2
MULD15; NZ; MULD16; READ B2, SET B3, ADD A1
MULD16; Z;  MULD17; ADD B0
MULD16; NZ; MULD17; ADD B1
MULD17; Z;  MULD14; INC B2, INC B3, TDEC U7
MULD17; NZ; MULD17; SET B2, NOP
MULD18; Z;  MULD19; TDEC B2
MULD18; NZ; MULD18; TDEC B3
MULD19; Z;  MULD11; TDEC U8
MULD19; NZ; MULD19; TDEC B2
`;

const part3 = `
# Increase the amount of memory that we are allocating to the
# binary registers, by adding U4 to U6.
ITER8; ZZ; ITER9; TDEC U4
ITER9; Z;  ITER10; TDEC U7
ITER9; NZ; ITER9; TDEC U4, INC U7
ITER10; Z;  ITER6; TDEC U5
ITER10; NZ; ITER10; TDEC U7, INC U4, INC U6
## Extract the units digit from (10^U3) * B1 / B2, as that is
## the digit of pi that we want to print.
# Copy U3 to temporary register U8.
ITER11; Z;  ITER12; TDEC U7
ITER11; NZ; ITER11; TDEC U3, INC U7
ITER12; Z;  ITER13; TDEC U6
ITER12; NZ; ITER12; TDEC U7, INC U3, INC U8
# Copy B1 into B3, without erasing B1.
ITER13; Z;  ITER14; TDEC U7
ITER13; NZ; ITER13; TDEC U6, INC U7
ITER14; Z;  ITER15; TDEC U9
ITER14; NZ; ITER14; TDEC U7, INC U6, INC U9
ITER15; Z;  ITER18; TDEC B3
ITER15; NZ; ITER16; READ B3
ITER16; *;  ITER17; READ B1
ITER17; Z;  ITER15; INC B1, INC B3, TDEC U9
ITER17; NZ; ITER17; SET B1, SET B3, NOP
ITER18; Z;  ITER19; TDEC B1
ITER18; NZ; ITER18; TDEC B3
ITER19; Z;  CMP1; TDEC U6
ITER19; NZ; ITER19; TDEC B1
# Now compare B2 with B3 to see which is bigger. This
# determines which of the two upcoming code blocks to go to.
CMP1; Z;  CMP2; TDEC U7
CMP1; NZ; CMP1; TDEC U6, INC U7
CMP2; Z;  CMP3; TDEC U9
CMP2; NZ; CMP2; TDEC U7, INC U6, INC U9
CMP3; Z;  CMP4; READ B3
CMP3; NZ; CMP3; TDEC U9, INC B2, INC B3
CMP4; Z;  CMP5; READ B2
CMP4; NZ; CMP8; READ B2, SET B3
CMP5; Z;  CMP6; TDEC B2
CMP5; NZ; CMP10; TDEC B3, SET B2
CMP6; *;  CMP7; TDEC B3
CMP7; Z;  CMP13; TDEC B2
CMP7; NZ; CMP4; READ B3
CMP8; Z;  CMP12; TDEC B3
CMP8; NZ; CMP9; SET B2, NOP
CMP9; ZZ; CMP6; TDEC B2
CMP10; Z;  CMP11; TDEC B2
CMP10; NZ; CMP10; TDEC B3
CMP11; Z;  DIG1; TDEC U8
CMP11; NZ; CMP11; TDEC B2
CMP12; Z;  CMP13; TDEC B2
CMP12; NZ; CMP12; TDEC B3
CMP13; Z;  SUB1; TDEC U6
CMP13; NZ; CMP13; TDEC B2
# If B2 <= B3 then subtract B2 from B3.
# That is, start or carry on with the integer division B3 / B2.
SUB1; Z;  SUB2; TDEC U7
SUB1; NZ; SUB1; TDEC U6, INC U7
SUB2; Z;  SUB3; TDEC U9
SUB2; NZ; SUB2; TDEC U7, INC U6, INC U9
SUB3; Z;  SUB7; TDEC B3
SUB3; NZ; SUB4; READ B3
SUB4; Z;  SUB5; READ B2
SUB4; NZ; SUB5; READ B2, SUB A1
SUB5; Z;  SUB6; SUB B0
SUB5; NZ; SUB6; SUB B1, SET B2
SUB6; Z;  SUB3; INC B2, INC B3, TDEC U9
SUB6; NZ; SUB6; SET B3, NOP
SUB7; Z;  SUB8; TDEC B2
SUB7; NZ; SUB7; TDEC B3
SUB8; Z;  CMP1; TDEC U6, INC U2
SUB8; NZ; SUB8; TDEC B2
# If B2 > B3 we cannot subtract anymore.
# Multiply B3 by 10 and reset U2, or jump ahead and print
# the digit that we have now computed.
DIG1; Z;  OUT0; TDEC U2
DIG1; NZ; DIG2; TDEC U2
DIG2; Z;  DIG3; TDEC U6
DIG2; NZ; DIG2; TDEC U2
DIG3; Z;  DIG4; TDEC U7
DIG3; NZ; DIG3; TDEC U6, INC U7
DIG4; Z;  DIG5; TDEC U9
DIG4; NZ; DIG4; TDEC U7, INC U6, INC U9
DIG5; Z;  DIG8; TDEC B3
DIG5; NZ; DIG6; READ B3
DIG6; Z;  DIG7; MUL 0
DIG6; NZ; DIG7; MUL 1
DIG7; Z;  DIG5; INC B3, TDEC U9
DIG7; NZ; DIG7; SET B3, NOP
DIG8; Z;  CMP1; TDEC U6
DIG8; NZ; DIG8; TDEC B3
`;

const part4 = `
# Print the current digit, which is stored in U2.
OUT0; Z;  OUTD1; NOP, OUTPUT 0
OUT0; NZ; OUT1; TDEC U2
OUT1; Z;  OUTD1; NOP, OUTPUT 1
OUT1; NZ; OUT2; TDEC U2
OUT2; Z;  OUTD1; NOP, OUTPUT 2
OUT2; NZ; OUT3; TDEC U2
OUT3; Z;  OUTD1; NOP, OUTPUT 3
OUT3; NZ; OUT4; TDEC U2
OUT4; Z;  OUTD1; NOP, OUTPUT 4
OUT4; NZ; OUT5; TDEC U2
OUT5; Z;  OUTD1; NOP, OUTPUT 5
OUT5; NZ; OUT6; TDEC U2
OUT6; Z;  OUTD1; NOP, OUTPUT 6
OUT6; NZ; OUT7; TDEC U2
OUT7; Z;  OUTD1; NOP, OUTPUT 7
OUT7; NZ; OUT8; TDEC U2
OUT8; Z;  OUTD1; NOP, OUTPUT 8
OUT8; NZ; OUTD1; NOP, OUTPUT 9
# Check whether or not we just printed the very first digit (3).
# If so, print a decimal point. Either way, increase U3, which
# counts which decimal place we are currently at, and loop back
# to start the next digit calculation.
OUTD1; ZZ; OUTD2; TDEC U3
OUTD2; Z;  ITER1; INC U3, NOP, OUTPUT .
OUTD2; NZ; OUTD3; INC U3, NOP
OUTD3; ZZ; ITER1; INC U3, NOP
`;

export const piCalculator = [part1, part2, part3, part4].join("");

export const piCalculatorTemplate = `
## Code templates for using binary numbers

# Unless otherwise stated, B registers start and finish each operation with the head at zero,
# with a corresponding U register (with the same identifier) storing the position of the most significant 1-bit

#######################################

# Bxx = 0
# Replacements : { xx = _; label = _; next_state = _ }

#----------------------------

# Bxx = Byy
# Replacements : { xx = _; yy = _; zero = Y/N; label = _; next_state = _ }
# Bxx must be zero at start
# zero defaults to N. If Y is used, Byy is reset to zero

#----------------------------

# Bxx += 1
# Replacements : { xx = _; label = _; next_state = _ }
# Bxx may be increased (and Uxx decreased) before starting, to add a power of 2

#----------------------------

# Bxx += Byy
# Replacements : { xx = _; yy = _; zero = Y/N; label = _; next_state = _ }
# Bxx may be increased (and Uxx decreased) before starting, to add a power-of-2 multiple of Byy
# zero defaults to N. If Y is used, Byy is reset to zero

#----------------------------

# Bxx = Byy + Bzz
# Replacements : { xx = _; yy = _; zz = _; label = _; next_state = _ }
# Bxx must be zero at start

#----------------------------

# Bxx -= Byy
# Replacements : { xx = _; yy = _; zero = Y/N; label = _; next_state = _ }
# Requires Bxx >= Byy
# zero defaults to N. If Y is used, Byy is reset to zero

#----------------------------

# Bxx = Byy - Bxx
# Replacements : { xx = _; yy = _; zero = Y/N; label = _; next_state = _ }
# Requires Byy >= Bxx
# zero defaults to N. If Y is used, Byy is reset to zero

#----------------------------

# Bxx = Byy - Bzz
# Replacements : { xx = _; yy = _; zz = _; label = _; next_state = _ }
# Requires Byy >= Bzz
# Bxx must be zero at start

#----------------------------

# Bxx *= 10
# Replacements : { xx = _; label = _; next_state = _ }

#----------------------------

# Bxx *= Byy
# Replacements : { xx = _; yy = _; temp = _; label = _; next_state = _ }
# Btemp must be zero at start, and will be zero at end.
# Btemp does not use a corresponding Utemp register

#----------------------------

# Bxx = Byy * Bzz
# Replacements : { xx = _; yy = _; zz = _; label = _; next_state = _ }
# Bxx must be zero at start

#----------------------------

# Bxx = Byy // Bzz; Byy %= Bzz
# Replacements : { xx = _; yy = _; zz = _; label = _; next_state = _ }
# Bxx must be zero at start

#----------------------------

# Output Bxx
# Replacements : { xx = _; label = _; next_state = _ }
# Assumes Bxx < 10
# Bxx is reset to zero

#######################################

#DEFINE Bxx = 0

label0; *; label1; TDEC Uxx
label1; Z; label2; READ Bxx
label1; NZ; label1; INC Bxx, TDEC Uxx
label2; *; label3; TDEC Bxx
label3; Z; next_state; NOP
label3; NZ; label2; READ Bxx

#ENDDEF

#------------------------------------------------
#DEFINE Bxx = Byy { zero = N }

label0; *; label1zero; READ Byy
label1N; Z; label2; TDEC Uyy
label1N; NZ; label2; SET Bxx, SET Byy, TDEC Uyy
label1Y; Z; label2; TDEC Uyy
label1Y; NZ; label2; SET Bxx, TDEC Uyy
label2; Z; label3; TDEC Bxx
label2; NZ; label0; INC Byy, INC Bxx, NOP
label3; Z; label4zero; TDEC Byy
label3; NZ; label3; INC Uxx, TDEC Bxx
label4N; Z; next_state; NOP
label4N; NZ; label4N; INC Uyy, TDEC Byy
label4Y; Z; next_state; NOP
label4Y; NZ; label4Y; TDEC Byy
#ENDDEF

#------------------------------------------------

#DEFINE Bxx += 1

label0; *; label1; READ Bxx
label1; Z; label2; SET Bxx, NOP
label1; NZ; label0; INC Bxx, TDEC Uxx
label2; ZZ; label3; TDEC Bxx

# Reset Bxx head

label3; Z; next_state; NOP
label3; NZ; label3; INC Uxx, TDEC Bxx
#ENDDEF

#------------------------------------------------

#DEFINE Bxx += Byy { zero = N }

# Add Byy to Bxx

label0; *; label1zero; READ Byy
label1N; Z; label2; READ Bxx
label1N; NZ; label2; SET Byy, ADD A1, READ Bxx
label1Y; Z; label2; READ Bxx
label1Y; NZ; label2; ADD A1, READ Bxx
label2; Z; label3; ADD B0
label2; NZ; label3; ADD B1
label3; Z; label4; TDEC Uyy
label3; NZ; label4; SET Bxx, TDEC Uyy
label4; Z; label5; ADD B0
label4; NZ; label0; INC Byy, INC Bxx, TDEC Uxx

# Add final carry

label5; Z; label9; TDEC Bxx
label5; NZ; label6; INC Bxx, TDEC Uxx
label6; *; label7; READ Bxx
label7; Z; label8; SET Bxx, NOP
label7; NZ; label6; INC Bxx, TDEC Uxx
label8; ZZ; label9; TDEC Bxx

# Reset Bxx and Byy heads

label9; Z; label10zero; TDEC Byy
label9; NZ; label9; INC Uxx, TDEC Bxx
label10N; Z; next_state; NOP
label10N; NZ; label10N; INC Uyy, TDEC Byy
label10Y; Z; next_state; NOP
label10Y; NZ; label10Y; TDEC Byy
#ENDDEF

#------------------------------------------------

#DEFINE Bxx = Byy + Bzz

# Add Byy to Bzz, writing result to Bxx

label0; *; label1; READ Byy
label1; Z; label2; READ Bzz
label1; NZ; label2; SET Byy, ADD A1, READ Bzz
label2; Z; label3; ADD B0
label2; NZ; label3; SET Bzz, ADD B1
label3; Z; label4; TDEC Uyy
label3; NZ; label4; SET Bxx, TDEC Uyy
label4; Z; label6; TDEC Uzz
label4; NZ; label5; TDEC Uzz
label5; Z; label10; NOP
label5; NZ; label0; INC Bxx, INC Byy, INC Bzz, NOP

# No more Byy digits, add Bzz only

label6; Z; label15; ADD B0
label6; NZ; label7; INC Bxx, INC Bzz, NOP
label7; *; label8; READ Bzz
label8; Z; label9; ADD B0
label8; NZ; label9; SET Bzz, ADD B1
label9; Z; label6; TDEC Uzz
label9; NZ; label6; SET Bxx, TDEC Uzz

# No more Bzz digits, add Byy only

label10; *; label11; INC Bxx, INC Byy, NOP
label11; *; label12; READ Byy
label12; Z; label13; ADD B0
label12; NZ; label13; SET Byy, ADD B1
label13; Z; label14; TDEC Uyy
label13; NZ; label14; SET Bxx, TDEC Uyy
label14; Z; label15; ADD B0
label14; NZ; label10; NOP

# Add final carry

label15; Z; label17; TDEC Bzz
label15; NZ; label16; INC Bxx, NOP
label16; *; label17; SET Bxx, TDEC Bzz

# Reset all heads

label17; Z; label18; TDEC Byy
label17; NZ; label17; INC Uzz, TDEC Bzz
label18; Z; label19; TDEC Bxx
label18; NZ; label18; INC Uyy, TDEC Byy
label19; Z; next_state; NOP
label19; NZ; label19; INC Uxx, TDEC Bxx
#ENDDEF

#------------------------------------------------

#DEFINE Bxx -= Byy { zero = N }

# Subtract Byy from Bxx

label0; *; label1; READ Bxx
label1; Z; label2zero; READ Byy
label1; NZ; label2zero; SUB A1, READ Byy
label2N; Z; label3; SUB B0
label2N; NZ; label3; SET Byy, SUB B1
label2Y; Z; label3; SUB B0
label2Y; NZ; label3; SUB B1
label3; Z; label4; TDEC Uyy
label3; NZ; label4; SET Bxx, TDEC Uyy
label4; Z; label6; SUB A1, NOP
label4; NZ; label5; INC Bxx, INC Byy, TDEC Uxx
label5; *; label1; READ Bxx

# Subtract final borrow

label6; ZZ; label7; SUB B0
label7; Z; label8; INC Bxx, TDEC Uxx
label7; NZ; label10; TDEC Uxx
label8; *; label9; READ Bxx
label9; Z; label7; SET Bxx, NOP
label9; NZ; label10; TDEC Uxx

# Clear leading zeros and reset Bxx and Byy heads

label10; Z; label11; READ Bxx
label10; NZ; label14; INC Uxx, TDEC Bxx
label11; Z; label12; TDEC Bxx
label11; NZ; label13; SET Bxx, NOP
label12; Z; label15zero; TDEC Byy
label12; NZ; label11; READ Bxx
label13; ZZ; label14; TDEC Bxx
label14; Z; label15zero; TDEC Byy
label14; NZ; label14; INC Uxx, TDEC Bxx
label15N; Z; next_state; NOP
label15N; NZ; label15N; INC Uyy, TDEC Byy
label15Y; Z; next_state; NOP
label15Y; NZ; label15Y; TDEC Byy
#ENDDEF

#------------------------------------------------

#DEFINE Bxx = Byy - Bxx { zero = N }

# Subtract Bxx from Byy, writing result to Bxx

label0; *; label1zero; READ Byy
label1N; Z; label2; READ Bxx
label1N; NZ; label2; SET Byy, SUB A1, READ Bxx
label1Y; Z; label2; READ Bxx
label1Y; NZ; label2; SUB A1, READ Bxx
label2; Z; label3; SUB B0
label2; NZ; label3; SUB B1
label3; Z; label4; TDEC Uyy
label3; NZ; label4; SET Bxx, TDEC Uyy
label4; Z; label5; READ Bxx
label4; NZ; label0; INC Bxx, INC Byy, TDEC Uxx

# Assuming Byy >= Bxx there can't be a final borrow
# Clear leading zeros in Bxx and reset Bxx and Byy heads

label5; Z; label6; TDEC Bxx
label5; NZ; label7; SET Bxx, NOP
label6; Z; label9zero; TDEC Byy
label6; NZ; label5; READ Bxx
label7; ZZ; label8; TDEC Bxx
label8; Z; label9zero; TDEC Byy
label8; NZ; label8; INC Uxx, TDEC Bxx
label9N; Z; next_state; NOP
label9N; NZ; label9N; INC Uyy, TDEC Byy
label9Y; Z; next_state; NOP
label9Y; NZ; label9Y; TDEC Byy
#ENDDEF

#------------------------------------------------

#DEFINE Bxx = Byy - Bzz

# Subtract Bzz from Byy, copying result to Bxx

label0; *; label1; READ Byy
label1; Z; label2; READ Bzz
label1; NZ; label2; SET Byy, SUB A1, READ Bzz
label2; Z; label3; SUB B0
label2; NZ; label3; SET Bzz, SUB B1
label3; Z; label4; TDEC Uyy
label3; NZ; label4; SET Bxx, TDEC Uyy
label4; Z; label5; READ Bxx
label4; NZ; label0; INC Bxx, INC Byy, INC Bzz, NOP

# Assuming Byy >= Bzz there can't be a final borrow
# Clear leading zeros in Bxx and reset all heads

label5; Z; label6; TDEC Bxx
label5; NZ; label7; SET Bxx, NOP
label6; Z; label9; TDEC Byy
label6; NZ; label5; READ Bxx
label7; ZZ; label8; TDEC Bxx
label8; Z; label9; TDEC Byy
label8; NZ; label8; INC Uxx, TDEC Bxx
label9; Z; label10; TDEC Bzz
label9; NZ; label9; INC Uyy, TDEC Byy
label10; Z; next_state; NOP
label10; NZ; label10; TDEC Bzz
#ENDDEF

#------------------------------------------------

#DEFINE Bxx *= 10

# Increase length of Bxx

label0; *; label1; INC Uxx, NOP
label1; ZZ; label2; INC Uxx, NOP
label2; ZZ; label3; INC Uxx, NOP
label3; ZZ; label4; INC Uxx, NOP

# Multiply Bxx by 10

label4; ZZ; label5; READ Bxx
label5; Z; label6; MUL 0
label5; NZ; label6; MUL 1
label6; Z; label7; TDEC Uxx
label6; NZ; label7; SET Bxx, TDEC Uxx
label7; Z; label8; READ Bxx
label7; NZ; label4; INC Bxx, NOP

# Clear leading zeros and reset Bxx head

label8; Z; label9; TDEC Bxx
label8; NZ; label10; SET Bxx, NOP
label9; Z; next_state; NOP
label9; NZ; label8; READ Bxx
label10; ZZ; label11; TDEC Bxx
label11; Z; next_state; NOP
label11; NZ; label11; INC Uxx, TDEC Bxx
#ENDDEF

#------------------------------------------------

#DEFINE Bxx *= Byy

# Increase length of Bxx to allow for carries

label0; *; label1; INC Uxx, READ Byy

# If current Byy bit == 0 skip addition

label1; Z; label7; TDEC Uyy
label1; NZ; label2; SET Byy, NOP

# Add Bxx to current Btemp position

label2; ZZ; label3; READ Bxx
label3; Z; label4; READ Btemp
label3; NZ; label4; SET Bxx, ADD A1, READ Btemp
label4; Z; label5; ADD B0
label4; NZ; label5; ADD B1
label5; Z; label6; TDEC Uxx
label5; NZ; label6; SET Btemp, TDEC Uxx
label6; Z; label7; TDEC Uyy
label6; NZ; label2; INC Bxx, INC Btemp, NOP

# Check for another Byy digit

label7; Z; label10; TDEC Uxx
label7; NZ; label9; INC Byy, INC Btemp, TDEC Bxx

# Reset Bxx and Btemp heads, then do next Byy digit

label8; *; label9; TDEC Bxx
label9; Z; label1; READ Byy
label9; NZ; label8; INC Uxx, TDEC Btemp

# No more Byy digits
# If Byy = 0, NZ branch is entered with all heads at zero
# otherwise Z branch, with all heads at maximum

label10; Z; label14; TDEC Byy
label10; NZ; label11; TDEC Uxx

# Reset Bxx to 0

label11; Z; label12; READ Bxx
label11; NZ; label11; INC Bxx, TDEC Uxx
label12; *; label13; TDEC Bxx
label13; Z; next_state; NOP
label13; NZ; label12; READ Bxx

# Reset Byy head and adjust Bxx head

label14; Z; label16; READ Btemp
label14; NZ; label14; INC Uyy, INC Bxx, TDEC Byy

# Copy Btemp to Bxx, clearing leading zeros

label15; *; label16; READ Btemp
label16; Z; label17; TDEC Btemp
label16; NZ; label19; SET Bxx, TDEC Btemp
label17; Z; next_state; NOP
label17; NZ; label18; TDEC Bxx
label18; *; label15; READ Bxx
label19; Z; next_state; NOP
label19; NZ; label20; INC Uxx, TDEC Bxx
label20; *; label21; READ Bxx
label21; *; label22; READ Btemp
label22; Z; label19; TDEC Btemp
label22; NZ; label19; SET Bxx, TDEC Btemp
#ENDDEF

#------------------------------------------------

#DEFINE Bxx = Byy * Bzz

# Increase length of Byy to allow for carries

label0; *; label1; INC Uyy, READ Bzz

# If current T4 bit == 0 skip addition

label1; Z; label8; TDEC Uzz
label1; NZ; label2; SET Bzz, NOP

# Add Byy to current Bxx position

label2; *; label3; READ Byy
label3; Z; label4; READ Bxx
label3; NZ; label4; SET Byy, ADD A1, READ Bxx
label4; Z; label5; ADD B0
label4; NZ; label5; ADD B1
label5; Z; label6; TDEC Uyy
label5; NZ; label6; SET Bxx, TDEC Uyy
label6; Z; label8; TDEC Uzz
label6; NZ; label2; INC Bxx, INC Byy, NOP

# Check for another Bzz digit

label8; Z; label12; TDEC Uyy
label8; NZ; label11; INC Bxx, INC Bzz, TDEC Byy

# Reset Bxx and Byy heads, then do next Bzz digit

label10; *; label11; TDEC Byy
label11; Z; label1; READ Bzz
label11; NZ; label10; INC Uyy, TDEC Bxx

# No more Bzz digits
# If Bzz = 0, NZ branch is entered with all heads at zero
# otherwise Z branch, with all heads at maximum

label12; Z; label13; READ Bxx
label12; NZ; next_state; NOP

# Clear leading zeros in Bxx and reset all heads

label13; Z; label14; TDEC Bxx
label13; NZ; label15; SET Bxx, TDEC Byy
label14; Z; label15; TDEC Byy
label14; NZ; label13; READ Bxx
label15; *; label16; TDEC Byy
label16; Z; label17; TDEC Bzz
label16; NZ; label16; INC Uyy, TDEC Byy
label17; Z; label18; TDEC Bxx
label17; NZ; label17; INC Uzz, TDEC Bzz
label18; Z; next_state; NOP
label18; NZ; label18; INC Uxx, TDEC Bxx
#ENDDEF

#------------------------------------------------

#DEFINE Bxx = Byy // Bzz; Byy %= Bzz

# Initialise

# Set Byy and Bzz heads to maximum, comparing lengths

label0; *; label1; TDEC Uzz
label1; Z; label3; TDEC Uyy
label1; NZ; label2; INC Bzz, TDEC Uyy
label2; Z; label4; TDEC Byy
label2; NZ; label1; INC Byy, TDEC Uzz

# len(Byy) >= len(Bzz) : set Bxx head to len(Byy) - len(Bzz) and go to Compare digits

label3; Z; labelC0; READ Byy
label3; NZ; label3; INC Bxx, INC Byy, TDEC Uyy

# len(Bzz) > len(Byy) : reset Byy and Bzz heads and go to next_state

label4; Z; label5; TDEC Bzz
label4; NZ; label4; INC Uyy, TDEC Byy
label5; Z; next_state; NOP
label5; NZ; label5; INC Uzz, TDEC Bzz

# Compare digits

labelC0; Z; labelC1; READ Bzz
labelC0; NZ; labelC2; SET Byy, READ Bzz
labelC1; Z; labelC4; TDEC Bzz  # 0,0
labelC1; NZ; labelC6; SET Bzz, TDEC Uzz  # 0,1
labelC2; Z; labelS0; TDEC Bzz  # 1,0 : go to Subtract
labelC2; NZ; labelC3; SET Bzz, NOP   # 1,1
labelC3; ZZ; labelC4; TDEC Bzz

# 0,0 or 1,1 : check next digit or subtract if no more digits

labelC4; Z; labelS0; TDEC Bzz
labelC4; NZ; labelC5; INC Uzz, TDEC Byy
labelC5; *; labelC0; READ Byy

# 0,1 : can't subtract : set Byy and Bzz heads to maximum and go to Next digit

labelC6; Z; labelC7; TDEC Uxx
labelC6; NZ; labelC6; INC Bzz, INC Byy, TDEC Uzz
labelC7; Z; labelN0; TDEC Bxx
labelC7; NZ; labelC8; INC Uxx, NOP
labelC8; ZZ; labelN0; INC Uxx, TDEC Bxx

# Subtract

# Set Byy and Bzz heads to subtraction position

labelS0; Z; labelS2; READ Byy
labelS0; NZ; labelS1; INC Uzz, TDEC Byy
labelS1; *; labelS0; TDEC Bzz

# Subtract Bzz from current Byy position

labelS2; Z; labelS3; READ Bzz
labelS2; NZ; labelS3; SUB A1, READ Bzz
labelS3; Z; labelS4; SUB B0
labelS3; NZ; labelS4; SET Bzz, SUB B1
labelS4; Z; labelS5; TDEC Uzz
labelS4; NZ; labelS5; SET Byy, TDEC Uzz
labelS5; Z; labelS7; SUB A1, NOP
labelS5; NZ; labelS6; INC Bzz, INC Byy, NOP
labelS6; *; labelS2; READ Byy

# Clear final borrow and set quotient digit

labelS7; ZZ; labelS8; SET Bxx, SUB B0
labelS8; *; labelN0; INC Uxx, TDEC Bxx

# Next digit : Check for next quotient digit

labelN0; Z; labelN4; READ Byy
labelN0; NZ; labelN1; READ Byy

# Another quotient digit
# If Byy bit was set, decrement Byy head, and go to Subtract
# else decrement Byy head and go to Compare digits

labelN1; Z; labelN2; TDEC Byy
labelN1; NZ; labelN3; TDEC Byy
labelN2; *; labelC0; READ Byy
labelN3; *; labelS0; TDEC Bzz

# No more quotient digits
# Clear leading zeros in Byy

labelN4; Z; labelN5; TDEC Byy
labelN4; NZ; labelN6; SET Byy, NOP
labelN5; Z; labelN8; TDEC Bzz
labelN5; NZ; labelN4; READ Byy

# Reset Byy and Bzz heads and go to next_state

labelN6; ZZ; labelN7; TDEC Byy
labelN7; Z; labelN8; TDEC Bzz
labelN7; NZ; labelN7; INC Uyy, TDEC Byy
labelN8; Z; labelN9; TDEC Uxx
labelN8; NZ; labelN8; INC Uzz, TDEC Bzz
labelN9; *; next_state; NOP
#ENDDEF

#------------------------------------------------

#DEFINE Output Bxx

label0; *; label1; READ Bxx
label1; Z; label2; INC Bxx, NOP
label1; NZ; label4; INC Bxx, NOP
label2; ZZ; label3; READ Bxx
label3; Z; label6; INC Bxx, NOP
label3; NZ; label10; INC Bxx, NOP
label4; ZZ; label5; READ Bxx
label5; Z; label8; INC Bxx, NOP
label5; NZ; label12; INC Bxx, NOP
label6; ZZ; label7; READ Bxx
label7; Z; label14; INC Bxx, NOP
label7; NZ; label18; OUTPUT 4, TDEC Bxx
label8; ZZ; label9; READ Bxx
label9; Z; label16; INC Bxx, NOP
label9; NZ; label18; OUTPUT 5, TDEC Bxx
label10; ZZ; label11; READ Bxx
label11; Z; label18; OUTPUT 2, TDEC Bxx
label11; NZ; label18; OUTPUT 6, TDEC Bxx
label12; ZZ; label13; READ Bxx
label13; Z; label18; OUTPUT 3, TDEC Bxx
label13; NZ; label18; OUTPUT 7, TDEC Bxx
label14; ZZ; label15; READ Bxx
label15; Z; label18; OUTPUT 0, TDEC Bxx
label15; NZ; label18; OUTPUT 8, TDEC Bxx
label16; ZZ; label17; READ Bxx
label17; Z; label18; OUTPUT 1, TDEC Bxx
label17; NZ; label18; OUTPUT 9, TDEC Bxx
label18; Z; label19; TDEC Uxx
label18; NZ; label18; TDEC Bxx
label19; Z; next_state; NOP
label19; NZ; label19; TDEC Uxx
#ENDDEF


## pi calculator
## Prints 3.14159...

# #INCLUDE binary.apglib

#COMPONENTS B0-11, U0-12, ADD, SUB, MUL, OUTPUT
#REGISTERS { 'B0': 1, 'B1': 180, 'B2': 60 }
#REGISTERS { 'U0': 0, 'U1': 7, 'U2': 5, 'U12': 1 }
#REGISTERS { 'B4': 3, 'B5': 5, 'B6': 1, 'B7': 5, 'B8': 4, 'B9': 60, 'B10': 108,'B11': 54 }
#REGISTERS { 'U4': 1, 'U5': 2, 'U6': 0, 'U7': 2, 'U8': 2, 'U9': 5, 'U10': 6,'U11': 5 }

INITIAL; ZZ; DIVREM0; NOP

#INSERT Bxx = Byy // Bzz; Byy %= Bzz   { xx = 3; yy = 1; zz = 2; label = DIVREM; next_state = OUT0 }
#INSERT Output Bxx { xx = 3; label = OUT; next_state = OUTDOT0 }

OUTDOT0; ZZ; OUTDOT1; TDEC U12
OUTDOT1; Z; MUL10_A0; NOP
OUTDOT1; NZ; MUL10_A0; OUTPUT ., NOP

#INSERT Bxx *= 10        { xx = 0; label = MUL10_A; next_state = MUL10_B0  }
#INSERT Bxx *= 10        { xx = 1; label = MUL10_B; next_state = ADD_P0 }

#INSERT Bxx += Byy       { xx = 4; yy = 5; label = ADD_P; next_state = ADD_Q0 }
#INSERT Bxx += Byy       { xx = 6; yy = 7; label = ADD_Q; next_state = ADD_QD0 }
#INSERT Bxx += Byy       { xx = 7; yy = 8; label = ADD_QD; next_state = ADD_R0 }
#INSERT Bxx += Byy       { xx = 9; yy = 10; label = ADD_R; next_state = ADD_RD0 }
#INSERT Bxx += Byy       { xx = 10; yy = 11; label = ADD_RD; next_state = MUL_AP0 }

#INSERT Bxx = Byy * Bzz  { xx = 3; yy = 0; zz = 4; label = MUL_AP; next_state = ADD_B0 }
#INSERT Bxx += Byy       { xx = 1; yy = 3; zero = Y; label = ADD_B; next_state = MUL_BR0 }
#INSERT Bxx *= Byy       { xx = 1; yy = 9; temp = 3; label = MUL_BR; next_state = MUL_AQ0 }
#INSERT Bxx *= Byy       { xx = 0; yy = 6; temp = 3; label = MUL_AQ; next_state = MUL_CR0 }
#INSERT Bxx *= Byy       { xx = 2; yy = 9; temp = 3; label = MUL_CR; next_state = DIVREM0 }
`;
