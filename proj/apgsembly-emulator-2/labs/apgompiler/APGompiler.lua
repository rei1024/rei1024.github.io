-- APGompiler.lua, version 0.1

local g = golly()

local APGsembly = [[

# Unary registers multiplication
# U2 = U0 * U1
# https://conwaylife.com/book/ > 9.3 Multiplying and Reusing Registers > APGsembly 9.3
#COMPONENTS U0-3,HALT_OUT
#REGISTERS {"U0":7, "U1":5}
# State  Input  Next state  Actions
# ---------------------------------------
INITIAL; ZZ; ID1; TDEC U0

# Loop over U0, TDECing it until it hits 0, and then halt.
ID1;     Z;  ID1; HALT_OUT
ID1;     NZ; ID2; TDEC U1

# Copy U1 into U3 while setting U1 = 0.
ID2;     Z;  ID3; TDEC U3
ID2;     NZ; ID2; TDEC U1, INC U3

# Loop over U3, adding its value to U1 (restoring it) and U2.
ID3;     Z;  ID1; TDEC U0
ID3;     NZ; ID3; TDEC U3, INC U1, INC U2

]]
local progname = "Osqrtlogt-plus-test"

local ZNZ = g.parse([[135bo$133b3o$132bo$132b2o7bo$139b3o$138bo24bo$138b2o23b3o$166bo$165b2o
$180b2o$180bo$177b2obo$176bo2bo$177b2o$147b2o13b2o$147b2o13b2o7$149b2o
6bob2o$126b2o21bobo3b3ob2o$125bobo23bo2bo$125bo25b2o2b3ob2o$124b2o31bo
bo$157bobo10b2o$158bo11b2o11$17bo127bo$15b3o125b3o$14bo127bo$14b2o126b
2o$20bo127bo$18b3o125b3o$17bo127bo$17b2o126b2o14$7b2o126b2o$8bo127bo$
5b3o125b3o$5bo127bo$191bo$189b3o$188bo$188b2o$23b2o126b2o$23bo127bo$
24b3o125b3o41b2o$26bo127bo42bo$197bob2o$189b2o4b3o2bo$189b2o3bo3b2o$
194b4o$180b2o15bo$15b2o126b2o34bobo12b3o$6b2o7b2o117b2o7b2o34bo13bo$7b
o127bo42b2o14b5o$7bobo125bobo60bo$8b2o126b2o58bo$24b2o126b2o42b2o$24bo
127bo$22bobo125bobo$22b2o126b2o3$3b2o126b2o$4bo127bo$4bobo18bo106bobo
18bo$5b2o17bobo106b2o17bobo$25bo127bo$32bo127bo$32b3o125b3o$35bo127bo$
34b2o126b2o$49b2o126b2o$49bo127bo$46b2obo124b2obo$2b2o41bo2bo81b2o41bo
2bo$bobo42b2o81bobo42b2o$bo5b2o22b2o96bo5b2o22b2o$2o4bo2bo21b2o95b2o4b
o2bo21b2o$7b2o126b2o3$9b2o7b2o3bo113b2o7b2o3bo$9b2o7bo3bobo112b2o7bo3b
obo$19bo3bobo121bo3bobo$20bo3bobob2o118bo3bobob2o$18bob4o2bob2o116bob
4o2bob2o$17bobo3bobo119bobo3bobo$17bobo2bo2b2ob2o115bobo2bo2b2ob2o$18b
o3b2o2bobo117bo3b2o2bobo$26bobo10b2o113bobo10b2o$27bo11b2o114bo11b2o!]])

local onlyZ = g.parse([[135bo$133b3o$132bo$132b2o7bo$139b3o$138bo24bo$138b2o23b3o$166bo$165b2o
$180b2o$180bo$177b2obo$176bo2bo$177b2o$147b2o13b2o$147b2o13b2o7$149b2o
6bob2o$126b2o21bobo3b3ob2o$125bobo23bo2bo$125bo25b2o2b3ob2o$124b2o31bo
bo$138b2o17bobo10b2o$138bo19bo11b2o$139b3o$141bo9$17bo$15b3o$14bo$14b
2o$20bo$18b3o$17bo$17b2o14$7b2o$8bo$5b3o$5bo5$23b2o$23bo$24b3o$26bo6$
15b2o$6b2o7b2o$7bo$7bobo$8b2o$24b2o$24bo$22bobo$22b2o3$3b2o$4bo$4bobo
18bo$5b2o17bobo$25bo$32bo$32b3o$35bo$34b2o$49b2o$49bo$46b2obo$2b2o41bo
2bo$bobo42b2o$bo5b2o22b2o$2o4bo2bo21b2o$7b2o3$9b2o7b2o3bo$9b2o7bo3bobo
$19bo3bobo$20bo3bobob2o$18bob4o2bob2o$17bobo3bobo$17bobo2bo2b2ob2o$18b
o3b2o2bobo$26bobo10b2o$27bo11b2o!]])

local splitter = g.parse([[48bo$48b3o$51bo$50b2o3$42b2o$42bo$39b2obo$39bo2b3o4b2o$40b2o3bo3b2o$
42b4o$42bo15b2o3b2o$43b3o12bobobobo$46bo13bobo$41b5o14bo2bo$41bo19bobo
$43bo18bo$42b2o4$77b2o$77b2o4$57b2o$56bobo$56bo18b2o$55b2o7b2o9bo$64b
2o10bo$75b2o$72b2o$9bo62b2ob2o$9b3o63bo$12bo59b2o3bo$11b2o10bo47bo2b4o
$22bobo45bobobo$22bobo27bo18bo2bob2o$o20b2ob3o25b3o19bobo$3o24bo27bo
17b2o2bo$3bo17b2ob3o6bo20b2o14bobo2bobo$2b2o17b2obo6b3o15bo20b2o2bobo$
30bo18b3o23bo$30b2o20bo$5b2o44b2o$4bo2bo$5b2o4$48b2o$48b2o17b2o$67b2o$
17b2o$18bo$15b3o50b2o$15bo52bo$55b2o12b3o$38b2o16bo14bo$38bo14b3o$39b
3o11bo$41bo!]])

local transrefl = g.parse([[24bo$22b3o$21bo$20bobo$20bobo$21bo5$5b2o$5b2o4$25b2o$25bobo$27bo$18b2o
7b2o$18b2o2$8bob2o$6b3ob2o$5bo$6b3ob2o$8bobo$8bobo$9bo6$18b2o$18b2o16$
3bob2o$b3ob2o$o$b3ob2o$3bobo2bo$6b3o$11bo5b2o$8b4o5b2o$8bo$9bo$8b2o!]])

local Snark_S = g.parse([[15bo$13b3o$12bo$12b2o7$2b2o$bobo5b2o$bo7b2o$2o2$14bo$10b2obobo$9bobobo
bo$6bo2bobobobob2o$6b4ob2o2bo2bo$10bo4b2o$8bobo$8b2o!]])

local Snark_E = g.parse([[18b2o$18bo$20bo$2o14b5o$bo13bo$bobo12b3o$2b2o15bo$16b4o$11b2o3bo3b2o$
11b2o4b3o2bo$19bob2o$19bo$18b2o3$10b2o$10bo$11b3o$13bo!]])

local Snark_N = g.parse([[9b2o$8bobo$2b2o4bo$o2bo2b2ob4o$2obobobobo2bo$3bobobobo$3bobob2o$4bo2$
17b2o$8b2o7bo$8b2o5bobo$15b2o7$5b2o$6bo$3b3o$3bo!]])

-- ZNZstopper = g.parse("2o126b2o$o127bo$b3o125b3o$3bo127bo!")

local ZNZbackstop = g.parse([[2o126b2o$o127bo$b3o125b3o$3bo127bo7$10b2obo124b2obo$10b2ob3o122b2ob3o$
16bo127bo$10b2ob3o122b2ob3o$11bobo125bobo$11bobo125bobo$12bo127bo!]])

local startpat = g.parse("3o$o$bo!", 255, 58)

function Parse(apgSemblySource)
  local lines = apgSemblySource
end

-- g.note('X')