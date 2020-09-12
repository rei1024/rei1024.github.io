/**
 * DOMビルダー
 */

export class D {
    /**
     * create element
     * @param {string} tagName 
     * @param {...(HTMLElement|Array<HTMLElement>)} children
     * @returns {HTMLElement}
     * // elem<K extends keyof HTMLElementTagNameMap>(tagName: K, ...(HTMLElement|Array<HTMLElement>)): HTMLElementTagNameMap[K];
     */
    static e(tagName, ...children) {
        const e = document.createElement(tagName);
        e.append(...children.flat(Infinity));
        return e;
    }

    /**
     * 名前空間指定
     * @param {string} namespace 
     * @param {string} tagName 
     * @param  {...(Element|Array<Element>)} children 
     */
    static eNS(namespace, tagName, ...children) {
        const e = document.createElementNS(namespace, tagName);
        e.append(...children.flat(Infinity));
        return e;
    }

    /**
     * 属性の設定
     * @param {object} attrs 
     * @param {HTMLElement} e 
     */
    static setAttr(attrs, e) {
        Object.entries(attrs).forEach(([attr, value]) => {
            e.setAttribute(attr, value);
        })
        return e;
    }

    /**
     * CSSスタイルの設定　
     * @param {object} props
     * @param {HTMLElement} e 
     */
    static setStyle(props, e) {
        const style = Object.entries(props).map(([p, v]) => p + ":" + v).join(";");
        D.setAttr({ "style": style }, e);
        return e;
    }

    /**
     * @template A
     * @param {A} e 
     * @param {(_: A) => void} func
     * @returns {A}
     */
    static tap(e, func) {
        func(e);
        return e;
    }

    static html(...children) { return D.e("html", ...children); }
    static base(...children) { return D.e("base", ...children); }
    static head(...children) { return D.e("head", ...children); }
    static link(...children) { return D.e("link", ...children); }
    static meta(...children) { return D.e("meta", ...children); }
    static style(...children) { return D.e("style", ...children); }
    static title(...children) { return D.e("title", ...children); }
    static body(...children) { return D.e("body", ...children); }
    static address(...children) { return D.e("address", ...children); }
    static article(...children) { return D.e("article", ...children); }
    static aside(...children) { return D.e("aside", ...children); }
    static footer(...children) { return D.e("footer", ...children); }
    static header(...children) { return D.e("header", ...children); }
    static h1(...children) { return D.e("h1", ...children); }
    static h2(...children) { return D.e("h2", ...children); }
    static h3(...children) { return D.e("h3", ...children); }
    static h4(...children) { return D.e("h4", ...children); }
    static h5(...children) { return D.e("h5", ...children); }
    static h6(...children) { return D.e("h6", ...children); }
    static hgroup(...children) { return D.e("hgroup", ...children); }
    static main(...children) { return D.e("main", ...children); }
    static nav(...children) { return D.e("nav", ...children); }
    static section(...children) { return D.e("section", ...children); }
    static blockquote(...children) { return D.e("blockquote", ...children); }
    static dd(...children) { return D.e("dd", ...children); }
    static div(...children) { return D.e("div", ...children); }
    static dl(...children) { return D.e("dl", ...children); }
    static dt(...children) { return D.e("dt", ...children); }
    static figcaption(...children) { return D.e("figcaption", ...children); }
    static figure(...children) { return D.e("figure", ...children); }
    static hr(...children) { return D.e("hr", ...children); }
    static li(...children) { return D.e("li", ...children); }
    static ol(...children) { return D.e("ol", ...children); }
    static p(...children) { return D.e("p", ...children); }
    static pre(...children) { return D.e("pre", ...children); }
    static ul(...children) { return D.e("ul", ...children); }
    static a(...children) { return D.e("a", ...children); }
    static abbr(...children) { return D.e("abbr", ...children); }
    static b(...children) { return D.e("b", ...children); }
    static bdi(...children) { return D.e("bdi", ...children); }
    static bdo(...children) { return D.e("bdo", ...children); }
    static br(...children) { return D.e("br", ...children); }
    static cite(...children) { return D.e("cite", ...children); }
    static code(...children) { return D.e("code", ...children); }
    static data(...children) { return D.e("data", ...children); }
    static dfn(...children) { return D.e("dfn", ...children); }
    static em(...children) { return D.e("em", ...children); }
    static i(...children) { return D.e("i", ...children); }
    static kbd(...children) { return D.e("kbd", ...children); }
    static mark(...children) { return D.e("mark", ...children); }
    static q(...children) { return D.e("q", ...children); }
    static rb(...children) { return D.e("rb", ...children); }
    static rp(...children) { return D.e("rp", ...children); }
    static rt(...children) { return D.e("rt", ...children); }
    static rtc(...children) { return D.e("rtc", ...children); }
    static ruby(...children) { return D.e("ruby", ...children); }
    static s(...children) { return D.e("s", ...children); }
    static samp(...children) { return D.e("samp", ...children); }
    static small(...children) { return D.e("small", ...children); }
    static span(...children) { return D.e("span", ...children); }
    static strong(...children) { return D.e("strong", ...children); }
    static sub(...children) { return D.e("sub", ...children); }
    static sup(...children) { return D.e("sup", ...children); }
    static time(...children) { return D.e("time", ...children); }
    static u(...children) { return D.e("u", ...children); }
    static var(...children) { return D.e("var", ...children); }
    static wbr(...children) { return D.e("wbr", ...children); }
    static area(...children) { return D.e("area", ...children); }
    static audio(...children) { return D.e("audio", ...children); }
    static img(...children) { return D.e("img", ...children); }
    static map(...children) { return D.e("map", ...children); }
    static track(...children) { return D.e("track", ...children); }
    static video(...children) { return D.e("video", ...children); }
    static embed(...children) { return D.e("embed", ...children); }
    static iframe(...children) { return D.e("iframe", ...children); }
    static object(...children) { return D.e("object", ...children); }
    static param(...children) { return D.e("param", ...children); }
    static picture(...children) { return D.e("picture", ...children); }
    static source(...children) { return D.e("source", ...children); }
    static canvas(...children) { return D.e("canvas", ...children); }
    static noscript(...children) { return D.e("noscript", ...children); }
    static script(...children) { return D.e("script", ...children); }
    static del(...children) { return D.e("del", ...children); }
    static ins(...children) { return D.e("ins", ...children); }
    static caption(...children) { return D.e("caption", ...children); }
    static col(...children) { return D.e("col", ...children); }
    static colgroup(...children) { return D.e("colgroup", ...children); }
    static table(...children) { return D.e("table", ...children); }
    static tbody(...children) { return D.e("tbody", ...children); }
    static td(...children) { return D.e("td", ...children); }
    static tfoot(...children) { return D.e("tfoot", ...children); }
    static th(...children) { return D.e("th", ...children); }
    static thead(...children) { return D.e("thead", ...children); }
    static tr(...children) { return D.e("tr", ...children); }
    static button(...children) { return D.e("button", ...children); }
    static datalist(...children) { return D.e("datalist", ...children); }
    static fieldset(...children) { return D.e("fieldset", ...children); }
    static form(...children) { return D.e("form", ...children); }
    static input(...children) { return D.e("input", ...children); }
    static label(...children) { return D.e("label", ...children); }
    static legend(...children) { return D.e("legend", ...children); }
    static meter(...children) { return D.e("meter", ...children); }
    static optgroup(...children) { return D.e("optgroup", ...children); }
    static option(...children) { return D.e("option", ...children); }
    static output(...children) { return D.e("output", ...children); }
    static progress(...children) { return D.e("progress", ...children); }
    static select(...children) { return D.e("select", ...children); }
    static textarea(...children) { return D.e("textarea", ...children); }
    static datails(...children) { return D.e("datails", ...children); }
    static dialog(...children) { return D.e("dialog", ...children); }
    static menu(...children) { return D.e("menu", ...children); }
    static summary(...children) { return D.e("summary", ...children); }
    static slot(...children) { return D.e("slot", ...children); }
    static template(...children) { return D.e("template", ...children); }

    /**
     * 
     * @param {HTMLElement} root 
     * @param {...HTMLElement|string|Array<HTMLElement|string>} children 
     */
    static append(root, ...children) {
        root.append(...children.flat(Infinity));
        return root;
    }

    /**
     * 
     * @param {HTMLElement} root
     * @param {...HTMLElement|string|Array<HTMLElement|string>} children
     */
    static prepend(root, ...children) {
        root.prepend(...children.flat(Infinity));
        return root;
    }

    /**
     * TODO テストする　
     * @param {string} html 
     */
    static createFromHTML(html) {
        let t = document.createElement("div");
        t.innerHTML = html;
        c = t.children[0];
        return c;
    }

    /**
     * 全ての子要素を削除する
     * @param {HTMLElement} parent 
     */
    static removeEveryChild(parent) {
        const children = parent.children;
        for (const child of children) {
            parent.removeChild(child);
        }
    }
    
    /**
     * イベントリスナーを付ける
     * @param {HTMLElement} e 
     * @param {string} event_type 
     * @param {Function} handler 
     */
    static addEventListener(e, event_type, handler) {
        e.addEventListener(event_type, handler);
        return e;
    }

    static addEventListenerToList(es, event_type, handler) {
        for (const e of es) {
            e.addEventListener(event_type, handler);
        }
    }
}

/**
 * HTMLタグ
 */
const str = "html base head link meta style title body " +
    "address article aside footer header h1 h2 h3 h4 h5 h6 " +
    "hgroup main nav section " +
    "blockquote dd div dl dt figcaption figure hr li ol p pre ul " +
    "a abbr b bdi bdo br cite code data dfn em i kbd mark q " +
    "rb rp rt rtc ruby s samp small span strong sub sup time u var wbr " +
    "area audio img map track video " + 
    "embed iframe object param picture source " +
    "canvas noscript script " +
    "del ins " +
    "caption col colgroup table tbody td tfoot th thead tr " +
    "button datalist fieldset form input label legend meter optgroup option " +
    "output progress select textarea " +
    "datails dialog menu summary " +
    "slot template";

/**
 * コード生成用
 * @param {string} str 
 */
function generateCode(str) {
    const textarea = document.createElement("textarea");
    textarea.cols = "80";
    const button = document.createElement("button");
    str.split(" ").forEach(s => {
        textarea.value += "    static " + s +  "(...children) { return D.e(\"" + s + "\", ...children); }\n";
    });
    document.body.appendChild(textarea);
    button.innerText = "コピーする";
    button.addEventListener("click", () => {
        navigator.clipboard.writeText(textarea.value);
    });
    document.body.appendChild(button);
}
