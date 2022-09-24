local g = golly()

function split(str, sep)
    local t = {}
    i = 1
    for s in string.gmatch(str, "([^"..sep.."]+)") do
      t[i] = s
      i = i + 1
    end
    return t
end

function splitReg(str, reg)
    local t = {}
    i = 1
    for s in string.gmatch(str, reg) do
      t[i] = s
      i = i + 1
    end
    return t
end

function string:startsWith(start)
    return self:sub(1, #start) == start
end

function trim(str)
    return string.gsub(str, "^%s*(.-)%s*$", "%1")
end

function map(fn, ary)
    local a = {}
    for i = 1, #ary do
      table.insert(a, fn(ary[i]))
    end
    return a
end

function parse(str)
    local componentsHeader = nil
    local componentsKey = "#COMPONENTS"
    local registersHeader = nil
    local registersKey = "#REGISTERS"
    local lines = {}
    for line_ in split(str, "\n") do
        local line = trim(line_)
        if line:startsWith(componentsKey) then
            componentsHeader = line:sub(#componentsKey)
        elseif line:startsWith(registersKey) then
            registersHeader = line:sub(#registersKey)
        else
            local array = split(line, ";")
            if #array ~= 4 then
                g.exit("Parse error: " + line)
            end

            local actions = splitReg(array[4], "(\\s*,\\s*)")
            local lineObject = {
                state = trim(array[1]),
                input = trim(array[2]),
                nextState = trim(array[3]),
                actions = actions
            }
            table.insert(lines, lineObject)
        end
    end

    return {
        componentsHeader = componentsHeader,
        registersHeader = registersHeader,
        lines = lines
    }
end

-- local str = g.getstring("write APGsembly")
g.note(parse([[
    # Unary registers multiplication
    # https://conwaylife.com/book/ > 9.3 Multiplying and Reusing Registers > APGsembly 9.3
    #COMPONENTS U0-3,HALT_OUT
    #REGISTERS {"U0":7, "U1":5}
    # State Input Next state Actions
    # ---------------------------------------
    INITIAL; ZZ; ID1; TDEC U0

    # Loop over U0, TDECing it until it hits 0, and then halt.
    ID1; Z; ID1; HALT_OUT
    ID1; NZ; ID2; TDEC U1

    # Copy U1 into U3 while setting U1 = 0.
    ID2; Z; ID3; TDEC U3
    ID2; NZ; ID2; TDEC U1, INC U3

    # Loop over U3, adding its value to U1 (restoring it) and U2.
    ID3; Z; ID1; TDEC U0
    ID3; NZ; ID3; TDEC U3, INC U1, INC U2

]]))