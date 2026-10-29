const home = document.getElementById("home");
const game = document.getElementById("game");
const game_main = game.querySelector(".main");
const game_sub = game.querySelector("aside.sub");
const event_selector = document.getElementById("event_selector");
const lvup_div = document.getElementById("lvup_div");
const status_text = document.querySelectorAll(".status");
const game_loglist = document.getElementById("game_loglist");
const disp_result = document.getElementById("disp_result");
const normal_view = document.getElementById("normal_view");
const boss_name_lbl = document.getElementById("boss_name_lbl");
const hpbar_inner = document.getElementById("hpbar_inner");
const battle_earth_img = document.getElementById("battle_earth_img");
const battle_boss_img = document.getElementById("battle_boss_img");

let num = 0
const species_list = ["human","beastman","engel","devil","norm"] //kari
let lvup_100 = 100
let lvup_02 = 0.2
let lvup_list = [["population",lvup_100],["research",lvup_100],["military",lvup_100],["research_mag",lvup_02],["population_mag",lvup_02],["military",lvup_02]]; //lvup選択肢
let lvup_math = ["+","-"]

let world_status = {
    "World_num":Math.floor(Math.random()*4 + 1), //0~3 +1
    // "develop":0,
    "population":100,
    "research":0,
    "military":0,
    "food":0,
    "kings":1,
    "species":species_list[Math.floor(Math.random() * species_list.length)], //0~10,
    "population_mag":(1+(1+Math.floor(Math.random()*20)/20)), //倍率 割合
    "research_mag":(1+(1+Math.floor(Math.random()*20)/20)), //倍率
    "military_mag":(1+(1+Math.floor(Math.random()*20)/20)), //倍率
    "lv":1,
    "score":0,
    "boss_num":1
};
let oldscore = 0
let moto = Date.now();
let last_tick = Date.now();
let last_status_html = "";
let buff = [1,1,1]; //population,research,militaryの順
let boss_moto = Date.now();
let boss_result = true

function rand_mag(base_mag) {
    const mag = base_mag + (Math.random() * 0.06 - 0.03);
    return mag;
}

function choices(max) {
    let kari = Math.floor(Math.random()*max)
    return kari
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
 
// ログ追加（上限を超えたら古いものから消す）
const MAX_LOG = 100;
 
function add_log(html) {
    game_loglist.insertAdjacentHTML('beforeend', html);
    while (game_loglist.children.length > MAX_LOG) {
        game_loglist.firstElementChild.remove();
    }
    game_loglist.scrollTop = game_loglist.scrollHeight; //test
}

//最悪エラー出るかもだけどpopupをbeforeendでやったら間違えて消さない気がする
function show_event_popup(text) {
    const child = document.createElement("p");
    child.textContent = text;
    child.className = "event_selector";
    event_selector.appendChild(child);

    setTimeout(() => {
        child.classList.add("event_fadeout")
        setTimeout(() => child.remove(), 400);
    }, 5000);
}

// #region event
function game_event() {
    let eventtext = "";
    const eventnum = Math.floor(Math.random()*3); //今　0～3
    // const eventnum = 1; //test
    console.log(`On_event:${eventnum}`);
    if (eventnum === 0) {
        // console.log(`event_No${eventnum}:村の建設`);
        eventtext = "イベント発生！　[村の建設]";
        world_status["population"] += 100;
    }
    else if (eventnum === 1) {
        // console.log(`event_No${eventnum}:春の研究祭り`);
        eventtext = "イベント発生！　[春の研究祭り]";
        world_status["research"] += 100; //checkpoint 数値計算バグの原因かも？
    }
    else if (eventnum === 2) {
        eventtext = "イベント発生！　[巨大台風接近]";
        world_status["population"] *= 0.95;
        world_status["research"] -= world_status["research"] / 10
    }
    else if (eventnum === 3) {
        eventtext = "イベント発生！　[宇宙の法則が乱れる]";
        const keys_wld_status = Object.keys(world_status); //エラーでるよ
        const target = keys_wld_status[Math.floor(Math.random()*keys_wld_status.length)]; //エラー出ます　（種族とか選ばれたとき）
        console.log(target);
        world_status[target] *= 2
    }

    show_event_popup(eventtext);

    add_log(`<p class="game_log event_log">${eventtext}</p>`);
}

// K_head_fst = ["この世のすべての ","混沌の",]

let K_popl = false
let K_mil = false
let K_boss = false

function K_check() {
    let K_name = ""
    if (K_popl == false) {
        if (world_status["population"] >= 500000) {
            world_status["kings"] += 1
            K_name = "sol"
            K_popl = true
        }
    }
    if (K_mil == false) {
        if (world_status["military"] >= 200000) {
            world_status["kings"] += 1;
            K_name = "水谷優";
            K_mil = true;
        }
    }
    if (K_boss == false) {
        if (world_status["boss_num"] >= 10) {
            world_status["kings"] += 1;
            K_name = "The Amalgamation";
            K_boss = true;
        }
    }
    // ...

    add_log(`<p class="game_log king_log" style="color: red">${K_name}がこの世に降り立ったぞ！</p>`)
}
// #endregion

// #region buff
function species_buff() {
    if (world_status["species"] == "human") {
        world_status["population_mag"] += 0.2
        world_status["research_mag"] += 0.1
        world_status["military_mag"] -= 0.1
    } else if (world_status["species"] == "beastman") {
        world_status["population_mag"] += 0.3
        world_status["research_mag"] -= 0.3
        world_status["military_mag"] -= 0.2
    } else if (world_status["species"] == "engel") {
        world_status["population_mag"] -= 0.3
        world_status["research_mag"] -= 0.1
        world_status["military_mag"] += 0.8
    } else if (world_status["species"] == "devil") {
        world_status["population_mag"] -= 0.2
        world_status["research_mag"] += 0.2
        world_status["military_mag"] += 0.5
    } else if (world_status["species"] == "norm") {
        world_status["population_mag"] += 0.1
        world_status["research_mag"] += 0.5
        world_status["military_mag"] -= 0.2
    }
}

// buff適用後の値（population,research,militaryの順）。変数に持たず、必要なときに計算する
function get_buffed() {
    return [
        world_status["population"] * buff[0],
        world_status["research"] * buff[1],
        world_status["military"] * buff[2],
    ];
}

function get_kbuffed() {
    return [
        world_status["population"] * (buff[0] ** world_status["kings"]),
        world_status["research"] * (buff[1] ** world_status["kings"]),
        world_status["military"] * (buff[2] ** world_status["kings"]),
    ];
}

// #endregion

//#region lvup

function lv_waitpromise() {
    // const waitlvup = new Promise(lvup_resolve => {
    return new Promise(lvup_resolve => {
        const fragment = new DocumentFragment();

        for (let i = 0; i < 2; i++) {
            const [to, up] = lvup_list[choices(lvup_list.length)];
            const math = lvup_math[choices(lvup_math.length)];
        
            const button = document.createElement("button");
        
            button.dataset.to = to;
            button.dataset.up = up;
            button.dataset.math = math;

            button.textContent = `${to}が ${math} ${up}`;
            console.log("button_data-",button.dataset.to)
            button.onclick = () => {
                lvup_resolve({
                    to: button.dataset.to,
                    up: Number(button.dataset.up),
                    math: button.dataset.math,
                });
                lvup_div.replaceChildren(); //test lvup
            }
        
            fragment.appendChild(button);
        }
        
        lvup_div.replaceChildren(fragment);
    });
    // lvup_div.innerHTML = ""
    // return waitlvup
}
    
// }
async function lvup() {
    let bst = 0
    if (world_status["kings"] > 1) {
        bst = get_kbuffed()
    } else {
        bst = get_buffed();
    }
    //スコア計算
    // world_status["score"] = world_status["develop"]*2 + (display_population + (display_research/(research_lv*5)))*0.5; //kari
    world_status["score"] = (Math.max(0, bst[0]/100) + Math.max(0, bst[1]/100) + Math.max(0, bst[2]))*0.5; //kari
    world_status["score"] *= 100
    world_status["score"] = Math.floor(world_status["score"]);
    world_status["score"] /= 100 //小数点第２位まで
    let increase = world_status["score"] - oldscore;
    console.log(`increase:${increase} score:${world_status["score"]}`)

    //レベルアップするかどうか
    if (increase > 500 + 250 * Math.pow(1.5, world_status["lv"] - 1)) { //  <= これが足し算で増えていくとダメ
        // console.log("lvuped",world_status["lv"]);
        oldscore = world_status["score"];
        increase = 0
        world_status["lv"] += 1;
        // time of select
        //世界の画面.toggle('hidden',false)
        const selected = await lv_waitpromise()

        console.log("before",world_status[selected.to])
        if (selected.math === "*") {
            world_status[selected.to] *= selected.up
        } else if (selected.math === "+") {
            world_status[selected.to] += selected.up //promiseでtoとupが返ってくる前提
        } else if (selected.math === "-") {
            world_status[selected.to] -= selected.up
        }
        console.log("end",world_status[selected.to])
        
    }
}
//#endregion

//#region bossbattle

// HPバーの表示を更新する関数（割合計算＋色分けをここにまとめる） 
function update_boss_hpbar(boss) {
    const rate = Math.max(0, boss.hp / boss.max_hp) * 100;
    hpbar_inner.style.width = `${rate}%`;

    hpbar_inner.classList.remove("low", "critical");
    if (rate <= 20) {
        hpbar_inner.classList.add("critical");
    } else if (rate <= 50) {
        hpbar_inner.classList.add("low");
    }
}

// 地球がボスに攻撃する演出　下のと合成できないかな？　dfside_img,dfside_dmgimg   checkpoint
async function earth_attack_animation(boss_num) {
    const normal_src = `/assets/Boss_${boss_num}.png`;
    const dmg_src = `/assets/Boss_${boss_num}_dmg.png`;

    battle_earth_img.style.transform = "translateX(90px)";
    await sleep(150);

    battle_boss_img.src = dmg_src;
    await sleep(200);
    battle_boss_img.src = normal_src;

    battle_earth_img.style.transform = "translateX(0px)";
    await sleep(150);
}

// ボスが地球に攻撃する演出
async function boss_attack_animation(world_num) {
    const normal_src = `/assets/Earth_${world_num}.png`; // "image/Earth ${world_num}.png" から修正
    const dmg_src = `/assets/Earth_${world_num}_dmg.png`;

    battle_boss_img.style.transform = "translateX(-90px)";
    await sleep(150);

    battle_earth_img.src = dmg_src;
    await sleep(200);
    battle_earth_img.src = normal_src;

    battle_boss_img.style.transform = "translateX(0px)";
    await sleep(150);
}

class Boss {
    constructor(boss_num) {
        this.boss_num = boss_num;
        this.lv = 10 * boss_num + Math.floor(Math.random() * 10);
        this.hp = 100 + Math.floor(Math.pow(1.2, this.lv));
        this.max_hp = this.hp; // ← HPバー計算用
        this.atk = 23 + Math.floor(Math.pow(1.2, this.lv));
    }
}

async function bossbattle() {
    
    console.log(`bossbattle start! boss_num:${world_status["boss_num"]}`);
    let result = true;

    const boss = new Boss(world_status["boss_num"]);
    const world_num = world_status["World_num"];

    battle_earth_img.src = `/assets/Earth_${world_num}.png`;
    battle_boss_img.src = `/assets/Boss_${world_status["boss_num"]}.png`;

    game.classList.add("boss_mode");   //ボス戦レイアウトへ切り替え

    boss_name_lbl.textContent = `ボス${world_status["boss_num"]}  HP:${Math.floor(boss.hp)}/${Math.floor(boss.max_hp)}`;
    update_boss_hpbar(boss);

    add_log(`<p class="game_log boss_log">ボス${world_status["boss_num"]}が現れた！(HP:${Math.floor(boss.hp)})</p>`);

    let turn = 1;
    while (world_status["population"] > 0 && boss.hp > 0) {
        
        let bst = 0
        if (world_status["kings"] >= 1) {
            bst = get_kbuffed()
        } else {
            bst = get_buffed();
        }
        const p_attack = ((bst[2] + bst[0] / 100) * bst[1] / 2) / 10000;
        const enemy_mil_dmg = boss.atk / 5 * 3;
        const enemy_pop_dmg = boss.atk / 5 * 2;

        boss.hp -= p_attack;
        world_status["military"] -= enemy_mil_dmg;
        world_status["population"] -= enemy_pop_dmg;

        await earth_attack_animation(world_status["boss_num"]);
        update_boss_hpbar(boss);
        boss_name_lbl.textContent = `第${world_status["boss_num"]}のボス  HP:${Math.max(0, Math.floor(boss.hp))}/${Math.floor(boss.max_hp)}`; //これ毎回描画しないといけないの？

        if (boss.hp > 0 && result !== false) {
            await boss_attack_animation(world_status["World_num"]); // ボス→地球攻撃演出
        }

        //1ターンごとにログを流す
        add_log(`
            <p class="game_log">【${turn}ターン目】こちらの攻撃！ ボスに${Math.floor(p_attack)}ダメージ (残りHP:${Math.max(0, Math.floor(boss.hp))})</p>
            <p class="game_log">ボスの反撃！ 軍事力-${Math.floor(enemy_mil_dmg)} 人口-${Math.floor(enemy_pop_dmg)}</p>
        `);

        if (world_status["military"] < 0) world_status["military"] = 0;
        if (world_status["population"] <= 0) {
            world_status["population"] = 0;
            result = false;
        }

        turn += 1;

        if (result === false) break;
    }

    if (boss.hp <= 0) {
        add_log(`<p class="game_log boss_log">ボス${world_status["boss_num"]}を撃破した！</p>`);
    } else {
        add_log(`<p class="game_log boss_log">世界は滅亡した…</p>`);
    }

    await sleep(1000);
    game.classList.remove("boss_mode");

    world_status["boss_num"] += 1;
    return result;
}
//#endregion

const DISPLAY_INTERVAL = 500; // ms
let display_timer = null;

// #region 描画ループ
async function update_status() {
    let bst = 0
    if (world_status["kings"] > 1) {
        bst = get_kbuffed()
    } else {
        bst = get_buffed();
    }
    const html = `
        <div style="margin-left: 1px" class="changing">
            <p>人口: ${Math.floor(bst[0])}人</p>
            <p>科学力: ${Math.floor(bst[1])}</p>
            <p>軍事力: ${Math.floor(bst[2])}</p>
            <p>王の数: ${world_status['kings']}人</p>
            <p>レベル: ${world_status['lv']}lv</p>
        </div>
        <div style="margin-left: 2px" class="stable">
            <p>種族: ${world_status['species']}</p>
        </div>
    `;
    if (html === last_status_html) return;
    last_status_html = html;
    status_text.forEach((i) => { i.innerHTML = html; });
}

function start_display_loop() {
    stop_display_loop();
    update_status();
    display_timer = setInterval(update_status, DISPLAY_INTERVAL);
}

function stop_display_loop() {
    clearInterval(display_timer);
    display_timer = null;
}
// #endregion

async function game_result_disp() {
    disp_result.innerHTML = `
    <h2>得点: ${world_status["score"]}</h2>
    <p>
    種族: ${world_status["species"]}<br>
    最終人口: ${Math.floor(world_status["population"])}<br>
    研究力: ${Math.floor(world_status["research"])}<br>
    王の数: ${world_status['kings']}人
    レベル: ${world_status["lv"]}<br>
    <br>
    <span style = "font-weight: bold;">倍率</span><br>
    人口倍率: ${world_status["population_mag"]}<br>
    研究倍率: ${world_status["research_mag"]}<br>
    </p>
    `
    let Flagment = new DocumentFragment();
    let child = document.createElement("button")
    child.onclick = () => {
        disp_result.classList.add('hidden');
        home.classList.remove('hidden');
    }
    child.textContent = "ホームに戻る"
    Flagment.appendChild(child)
    disp_result.appendChild(Flagment)
}

// #region ゲーム本体

async function playgame() { //引数にアイテムとかのフラグ入れるかも
    console.log("game start")
    // ゲーム本体
    //ステータス等の初期設定
    world_status = {
        "World_num":Math.floor(Math.random()*4 + 1), //0~3 +1
        // "develop":0,
        "population":100,
        "research":0,
        "military":0,
        "food":0,
        "kings":1,
        "species":species_list[Math.floor(Math.random() * species_list.length)], //0~10,
        "population_mag":(1+(1+Math.floor(Math.random()*20)/20)) ** world_status["kings"], //倍率 割合
        "research_mag":(1+(1+Math.floor(Math.random()*20)/20)) ** world_status["kings"], //倍率
        "military_mag":(1+(1+Math.floor(Math.random()*20)/20)) ** world_status["kings"], //倍率
        "lv":1,
        "score":0,
        "boss_num":1
    };
    // ↑これを関数で変更するのは元とコード量が変わんなそうだからやめた
    const gameworld_img = `<img src="/assets/Earth_${world_status["World_num"]}.png" alt="world" class="gameworld_img">`
    oldscore = 0
    moto = Date.now();
    status_text.forEach((i) => {
        i.innerHTML = "";
    })
    buff = [1,1,1];
    boss_moto = Date.now();
    last_tick = Date.now();
    let boss_win = true;

    //region 地獄の数値計算

    //html書き換え
    home.classList.add('hidden');
    game.classList.remove('hidden');
    
    //画像出す
    normal_view.insertAdjacentHTML('afterbegin', gameworld_img);

    // プログラム

    species_buff()

    let game_result = undefined // tryでローカルになるっぽいので宣言
    try {
        game_result = await new Promise(resolve => {
            async function loop() {
                const dt = Math.min((Date.now() - last_tick) / 1000, 5);

                //数値計算
                // military = world_status["military"] kari

                // 人口の処理
                world_status["population"] += world_status["population"] * (world_status["population_mag"] - 1) /(1 + world_status["population"] / 10000) * dt;

                //リサーチの処理
                let up = (world_status["population"]/5000) * rand_mag(world_status["research_mag"]) * dt;
                // console.log(up); デバッグしよう！
                world_status["research"] += up
                if (world_status["research"] < 0) {
                    world_status["research"] = 0
                }

                //軍事力の処理
                const research_ratio = Math.max(0.7, world_status["research"] / (50 * world_status["military_mag"])); //研究力(50 * 軍事倍率)％中のどれくらいが軍人一人に使われているか
                const per_soldier = research_ratio / Math.max(world_status["military"], 1); // 0除算の防止
                let onduty = (world_status["population"] / 100) * (world_status["military_mag"] - 1) * per_soldier     * dt; //人口の1.0%から軍事力を選ぶ * per_soldier *dt
                if (!Number.isFinite(onduty)) {
                    console.warn("onduty が数値になりませんでした", { research_ratio, per_soldier, dt });
                    onduty = 0;
                }
                onduty = Math.min(onduty, world_status["population"]); // 人口以上は変換しない
                world_status["military"] += onduty;
                world_status["population"] -= onduty; //ondutyの数だけ人口から軍事力へ変換

                //endregion
                
                //イベント系もろもろの処理
                const ima = Date.now();
                const eventfrag = Math.min(0.2, 0.01 * Math.floor((ima - moto) / 1000)); //イベント発生率
                if (Math.random() < eventfrag) {
                    game_event();
                    moto = Date.now(); //タイマーリセット
                }

                K_check()
                
                //lvup
                const lvupstart = Date.now();
                await lvup();
                moto += Date.now() - lvupstart;

                //bossbattle
                const boss_ima = Date.now();
                if ((boss_ima - boss_moto) / 1000 > Math.max(30, 60 - 10 * world_status["boss_num"])) { //経過時間の秒数が一定以上ならば実行
                    boss_result = await bossbattle();
                    boss_moto = Date.now();
                    
                    lvup_100 = 100 * world_status["boss_num"]
                    lvup_02 = 0.2 * world_status["boss_num"]

                    if (boss_result === false) {
                        boss_win = false;
                    }
                }

                if (world_status["population"] < 0) {
                    world_status["population"] = 0;
                }
                if (world_status["research"] < 0) {
                    world_status["research"] = 0;
                }
                if (world_status["military"] < 0) {
                    world_status["military"] = 0;
                }
                if (world_status["population_mag"] < 0) {
                    world_status["population_mag"] = 0;
                }
                if (world_status["research_mag"] < 0) {
                    world_status["research_mag"] = 0;
                }
                if (world_status["military_mag"] < 0) {
                    world_status["military_mag"] = 0;
                }//関数にする

                //終了処理
                if (boss_win === false) {
                    resolve(world_status);
                    return; //world status
                }
                if (reset === true) {
                    reset = false
                    resolve(undefined);
                    return
                }

                last_tick = Date.now();
                setTimeout(loop, 1000);
            }
            loop();

        })
    }finally {
        //バグると二つ画像出る?
        // console.log(game);
        try {
            const oldimg = game.querySelector(".gameworld_img");
            boss_win = true;

            if (oldimg) {
                oldimg.remove();
            }
        } catch(error) {
            console.error("erroercode\"001\" : " + error);
            alert("  エラーが発生しました!\n errorcode\"001\" : " + error)
        }
    }

    game.classList.add('hidden');
    disp_result.classList.remove('hidden');

    await game_result_disp()

    // console.log(`aaaa:${game_result}`) test
    return game_result;
}
// #endregion

async function main() {
    const game_promise = playgame();
    start_display_loop();
    try {
        return await game_promise;
    } finally {
        stop_display_loop();
    }
}

// #region Eventlistenerまとめ
const createworld_button = document.getElementById("createWorld_button");
const worlds = document.getElementById("Worlds");
let n = 0;
let world_status_list = [];

console.log("start");

createworld_button.addEventListener("click", async () => {

    n += 1; //位置変えたらoldimgの表示方式も変える

    const result = await main();  // main()に変更予定
    // console.log(result)
    // console.log(`result:${result["World_num"]}`);

    if (result) {
        world_status_list.push(result);

        const worldcompornent = document.createElement("div");
        // worldcompornent.className = `${No} chiled_world`;
        worldcompornent.className = `chiled_world`;
        worldcompornent.dataset.WorldNo = `${n}`; //datasetは大文字入れると-wなどの"-　+　小文字"の形になる
        worldcompornent.dataset.imageNo = `${result["World_num"]}`;

        worldcompornent.innerHTML = `
            <button class="view">view status!</button>
            <img src="/assets/Earth_${result["World_num"]}.png" alt="world" class="homeworld_img">
        `;
        //img_numが範囲超えないか確認

        worlds.appendChild(worldcompornent);
    }
    else {
        n -= 1;
    }
})

worlds.addEventListener("click", (e) => {
    //worlds内のview要素を持つもの(viewbutton)がクリックされたとき
    if (e.target.classList.contains("view")) {
        //viewtargetの親divをとって、そこからclassを取得　ー＞　取得したものから.split("")で無理やり番号だけを取得する
        const viewtarget = e.target.closest('.chiled_world');
        const World_No = viewtarget.dataset.WorldNo;

        //新規タブでstatusの表示
        const targetstatus = world_status_list[World_No - 1];
        console.log(`World_No: ${World_No}  +taget:${JSON.stringify(targetstatus)}  +status${world_status_list[World_No - 1]}`); //test

        try {
            if (targetstatus) {
                let status_window = window.open('/status.html', null, "width=200,height=600");
                // console.log("window.open:" + status_window);
                if( status_window ) {
                    console.log('正常に開きました');
                } 
                if (!status_window) {
                    console.log('正常に開けませんでした！');
                    return;
                }
                status_window.onload = () => {
                const mainstatus = status_window.document.getElementById("mainstatus");
                mainstatus.innerHTML = `
                    <div style="margin-left: 1px display: flex;">
                        <div style="margin-right: 5px">
                            <h1>World_No${World_No}</h1>
                            <p>人口: ${targetstatus['population']}</p>
                            <p>研究: ${targetstatus['research']}</p>
                            <p>軍事力: ${targetstatus['military']}</p>
                            <p>lv: ${targetstatus['lv']}</p>
                            <p>スコア: ${targetstatus['score']}</p>
                        </div>
                        <div>
                            <p>種族: ${targetstatus['species']}</p>
                            <p>倍率</p>
                            <p>人口倍率: ${targetstatus['population_mag']}</p>
                            <p>研究倍率: ${targetstatus['research_mag']}</p>
                        </div>
                    </div>`;
                    //なんか勝手に治った
                };
            }
        } catch (e) {
            console.log("errorcode\"002\" : " + e)
        }
    }
});

let log_i = 0
game_sub.querySelector("button").addEventListener('click', () => {
    game_sub.querySelector("#game_loglist").classList.toggle('hidden');
    console.log("game_log on/off");
    if (log_i === 0) {
        game_sub.style.backgroundColor = "rgba(138, 251, 251, 0.575)";
        log_i++
    } else {
        game_sub.style.backgroundColor = "initial"
        log_i -= 1
    }
})

// const fight_button = document.getElementById("fight");
// console.log(fight_button);
// const fightlist = document.getElementById("fight_list");
// console.log(fightlist);
// const fighter1 = document.getElementById("fighter1");
// const fighter2 = document.getElementById("fighter2");


// fight_button.addEventListener('click', () => {
//     fightlist.classList.toggle('hidden');
// })
// fightlist.querySelector("button").addEventListener('click', () => {
//     console.log("fightlist_clicked");
//     const allert = fightlist.querySelector("#allert_text");
//     if (allert) {
//         allert.remove();
//     }
//     // const 
//     if (fighter1.value && fighter2.value) {
//         //勝負の処理　ナンバーとっていったん二分の一して勝敗決める
//         try {
//             //divtoru
//             let kouho = Array.from(worlds.querySelectorAll(".chiled_world"));
//             console.log(kouho);
//             // console.log( kouho.filter(target => {target.dataset.WorldNo === fighter1.value;}) )
//         } catch (e) {
//             console.error(e);
//             // console.error("fighter_select_error:", e.message,e.stuck)
//         }
//     }
//     else {
//         let text = document.createElement("p");
//         text.textContent = "両方にナンバーを入力してください";
//         text.id = "allert_text";
//         fightlist.appendChild(text);
//     }
// })

const resetbuttons = document.querySelectorAll(".reset");
let reset = false;

// console.log(`resetbutton:${resetbuttons}`);

resetbuttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        reset = true;
        console.log("reset");
    })
})

// #endregion
//vscodeからリポジトリ開くんならローカルあるからそれ開いて

//イベント増やす
//王がどうやって増えるのか → 厳しい条件の達成
//boss_winの判定
//status_text表示を変更
//関数をローカル関数にしたらworld_statusの外での宣言いらない？
//　↑何ならworld_statusを引数で送れば宣言いらない（返り値作って代入しないといけない）

//勝負の処理

//バグ

//ボス６を倒すと国家総動員法が施工される
//viewstatusを二回押すとバグる　<- slackに送ったonloadの関係かも
//[宇宙の法則が乱れる]　←　このイベントで変更するとまずいやつまで変更するかも ← 種族を変更するとengelengelみたいになってバフ消える

//ゲーム性の再確認
/*
1.世界を育てる　=>　1.ハイスコアを目指すorオンライン対戦 =>　3.育てた報酬でアイテムを買う => 4.さらに強い世界を作る

1 =>ローグライク要素(レベルなどによる強化),スレスパなどのようなボス戦　<= ちょうてんちゃんのようなノルマ系でもいいかも？,
*/
