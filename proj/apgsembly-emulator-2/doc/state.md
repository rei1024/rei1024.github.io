// http://www.plantuml.com/plantuml/uml/

@startuml
Initial: 初期状態
Running: 連続実行中
Stop:　連続実行停止中（パースOK）
ParseError: パースエラー
RuntimeError: 実行時エラー
Halted: 正常終了

[*]-->Initial
Initial-->Running: Start(パース成功)
Initial-->ParseError: Reset or Step(パース失敗)
Initial-->ParseError: Start（パース失敗）
ParseError-->Stop: Reset(パース成功)
ParseError-->ParseError: Reset(パース失敗)
Stop-->Running: Start
Running-->Stop: Stop
Stop-->Stop: Reset（パース成功）
Stop-->ParseError: Reset（パース失敗）

Initial-->Stop: Reset or Step(パース成功)
Initial-->RuntimeError: Step(実行時エラー)
Running-->RuntimeError: 実行時エラー
RuntimeError-->Stop: Reset（パース成功）
RuntimeError-->ParseError: Reset（パース失敗）
Stop-->Stop: Step（実行時エラーがない場合）
Stop-->RuntimeError: Step（実行時エラーが発生）

Running-->Halted: 正常終了
Stop-->Halted: Step(正常終了)
Halted-->ParseError: Reset(パース失敗)
Halted-->Stop: Reset(パース成功)
@enduml

,Initial,Running,Stop,Halted,ParseError,RuntimeError
Start,◯,,◯,,,
Stop,,◯,,,,
Step,◯,,◯,,,
Reset,◯,,◯,◯,◯,◯
,,,,,,
machine,undefined,◯,◯,◯,undefined,◯
