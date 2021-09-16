* `make chore`を走らせる
* cypressとeslintを確認してpackage.jsonを更新
   * https://docs.cypress.io/guides/references/changelog
     * `/Users/[your name]/Library/Caches/Cypress`に古いバージョンが残るので削除する
   * https://eslint.org/blog/
* Bootstrapの更新を確認する
   * https://blog.getbootstrap.com/
   * popperとBootstrapのJSが分かれている形式を選ぶ
   * deferを付ける
* deno_stdの更新を確認してtest/deps.jsを更新する
   * https://deno.land/std
* file_serverを更新する
   * `deno install --allow-net --allow-read -f https://deno.land/std@0.105.0/http/file_server.ts`
* typescriptを更新する
   * `npm install -g typescript`
* VSCodeを更新する
   * `Code > Restart to Update`
