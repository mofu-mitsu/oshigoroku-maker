let iconBase64 = "";

// リアルタイム更新
function updatePreview() {
    const name = document.getElementById("name").value.trim() || "名前";
    const work = document.getElementById("work").value.trim() || "作品名";
    
    const quoteInputs = document.querySelectorAll(".quote-input");
    const quoteContainer = document.getElementById("card-quote-list");
    quoteContainer.innerHTML = ""; 
    
    let hasQuote = false;
    quoteInputs.forEach(input => {
        const val = input.value.trim();
        if (val) {
            hasQuote = true;
            const div = document.createElement("div");
            div.className = "quote-text";
            div.innerText = val;
            quoteContainer.appendChild(div);
        }
    });

    if (!hasQuote) {
        quoteContainer.innerHTML = '<div class="quote-text">語録を入力してね！</div>';
    }

    document.getElementById("card-name").innerText = name;
    document.getElementById("card-work").innerText = work;

    const mainColor = document.getElementById("main-color").value;
    const textColor = document.getElementById("text-color").value;
    document.getElementById("main-color-hex").innerText = mainColor;
    document.getElementById("text-color-hex").innerText = textColor;
    document.documentElement.style.setProperty('--card-main-color', mainColor);
    document.documentElement.style.setProperty('--card-text-color', textColor);
}

// 語録の入力欄を追加・削除
function addQuoteField() {
    const container = document.getElementById("quotes-container");
    const div = document.createElement("div");
    div.className = "input-group quote-group";
    div.innerHTML = `
        <textarea class="quote-input" rows="3" placeholder="さらなる尊い語録..." oninput="updatePreview()"></textarea>
        <button class="quote-remove-btn" onclick="removeQuoteField(this)"><i class="fa-solid fa-minus"></i></button>
    `;
    container.appendChild(div);
}

function removeQuoteField(btn) {
    btn.parentElement.remove();
    updatePreview();
}

function selectTheme(themeClass, element) {
    document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('card').className = `card ${themeClass}`;
}

// 🌟 リセット機能（全部まっさら＆量産系に戻す！）
function resetAll() {
    document.getElementById("name").value = "";
    document.getElementById("work").value = "";
    document.getElementById("main-color").value = "#ffb6c1";
    document.getElementById("text-color").value = "#333333";
    removeIcon();
    
    // テーマを最初の「量産系」に戻す
    const firstTheme = document.querySelector('.theme-option');
    selectTheme('theme-kawaii', firstTheme);
    
    // 語録を1つにリセット
    const container = document.getElementById("quotes-container");
    container.innerHTML = `
        <div class="input-group quote-group">
            <textarea class="quote-input" rows="3" placeholder="例：大丈夫。未来は、きっと君の味方だよ。" oninput="updatePreview()"></textarea>
        </div>
    `;
    
    updatePreview();
    showToast("全てリセットしたよ♡");
}

function previewIcon(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            iconBase64 = e.target.result;
            document.getElementById("icon-preview").src = iconBase64;
            document.getElementById("preview-icon-wrapper").style.display = "block";
            document.getElementById("card-icon-img").src = iconBase64;
            document.getElementById("card-icon-img").style.display = "block";
            document.getElementById("card-icon-placeholder").style.display = "none";
        };
        reader.readAsDataURL(file);
    }
}

function removeIcon() {
    iconBase64 = "";
    document.getElementById("icon-upload").value = "";
    document.getElementById("preview-icon-wrapper").style.display = "none";
    document.getElementById("card-icon-img").style.display = "none";
    document.getElementById("card-icon-placeholder").style.display = "flex";
}

// 📸 画像保存
function downloadImage() {
    const card = document.getElementById("card");
    html2canvas(card, { scale: 3, useCORS: true, backgroundColor: null }).then(canvas => {
        const link = document.createElement("a");
        link.download = "oshi_card.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}

// 📋 コピー
async function copyToClipboard() {
    const card = document.getElementById("card");
    try {
        const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: null });
        canvas.toBlob(async (blob) => {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            showToast("クリップボードにコピーしたよ♡");
        });
    } catch (error) {
        showToast("コピー失敗…保存ボタンを使ってね！");
    }
}

// 🌟 シェア機能復活！
function shareCard() {
    const name = document.getElementById("name").value.trim() || "推し";
    const text = `【${name}】の推し名言カードを作成！\n#推し語録メーカー`;
    const url = "https://mofu-mitsu.github.io/"; // みつきのURL
    
    if (navigator.share) {
        navigator.share({ title: '推し語録メーカー', text: text, url: url }).catch(console.error);
    } else {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
    toast.classList.add("show");
    setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

function openHelp() { document.getElementById("help-modal").classList.add("active"); }
function closeHelp() { document.getElementById("help-modal").classList.remove("active"); }

// 楽天API連携（前回と同じ）
async function fetchRakutenAd() {
    const appId = "1055088369869282145";
    const affId = "3d94ea21.0d257908.3d94ea22.0ed11c6e";
    const searchKeywords = ["推し活 グッズ", "推し活", "推し活 収納"];
    const randomKeyword = searchKeywords[Math.floor(Math.random() * searchKeywords.length)];
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&keyword=${encodeURIComponent(randomKeyword)}&hits=1&format=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.Items && data.Items.length > 0) {
            const item = data.Items[0].Item;
            const itemUrl = item.itemUrl.split("?")[0];
            const affiliateUrl = `https://hb.afl.rakuten.co.jp/hgc/${affId}/?pc=${encodeURIComponent(itemUrl)}`;
            document.getElementById("rakuten-content").innerHTML = `
                <a href="${affiliateUrl}" target="_blank" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#333; justify-content:center;">
                    <img src="${item.mediumImageUrls[0].imageUrl}" style="width:60px; height:60px; border-radius:8px;">
                    <div style="text-align:left;">
                        <div style="font-size:12px; font-weight:bold;">${item.itemName.substring(0,30)}...</div>
                        <div style="color:#ff4757; font-weight:bold;">${item.itemPrice}円</div>
                    </div>
                </a>`;
        }
    } catch (e) {}
}

// 初期化実行
window.onload = () => {
    updatePreview();
    fetchRakutenAd();
};