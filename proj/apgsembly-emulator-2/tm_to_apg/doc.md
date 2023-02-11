## Turing machine simulators

- https://turingmachinesimulator.com/
- https://morphett.info/turing/turing.html
  - 巨大数Wikiもこの記法をよく使っているのでこれをinputとする

- https://googology.wikia.org/wiki/User_blog:Ikosarakt1/My_Turing_machine_programs
- https://googology.wikia.org/wiki/User_blog:SuperJedi224/Turing_Machines
- https://googology.wikia.org/wiki/User_blog:Deedlit11/Okay,_more_Turing_machines
- https://googology.wikia.org/wiki/User_blog:Wythagoras/The_nineteenth_Busy_Beaver_number_is_greater_than_Graham%27s_Number!

## 設計

1. 現在の状態が停止状態が調べる
   1. 停止状態ならHALT_OUT
   2. 停止状態でないなら次へ進む
2. 現在のシンボルを読む
   1. 空白の場合
      1. 遷移関数から現在の状態と空白で検索を行いそれをlineとする
      2. currentSymbol = 0
   2. 空白でない場合
      1. 遷移関数から現在の状態と空白でないシンボルで検索を行いそれをlineとする
      2. currentSymbol = 1
3. シンボルを書き換える
   1. lineのnewSymbolを調べる
      1. NO_CHANGEの場合
         1. currentSymbolを書き込む
      2. 空白の場合
         1. 空白にする
      3. 空白でない場合
         1. 空白でないシンボルを書き込む
4. 移動する
   1. lineのdirectionを調べる
      1. NO_CHANGEの場合
         1. 何もしない
      2. LEFTの場合
         1. 右へ移動する
            1. 現在がNEGで結果がZの場合POSへ移動する
      3. RIGHTの場合
         1. 左へ移動する
            1. 現在がPOSで結果がNZの場合NEGへ移動する
5. lineのnewStateを調べる
   1. NO_CHANGEの場合
      1. 何もしない
   2. それ以外の場合
      1. 現在の状態をnewStateとする
6. 1へ戻る

- U0: NEGATIVE_FLAG
- B0: NEGATIVE_TAPE
- B1: POSITIVE_TAPE
