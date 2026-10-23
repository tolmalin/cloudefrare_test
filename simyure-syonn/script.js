const home = document.getElementById("home");
const game = document.getElementById("game");
const game_main = game.querySelector(".main")
const game_sub = game.querySelector(".sub")
const event_selector = document.getElementById("event_selector");
const levelup_div = document.getElementById("levelup_div");
const status_text = document.getElementById("status");
const normal_view = document.getElementById("normal_view");

let num = 0
const spicies_list = ["human","beastman","engel","devil","norm"] //kari
let levelup_list = [["population",100],["research",100]]; //levelup選択肢

let world_status = {
    "World_num":undefined,
    "develop":0,
    "population":0,
    "research":0,
    "spicies":undefined,
    "population_mag":0, //倍率
    "militaly":0,
    "level":1,
    "score":0
};
let develop = 0;
let population = 100;
world_status["population_mag"] = 0;
let research = 0;
let research_level = 1;
let research_MAG = 0;
let research_chemi = 0;
let war = false;
let housin = undefined;
world_status["spicies"] = 0;
world_status["World_num"] = 0;
let score = 0
let oldscore = 0
let moto;
let display_population = 0;
let display_research = 0;

function choices() {
    let kari = Math.floor(Math.random()*2) //0~1
    return kari
}

function waitpromise() {
    return new Promise(levelup_resolve => {
        const fragment = new DocumentFragment();

        for (let i = 0; i < 2; i++) {
            const [to, up] = levelup_list[choices()];
        
            const button = document.createElement("button");
        
            button.dataset.to = to;
            button.dataset.up = up;
            button.textContent = `${to}が${up}増加`;
            console.log("button_data-",button.dataset.to)
            button.onclick = () => {
                levelup_resolve({
                    to: button.dataset.to,
                    up: Number(button.dataset.up)
                });
                levelup_div.replaceChildren(); //test levelup
            }
        
            fragment.appendChild(button);
        }
        
        levelup_div.replaceChildren(fragment);
    });
    // levelup_div.innerHTML = ""
}
    
// }

function game_event() {
    let eventtext = "";
    const eventnum = Math.floor(Math.random()*3); //今　0～3
    // const eventnum = 1; //test
    console.log(`On_event:${eventnum}`);
    if (eventnum === 0) {
        // console.log(`event_No${eventnum}:村の建設`);
        eventtext = "イベント発生！　[村の建設]";
        population += 100;
    }
    else if (eventnum === 1) {
        // console.log(`event_No${eventnum}:春の研究祭り`);
        eventtext = "イベント発生！　[春の研究祭り]";
        research += 100; //checkpoint 数値計算バグの原因かも？
    }
    else if (eventnum === 2) {
        eventtext = "イベント発生！　[巨大台風接近]";
        population *= 0.95;
        research -= 10
    }
    else if (eventnum === 3) {
        eventtext = "イベント発生！　[宇宙の法則が乱れる]";
        const keys_wld_status = Object.keys(world_status); //エラーでるよ
        target = keys_wld_status[Math.floor(Math.random(keys_wld_status.length))];
        console.log(target);
        world_status[target] *= 2
    }

    const event_selector_child = document.createElement("p");
    event_selector_child.textContent = eventtext;
    event_selector_child.className = "event_selector";
    event_selector.appendChild(event_selector_child)
    //ここも関数作りたい

    game_sub.querySelector("#game_loglist").insertAdjacentHTML('beforeend', `<p class="game_log">${eventtext}</p>`)

    setTimeout(() => {event_selector.querySelector(".event_selector").remove()} , 5000);
}

async function levelup() {
    //スコア計算
    world_status["score"] = world_status["develop"]*2 + (display_population + (display_research/(research_level*5)))*0.5; //kari
    world_status["score"] *= 100
    world_status["score"] = Math.floor(world_status["score"]);
    world_status["score"] /= 100 //小数点第２位まで
    let increase = world_status["score"] - oldscore;
    console.log(`increase:${increase} score:${world_status["score"]}`)

    //レベルアップするかどうか
    if (increase > 1000 * 2*(world_status["level"] - 1)) { //  <= これが足し算で増えていくとダメ
        // console.log("leveluped",world_status["level"]);
        oldscore = world_status["score"];
        increase = 0
        world_status["level"] += 1;
        // time of select
        //世界の画面.toggle('hidden',false)
        const selected = await waitpromise()
        console.log("before",world_status)
        world_status[selected.to] += selected.up //promiseでtoとupが返ってくる前提
        console.log("end",world_status)
        
    }
    // #endregion
}

async function game_result_disp() {
    disp_result.innerHTML = `
    <h2>${world_status["score"]}
    <p>
    種族:${world_status["spicies"]}<br>
    最終人口:${world_status["population"]}<br>
    研究力:${world_status["research"]}<br>
    軍事力:${world_status["militaly"]}<br>
    レベル:${world_status["level"]}<br>
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
        "World_num":undefined,
        "develop":0,
        "population":100,
        "research":0,
        "spicies":undefined,
        "population_mag":0, //倍率
        "militaly":0,
        "level":1,
        "score":0
    };
    develop = 0;
    population = 100;
    world_status["population_mag"] = Math.floor(Math.random()); //0じゃね？
    research = 0;
    research_level = 1;
    research_MAG = 0;
    research_chemi = 0;
    war = false;
    housin = undefined;
    world_status["spicies"] = spicies_list[Math.floor(Math.random() * spicies_list.length)]; //0~10
    world_status["World_num"] = Math.floor(Math.random()*4 + 1); //0~3 +1
    const gameworld_img = `<img src="src/assets/Earth ${world_status["World_num"]}.png" alt="world" class="gameworld_img">`
    score = 0
    oldscore = 0
    moto = new Date;
    status_text.innerHTML = "";

//region 地獄の数値計算

    //html書き換え
    home.classList.add('hidden');
    game.classList.remove('hidden');
    
    //画像出す
    game_main.insertAdjacentHTML('afterbegin', gameworld_img);

    // プログラム
    let game_result = undefined // tryでローカルになるっぽいので宣言
    try {
        game_result = await new Promise(resolve => {
            async function loop() {
                //数値計算
                develop = world_status["develop"]
                // militaly = world_status["militaly"] kari
                population = world_status["population"]
                research = world_status["research"]
                //発展度の処理
                develop += (Math.random()*1.5); //0~1  kari
                // console.log(`world_status:${JSON.stringify(world_status)}`);

                // 人口の処理
                // console.log("try",population/10);
                // population += 1
                if (research_level >= 3) {
                    population *= (1.1+world_status["population_mag"])*2;
                }
                else {
                    population *= (1.1+world_status["population_mag"]);
                }

                //リサーチの処理
                let up = (population/(1000*research_level)*(1+(develop/100)))
                console.log(up);
                let whichup = Math.floor(Math.random()*2) //0~1
                if (war === true) {
                    up *= 1.2;
                };
                research += up

                if (whichup === 0) {
                    research_MAG += up
                }
                else if (whichup === 1) {
                    research_chemi += up
                }

                if (research_level <= 5) { //制限
                    if (research >= 100**research_level && research >= 1000) { //100,10000,1000000,100000000
                        research_level += 1;
                    }
                }

                world_status["militaly"] = 10000000000000

                //endregion
                
                //イベント系もろもろの処理
                let ima = new Date;
                let eventfrag = Math.min(0.3, 0.01 * Math.floor((ima.getTime() - moto.getTime()) / 1000)); //イベント発生率
                // let eventfrag = 100; //test
                if (Math.random() < eventfrag) {
                    game_event();
                    moto = new Date; //タイマーリセット
                }

        //region buff
                //バフの処理
                //表示用の数値はdisplay_(status名)にする & 元の数値に倍率かけたのをdisplay_に代入 & ここから先はdisplay_かworldstatusで判定
                display_population = Math.trunc(population);
                display_research = Math.trunc(research);

                // if (world_status["spicies"] == "engel") {
                //     pass
                // }
                //  => spieces_buff(); //に変更

                if (housin === "population") {
                    display_population = population*1.3; //1.3またはそのあとに追加する倍率を倍率の変数で管理
                }
                else if (housin === "research") {
                    display_research = research*1.3; //同上
                }
                // else if (housin === "") {
                //     display_ *= 1.3
                // }

                world_status["population"] = display_population;
                world_status["research"] = display_research;
                world_status['develop'] = develop;
        // endregion

                //#region levelup
                await levelup()
                //#endregion

                //画面表示
                status_text.innerHTML = `
                    <div style="margin-left: 1px" class="changing">
                        <p>発展度: ${Math.floor(world_status['develop'])}</p>
                        <p>人口: ${world_status['population']}</p>
                        <p>科学力: ${world_status['research']}</p>
                        <p>レベル: ${world_status['level']}</p>
                    </div>
                    <div style="margin-left: 1px" class="stable">
                        <p>種族: ${world_status['spicies']}</p>
                    </div>
                `

                //終了処理
                if (develop >= 100) {
                    world_status["develop"] = 100;
                    game.classList.add('hidden')
                    disp_result.classList.remove('hidden')
                    resolve(world_status);
                    return; //world status
                }
                if (reset === true) {
                    reset = false
                    // home.classList.toggle('hidden',false);
                    // game.classList.toggle('hidden',true);
                    game.classList.add('hidden');
                    disp_result.classList.remove('hidden');
                    resolve(undefined);
                    return
                }

                world_status["develop"] += 100 //test
                setTimeout(loop, 1000);
            }
            loop();

        })
    }finally {
        if (1 <= n) { //バグると二つ画像出る?
            // console.log(game);
            try {
                const oldimg = game.querySelector("img");
                oldimg.remove();
            } catch(error) {
                console.log("errorcode\"001\" : " + error)
            }
        }
    }

    game.classList.add('hidden');
    disp_result.classList.remove('hidden');

    await game_result_disp()

    develop = 0;
    population = 100;
    research = 0;
    research_level = 1;
    war = false;
    housin = undefined;
    //view_statusバグったらここの初期化方法考える

    // console.log(`aaaa:${game_result}`) test
    return game_result;
}
// #endregion

// #region Eventlisnerまとめ
const createworld_button = document.getElementById("createWorld_button");
const worlds = document.getElementById("Worlds");
let n = 0;
let world_status_list = [];

console.log("start");

createworld_button.addEventListener("click", async () => {

    n += 1; //位置変えたらoldimgの表示方式も変える

    const result = await playgame();
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
            <img src="src/assets/Earth ${result["World_num"]}.png" alt="world" class="homeworld_img">
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
                    <div style="margin-left: 1px">
                        <h1>World_No${World_No}</h1>
                        <p>develop: ${targetstatus['develop']}</p>
                        <p>population: ${targetstatus['population']}</p>
                        <p>research: ${targetstatus['research']}</p>
                        <p>militaly: ${targetstatus['militaly']}</p>
                        <p>level: ${targetstatus['level']}</p>
                        <p>score: ${targetstatus['score']}</p>  
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
        n -= 1
        console.log("reset");
    })
})

// #endregion

//数値の増え方全体的に減らしてもいいかも？ <- 🤔
//イベント増やす
//status追加案: 文明の性格（冷徹度とか）、文化力、魔法系（researchの細分化でいいかも？）
//populationの計算考える
//display_系を最後に代入するように変更
//fightのeventlisner

//勝負の処理

//バグ

//viewstatusを二回押すとバグる　<- slackに送ったonloadの関係かも
//[宇宙の法則が乱れる]　←　このイベントで変更するとまずいやつまで変更するかも

//ゲーム性の再確認
/*
1.世界を育てる　=>　1.ハイスコアを目指すorオンライン対戦 =>　3.育てた報酬でアイテムを買う => 4.さらに強い世界を作る

1 =>ローグライク要素(レベルなどによる強化),スレスパなどのようなボス戦　<= ちょうてんちゃんのようなノルマ系でもいいかも？,


*/
