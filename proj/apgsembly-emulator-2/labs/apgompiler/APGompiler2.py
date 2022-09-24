# import golly as g
from typing import List, Optional, Dict
import re

class Line:
  state: str
  inputStr: str
  nextState: str
  actions: List[str]

  def __init__(
    self,
    state: str,
    inputStr: str,
    nextState: str,
    actions: List[str]
  ) -> None:
    self.state = state
    self.inputStr = inputStr
    self.nextState = nextState
    self.actions = actions

  def __str__(self):
    return "; ".join(
      [
        self.state,
        self.inputStr,
        self.nextState,
        ", ".join(self.actions)]
    )

class Program:
  componentsHeader: str
  registersHeader: str
  lines: List[Line]

  def __init__(
    self,
    componentsHeader: Optional[str],
    registersHeader: Optional[str],
    lines: List[Line]
  ) -> None:
    self.componentsHeader = componentsHeader
    self.registersHeader = registersHeader
    self.lines = lines

  def __str__(self):
    return str(self.__class__) + ": " + str(self.__dict__)

def error(message: str):
  g.note(message)
  g.exit()

def parse(source: str) -> Program:
  componentsHeader = None
  componentsKey = "#COMPONENTS"
  registersHeader = None
  registersKey = "#REGISTERS"
  lines = []
  for line in source.split("\n"):
    line = line.strip()
    if len(line) == 0:
      continue
    if line.startswith(componentsKey):
      componentsHeader = line[len(componentsKey)].strip()
      continue
    if line.startswith(registersKey):
      registersHeader = line[len(registersKey)].strip()
      continue
    if line.startswith("#"):
      continue
    arr = re.split('\s*;\s*', line)
    if len(arr) != 4:
      error("Parse failed: " + line)
    [state, inputStr, nextState, actionsStr] = arr
    actions = re.split('\s*,\s*', actionsStr)
    lines.append(Line(state, inputStr, nextState, actions))
  return Program(componentsHeader, registersHeader, lines)

# process * and ZZ
def preProcess(program: Program) -> Program:
  lines = []
  for line in program.lines:
    if line.inputStr == "*":
      lines.append(Line(line.state, "Z", line.nextState, line.actions))
      lines.append(Line(line.state, "NZ", line.nextState, line.actions))
    elif line.inputStr == "ZZ":
      lines.append(line)
      lines.append(Line(line.state, "NZ", line.nextState, line.actions))
    else:
      lines.append(line)
  return Program(program.componentsHeader, program.registersHeader, lines)

def makeDict(program: Program) -> Dict[str, int]:
  programLength = len(program.lines)
  statedict = {}
  for i in range(0, programLength, 2):
    statedict[program.lines[i].state] = i

def actionToPlace(program: Program) -> List[str]:
  def makeU(n: int):
    return ["TDEC U" + str(n), "INC U" + str(n)]
  return [*makeU(0), *makeU(1), *makeU(2), *makeU(3), "HALT_OUT"]

def main():
  progStr = """

  """
  program = preProcess(parse(progStr))
  stateDict = makeDict(program)
  actions = actionToPlace(program)

  actionDict = {}
  for i in range(len(actions)):
    actionDict[actions[i]] = i

# print(parse("""
# # Unary registers multiplication
# # https://conwaylife.com/book/ > 9.3 Multiplying and Reusing Registers > APGsembly 9.3
# #COMPONENTS U0-3,HALT_OUT
# #REGISTERS {"U0":7, "U1":5}
# # State Input Next state Actions
# # ---------------------------------------
# INITIAL; ZZ; ID1; TDEC U0

# # Loop over U0, TDECing it until it hits 0, and then halt.
# ID1; Z; ID1; HALT_OUT
# ID1; NZ; ID2; TDEC U1

# # Copy U1 into U3 while setting U1 = 0.
# ID2; Z; ID3; TDEC U3
# ID2; NZ; ID2; TDEC U1, INC U3

# # Loop over U3, adding its value to U1 (restoring it) and U2.
# ID3; Z; ID1; TDEC U0
# ID3; NZ; ID3; TDEC U3, INC U1, INC U2

# """).lines[4])
