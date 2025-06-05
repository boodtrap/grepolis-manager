// ==UserScript==
// @name         Grepolis Manager
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Popup met werkbalk en buttons, inclusief Afwezigheidsassistent en Militaire Manager
// @author       Zambia1972
// @match        *://*.grepolis.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';

    let isUIInjected = false; // Globale variabele om bij te houden of de UI al is geïnjecteerd
    const uw = unsafeWindow;

    class ForumManager {
        constructor() {
            this.popup = null;
            this.playerName = '';
            this.server = '';
            this.troopManager = new TroopManager(this);
            this.fora = [
                { name: "Algemeen", description: "Algemene discussies" },
                { name: "ROOD", description: "Noodmeldingen en verdediging" },
                { name: "Deff", description: "Verdedigingsstrategieën" },
                { name: "Offens", description: "Offensieve strategieën" },
                { name: "Massa_Aanval", description: "Massa-aanvallen" },
                { name: "Interne_Overnames", description: "Interne overnames" },
                { name: "Cluster", description: "Clusterbeheer" },
                { name: "Kroeg", description: "Informele discussies" },
                { name: "Leiding", description: "Leidinggevenden" },
            ];
            this.topicsData = {
                Algemeen: [
                    {
                        title: "Welkom bij de alliantie", content: "Hallo strijders van de oude wereld!\n" +
                        "\n" +
                        "We zijn ontzettend blij dat jullie hier zijn, op ons forum waar de goden en godinnen van de strategie samenkomen! Of je nu een doorgewinterde held bent of net je eerste stad hebt veroverd, hier is de plek waar we elkaar kunnen ontmoeten, tips kunnen uitwisselen en natuurlijk kunnen lachen om onze meest epische blunders (ja, we hebben allemaal wel eens een stad verloren aan een stelletje boze kippen).\n" +
                        "\n" +
                        "Voordat je je zwaarden en schilden opbergt, willen we je vragen om jezelf even kort voor te stellen. Vertel ons wie je bent, waar je vandaan komt en wat je favoriete strategie is. En als je een hilarisch verhaal hebt over een mislukte aanval of een onverwachte alliantie, deel dat vooral! We zijn hier om elkaar te steunen, maar ook om samen te lachen.\n" +
                        "\n" +
                        "Dus, trek je toga aan, neem een slok van je ambrosia en laat ons weten wie je bent! We kunnen niet wachten om je te leren kennen en samen de wereld van Grepolis te veroveren!\n" +
                        "\n" +
                        "Met strijdlustige groet,\n" +
                        "\n" +
                        "Het Grepolis Forum Team 🏛️✨"
                    },
                    {
                        title: "Te volgen regels", content: "🏛️ Alliantie Reglement – Samen Sterk, Samen Onverslaanbaar! 🏛️\n" +
                        "Welkom bij de alliantie! 🎉 We zijn hier niet alleen om een beetje rond te dobberen, maar om samen de vijand tot stof te reduceren. Dit reglement is geen bureaucratische onzin, maar een handleiding voor totale dominantie. Volg het, en we overleven. Negeer het, en de vijand lacht ons uit – en laten we eerlijk zijn, dat is gewoon gênant.\n" +
                        "\n" +
                        "1️⃣ Afwezigheid – Niet Stiekem Verdwijnen!\n" +
                        "Ga je langer dan 18 uur weg? Meld het op het forum. Laat ons ook weten of je de vakantiemodus aanzet.\n" +
                        "Geen melding = automatisch IO voor clustersteden, en geloof ons, dat wil je niet.\n" +
                        "\n" +
                        "👀 “Ik was even mijn kat zoeken” is geen excuus. We willen duidelijke communicatie.\n" +
                        "\n" +
                        "2️⃣ Opstand ([color=#FF0000]Rood[/color]) – Alarmfase Rood!\n" +
                        "Als je stad in opstand staat, panikeer niet (of doe dat stilletjes), maar maak een Rood-topic met de juiste informatie.\n" +
                        "\n" +
                        "📢 Verlies je een stad zonder iets te zeggen? Dan zetten we je op de lijst voor een gratis IO-abonnement, geen terugbetaling mogelijk.\n" +
                        "\n" +
                        "Extra tip: Geef updates over muurstand, inkomende aanvallen en spreuken. We zijn goed, maar we kunnen helaas nog geen gedachten lezen.\n" +
                        "\n" +
                        "3️⃣ Trips – Een Kleine Stap voor Jou, Een Grote Stap voor de Alliantie\n" +
                        "Plaats altijd trips bij je eilandgenoten. Een trip is 3 def lt per stad.\n" +
                        "\n" +
                        "💡 Denk eraan: geen trips plaatsen is als je huis openlaten voor inbrekers en zeggen: “Kom maar binnen, koffie staat klaar!”\n" +
                        "\n" +
                        "Vernieuw gesneuvelde trips en plaats een rapport in het trips-topic op het def-forum.\n" +
                        "\n" +
                        "4️⃣ Hulp Vragen & Elkaar Steunen – We Doen Dit Samen\n" +
                        "Vraag op tijd om hulp. Het is geen schande om hulp te vragen, het is een schande om stil te zijn en dan keihard onderuit te gaan. Gebruik forum, Discord of PM.\n" +
                        "\n" +
                        "Help! Mijn stad brandt! is trouwens een prima bericht. Sneller reageren we niet, maar het is wel dramatisch.\n" +
                        "\n" +
                        "5️⃣ Reservaties – Geen Vage Claims, Gewoon Doen\n" +
                        "Claim pas als je een kolo en een slotje hebt. Een claim is binnen 2 dagen overnemen, geen eindeloze bezetting van de stoel zoals een kleuter die niet van de schommel wil.\n" +
                        "\n" +
                        "🔴 PRIO-steden? Dan tellen claims niet. Pak het, of de vijand doet het. Simpel.\n" +
                        "\n" +
                        "6️⃣ Overzicht & Communicatie – Niet Raden, Gewoon Weten\n" +
                        "Gebruik BB-codes of zorg dat iemand het voor je doet. Anders proberen we je bericht zu ontcijferen alsof het een oude schatkaart is.\n" +
                        "\n" +
                        "🔍 Eilandcodes uit het Cluster Plan-topic gebruiken = dikke pluspunten.\n" +
                        "\n" +
                        "7️⃣ Offensief – Oorlog met Stijl\n" +
                        "🚫 Geen transportboten als aanval – tenzij je de vijand wilt laten lachen.\n" +
                        "🎯 VS voor je LT-aanval timen = slim.\n" +
                        "💥 Geen def lt of bir gebruiken bij aanvallen. Anders krijg je een cursus “Hoe val ik wél aan” gratis op het forum.\n" +
                        "\n" +
                        "🌙 Nachtbonus? Alleen aanvallen op inactieve spelers, lege steden of als je écht durft.\n" +
                        "\n" +
                        "8️⃣ TTA’s & Berichten – Reacties Zijn Belangrijker dan Je Ex\n" +
                        "Antwoord op TTA’s, berichten en Discord @’s. Geen reactie? Dan nemen we aan dat je ondergedoken bent en nemen we je clustersteden voor je eigen veiligheid over.\n" +
                        "\n" +
                        "Dus tenzij je graag een stadsloze kluizenaar wordt: reageren aub!\n" +
                        "\n" +
                        "9️⃣ Steden & Collectieve Verplichtingen – Iedereen Doet Mee\n" +
                        "Elke speler heeft minimaal 1 def lt-stad en 1 bir-stad.\n" +
                        "📌 Cluster Plan volgen = essentieel. Overnemen pas na 1 stad per cluster eiland (inclusief rotsen, ja, ook die lelijke).\n" +
                        "\n" +
                        "🔟 Rotsen & Gunstfarmen – Klein Maar Fijn\n" +
                        "Heb je een rotsstad? Zorg dat je actief bent en alarm aanzet. Anders is die rots sneller weg dan een gratis biertje op een festival.\n" +
                        "\n" +
                        "Gunst is belangrijk. Zonder gunst geen razende aanvallen. Zonder razende aanvallen? Nou ja, dan win je niet.\n" +
                        "\n" +
                        "Waarom deze regels?\n" +
                        "We zijn niet de alliantie van de vrije interpretatie. We zijn een goed geoliede machine die vijanden verslindt.\n" +
                        "🚀 Duidelijke afspraken = een sterke alliantie = Winst.\n" +
                        "\n" +
                        "Hou je eraan, dan maken we gehakt van de tegenstanders. Negeer ze? Dan krijg je een persoonlijke uitnodiging voor de IO van de Maand-competitie.\n" +
                        "\n" +
                        "💪 SAMEN DOMINEREN WE!\n" +
                        "\n" +
                        "Met strijdlustige groeten,\n" +
                        "🔥 De Leiding 🔥"
                    },
                    {
                        title: "Afwezig", content: "Laat hier weten als je er even tussenuit bent.\n" +
                        "\n" +
                        "[table]\n" +
                        "[**]Speler[||]Afwezig van[||]tem[||]VM[||]Opmerkingen[/**]\n" +
                        "[*][|][|][|][|][/*]\n" +
                        "[*][|][|][|][|][/*]\n" +
                        "[*][|][|][|][|][/*]\n" +
                        "[/table]\n"
                    },
                    {title: "Bondgenoten & NAP's", content: "Bondgenoten en NAP's worden hier besproken."},
                    {
                        title: "Spreuken en grondstoffen",
                        content: "Hier kunnen spelers om spreuken en grondstoffen vragen."
                    },
                    {
                        title: "Discord en scripts", content: "[b][u]Kom langs op onze discord server.[/u][/b]\n" +
                        "\n" +
                        "[url]https://discord.gg/v53K97dD8a[/url]\n" +
                        "\n" +
                        "[b][u]grepodata city-indexer[/u][/b]\n" +
                        "\n" +
                        "[url]https://grepodata.com/invite/rhzuhr2n4yqwd7dhcc[/url]\n" +
                        "\n" +
                        "[b][u]Forum ROOD template generator[/u][/b]\n" +
                        "\n" +
                        "[url]https://greasyfork.org/nl/scripts/512594-grepolis-notepad-forum-template-3[/url]"
                    }
                ],
                ROOD: [
                    {
                        title: "Rood tabel", content: "Bij meer dan 5 aanvallen wordt de tabel actief.\n" +
                        "[b][color=#FF0000]Bij een opstand éérst een eigen topic aanmaken in de juiste opmaak, [u]incl. tabelregel![/u][/color][/b]\n" +
                        "Tabelregel:\n" +
                        "[b][*]nr[|]OC[|]start F2[|]BB-code stad[|]muur[|]god[|]aanvaller(s)[|]BIR/LT[|]Aanwezige OS[|]Notes[/*][/b]\n" +
                        "                    Vul de tabelregel in met de gegevens van jouw ROOD melding en plaats deze bovenaan in je topic.\n" +
                        "                    muur -16 ➡️ alleen BIR sturen\n" +
                        "                    muur +16 ➡️ alleen LT (landtroepen) sturen\n" +
                        "                    Als de muur opgebouwd is én er geen reden op afbraak is, dan mag BIR omgezet worden naar LT.\n" +
                        "                    ⚠️ Zet géén sterretje in de titel van je topic! Forum mods zetten een * in de titel als indicatie dat de melding is opgenomen in de ROOD tabel. Doe je dit zelf, komt je stad NIET in de tabel terecht.\n" +
                        "                    [b]Mod van Dienst[/b]: [img]https://cdn.grcrt.net/emots2/girl_comp.gif[/img]\n" +
                        "                    [player]joppie86[/player]\n" +
                        "                    [table]\n" +
                        "                    [**]Nr[||]OC[||]Start F2[||]BB-code stad[||]Muur[||]God[||]aanvaller(s)[||]BIR/LT[||]Aanwezig[||]Notes[/**]\n" +
                        "                    [*][|][|][|][|][|][|][|][|][|][/*]\n" +
                        "                    [/table]\n" +
                        "                    [b][color=#FF2D2D][size=12]Dringend verzoek[/size]: Als je stad [b][u][size=12]safe[/size][/u][/b] is dit [u][size=12]melden[/size][/u] en de [u][size=12]OS terug sturen[/size][/u]! [/color][/b]"
                    },
                    {
                        title: "Kolo snipe", content: "Beste strijders,\n" +
                        "                    Aan alle [u]Kolo-spotters[/u]," +
                        "					 plaats in deze topic ASAP een bericht als je kolo hebt gespot.\n" +
                        "                    meld je stadsnaam in BB en exacte tijd van aankomst kolo + tijd laatste aanval voor kolo.\n" +
                        "                    Vb.:\n" +
                        "                    [town]1[/town]\n" +
                        "                    Kolo: 22:15:42\n" +
                        "                    laatste voor kolo: 22:15:32\n" +
                        "                    aan alle [u]Kolo-snipers[/u],\n" +
                        "                    hou deze topic goed in de gaten voor kolo-spotters, zodat je vlug kan handelen indien er kolo is gespot.\n" +
                        "                    [b]hoe timen:[/b]\n" +
                        "                    zorg in je snipe steden voor:\n" +
                        "                    * uiteraard BIR\n" +
                        "                    * transportboot\n" +
                        "                    * sirene\n" +
                        "                    gebruik bij voorkeur je aanvalsplanner om je ondersteuning te timen:\n" +
                        "                    poging 1: 1 tb + bir (min 50) check aankomsttijd en eventueel opnieuw proberen\n" +
                        "                    poging 2: 60 BIR meerdere pogingen versturen kort na elkaar van 10 sec voor tot 10 sec na opstandtijd\n" +
                        "                    poging 3: 1 sirene + Bir check aankomsttijd en eventueel opnieuw proberen\n" +
                        "                    succes\n"
                    },
                    {
                        title: "Rood Template",
                        content: "[*]nr[|]OC[|]start F2[|]aangevallen stad[|]muur[|]god[|]aanvallende speler[|]gewenste OS[|]aanwezig[|]Notes[/*]\n" +
                        "                    Aangevallen stad: \n" +
                        "                    God: \n" +
                        "                    Muur: \n" +
                        "                    Toren: \n" +
                        "                    Held: \n" +
                        "                    Ontwikkelingen: \n" +
                        "                    OS aanwezig: \n" +
                        "                    OS nodig: \n" +
                        "                    Stadsbescherming: \n" +
                        "                    Fase 2 begint om: \n" +
                        "                    Fase 2 eindigt om: \n" +
                        "                    [spoiler=Rapporten] \n" +
                        "                    *Opstandsrapport(ten)!!!*\n" +
                        "                    [/spoiler]\n"
                    }
                ],
                Deff: [
                    {
                        title: "Pre-deff", content: "Vraag hier je pre-deff aan voor belangrijke steden.\n" +
                        "\n" +
                        "                    Pre-deff kan je krijgen op voorwaarde dat je muur 25 is en Toren.\n" +
                        "\n" +
                        "                    hoe aanvragen:\n" +
                        "                    stadsnaam: in BB\n" +
                        "                    Muur Lv:\n" +
                        "                    Toren:\n" +
                        "                    aanwezige Lt:\n"
                    },
                ],
                Offens: [
                    {
                        title: "OFF. | Template", content: "Titel\n" +
                        "                    VB: Oceaan | Te veroveren stadsnaam | Status\n" +
                        "                    VB: 55 | 55-01 | Opstand/ VS clear nodig\n" +
                        "\n" +
                        "                    -------------------------------------------------------\n" +
                        "\n" +
                        "                    Alliantie:\n" +
                        "                    Speler:\n" +
                        "                    Stad:\n" +
                        "\n" +
                        "                    Gevraagde hulp: Spionage/ VS clear/ Zee clear\n" +
                        "\n" +
                        "                    [spoiler=Recentste spionage][/spoiler]\n" +
                        "\n" +
                        "                    [spoiler=Opstand aanval][/spoiler]\n"
                    },
                    {
                        title: "Opstand breken met Helena", content: "[b]Aan wie Helena bezit:[/b]\n" +
                        "                Zorg dat Helena op Lv 20 is.\n" +
                        "                meld hier in welke stad Helena zit.\n" +
                        "                controleer hier regelmatig naar opstanden.\n" +
                        "\n" +
                        "                [b]Aan wie opstand heeft:[/b]\n" +
                        "\n" +
                        "                Laat hier onmiddellijk weten waar er opstand in een stad word gezet (zelfs indien je zeker bent van een opstand, nog voor die er is).\n" +
                        "\n" +
                        "                stad: in BB\n" +
                        "                F2 tijd:\n" +
                        "\n" +
                        "                [table]\n" +
                        "                [**]naam[||]lv[||]stad[||][/**]\n" +
                        "                [*][|][|][|][/*]\n" +
                        "                [/table]\n"
                    },
                    {
                        title: "Spionage rapporten", content: "Hier kan je alle recente spionage rapporten bekijken."
                    },
                ],
                Massa_Aanval: [
                    {title: "Massa-aanvallen", content: "Inhoud van Massa-aanvallen..."},
                ],
                Interne_Overnames: [
                    {title: "Interne overnames", content: "Inhoud van Interne overnames..."},
                ],
                Cluster: [
                    {title: "Clusterbeheer", content: "Inhoud van Clusterbeheer..."},
                ],
                Kroeg: [
                    {title: "Kroegpraat", content: "Inhoud van Kroegpraat..."},
                ],
                Leiding: [
                    {title: "Leidinggevenden", content: "Inhoud van Leidinggevenden..."},
                ],
            };

            this.popup = null;
            this.playerName = '';
            this.server = '';
            this.militaryManager = new MilitaryManager();
            this.initHelpers();
            try {
                // Wait for game to be ready before initializing
                this.waitForGameReady();
                this.attackRangeHelper = new AttackRangeHelperManager(unsafeWindow);
            } catch (e) {
                console.error("Failed to initialize AttackRangeHelper:", e);
                this.attackRangeHelper = {
                    toggle: () => alert("Attack Range Helper is unavailable"),
                    initialize: () => {}
                };
            }

            this.initializeDependencies().then(() => {
                this.initializeScript(); // Hier worden de knoppen gemaakt
                this.fetchPlayerInfo();
                this.injectAfwezigheidsassistent();
            }).catch(error => {
                console.error("Initialisatie mislukt:", error);
            });
        }

        // ===================AttackRangeHelperManager===================================

        async initHelpers() {
            try {
                this.attackRangeHelper = new AttackRangeHelperManager(unsafeWindow);
                await this.attackRangeHelper.initialize();

            } catch (e) {
                console.error("Helper initialisatie mislukt:", e);
                this.attackRangeHelper = {
                    toggle: () => {},
                    showHelpPopup: () => {}
                };
            }
        }

        async initializeDependencies() {
            try {
                await this.waitForGameReady();
                this.attackRangeHelper = new AttackRangeHelperManager(unsafeWindow);
                await this.attackRangeHelper.initialize();
                this.feestenFixed = new FeestenFixedManager();
            } catch (e) {
                console.error("Fout bij initialiseren dependencies:", e);
                this.attackRangeHelper = {
                    toggle: () => {},
                    showHelpPopup: () => {}
                };
            }
        }

        waitForGameReady() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const check = () => {
                    if (typeof unsafeWindow.Game !== 'undefined' &&
                        typeof unsafeWindow.ITowns !== 'undefined') {
                        resolve();
                    } else if (attempts < 30) {
                        attempts++;
                        setTimeout(check, 250);
                    } else {
                        reject(new Error("Game objecten niet gevonden"));
                    }
                };
                check();
            });
        }

        showNotification(message, success = true) {
            const content = document.getElementById('popup-content');
            if (!content) return;

            const color = success ? '#4CAF50' : '#F44336';
            const note = document.createElement('div');
            note.textContent = message;
            note.style.cssText = `
        background: ${color};
        color: white;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        font-weight: bold;
    `;

            content.prepend(note);
            setTimeout(() => note.remove(), 4000);
        }

        toggleAttackRangeHelper = (state) => {
            if (this.attackRangeHelper && this.attackRangeHelper.toggle) {
                this.attackRangeHelper.toggle(state);
            } else {
                console.error("AttackRangeHelper is not available");
                alert("AttackRange Helper is niet beschikbaar");
            }
        }

        addHelperToggle(label, helpText, onClick, onHelpClick) {
            const container = document.getElementById('helper-buttons');
            if (!container) return;

            // Main container
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 5px;
                margin-bottom: 15px;
                align-items: flex-start;
            `;

            // Label boven de switch
            const labelElement = document.createElement('span');
            labelElement.textContent = label;
            labelElement.style.cssText = `
                color: #FF0000;
                font-weight: bold;
                font-size: 14px;
                margin-left: 5px;
            `;

            // Switch container
            const switchContainer = document.createElement('div');
            switchContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
            `;

            // Switch element
            const switchInput = document.createElement('input');
            switchInput.type = 'checkbox';
            switchInput.id = `switch-${label.toLowerCase().replace(/\s+/g, '-')}`;
            switchInput.style.display = 'none';

            // Visuele switch
            const switchLabel = document.createElement('label');
            switchLabel.htmlFor = switchInput.id;
            switchLabel.style.cssText = `
                position: relative;
                display: inline-block;
                width: 60px;
                height: 30px;
                background-color: #333;
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid #FF0000;
                order: 1;
            `;

            // Switch knop
            const switchButton = document.createElement('span');
            switchButton.style.cssText = `
                position: absolute;
                height: 26px;
                width: 26px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                border-radius: 50%;
                transition: all 0.3s;
            `;

            // Help knop
            const helpBtn = document.createElement('button');
            helpBtn.innerHTML = '?';
            helpBtn.title = helpText;
            helpBtn.style.cssText = `
                background: #444;
                color: #FFF;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: none;
                order: 2;
            `;

            // Voeg elementen toe
            switchLabel.appendChild(switchButton);
            switchContainer.appendChild(switchInput);
            switchContainer.appendChild(switchLabel);
            switchContainer.appendChild(helpBtn);

            wrapper.appendChild(labelElement);
            wrapper.appendChild(switchContainer);
            container.appendChild(wrapper);

            // Event listeners
            switchInput.addEventListener('change', (e) => {
                const state = e.target.checked ? 'on' : 'off';
                if (state === 'on') {
                    switchLabel.style.backgroundColor = '#FF0000';
                    switchButton.style.transform = 'translateX(30px)';
                } else {
                    switchLabel.style.backgroundColor = '#333';
                    switchButton.style.transform = 'translateX(0)';
                }
                onClick(state);
            });

            helpBtn.addEventListener('click', () => {
                onHelpClick();
            });
        }

        getPlayerPoints() {
            const pointsElement = document.querySelector('.player_points') ||
                  document.querySelector('[id*="points"]');

            if (pointsElement) {
                const pointsText = pointsElement.textContent.trim();
                return parseInt(pointsText.replace(/\D/g, ''), 10) || 0;
            }
            return 0;
        }

        showHelperTools() {
            const content = document.getElementById('popup-content');
            content.innerHTML = `
                <h2>Helper Tools</h2>
                <div id="helper-buttons" style="display: grid; gap: 10px; grid-template-columns: auto 1fr;"></div>
            `;

            this.addHelperToggle(
                'AttackRange Helper',
                'Toont aanvalsbereik op basis van spelerspunten',
                this.toggleAttackRangeHelper,  // Directe referentie zonder extra functie
                () => {
                    if (this.attackRangeHelper && this.attackRangeHelper.showHelpPopup) {
                        this.attackRangeHelper.showHelpPopup();
                    } else {
                        alert("Help functie is niet beschikbaar");
                    }
                }
            );
        }

        // Initialiseer het script
        initializeScript() {
            this.addMainButton();
            this.injectStyles();
            this.troopManager.setupAutoUpload();
        }

        addMainButton() {
            const button = document.createElement('div');
            button.id = 'grepolis-manager-main-btn';
            button.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 30px; /* <-- aangepast van right naar left */
        width: 60px;
        height: 60px;
        background-image: url('https://imgur.com/I62TXeo.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 50%;
        border: 2px solid #caa35d;
        box-shadow: 0 0 15px #caa35d;
        cursor: pointer;
        z-index: 75;
    `;

            button.title = 'Open Grepolis Manager';
            button.addEventListener('click', () => {
                this.toggleMainWindow(); // gebruik 'this.'
            });

            document.body.appendChild(button);
        }

        toggleMainWindow() {
            this.createPopup(); // Dit toont je hoofdscherm
        }

        createPopup() {
            if (!this.popup) {
                this.popup = document.createElement('div');
                this.popup.id = 'forum-popup';
                this.popup.style = `
            display: none;
            position: fixed;
            width: 600px;
            height: 400px;
            background: #1e1e1e;
            border: 2px solid #FF0000;
            border-radius: 10px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 76;
            box-shadow: 0 0 20px #FF0000;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            overflow: hidden;
        `;
                document.body.appendChild(this.popup);
            }

            const closeButton = document.createElement('button');
            closeButton.textContent = 'X';
            closeButton.style = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: black;
                color: #FF0000;
                font-size: 16px;
                border: none;
                width: 30px;
                height: 30px;
                cursor: pointer;
                border-radius: 50%;
                box-shadow: 0 0 5px #FF0000;
            `;
            closeButton.addEventListener('click', () => {
                this.popup.style.display = 'none';
                console.log("Popup gesloten.");
            });

            // ========================toolbar met 5 buttons======================

            const toolbar = document.createElement('div');
            toolbar.style = `
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            `;

            const button1 = this.createToolbarButton('Startscherm', () => this.showStartScreen());
            const button2 = this.createToolbarButton('Script Info', () => alert('Knop 3 wordt later toegevoegd.'));
            const button3 = this.createToolbarButton('Helper', () => this.showHelperTools());
            const button4 = this.createToolbarButton('Leiding Tools', () => this.showLeadershipTools());
            const button5 = this.createToolbarButton('Fora en Topics', () => this.createAllForaAndTopics());

            toolbar.appendChild(button1);
            toolbar.appendChild(button2);
            toolbar.appendChild(button3);
            toolbar.appendChild(button4);
            toolbar.appendChild(button5);

            const content = document.createElement('div');
            content.id = 'popup-content';
            content.style = `
                flex-grow: 1;
                padding: 20px;
                overflow-y: auto;
                max-height: 300px;
                position: relative;
            `;

            this.popup.innerHTML = '';
            this.popup.appendChild(closeButton);
            this.popup.appendChild(toolbar);
            this.popup.appendChild(content);
            this.popup.style.display = 'block';

            // Toon het startscherm standaard
            this.showStartScreen();
        }

        addToggleButton(label, helpText, onClick) {
            const container = document.getElementById('helper-buttons');

            // Main container
            const wrapper = document.createElement('div');
            wrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 15px;
        align-items: flex-start;  // Alles links uitlijnen
    `;

            // Label boven de switch (links uitgelijnd)
            const labelElement = document.createElement('span');
            labelElement.textContent = label;
            labelElement.style.cssText = `
        color: #FF0000;
        font-weight: bold;
        font-size: 14px;
        margin-left: 5px;  // Kleine marge voor uitlijning
    `;

            // Switch container (volledige breedte)
            const switchContainer = document.createElement('div');
            switchContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
    `;

            // Switch element (verborgen checkbox)
            const switchInput = document.createElement('input');
            switchInput.type = 'checkbox';
            switchInput.id = `switch-${label.toLowerCase().replace(/\s+/g, '-')}`;
            switchInput.style.cssText = `
        display: none;
    `;

            // Visuele switch
            const switchLabel = document.createElement('label');
            switchLabel.htmlFor = switchInput.id;
            switchLabel.style.cssText = `
        position: relative;
        display: inline-block;
        width: 60px;
        height: 30px;
        background-color: #333;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid #FF0000;
        order: 1;  // Zet switch als eerste element
    `;

            // Switch knop
            const switchButton = document.createElement('span');
            switchButton.style.cssText = `
        position: absolute;
        height: 26px;
        width: 26px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        border-radius: 50%;
        transition: all 0.3s;
    `;

            // Help knop
            const helpBtn = document.createElement('button');
            helpBtn.innerHTML = '?';
            helpBtn.title = helpText;
            helpBtn.style.cssText = `
        background: #444;
        color: #FFF;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        order: 2;  // Zet help knop als tweede element
    `;

            // Voeg elementen toe
            switchLabel.appendChild(switchButton);
            switchContainer.appendChild(switchInput);
            switchContainer.appendChild(switchLabel);
            switchContainer.appendChild(helpBtn);

            wrapper.appendChild(labelElement);
            wrapper.appendChild(switchContainer);
            container.appendChild(wrapper);

            // Event listeners
            switchInput.addEventListener('change', (e) => {
                const state = e.target.checked ? 'on' : 'off';

                // Visuele feedback
                if (state === 'on') {
                    switchLabel.style.backgroundColor = '#FF0000';
                    switchButton.style.transform = 'translateX(30px)';
                } else {
                    switchLabel.style.backgroundColor = '#333';
                    switchButton.style.transform = 'translateX(0)';
                }

                onClick(state);
            });

            helpBtn.addEventListener('click', () => {
                this.showHelpPopup();
            });

            // Initieel uitgeschakeld
            switchInput.checked = false;
        }

        generateMilitaryTable(data) {
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Stad</th><th>ID</th><th>God</th><th>Muur</th><th>Toren</th>
                        <th>Aanval</th><th>Verdediging</th>
                        <th>Schepen</th><th>Stad</th>speciale units<th>Ontwikkelingen</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(town => `
                        <tr>
                            <td>${town.basic.name}</td>
                            <td>${town.basic.id}</td>
                            <td>${town.god}</td>
                            <td>${town.wall}</td>
                            <td>${town.tower}</td>
                            <td>${town.attack}</td>
                            <td>${town.defense}</td>
                            <td>${town.siege}</td>
                            <td>${town.specials}</td>
                            <td>${town.developments}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            return table;
        }

        // ===============================Leiding Tools buttons=====================================

        showLeadershipTools() {
            const content = document.getElementById('popup-content');
            content.innerHTML = `
        <h2>Leiding Tools</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button id="show-player-list" style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Spelerslijst</button>
            <button id="tool-2-btn" style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Troop counter</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 3</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 4</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 5</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 6</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 7</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 8</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 9</button>
            <button style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Tool 10</button>
        </div>
    `;

            // Attach the event listener to the "Spelerslijst" button
            const showPlayerListButton = document.getElementById('show-player-list');
            if (showPlayerListButton) {
                showPlayerListButton.addEventListener('click', () => this.fetchPlayerList());
            }
            // Update deze event listener:
            document.getElementById('tool-2-btn').addEventListener('click', () => {
                this.troopManager.showControlPanel();
            });
        }

        //====================Spelerslijst (Leiding Tools)==================================

        // Pas de showPlayerList-methode aan om de spelerslijst correct op te halen
        showPlayerList() {
            const players = this.getPlayers();
            if (!players || players.length === 0) {
                console.error('Geen spelers gevonden of de lijst is leeg.');
                return;
            }

            const headers = [
                'Naam', 'Rang', 'Punten', 'Steden', 'Status',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/founder.png" alt="Oprichter" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/leader.png" alt="Leider" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/invite.png" alt="Uitnodigingen" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/diplomacy.png" alt="Diplomatie" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/mass_mail.png" alt="Rondschrijven" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/forum_mod.png" alt="Forummoderator" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/internal_forum.png" alt="Intern forum" width="16" height="16">',
                '<img src="https://gpnl.innogamescdn.com/images/game/ally/reservationtool_admin.png" alt="Reserveringen" width="16" height="16">',
                'Geplande Inactiviteit'
            ];

            const currentDateTime = new Date().toLocaleString();
            let html = `<div style="text-align: center; margin-bottom: 10px;"><strong>Laatst bijgewerkt:</strong> ${currentDateTime}</div>`;
            html += '<table><thead><tr>';
            headers.forEach(header => html += `<th>${header}</th>`);
            html += '</tr></thead><tbody>';

            players.forEach(player => {
                const statusText = this.determineStatus(player.status);
                const statusIcon = this.getStatusIcon(statusText);
                html += '<tr>';
                html += `<td><a class="player-name-link" href="#" data-player="${player.name}" data-player-id="${player.id}">${player.name}</a></td>`;
                html += `<td>${player.rank}</td>`;
                html += `<td>${player.points}</td>`;
                html += `<td>${player.cities}</td>`;
                if (player.status === "online.png" || player.status === "vacation.png") {
                    html += `<td>${statusIcon} ${statusText}</td>`;
                } else {
                    html += `<td>${statusIcon}</td>`;
                }
                player.rights.forEach(right => html += `<td>${right}</td>`);
                html += `<td></td>`; // Placeholder for "Geplande Inactiviteit"
                html += '</tr>';
            });

            html += '</tbody></table>';
            const content = document.getElementById('popup-content');
            if (!content) {
                console.error('Popup-content element niet gevonden.');
                return;
            }
            content.innerHTML = html;

            // Voeg event listeners toe aan de spelersnamen
            const playerLinks = document.querySelectorAll('.player-name-link');
            playerLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const playerId = parseInt(link.getAttribute('data-player-id'), 10);
                    if (this.militaryManager) {
                        try {
                            const militaryData = await this.militaryManager.getMilitaryData(playerId);
                            this.showMilitaryData(militaryData);
                        } catch (error) {
                            console.error('Fout bij ophalen militaire data:', error);
                        }
                    }
                });
            });

            console.log('Player list displayed successfully.');
        }

        fetchPlayerList() {
            // Klik op het alliantie menu
            const allianceMenu = document.querySelector('#ui_box > div.nui_main_menu > div.middle > div.content > ul > li.alliance.main_menu_item > span > span.name_wrapper > span');
            if (allianceMenu) {
                allianceMenu.click();

                // Wacht tot het menu geladen is en klik op de ledenlijst
                setTimeout(() => {
                    const membersButton = document.querySelector('#alliance-members_show > span > span > span');
                    if (membersButton) {
                        membersButton.click();

                        // Wacht tot de ledenlijst geladen is en haal de gegevens op
                        setTimeout(() => {
                            this.showPlayerList(); // Display the player list

                            // Sluit het dialoogvenster na het ophalen van de gegevens
                            const closeDialogButton = document.querySelector('body > div.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-draggable.ui-resizable.js-window-main-container > div.ui-dialog-titlebar.ui-corner-all.ui-widget-header.ui-helper-clearfix.ui-draggable-handle > button');
                            if (closeDialogButton) {
                                closeDialogButton.click();
                            }
                        }, 100); // Wacht 100ms voor de ledenlijst om te laden
                    }
                }, 100); // Wacht 100ms voor het menu om te laden
            } else {
                console.error('Alliance menu not found.');
            }
        }

        fetchPlayerInfo() {
            try {
                if (unsafeWindow.Game && unsafeWindow.Game.player_id && unsafeWindow.Game.player_name) {
                    this.playerId = unsafeWindow.Game.player_id;
                    this.playerName = unsafeWindow.Game.player_name;
                    console.log('Player-ID via Game object:', this.playerId);
                    console.log('Spelersnaam via Game object:', this.playerName);

                    // Optioneel ook opslaan in localStorage als je dat later wil gebruiken
                    localStorage.setItem('grepolisPlayerId', this.playerId);
                    localStorage.setItem('grepolisPlayerName', this.playerName);
                } else {
                    console.warn('Kon Game.player_id of Game.player_name niet vinden.');
                }
            } catch (e) {
                console.error('Fout bij ophalen spelersgegevens:', e);
            }
        }


        // Toon militaire gegevens in het popup-venster
        showMilitaryData(data) {
            const content = document.getElementById('popup-content');
            if (!content) return;

            if (!data.success || !data.towns?.length) {
                content.innerHTML = `
                <h2>Militaire Gegevens</h2>
                <p style="color: #ff4444;">
                    ${data.error || 'Geen militaire data gevonden'}
                </p>
            `;
                return;
            }

            const tableHTML = this.militaryManager.createTable(data.towns).outerHTML;
            content.innerHTML = `
            <h2>Militaire Gegevens</h2>
            <div style="overflow-x: auto;">${tableHTML}</div>
        `;
        }

        // Haal de spelerslijst op
        getPlayers() {
            const players = [];
            const rows = document.querySelectorAll('#ally_members_body tr[id^="alliance_player_"]');

            if (!rows || rows.length === 0) {
                console.error('Geen rijen gevonden in de spelerslijst.');
                return players;
            }

            rows.forEach(row => {
                const nameLink = row.querySelector('.ally_name a');
                const name = nameLink?.textContent.trim();
                const statusImg = nameLink?.querySelector('img');
                const status = statusImg ? statusImg.src.split('/').pop() : null; // Haal de status afbeelding op
                const cells = row.cells;

                if (!cells || cells.length < 12) {
                    console.error('Ongeldige rij in de spelerslijst:', row);
                    return;
                }

                const rights = [];
                for (let i = 4; i <= 11; i++) { // Pas de index aan om de kolom "Donaties" over te slaan
                    const img = cells[i].querySelector('img');
                    // Voeg alleen een icoon toe als het recht actief is
                    if (img && img.src.includes('yellow_checkmark')) {
                        rights.push(`<img src="${img.src}" alt="${img.alt}" width="16" height="16">`);
                    } else {
                        rights.push(''); // Geen icoon als het recht niet actief is
                    }
                }

                players.push({
                    name: name,
                    rank: cells[1].textContent,
                    points: cells[2].textContent,
                    cities: cells[3].textContent,
                    status: status, // Gebruik de status afbeelding om de inactiviteitsduur te bepalen
                    rights: rights
                });
            });

            return players;
        }

        determineStatus(statusImg) {
            const activityMap = {
                "green.png": "Actief in de afgelopen 12 uur",
                "online.png": "Actief in de afgelopen 10 minuten",
                "vacation.png": "Vakantiemodus",
                "yellow.png": "Meer dan 12 uur inactief",
                "red.png": "Meer dan 24 uur inactief",
            };

            return activityMap[statusImg] || "Onbekend";
        }

        getStatusIcon(status) {
            const statusIcons = {
                "Actief in de afgelopen 12 uur": '<i class="fas fa-circle status-icon" style="color: limegreen;"></i>', // Fel groen voor actief
                "Actief in de afgelopen 10 minuten": '<i class="fas fa-circle status-icon" style="color: limegreen;"></i>', // Fel groen voor actief
                "Meer dan 12 uur inactief": '<i class="fas fa-circle status-icon" style="color: orange;"></i>', // Oranje voor 12-24u inactief
                "Meer dan 24 uur inactief": '<i class="fas fa-circle status-icon" style="color: red;"></i>', // Rood voor meer dan 24u inactief
                "Vakantiemodus": '<i class="fas fa-umbrella-beach status-icon" style="color: blue;"></i>', // Blauw voor vakantie
            };

            return statusIcons[status] || '<i class="fas fa-question-circle status-icon" style="color: gray;"></i>'; // Vraagteken voor onbekende status
        }

        createToolbarButton(text, onClick) {
            const button = document.createElement('button');
            button.textContent = text;
            button.style = `
                background: black;
                color: #FF0000;
                border: 1px solid #FF0000;
                padding: 10px 20px;
                cursor: pointer;
                font-size: 14px;
                border-radius: 5px;
                margin: 0 5px;
            `;
            button.addEventListener('click', onClick);
            return button;
        }

        waitForTableAndShowPlayerList() {
            const observer = new MutationObserver((mutations, obs) => {
                const table = document.querySelector('.alliance-members-table'); // Update this selector
                if (table) {
                    console.log('Alliance members table found in the DOM.');
                    forumManager.showPlayerList();
                    obs.disconnect(); // Stop observing once the table is found
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Call this function when the "Spelerslijst" button is clicked
        showPlayerListButton = document.getElementById('show-player-list');
        if (showPlayerListButton) {
            showPlayerListButton.addEventListener('click', waitForTableAndShowPlayerList);
        }

        // ========================Startscherm==================================

        showStartScreen() {
            const content = document.getElementById('popup-content');
            const name = this.playerName || "strijder";

            content.innerHTML = `
        <h2>Welkom ${name} bij Grepolis Manager</h2>
            <p>Dit script combineert de kracht van populaire Grepolis-tools in één handige oplossing en nog veel meer.</p>

            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                ${[
                {
                    name: "Grepotools",
                    img: "https://www.grepotools.nl/wp-content/uploads/2022/08/logo_425x425.png",
                    description: "Script, tools en informatie voor Grepolis.",
                    url: "https://www.grepotools.nl/script/stable/grepotools.user.js"
                },
                {
                    name: "DIO-Tools",
                    img: "https://dio-david1327.github.io/img/site/btn-dio-settings.png",
                    description: "Extra opties voor een verbeterde gameplay.",
                    url: "https://dio-david1327.github.io/DIO-TOOLS-David1327/code.user.js"
                },
                {
                    name: "GRCRTools",
                    img: "https://cdn.grcrt.net/img/octopus.png",
                    description: "Krachtige tools voor rapporten en gameplay.",
                    url: "https://www.grcrt.net/scripts/GrepolisReportConverterV2.user.js"
                },
                {
                    name: "Map Enhancer",
                    img: "https://gme.cyllos.dev/res/icoon.png",
                    description: "Verbeter de kaartweergave met extra functies.",
                    url: "https://gme.cyllos.dev/GrepolisMapEnhancer.user.js"
                },
                {
                    name: "GrepoData",
                    img: "https://grepodata.com/favicon.ico",
                    description: "Geavanceerde tools en statistieken voor Grepolis.",
                    url: "https://api.grepodata.com/script/indexer.user.js"
                },
                {
                    name: "Forum Template",
                    img: "https://i.postimg.cc/7Pzd6360/def-button-2.png",
                    description: "Genereert een forumsjabloon met eenheden, gebouwen en stadsgod.",
                    url: "https://update.greasyfork.org/scripts/512594/Grepolis%20Notepad%20Forum%20Template%203.user.js"
                }
            ].map(tool => `
                    <div style="flex: 1; min-width: 150px; text-align: center;">
                        <img src="${tool.img}" alt="${tool.name}" style="width: 50px; height: 50px;">
                        <p style="font-size: 12px; font-weight: bold;">${tool.name}</p>
                        <p style="font-size: 12px;">${tool.description}</p>
                        <a href="${tool.url}" target="_blank" style="
                            display: inline-block;
                            background-color: #FF0000;
                            color: white;
                            padding: 5px 10px;
                            font-size: 11px;
                            border-radius: 4px;
                            text-decoration: none;
                            margin-top: 5px;
                        ">Download script</a>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <p style="font-size: 12px; font-style: italic;">Het Grepolis Manager Team</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px;">
                    <div>
                        <p style="font-size: 12px; font-weight: bold;">Elona</p>
                        <img src="https://imgur.com/QxTgAHJ.png" alt="Elona Handtekening" style="width: 100px; height: auto; transform: rotate(${Math.floor(Math.random() * 30 - 15)}deg);">
                    </div>
                    <div>
                        <p style="font-size: 12px; font-weight: bold;">Zambia1972</p>
                        <img src="https://imgur.com/uHRXM9u.png" alt="Zambia1972 Handtekening" style="width: 200px; height: auto; transform: rotate(${Math.floor(Math.random() * 30 - 15)}deg);">
                    </div>
                </div>
            </div>
        `;
        }

        // =======================Fora en Topics==================================

        async createAllForaAndTopics() {
            const content = document.getElementById('popup-content');
            content.innerHTML = `
        <h2>Fora en Topics Aanmaken</h2>
        <p>Klik op de knop hieronder om alle fora en topics in één keer aan te maken.</p>
        <button id="start-creation" style="background: black; color: #FF0000; border: 1px solid #FF0000; padding: 10px 20px; cursor: pointer; font-size: 14px; border-radius: 5px;">Start Aanmaken</button>
        <div id="status-messages" style="margin-top: 20px;"></div>
    `;

            const startButton = content.querySelector('#start-creation');
            startButton.addEventListener('click', async () => {
                const statusDiv = document.getElementById('status-messages');
                statusDiv.innerHTML = '';

                try {
                    // Navigeer naar het alliantieforum
                    await this.navigateToAllianceForum();

                    // Open het forumbeheer (alleen voor het eerste forum)
                    let isForumAdminOpen = false;

                    // Maak alle fora aan
                    for (let i = 0; i < this.fora.length; i++) {
                        const forum = this.fora[i];
                        if (await this.forumExists(forum.name)) {
                            statusDiv.innerHTML += `<p>Forum "${forum.name}" bestaat al.</p>`;
                        } else {
                            if (!isForumAdminOpen) {
                                await this.openForumAdmin();
                                isForumAdminOpen = true;
                            }
                            await this.createForum(forum);

                            // Sluit het dialoogvenster alleen na het laatste forum
                            if (i === this.fora.length - 1) {
                                await this.closeDialog();
                            }

                            statusDiv.innerHTML += `<p>Forum "${forum.name}" succesvol aangemaakt.</p>`;
                        }
                    }

                    // Terugkeren naar het alliantieforum
                    await this.navigateToAllianceForum();

                    // Maak alle topics aan
                    for (const forumName in this.topicsData) {
                        const topics = this.topicsData[forumName];

                        // Navigeer naar het juiste forum
                        await this.navigateToForum(forumName);

                        for (const topic of topics) {
                            if (await this.topicExists(forumName, topic.title)) {
                                statusDiv.innerHTML += `<p>Topic "${topic.title}" in forum "${forumName}" bestaat al.</p>`;
                            } else {
                                await this.createTopic(topic);
                                statusDiv.innerHTML += `<p>Topic "${topic.title}" in forum "${forumName}" succesvol aangemaakt.</p>`;

                                // Keer terug naar het forum na het aanmaken van het topic
                                await this.navigateToForum(forumName);
                            }
                        }
                    }

                    // Sluit het dialoogvenster na het aanmaken van alle topics
                    await this.closeDialog();

                    statusDiv.innerHTML += `<p><strong>Alle fora en topics zijn verwerkt!</strong></p>`;
                } catch (error) {
                    statusDiv.innerHTML += `<p style="color: red;">Fout: ${error.message}</p>`;
                    console.error(error);
                }
            });
        }

        async navigateToAllianceForum() {
            console.log("Navigeer naar alliantieforum...");
            const forumButton = await this.waitForElement('#ui_box > div.nui_main_menu > div.middle > div.content > ul > li.allianceforum.main_menu_item > span > span.name_wrapper > span', 15000);
            if (forumButton) {
                forumButton.click();
                await this.waitForElement('.forum_menu', 15000);
            } else {
                throw new Error('Kon het alliantieforum niet vinden.');
            }
        }

        async navigateToForum(forumName) {
            console.log(`Navigeer naar forum: ${forumName}`);

            try {
                // Zoek het forum op basis van de naam
                const forumLinks = document.querySelectorAll('a.submenu_link[data-menu_name]');
                let foundForum = null;

                // Loop door alle forum links
                for (const link of forumLinks) {
                    const forumSpan = link.querySelector('span.forum_menu');
                    if (forumSpan) {
                        const linkText = forumSpan.textContent.trim();
                        if (linkText.toLowerCase() === forumName.toLowerCase()) {
                            foundForum = link;
                            break;
                        }
                    }
                }

                if (!foundForum) {
                    // Toon beschikbare forums voor debuggen
                    const availableForums = Array.from(forumLinks).map(link => {
                        return link.querySelector('span.forum_menu')?.textContent.trim() || 'Onbekend forum';
                    });

                    console.error('Beschikbare forums:', availableForums);
                    throw new Error(`Forum "${forumName}" niet gevonden in de lijst.`);
                }

                // Klik op het forum
                console.log(`Klik op forum: ${forumName}`);
                foundForum.click();

                // Wacht 3 seconden om de pagina te laten laden
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Controleer of het forum leeg is
                const threadList = document.querySelector('.forum_thread_list');
                if (!threadList) {
                    console.log(`Forum "${forumName}" is leeg of het element .forum_thread_list bestaat niet.`);
                    return; // Stop verdere acties voor dit forum
                }

                console.log(`Forum "${forumName}" succesvol geladen.`);

            } catch (error) {
                console.error(`Fout bij navigeren naar forum "${forumName}":`, error);
                throw error; // Gooi de fout opnieuw voor hogere afhandeling
            }
        }

        async forumExists(forumName) {
            const forumLinks = document.querySelectorAll('a.submenu_link[data-menu_name]');
            for (const link of forumLinks) {
                const forumSpan = link.querySelector('span.forum_menu');
                if (forumSpan && forumSpan.textContent.trim().toLowerCase() === forumName.toLowerCase()) {
                    return true;
                }
            }
            return false;
        }

        async topicExists(forumName, topicTitle) {
            const topicTitles = document.querySelectorAll('.forum_thread_title');
            if (topicTitles.length === 0) {
                console.log(`Geen topics gevonden in forum "${forumName}".`);
                return false; // No topics exist in this forum
            }
            for (const title of topicTitles) {
                if (title.textContent.trim().toLowerCase() === topicTitle.toLowerCase()) {
                    return true;
                }
            }
            return false;
        }

        async createForum(forum) {
            console.log(`Maak forum aan: ${forum.name}`);

            // Klik op de knop om een nieuw forum aan te maken
            await this.clickButton("#forum_admin > div.game_list_footer > a > span.left > span > span", 15000);

            // Vul de forumnaam en beschrijving in
            await this.fillField("#forum_forum_name", forum.name, 15000);
            await this.fillField("#forum_forum_content", forum.description, 15000);

            // Klik op de bevestigingsknop
            await this.clickButton("#create_forum_confirm > span.left > span > span", 15000);

            // Wacht tot het forum is aangemaakt
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        async createTopic(topic) {
            console.log(`Maak topic aan: ${topic.title}`);

            // Klik op de knop om een nieuw topic aan te maken
            await this.clickButton("#forum_buttons > a:nth-child(1) > span.left > span > span", 15000);

            // Vul de titel in
            await this.fillField("#forum_thread_name", topic.title, 15000);

            // Vul de inhoud in
            await this.fillField("#forum_post_textarea", topic.content, 15000);

            // Klik op de bevestigingsknop
            await this.clickButton("#forum > div.game_footer > a > span.left > span > span", 15000);

            // Wacht tot het topic is aangemaakt
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        async closeDialog() {
            console.log("Sluit dialoogvenster...");
            const closeButton = await this.waitForElement(
                'body > div.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-draggable.js-window-main-container > div.ui-dialog-titlebar.ui-corner-all.ui-widget-header.ui-helper-clearfix.ui-draggable-handle > button',
                15000
            );
            if (closeButton) {
                closeButton.click();
                console.log("Dialoogvenster gesloten.");
            } else {
                throw new Error('Kon de sluitknop van het dialoogvenster niet vinden.');
            }
        }

        async openForumAdmin() {
            console.log("Open forumbeheer...");
            const forumAdminButton = await this.waitForElement('#forum > div.game_list_footer > div.forum_footer > a', 15000);
            if (forumAdminButton) {
                forumAdminButton.click();
                await this.waitForElement('#forum_admin', 15000);
            } else {
                throw new Error('Kon de forumbeheerknop niet vinden. Controleer of de gebruiker de juiste rechten heeft.');
            }
        }

        async clickButton(selector, timeout = 15000) {
            console.log(`Zoek knop: ${selector}`);
            const button = await this.waitForElement(selector, timeout);
            if (!button) throw new Error(`Knop niet gevonden: ${selector}`);
            button.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        async fillField(selector, value, timeout = 15000) {
            console.log(`Vul veld in: ${selector}`);
            const field = await this.waitForElement(selector, timeout);
            if (!field) throw new Error(`Veld niet gevonden: ${selector}`);
            field.value = value;
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }

        async waitForElement(selector, timeout = 20000, retries = 3) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();
                let attempts = 0;

                const check = () => {
                    const element = document.querySelector(selector);
                    if (element) {
                        console.log(`Element gevonden: ${selector}`);
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        if (attempts < retries) {
                            attempts++;
                            console.log(`Timeout: ${selector} niet gevonden. Poging ${attempts} van ${retries}.`);
                            setTimeout(check, 1000); // Retry after 1 second
                        } else {
                            reject(new Error(`Timeout: ${selector} niet gevonden na ${retries} pogingen.`));
                        }
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }

        injectStyles() {
            const styles = `
        #forum-popup h2 {
            color: #FF0000;
            text-align: center;
        }
        #forum-popup p {
            text-align: center;
        }
        #create-all {
            background: black;
            color: #FF0000;
            border: 1px solid #FF0000;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 5px;
            display: block;
            margin: 20px auto;
        }
        #status-messages {
            margin-top: 20px;
            color: white;
        }
    `;
            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        //=========================einde Fora en Topics==============================

        //=========================Afwezigheids assistent============================

        injectAfwezigheidsassistent() {
            const waitForElement = (selector, timeout = 3000) => {
                return new Promise((resolve, reject) => {
                    const start = Date.now();
                    const check = () => {
                        const el = document.querySelector(selector);
                        if (el) {
                            console.log(`[DEBUG] Element ${selector} gevonden na ${Date.now() - start}ms`);
                            resolve(el);
                        } else if (Date.now() - start > timeout) {
                            reject(new Error(`Timeout wachten op ${selector}`));
                        } else {
                            setTimeout(check, 100);
                        }
                    };
                    check();
                });
            };

            const injectUI = () => {
                try {
                    // Controleer of we op het juiste forum zijn
                    const forumTitel = document.querySelector('.forum_menu');
                    if (!forumTitel?.textContent.toLowerCase().includes('algemeen')) {
                        return;
                    }

                    // Controleer of we in het afwezigheidstopic zitten
                    const topicTitel = document.querySelector("#forum_thread_name_span_text_admin > span");
                    if (!topicTitel?.textContent.toLowerCase().includes('afwezig')) {
                        return;
                    }

                    // Zoek het tekstveld en voeg UI toe
                    const tekstveld = document.querySelector("#postlist");

                    const uiExists = document.getElementById('afwezigheid-ui');
                    if (!tekstveld || uiExists) {
                        console.log('[DEBUG] Injectie stopreden:',
                                    !tekstveld ? 'Geen tekstveld' : `UI al aanwezig (ID: ${uiExists?.id})`);
                        return;
                    }

                    // Maak container voor UI elementen
                    const uiContainer = document.createElement('div');
                    uiContainer.id = 'afwezigheid-ui';
                    uiContainer.style.cssText = `
                margin: 300px 0;
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 5px;
                position: relative;
                z-index: 75;
                background: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;

                    // Plaats UI onderaan het topic-veld, na alle bestaande inhoud
                    tekstveld.parentNode.insertBefore(uiContainer, tekstveld.nextSibling);

                    // Spelersnaamveld
                    let naamVeld = uiContainer.querySelector('#afw-speler');
                    if (!naamVeld) {
                        naamVeld = document.createElement('input');
                        naamVeld.id = 'afw-speler';
                        naamVeld.value = this.playerName; // Gebruik de spelersnaam uit het hoofdscript
                        naamVeld.style.gridColumn = 'span 2';
                        uiContainer.appendChild(naamVeld);
                    }

                    // Datumvelden
                    const startDatum = document.createElement('input');
                    startDatum.type = 'date';
                    startDatum.required = true;

                    const eindDatum = document.createElement('input');
                    eindDatum.type = 'date';
                    eindDatum.required = true;

                    // VM Checkbox
                    const vmCheck = document.createElement('input');
                    vmCheck.type = 'checkbox';
                    vmCheck.style.margin = 'auto';

                    // Opmerkingenveld
                    const opmerkingen = document.createElement('input');
                    opmerkingen.type = 'text';
                    opmerkingen.placeholder = 'Opmerkingen (optioneel)';

                    // Voeg toe knop
                    const voegToeKnop = document.createElement('button');
                    voegToeKnop.textContent = 'Voeg toe';
                    voegToeKnop.style.backgroundColor = '#5a5a5a';
                    voegToeKnop.style.color = 'white';

                    // Voeg elementen toe aan container
                    uiContainer.append(startDatum, eindDatum, vmCheck, opmerkingen, voegToeKnop);

                    // Voeg functionaliteit toe aan knop
                    voegToeKnop.addEventListener('click', async (e) => {
                        if (!startDatum.value || !eindDatum.value) {
                            alert('Vul start- en einddatum in!');
                            return;
                        }

                        const volgendeKnop = Array.from(document.querySelectorAll('a[onclick*="Forum.postEdit"]')).find(a => {
                            const postIdMatch = a.getAttribute('onclick')?.match(/Forum\.postEdit\((\d+),/);
                            const isEditKnop = a.textContent.toLowerCase().includes('bewerken');
                            return postIdMatch && isEditKnop;
                        });

                        if (volgendeKnop) {
                            volgendeKnop.click();
                        }

                        const tekstveld = await waitForElement("#forum_post_textarea:not([style*='display: none'])", 5000);

                        if (tekstveld) {
                            // Genereer tabelrij
                            const tabelRij = `[*][player]${naamVeld.value}[/player][|]${startDatum.value}[|]${eindDatum.value}[|]${vmCheck.checked ? 'Ja' : 'Nee'}[|]${opmerkingen.value || '-'}[/*]\n`;

                            // Probeer in te voegen in bestaande tabel
                            const nieuweTekst = tekstveld.value.replace(
                                /(\[\/\*\*\]\s*\n)(.*?)(\n\[\*\]\[\|)/s,
                                `$1$2\n${tabelRij}$3`
                            );

                            // Update alleen als er een wijziging is
                            if (nieuweTekst !== tekstveld.value) {
                                tekstveld.value = nieuweTekst;
                            }

                            tekstveld.dispatchEvent(new Event('input', { bubbles: true }));

                            // Opslaan
                            const opslaanKnop = document.querySelector("#post_save_form > a:nth-child(6)", 3000);
                            if (opslaanKnop) {
                                opslaanKnop.click();
                            }
                        }

                        // Reset velden
                        startDatum.value = '';
                        eindDatum.value = '';
                        vmCheck.checked = false;
                        opmerkingen.value = '';

                        // Reset de UI-injectie vlag
                        isUIInjected = false;
                        console.log('[DEBUG] UI-injectie vlag gereset');
                    });

                    // Markeer de UI als geïnjecteerd
                    isUIInjected = true;
                    console.log('[DEBUG] UI gemarkeerd als geïnjecteerd');
                } catch (error) {
                    console.error('[DEBUG] Fout:', error);
                }
            };

            // Initialisatie
            const init = () => {
                injectUI();
                new MutationObserver((mutations) => {
                    // Filter alleen relevante DOM wijzigingen
                    const needsInject = mutations.some(mutation =>
                                                       mutation.addedNodes.length > 0 &&
                                                       document.querySelector('.forum_menu') // Alleen triggeren als forum menu aanwezig is
                                                      );
                    if (needsInject) injectUI();
                }).observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: false,
                    characterData: false
                });
            };

            if (document.readyState === 'complete') {
                init();
            } else {
                window.addEventListener('load', init);
            }
        }
    }

    // =====================einde Afwezigheids assistent===========================

    // =====================Feestenfixer===========================================

    class FeestenFixedManager {
        constructor() {
            this.isActive = false;
            this.container = null;
            this.box = null;
            this.triggerBtn = null;
            this.initialized = false;
            this.interval = null;
            this.helpPopup = null;

            this.init();
        }

        init() {
            if (this.initialized) return;

            this.addStyles();
            this.createUIElements();
            this.initialized = true;
        }

        toggle(state) {
            if (state === 'on') {
                this.show();
            } else {
                this.hide();
            }
        }

        addStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
            #feestenFixedContainer {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 75;
                display: none;
            }

            .feestenFixedBox {
                position: absolute;
                right: 0;
                bottom: 50px;
                background-color: rgba(30, 30, 30, 0.9);
                border: 1px solid #FF0000;
                padding: 10px;
                width: 300px;
                max-height: 400px;
                overflow: auto;
                border-radius: 10px;
                display: none;
                color: white;
                font-family: Arial, sans-serif;
            }

            #feestenFixedTrigger {
                position: absolute;
                right: 0;
                bottom: 0;
                background-color: #1e1e1e;
                color: #FF0000;
                border: 1px solid #FF0000;
                padding: 8px 16px;
                font-size: 14px;
                cursor: pointer;
                z-index: 75;
                border-radius: 5px;
                transition: all 0.3s ease;
            }

            #feestenFixedTrigger:hover {
                background-color: #FF0000 !important;
                color: white !important;
            }

            #feestenFixedTrigger.active {
                background-color: #f44336 !important;
                color: white !important;
            }

            .feestenFixedBox div {
                margin: 5px 0;
                padding: 5px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }

            .feestenFixedBox a {
                color: #FF4444;
                text-decoration: none;
            }

            .feestenFixedBox a:hover {
                text-decoration: underline;
            }
        `;
            document.head.appendChild(styleElement);
        }

        createUIElements() {
            // Main container
            this.container = document.createElement('div');
            this.container.id = 'feestenFixedContainer';
            document.body.appendChild(this.container);

            // Content box
            this.box = document.createElement('div');
            this.box.className = 'feestenFixedBox';
            this.container.appendChild(this.box);

            // Trigger button
            this.triggerBtn = document.createElement('button');
            this.triggerBtn.id = 'feestenFixedTrigger';
            this.triggerBtn.textContent = 'Show SFs';
            this.container.appendChild(this.triggerBtn);

            // Event listeners
            this.triggerBtn.addEventListener('click', () => this.toggleBox());
        }

        show() {
            if (!this.container) return;
            this.container.style.display = 'block';
            this.isActive = true;
            this.refreshContent();
            this.interval = setInterval(() => this.refreshContent(), 10000);
        }

        hide() {
            if (!this.container) return;
            this.container.style.display = 'none';
            this.box.style.display = 'none';
            this.isActive = false;
            this.triggerBtn.classList.remove('active');
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        toggleBox() {
            if (!this.box) return;
            if (this.box.style.display === 'block') {
                this.box.style.display = 'none';
                this.triggerBtn.classList.remove('active');
            } else {
                this.box.style.display = 'block';
                this.triggerBtn.classList.add('active');
                this.refreshContent();
            }
        }

        refreshContent() {
            if (!this.box || !this.isActive) return;

            this.box.innerHTML = '';

            try {
                const celebrations = Object.values(unsafeWindow.MM.getModels().Celebration || {});
                const towns = Object.values(unsafeWindow.ITowns.getTowns() || {});
                let hasContent = false;

                for (const town of towns) {
                    const townId = town.getId();
                    const townName = town.getName();
                    const theaterLevel = town.buildings()?.attributes?.theater || 0;
                    const academyLevel = town.buildings()?.attributes?.academy || 0;

                    const hasParty = celebrations.some(c =>
                                                       c.attributes?.town_id === townId &&
                                                       c.attributes?.celebration_type === 'party'
                                                      );

                    const hasTheater = celebrations.some(c =>
                                                         c.attributes?.town_id === townId &&
                                                         c.attributes?.celebration_type === 'theater'
                                                        );

                    let message = '';
                    if (theaterLevel === 1 && !hasTheater) {
                        message += 'Activeer theater ';
                    }
                    if (academyLevel >= 30 && !hasParty) {
                        message += 'Activeer SF ';
                    }

                    if (message) {
                        hasContent = true;
                        const townLink = this.generateTownLink(townId, townName);
                        const msgElement = document.createElement('div');
                        msgElement.innerHTML = `${townLink}: ${message}`;
                        this.box.appendChild(msgElement);
                    }
                }

                if (!hasContent) {
                    const defaultMsg = document.createElement('div');
                    defaultMsg.textContent = 'Alle SFs en theaters in gebruik';
                    this.box.appendChild(defaultMsg);
                }
            } catch (error) {
                const errorMsg = document.createElement('div');
                errorMsg.textContent = 'Fout bij ophalen data';
                errorMsg.style.color = '#FF4444';
                this.box.appendChild(errorMsg);
                console.error('FeestenFixed error:', error);
            }
        }

        generateTownLink(townId, townName) {
            const encodedData = btoa(JSON.stringify({
                id: townId,
                ix: 436,
                iy: 445,
                tp: 'town',
                name: townName
            }));
            return `<a href="#${encodedData}" class="gp_town_link">${townName}</a>`;
        }

        showCustomHelp() {
            const existing = document.getElementById('feestenfixed-help-popup');
            if (existing) existing.remove();

            const popup = document.createElement('div');
            popup.id = 'feestenfixed-help-popup';
            popup.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e1e1e;
        color: white;
        border: 2px solid #FF0000;
        padding: 20px;
        border-radius: 10px;
        z-index: 75;
        max-width: 500px;
        box-shadow: 0 0 15px #FF0000;
        font-family: Arial, sans-serif;
    `;
            popup.innerHTML = `
            <div style="border-bottom: 1px solid #444; margin-bottom: 15px;">
                <h2 style="color: #FF0000; margin: 0 0 10px 0;">FeestenFixed Help</h2>
            </div>

            <div style="margin-bottom: 15px;">
                <h3 style="color: #FF8888; margin: 0 0 8px 0;">Functionaliteit</h3>
                <p>Dit hulpmiddel identificeert steden waar:</p>
                <ul style="margin: 8px 0 0 20px; padding: 0;">
                    <li>Stadsfeesten (SF) geactiveerd kunnen worden</li>
                    <li>Theatervoorstellingen gestart kunnen worden</li>
                </ul>
            </div>

            <div style="margin-bottom: 15px;">
                <h3 style="color: #FF8888; margin: 0 0 8px 0;">Vereisten</h3>
                <ul style="margin: 8px 0 0 20px; padding: 0;">
                    <li><strong>Stadsfeest:</strong> Academie niveau 30+</li>
                    <li><strong>Theater:</strong> Theater gebouw niveau 1</li>
                </ul>
            </div>

            <div style="margin-bottom: 20px;">
                <h3 style="color: #FF8888; margin: 0 0 8px 0;">Gebruiksaanwijzing</h3>
                <ol style="margin: 8px 0 0 20px; padding: 0;">
                    <li>Activeer FeestenFixed via de toggle switch</li>
                    <li>Klik op "Show SFs" knop rechtsonder</li>
                    <li>Klik op stadnamen om direct te navigeren</li>
                    <li>Automatische refresh elke 10 seconden</li>
                </ol>
            </div>

            <div style="text-align: center;">
                <button id="close-feestenfixed-help" style="
            display:block; margin:20px auto 0;
            background:black; color:white;
            padding:5px 15px; border:1px solid #FF0000;
            border-radius:5px; cursor:pointer;">Sluiten</button>
    `;

            document.body.appendChild(popup);

            document.getElementById('close-feestenfixed-help').addEventListener('click', () => popup.remove());
        }
    }

    // ===========================einde FeestenFixer============================================

    // ===========================AttackRangeHelperManager======================================

    class AttackRangeHelperManager {
        constructor(uw) {
            this.uw = uw;
            this.townInterval = null;
            this.isActive = falls;
            this.playerList = [];
            this.townsList = [];
            this.pPoints = 0;
            this.initialize();
        }

        initialize() {
            this.playerList = this.loadPlayerData();
            this.townsList = this.loadTownData();
            this.pPoints = this.fetchPlayerPoints();
            this.injectStyles();

            // Voeg ranglijst observer toe
            this.setupRankingObserver();
        }

        setupRankingObserver() {
            const observer = new MutationObserver(() => {
                const rankingButtons = document.querySelectorAll('.ranking main_menu_item');
                if (rankingButtons.length > 0) {
                    rankingButtons[0].addEventListener('click', () => {
                        this.startRankingColoring();
                    });
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        fetchPlayerPoints() {
            const MAX_ATTEMPTS = 5;
            let attempts = 0;

            const tryFetch = () => {
                attempts++;

                // Methode 1: Direct uit Game object
                if (this.uw?.Game?.player_points) {
                    return this.uw.Game.player_points;
                }

                // Methode 2: Uit player_data
                if (this.uw?.Game?.player_data?.points) {
                    return this.uw.Game.player_data.points;
                }

                // Methode 3: Uit grepolis object
                if (this.uw?.grepolis?.player?.points) {
                    return this.uw.grepolis.player.points;
                }

                // Methode 4: DOM-scan (fallback)
                const points = this.getPlayerPoints();
                if (points > 0) return points;

                // Probeer opnieuw als nog niet gelukt
                if (attempts < MAX_ATTEMPTS) {
                    setTimeout(tryFetch, 1000);
                    return 0;
                }

                console.warn("Kon spelerspunten niet vaststellen");
                return 0;
            };

            return tryFetch();
        }

        loadPlayerData() {
            try {
                return this.uw.$.ajax({
                    type: "GET",
                    url: "/data/players.txt",
                    async: false
                }).responseText.split(/\r\n|\n/);
            } catch (error) {
                console.error("Fout bij laden spelersdata:", error);
                return [];
            }
        }

        loadTownData() {
            try {
                return this.uw.$.ajax({
                    type: "GET",
                    url: "/data/towns.txt",
                    async: false
                }).responseText.split(/\r\n|\n/);
            } catch (error) {
                console.error("Fout bij laden stedendata:", error);
                return [];
            }
        }

        injectStyles() {
            const css = `
            .r_city_shield_blessing {
                background: url(https://i.ibb.co/W05MsxT/dr-city-shield-blessing-a1471e5.png) no-repeat 0 0 !important;
                width: 120px !important;
                height: 72px !important;
                pointer-events: none !important;
            }
            .o_city_shield_blessing {
                background: url(https://i.ibb.co/X8cn1fK/r-city-shield-blessing-a1471e5.png) no-repeat 0 0 !important;
                width: 120px !important;
                height: 72px !important;
                pointer-events: none !important;
            }
            .b_city_shield_blessing {
                background: url(https://i.ibb.co/9crM5x6/b-city-shield-blessing-a1471e5.png) no-repeat 0 0 !important;
                width: 120px !important;
                height: 72px !important;
                pointer-events: none !important;
            }
            .g_city_shield_blessing {
                background: url(https://i.ibb.co/6YmdJVk/g-city-shield-blessing-a1471e5.png) no-repeat 0 0 !important;
                width: 120px !important;
                height: 72px !important;
                pointer-events: none !important;
            }
            .ranking-points-red { color: red !important; }
            .ranking-points-orange { color: orange !important; }
            .ranking-points-green { color: green !important; }
            .ranking-points-blue { color: blue !important; }
        `;
            GM_addStyle(css);
        }

        toggle(state) {
            this.isActive = state === 'on';
            if (this.isActive) {
                this.townInterval = setInterval(() => this.townColoring(), 1500);
                this.startRankingColoring();  // Start ranglijstkleuring
            } else {
                if (this.townInterval) {
                    clearInterval(this.townInterval);
                    this.townInterval = null;
                }
                this.stopRankingColoring();  // Stop ranglijstkleuring
                this.cleanupBlessings();
            }
        }

        // Alternative method to get player points
        getPlayerPoints() {
            const pointsElement = document.querySelector('.player_points') ||
                  document.querySelector('[id*="points"]');

            if (pointsElement) {
                const pointsText = pointsElement.textContent.trim();
                return parseInt(pointsText.replace(/\D/g, ''), 10) || 0;
            }
            return 0;
        }

        townColoring() {
            const towns = document.getElementsByClassName('flag town');
            for (const town of towns) {
                try {
                    const nextelement = town.nextSibling;
                    const content = nextelement.getAttribute("href");
                    const base64 = window.atob(content.substring(1));

                    const ix = base64.substring(base64.indexOf(",\"ix") + 6, base64.indexOf(",\"iy"));
                    const iy = base64.substring(base64.indexOf(",\"iy") + 6, base64.indexOf(",\"tp"));
                    const pos = base64.substring(base64.indexOf("island") + 8, base64.indexOf("}"));
                    const search = ix + "," + iy + "," + pos;

                    // Zoek stad in townsList
                    const townData = this.townsList.find(t => t.includes(search));
                    if (!townData) continue;

                    const townArr = townData.split(',');
                    const playerId = townArr[1];

                    // Zoek speler in playerList
                    const playerData = this.playerList.find(p => p.includes(playerId));
                    if (!playerData) continue;

                    const playerArr = playerData.split(',');
                    const playerPoints = parseInt(playerArr[3], 10); // Punten van de speler

                    // Controleer of het een spookstad is
                    const isGhostTown = town.children[0].getAttribute("class").includes("ghost");

                    // Bepaal kleur op basis van punten en stadstype
                    if (playerPoints < (this.pPoints * 0.83333333333) || playerPoints > (this.pPoints * 1.2)) {
                        if (isGhostTown) {
                            // Geel schild voor spooksteden buiten bereik
                            town.nextSibling.nextSibling.classList.remove("city_shield_blessing");
                            town.nextSibling.nextSibling.classList.add("o_city_shield_blessing");
                        } else {
                            // Rood schild voor normale steden buiten bereik
                            town.nextSibling.nextSibling.classList.remove("city_shield_blessing");
                            town.nextSibling.nextSibling.classList.add("r_city_shield_blessing");
                        }
                    } else {
                        if (isGhostTown) {
                            // Groen schild voor spooksteden binnen bereik
                            town.nextSibling.nextSibling.classList.remove("city_shield_blessing");
                            town.nextSibling.nextSibling.classList.add("g_city_shield_blessing");
                        } else {
                            // Blauw schild voor normale steden binnen bereik
                            town.nextSibling.nextSibling.classList.remove("city_shield_blessing");
                            town.nextSibling.nextSibling.classList.add("b_city_shield_blessing");
                        }
                    }
                } catch (error) {
                    console.error("Fout bij kleuren stad:", error);
                }
            }
        }

        cleanupBlessings() {
            document.querySelectorAll('.r_city_shield_blessing, .b_city_shield_blessing').forEach(el => el.remove());
        }

        startRankingColoring() {
            this.rankingInterval = setInterval(() => this.colorRanking(), 1000);
        }

        stopRankingColoring() {
            if (this.rankingInterval) {
                clearInterval(this.rankingInterval);
                this.rankingInterval = null;
            }
        }

        colorRanking() {
            try {
                if (document.querySelector('#ranking-index.submenu_link.active')) {
                    const points = document.querySelectorAll('.r_points');
                    for (const point of points) {
                        if (point.innerHTML > 0) {
                            const pointValue = parseInt(point.innerHTML.replace(/\D/g, ''), 10);

                            if (pointValue < (this.pPoints * 0.66666666666)) {
                                point.style.color = 'red';     // Rood: < 66.6%
                            } else if (pointValue < (this.pPoints * 0.83333333333)) {
                                point.style.color = 'orange';  // Oranje: 66.6% - 83.3%
                            } else if (pointValue <= (this.pPoints * 1.2)) {
                                point.style.color = 'green';   // Groen: 83.3% - 120%
                            } else {
                                point.style.color = 'blue';    // Blauw: > 120%
                            }
                        }
                    }
                }

                if (document.querySelector('#ranking-sea_player.submenu_link.active')) {
                    const names = document.querySelectorAll('.r_name');
                    const points = document.querySelectorAll('.r_points');

                    for (let i = 0; i < names.length; i++) {
                        const point = points[i];
                        if (point.innerHTML > 0) {
                            const pointValue = parseInt(point.innerHTML.replace(/\D/g, ''), 10);

                            if (pointValue < (this.pPoints * 0.66666666666)) {
                                point.style.color = 'red';
                            } else if (pointValue < (this.pPoints * 0.83333333333)) {
                                point.style.color = 'orange';
                            } else if (pointValue <= (this.pPoints * 1.2)) {
                                point.style.color = 'green';
                            } else {
                                point.style.color = 'blue';
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Fout bij kleuren ranglijst:', err);
            }
        }
    }


    // =====================Einde AttackRangeHelperManager======================================

    // =====================MilitaryManager=====================================================

    class MilitaryManager {
        constructor() {
            this.UNIT_CONFIG = {
                aanval: {
                    slinger: 'Slingeraars',
                    hoplite: 'Hoplieten',
                    rider: 'Ruiters',
                    catapult: 'Katapult'
                },
                verdediging: {
                    swordsman: 'Zwaardvechters',
                    archer: 'Boogschutters',
                    chariot: 'Strijdwagens',
                    colonist: 'Kolonisten'
                },
                belegering: {
                    bireme: 'Biremen',
                    trireme: 'Triremen',
                    attack_ship: 'Vuurschepen',
                    colonize_ship: 'kolo'
                },
                speciaal: {
                    godsent: 'Godgezanten',
                    pegasus: 'Pegasus',
                    cerberus: 'Cerberus',
                    calydonian_boar: 'Wilde Zwijnen'
                }
            };

            this.CONFIG = {
                columns: [
                    'Stad', 'ID', 'God',
                    'Muur', 'Toren',
                    'Aanval', 'Verdediging',
                    'Belegering', 'Speciale Eenheden',
                    'Ontwikkelingen'
                ]
            };
        }

        async getMilitaryData(playerId) {
            try {
                const towns = await this.loadTowns();
                console.log('Geladen steden:', towns); // Debug log

                const filteredTowns = this.filterTowns(towns, playerId);
                console.log('Gefilterde steden:', filteredTowns); // Debug log

                if (filteredTowns.length === 0) {
                    return {
                        success: false,
                        error: `Geen steden gevonden voor speler ID ${playerId}`
                    };
                }

                return this.processTowns(filteredTowns);
            } catch (error) {
                console.error('Fout in getMilitaryData:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }

        async processTowns(towns) {
            try {
                const processed = await Promise.all(
                    towns.map(town => this.getTownDetails(town.id))
                );
                return { success: true, towns: processed };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        async initializeTowns() { // CORRECT
            try {
                this.towns = await this.loadTowns();
            } catch (error) {
                console.error('Fout bij initialiseren steden:', error);
            }
        }

        async loadTowns() { // CORRECT
            return new Promise((resolve, reject) => {
                const check = (attempts = 0) => {
                    if (uw.ITowns?.towns) {
                        resolve(uw.ITowns.towns);
                    } else if (attempts < 20) {
                        setTimeout(() => check(attempts + 1), 250);
                    } else {
                        reject(new Error('Kon stedendata niet laden'));
                    }
                };
                check();
            });
        }

        filterTowns(towns, targetPlayerId) {
            console.log('Filteren op speler ID:', targetPlayerId);
            return Object.values(towns).filter(town => {
                const townPlayerId = town.player_id || town.player?.id;
                console.log(`Stad ${town.id} heeft speler ID:`, townPlayerId);
                return townPlayerId?.toString() === targetPlayerId.toString();
            });
        }

        async processTowns(towns) {
            return Promise.all(
                Object.values(towns).map(async town => ({
                    basic: town,
                    ...await getTownDetails(town.id)
                })));
        }

        getTownDetails(townId) {
            try {
                const town = uw.ITowns.getTown(townId);
                if (!town) {
                    console.warn(`Stad ${townId} niet gevonden in ITowns`);
                    return this.getFallbackData();
                }

                // Debug logs voor stadseigenschappen
                console.log(`Details voor stad ${townId}:`, {
                    buildings: town.buildings?.(),
                    units: town.units?.(),
                    researches: town.researches?.()
                });

                return {
                    god: town.god?.() || 'Onbekend',
                    wall: town.buildings?.().getBuildingLevel?.('wall') ?? '?',
                    tower: town.buildings?.().getBuildingLevel?.('tower') ? 'Ja' : 'Nee',
                    attack: this.formatUnitGroup(town.units?.(), this.UNIT_CONFIG.aanval),
                    defense: this.formatUnitGroup(town.units?.(), this.UNIT_CONFIG.verdediging),
                    siege: this.formatUnitGroup(town.units?.(), this.UNIT_CONFIG.belegering),
                    specials: this.formatUnitGroup(town.units?.(), this.UNIT_CONFIG.speciaal),
                    developments: this.formatResearches(town.researches?.()?.attributes || {})
                };
            } catch (error) {
                console.error(`Fout bij ophalen stad ${townId}:`, error);
                return this.getFallbackData();
            }
        }

        formatUnitGroup(units, types)
        {
            return Object.entries(types)
                .map(([key, name]) => units?.[key] > 0 ? `${units[key]} ${name}` : null)
                .filter(Boolean)
                .join('<br>') || '-';
        }

        formatResearches(researches)
        {
            return [
                researches?.phalanx && 'Falanx',
                researches?.ram && 'Stormram',
                researches?.divine_selection && 'Goddelijke Selectie',
                researches?.conscription && 'Dienstplicht'
            ].filter(Boolean).join(', ') || 'Geen';
        }

        getFallbackData()
        {
            return {
                god: 'Onbekend', wall: '?', tower: 'Nee',
                developments: 'Geen', attack: '-', defense: '-',
                siege: '-', specials: '-'
            };
        }
    }

    // ===============Einde MilitaryManager=====================================================

    // =====================TroopManager========================================================

    class TroopManager {
        constructor(manager) {
            this.manager = manager;
            this.uw = unsafeWindow;
            this.world = window.location.host.split('.')[0]; // bv. 'nl124'
            this.currentData = null;

            // Configuratie
            this.CONFIG = {
                SUPABASE_URL: 'https://wmbaarvoceexltzxgcsl.supabase.co',
                SUPABASE_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtYmFhcnZvY2VleGx0enhnY3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzc4NjcsImV4cCI6MjA2MzY1Mzg2N30.O9eNhVenXaa3-K8CHC9GRHnzeruKeRaBBh7CXgU7bOw',
                UPLOAD_INTERVAL: 5 * 60 * 1000,
                TROOP_ICONS_URL: 'https://gpnl.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png'
            };

            // Troep icons
            this.troopIcons = {
                sword: '-320px 0', slinger: '-200px -280px', archer: '-40px -80px',
                hoplite: '-240px -40px', rider: '-40px -280px', chariot: '-160px -80px',
                catapult: '-120px -120px', minotaur: '-240px -240px', manticore: '0px -240px',
                zyklop: '-240px -320px', harpy: '-120px -200px', medusa: '-80px -240px',
                centaur: '-160px 0px', pegasus: '-280px -120px', cerberus: '-160px -40px',
                fury: '0px -200px', griffin: '-80px -200px', calydonian_boar: '-80px -120px',
                satyr: '-80px -280px', spartoi: '-280px -280px', ladon: '-240px -120px',
                godsent: '-40px -200px', militia: '-200px -240px',
                big_transporter: '0 -120px', bireme: '-40px -120px', attack_ship: '-120px -80px',
                demolition_ship: '-200px 0px', small_transporter: '-240px -280px',
                trireme: '-320px -200px', colonize_ship: '-40px -160px', sea_monster: '-120px -280px',
                siren: '-160px -240px'
            };

            // Vertalingen
            this.unitTranslations = {
                sword: 'Zwaardvechter',
                slinger: 'Slingeraar',
                archer: 'Boogschutter',
                hoplite: 'Hopliet',
                rider: 'Ruiter',
                chariot: 'Strijdwagen',
                catapult: 'Katapult',
                minotaur: 'Minotaurus',
                manticore: 'Manticore',
                zyklop: 'Cycloop',
                harpy: 'Harpij',
                medusa: 'Medusa',
                centaur: 'Centaur',
                pegasus: 'Pegasus',
                cerberus: 'Cerberus',
                fury: 'Erinys',
                griffin: 'Griffioen',
                calydonian_boar: 'Calydonisch varken',
                satyr: 'Sater',
                spartoi: 'Spartoi',
                ladon: 'Ladon',
                godsent: 'Godsgezant',
                militia: 'Militie',
                big_transporter: 'Transportboot',
                bireme: 'Bireem',
                attack_ship: 'Vuurschip',
                demolition_ship: 'Brander',
                small_transporter: 'Snel transportschip',
                trireme: 'Trireem',
                colonize_ship: 'Kolonisatieschip',
                sea_monster: 'Hydra',
                siren: 'Sirene'
            };

            this.setupStyles();
        }

        // Land units check
        isLandUnit(unit) {
            const landUnits = [
                'sword', 'slinger', 'archer', 'hoplite', 'rider',
                'chariot', 'catapult', 'minotaur', 'manticore',
                'zyklop', 'harpy', 'medusa', 'centaur', 'pegasus',
                'cerberus', 'fury', 'griffin', 'calydonian_boar',
                'satyr', 'spartoi', 'ladon', 'godsent', 'militia'
            ];
            return landUnits.includes(unit);
        }

        // Sea units check
        isSeaUnit(unit) {
            const seaUnits = [
                'big_transporter', 'bireme', 'attack_ship', 'demolition_ship',
                'small_transporter', 'trireme', 'colonize_ship', 'sea_monster', 'siren'
            ];
            return seaUnits.includes(unit);
        }

        async show() {
            try {
                const data = await this.fetchTroopData();
                if (!data) {
                    this.manager.showNotification("Geen troepdata gevonden.", false);
                    return;
                }
                this.displayAllDataInPopup(data);
            } catch (error) {
                console.error("Fout bij tonen troepen:", error);
                this.manager.showNotification("Fout bij tonen troepen.", false);
            }
        }

        // Icon styling
        getUnitIconStyle(unit) {
            return `background-image: url(${this.CONFIG.TROOP_ICONS_URL}); background-position: ${this.troopIcons[unit] || '0 0'};`;
        }

        showTroopDataInNewTab(data, title = 'Troepenoverzicht') {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
        <html>
            <head><title>${title}</title></head>
            <body>
                ${this.generateTroopDataHTML(data)}
            </body>
        </html>
    `);
            newWindow.document.close();
        }

        // Data display functions
        displayAllDataInPopup(data) {
            this.manager.toggleMainWindow();
            const popup = document.getElementById('forum-popup');
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'tm-single-column';

            const grouped = this.groupDataByPlayer(data);

            for (const playerName in grouped) {
                const playerGroup = grouped[playerName];
                const playerInfo = data.PlayerCL.find(p => p.playerName === playerName) || {};

                contentWrapper.innerHTML += `
                <div class="tm-player-block">
                    <h3>${playerName}</h3>
                    <div>Culture Level: ${playerInfo.cultureLevel || '?'}</div>
                    <div>Steden: ${playerInfo.playerVillages || playerGroup.length}</div>
                    <div>Vrije slotjes: ${playerInfo.openSlots ?? '?'}</div>
                    <hr>
                </div>
            `;

                playerGroup.forEach((entry) => {
                    const wall = entry.wall || {};
                    const home = entry.home?.units || {};
                    const away = entry.away?.units || {};
                    const support = entry.support?.units || {};

                    contentWrapper.innerHTML += `
                    <div class="tm-city-block">
                        <strong>Stad:</strong> ${wall.town || 'Onbekend'}<br>
                        Muur: ${wall.wall || 'N/A'}<br>
                        Toren: ${wall.tower ? 'Ja' : 'Nee'}<br>
                        Falanx: ${wall.phalanx ? 'Actief' : 'Inactief'}<br>
                        God: ${wall.god || 'Onbekend'}
                    </div>
                    ${this.renderTroopCategory('Aanwezige troepen', home)}
                    ${this.renderTroopCategory('Troepen buiten', away)}
                    ${this.renderTroopCategory('Ondersteunende troepen', support)}
                    ${this.renderOtherUnitsCategory(home, away, support)}
                    <hr>
                `;
                });
            }

            popup.appendChild(contentWrapper);
            document.body.appendChild(popup);
        }

        async showControlPanel() {
            const content = document.getElementById('popup-content');
            content.innerHTML = `
            <h2>Troop Manager</h2>
            <div style="display: grid; gap: 15px; margin: 20px 0;">
                <!-- Eigen data -->
                <div style="border: 1px solid #FF0000; padding: 10px; border-radius: 5px;">
                    <h3 style="color: #FF0000;">Eigen Troepen</h3>
                    <button id="show-own-data" class="troop-btn">Toon Mijn Data</button>
                    <button id="export-own-data" class="troop-btn">Exporteer Mijn Data</button>
                </div>

                <!-- Andere spelers -->
                <div style="border: 1px solid #FF0000; padding: 10px; border-radius: 5px;">
                    <h3 style="color: #FF0000;">Andere Spelers</h3>
                    <select id="player-select" style="padding: 5px; margin-bottom: 10px;">
                        <option value="">Laden...</option>
                    </select>
                    <button id="show-player-data" class="troop-btn">Toon Data</button>
                    <button id="export-all-data" class="troop-btn">Exporteer Alles</button>
                </div>
            </div>
            <div id="troop-data-container"></div>
        `;

            // Laad spelerslijst
            await this.loadPlayerDropdown();

            // Event listeners
            document.getElementById('show-own-data').addEventListener('click', async () => {
                const data = await this.fetchTroopData();
                this.currentData = data;
                this.showTroopDataInNewTab(data);
            });

            document.getElementById('export-own-data').addEventListener('click', this.exportToExcel.bind(this));

            document.getElementById('show-player-data').addEventListener('click', async () => {
                const select = document.getElementById('player-select');
                const selectedPlayer = select.value;

                if (!selectedPlayer) {
                    this.manager.showNotification("Selecteer eerst een speler", false);
                    return;
                }

                if (selectedPlayer === "-ALL-") {
                    await this.showAllPlayersData();
                } else {
                    const data = await this.fetchPlayerDataFromSupabase(selectedPlayer);
                    if (data) {
                        this.showTroopDataInNewTab(data, `${selectedPlayer}'s Troepen`);
                    } else {
                        this.manager.showNotification("Geen data gevonden voor deze speler", false);
                    }
                }
            });

            document.getElementById('export-all-data').addEventListener('click', this.exportAllData.bind(this));
        }

        async loadPlayerDropdown() {
            const select = document.getElementById('player-select');
            try {
                const players = await this.fetchAvailablePlayers();
                select.innerHTML = `
                <option value="">-- Selecteer een speler --</option>
                <option value="-ALL-">-- Toon Alles --</option>
                ${players.map(player => `
                    <option value="${player}">${player}</option>
                `).join('')}
            `;
            } catch (error) {
                console.error("Fout bij laden spelers:", error);
                select.innerHTML = `
                <option value="">Fout bij laden spelerslijst</option>
            `;
            }
        }

        async fetchAvailablePlayers() {
            try {
                const url = `${this.CONFIG.SUPABASE_URL}/rest/v1/troepen?select=player,world`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'apikey': this.CONFIG.SUPABASE_API_KEY,
                        'Authorization': `Bearer ${this.CONFIG.SUPABASE_API_KEY}`
                    }
                });

                if (!response.ok) throw new Error(`Fout bij ophalen spelers`);
                const result = await response.json();

                return result
                    .filter(entry =>
                            (entry.world || '').trim().toLowerCase() === this.world.trim().toLowerCase()
                           )
                    .map(entry => entry.player);
            } catch (error) {
                return [];
            }
        }

        async fetchPlayerDataFromSupabase(playerName) {
            try {
                const url = `${this.CONFIG.SUPABASE_URL}/rest/v1/troepen?select=player,world,data&player=eq.${encodeURIComponent(playerName)}&world=eq.${encodeURIComponent(this.world)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'apikey': this.CONFIG.SUPABASE_API_KEY,
                        'Authorization': `Bearer ${this.CONFIG.SUPABASE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`Fout bij ophalen data`);
                const result = await response.json();
                return result.length > 0 ? result[0].data : null;
            } catch (error) {
                return null;
            }
        }

        async showAllPlayersData() {
            try {
                const allData = await this.fetchAllPlayersData();
                if (!allData.length) {
                    this.manager.showNotification("Geen spelerdata gevonden", false);
                    return;
                }

                const newWindow = window.open('', '_blank');
                newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Alle Troep Data - ${new Date().toLocaleString()}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #FF0000; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .unit-icon {
                        display: inline-block;
                        width: 40px;
                        height: 40px;
                        background-image: url(${this.CONFIG.TROOP_ICONS_URL});
                        position: relative;
                    }
                    .unit-count {
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        background: rgba(0,0,0,0.7);
                        color: white;
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <h1>Troep Data - Alle Spelers</h1>
                    ${allData.map(playerData => `
                        <div style="page-break-after: always;">
                            ${this.generateTroopDataHTML(playerData.data)}
                        </div>
                    `).join('')}
                </body>
                </html>
            `);
                newWindow.document.close();
            } catch (error) {
                console.error("Fout bij ophalen alle data:", error);
                this.manager.showNotification("Fout bij laden alle data", false);
            }
        }

        async fetchAllPlayersData() {
            try {
                const url = `${this.CONFIG.SUPABASE_URL}/rest/v1/troepen?select=player,world,data&world=eq.${encodeURIComponent(this.world)}`;
                const response = await fetch(url, {
                    headers: {
                        "apikey": this.CONFIG.SUPABASE_API_KEY,
                        "Authorization": `Bearer ${this.CONFIG.SUPABASE_API_KEY}`
                    }
                });

                if (!response.ok) throw new Error("Kon alle spelerdata niet ophalen");
                return await response.json();
            } catch (error) {
                return [];
            }
        }

        async exportAllData() {
            try {
                const allData = await this.fetchAllPlayersData();
                if (!allData.length) {
                    this.manager.showNotification("Geen data om te exporteren", false);
                    return;
                }

                let csvContent = 'Speler,Culture Level,Steden,Stad,Muur,Toren,Falanx,God,Unit Type,Unit,Count\n';

                allData.forEach(item => {
                    item.data.PlayerCL.forEach(player => {
                        item.data.Wall.forEach((wall, index) => {
                            const troops = item.data.Troepen[index] || { units: {} };
                            Object.entries(troops.units).forEach(([unit, count]) => {
                                csvContent += [
                                    `"${player.playerName}"`,
                                    player.cultureLevel,
                                    player.playerVillages,
                                    `"${wall?.town || 'Unknown'}"`,
                                    wall?.wall || 'N/A',
                                    wall?.tower ? 'Yes' : 'No',
                                    wall?.phalanx ? 'Yes' : 'No',
                                    `"${wall?.god || ''}"`,
                                    this.isLandUnit(unit) ? 'Land' : (this.isSeaUnit(unit) ? 'Sea' : 'Other'),
                                    `"${unit}"`,
                                    count
                                ].join(',') + '\n';
                            });
                        });
                    });
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `alle_troepen_export_${new Date().toISOString().slice(0,10)}.csv`;
                link.click();
            } catch (error) {
                console.error("Export fout:", error);
                this.manager.showNotification("Export mislukt", false);
            }
        }

        generateTroopDataHTML(data) {
            const grouped = this.groupDataByPlayer(data);
            let html = '';

            for (const playerName in grouped) {
                const playerGroup = grouped[playerName];
                const playerInfo = data.PlayerCL.find(p => p.playerName === playerName) || {};

                html += `
                <div style="margin-bottom: 30px;">
                    <h2>${playerName}</h2>
                    <p>
                        <strong>Culture Level:</strong> ${playerInfo.cultureLevel || '?'} |
                        <strong>Steden:</strong> ${playerInfo.playerVillages || playerGroup.length} |
                        <strong>Vrije slotjes:</strong> ${playerInfo.openSlots ?? '?'}
                    </p>
            `;

                playerGroup.forEach((entry, index) => {
                    const wall = entry.wall || {};
                    const home = entry.home?.units || {};
                    const away = entry.away?.units || {};
                    const support = entry.support?.units || {};

                    html += `
                    <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                        <h3>Stad ${index + 1}: ${wall.town || 'Onbekend'}</h3>
                        <p>
                            <strong>Muur:</strong> ${wall.wall || 'N/A'} |
                            <strong>Toren:</strong> ${wall.tower ? 'Ja' : 'Nee'} |
                            <strong>Falanx:</strong> ${wall.phalanx ? 'Actief' : 'Inactief'} |
                            <strong>God:</strong> ${wall.god || 'Onbekend'}
                        </p>

                        ${this.generateTroopCategoryHTML('Aanwezige troepen', home)}
                        ${this.generateTroopCategoryHTML('Troepen buiten', away)}
                        ${this.generateTroopCategoryHTML('Ondersteunende troepen', support)}
                        ${this.generateOtherUnitsHTML(home, away, support)}
                    </div>
                `;
                });

                html += `</div>`;
            }

            return html;
        }

        generateTroopCategoryHTML(title, units) {
            const landUnits = Object.entries(units).filter(([unit]) => this.isLandUnit(unit));
            const seaUnits = Object.entries(units).filter(([unit]) => this.isSeaUnit(unit));

            return `
            <div style="margin-bottom: 15px;">
                <h4>${title}</h4>
                ${landUnits.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
                        ${landUnits.map(([unit, count]) => `
                            <div class="unit-icon" style="background-position: ${this.troopIcons[unit] || '0 0'}"
                                 title="${this.getUnitDescription(unit)}">
                                <div class="unit-count">${count}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>Geen eenheden</p>'}

                ${seaUnits.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${seaUnits.map(([unit, count]) => `
                            <div class="unit-icon" style="background-position: ${this.troopIcons[unit] || '0 0'}"
                                 title="${this.getUnitDescription(unit)}">
                                <div class="unit-count">${count}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        }

        generateOtherUnitsHTML(...unitSets) {
            const combined = Object.assign({}, ...unitSets);
            const otherUnits = Object.entries(combined)
            .filter(([unit]) => !this.isLandUnit(unit) && !this.isSeaUnit(unit))
            .filter(([_, count]) => count > 0);

            return `
            <div style="margin-bottom: 15px;">
                <h4>Andere eenheden</h4>
                <div style="padding-left: 15px;">
                    ${otherUnits.length > 0 ?
                otherUnits.map(([unit, count]) => `
                            <p>${this.getUnitName(unit)}: ${count}</p>
                        `).join('') :
            '<p>Geen andere eenheden</p>'
        }
                </div>
            </div>
        `;
        }

        renderTroopCategory(title, units) {
            const landUnits = Object.entries(units).filter(([unit]) => this.isLandUnit(unit));
            const seaUnits = Object.entries(units).filter(([unit]) => this.isSeaUnit(unit));

            return `
            <div class="tm-troop-category">
                <h4>${title}</h4>
                ${landUnits.length > 0 ? `
                    <div class="tm-units-row">
                        ${landUnits.map(([unit, count]) => this.renderUnitIcon(unit, count)).join('')}
                    </div>
                ` : ''}
                ${seaUnits.length > 0 ? `
                    <div class="tm-units-row">
                        ${seaUnits.map(([unit, count]) => this.renderUnitIcon(unit, count)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        }

        renderOtherUnitsCategory(...unitSets) {
            const combined = Object.assign({}, ...unitSets);
            const otherUnits = Object.entries(combined)
            .filter(([unit]) => !this.isLandUnit(unit) && !this.isSeaUnit(unit))
            .filter(([_, count]) => count > 0);

            return `
            <div class="tm-troop-category">
                <h4>Andere eenheden</h4>
                <div class="tm-other-list">
                    ${otherUnits.length > 0 ?
                otherUnits.map(([unit, count]) => `
                            <div class="tm-other-line">${this.getUnitName(unit)} – ${count}</div>
                        `).join('') :
            '<div class="tm-no-units">Geen eenheden</div>'
        }
                </div>
            </div>
        `;
        }

        renderUnitIcon(unit, count) {
            return `
            <div class="tm-unit" style="${this.getUnitIconStyle(unit)}" title="${this.getUnitDescription(unit)}">
                <div class="tm-unit-count">${count}</div>
            </div>
        `;
        }

        getUnitDescription(unit) {
            return this.unitTranslations[unit] || 'Geen beschrijving beschikbaar';
        }

        getUnitName(unitKey) {
            return this.unitTranslations[unitKey] || unitKey;
        }

        // Export system
        exportToExcel() {
            if (!this.currentData) {
                this.manager.showNotification('No data available to export', false);
                return;
            }

            try {
                const csvContent = this.formatCSVData(this.currentData);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `troop_export_${new Date().toISOString().slice(0,10)}.csv`;
                link.click();
                this.manager.showNotification('Export started successfully!');
            } catch (error) {
                console.error('Export error:', error);
                this.manager.showNotification(`Export failed: ${error.message}`, false);
            }
        }

        formatCSVData(data) {
            let csv = 'Player,Culture Level,Villages,Open Slots,Town,Wall,Tower,Phalanx,God,Unit Type,Unit,Count\n';

            data.PlayerCL.forEach(player => {
                data.Wall.forEach((wall, index) => {
                    const troops = data.Troepen[index] || { units: {} };
                    Object.entries(troops.units).forEach(([unit, count]) => {
                        csv += [
                            `"${player.playerName}"`,
                            player.cultureLevel,
                            player.playerVillages,
                            player.openSlots,
                            `"${wall?.town || 'Unknown'}"`,
                            wall?.wall || 'N/A',
                            wall?.tower ? 'Yes' : 'No',
                            wall?.phalanx ? 'Yes' : 'No',
                            `"${wall?.god || ''}"`,
                            this.isLandUnit(unit) ? 'Land' : (this.isSeaUnit(unit) ? 'Sea' : 'Other'),
                            `"${unit}"`,
                            count
                        ].join(',') + '\n';
                    });
                });
            });

            return csv;
        }

        async performUpload() {
            try {
                const playerName = this.getPlayerName();
                await this.deleteOldDataFromSupabase(playerName);
                await this.uploadDataToSupabase(troopData, playerName);
                this.manager.showNotification('Upload gelukt');
            } catch (error) {
                this.manager.showNotification(`Upload faalde: ${error.message}`, false);
            }
        }

        async deleteOldDataFromSupabase(playerName) {
            try {
                const url = `${this.CONFIG.SUPABASE_URL}/rest/v1/troepen?player=eq.${encodeURIComponent(playerName)}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'apikey': this.CONFIG.SUPABASE_API_KEY,
                        'Authorization': `Bearer ${this.CONFIG.SUPABASE_API_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal' // sneller
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Supabase DELETE failed: ${errorText}`);
                }

                console.log(`[SUPABASE] Oude data verwijderd voor speler: ${playerName}`);
            } catch (error) {
                console.error('Fout bij verwijderen van oude data:', error);
            }
        }


        // Voeg deze nieuwe methodes toe:
        setupAutoUpload() {
            function calculateNextUpload() {
                const now = new Date();
                const nextUpload = new Date(now);
                nextUpload.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
                nextUpload.setSeconds(0);
                nextUpload.setMilliseconds(0);
                return nextUpload - now;
            }

            const performUpload = async () => {
                try {
                    const playerName = this.getPlayerName();
                    const troopData = await this.fetchTroopData();
                    await this.uploadDataToSupabase(troopData, playerName);
                    this.manager.showNotification('Auto-upload successful!');
                } catch (error) {
                    console.error('Auto-upload error:', error);
                    this.manager.showNotification(`Upload failed: ${error.message}`, false);
                }
            };

            setTimeout(() => {
                performUpload();
                setInterval(performUpload, this.CONFIG.UPLOAD_INTERVAL);
            }, calculateNextUpload());
        }

        async uploadDataToSupabase(data, playerName) {
            try {
                const payload = {
                    player: playerName,
                    world: this.world,
                    data: data
                };

                const url = `${this.CONFIG.SUPABASE_URL}/rest/v1/troepen?on_conflict=player,world`;
                const headers = {
                    'apikey': this.CONFIG.SUPABASE_API_KEY,
                    'Authorization': `Bearer ${this.CONFIG.SUPABASE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=representation'
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify([payload])
                });

                if (!response.ok) throw new Error(`Upsert mislukt`);
            } catch (error) {}
        }

        // Data handling functions
        async fetchTroopData() {
            const playerName = this.uw.Game.player_name || "onbekend";
            const data = {
                HomeTroops: [],
                AwayTroops: [],
                SupportInCity: [],
                PlayerCL: [],
                Wall: [],
                IDs: [],
                Troepen: [],
                timestamp: new Date().toISOString()
            };

            try {
                // Get culture level
                const cldata = this.uw.TooltipFactory.getCultureOverviewTooltip()?.split('<br />') || [];
                const cl = parseInt(cldata[1]?.replace(/<b>.*?<\/b>/g, '').trim()) || 0;
                const open_slots = cl - (this.uw.Game.player_villages || 0);

                data.PlayerCL.push({
                    playerName: playerName,
                    playerVillages: this.uw.Game.player_villages || 0,
                    cultureLevel: cl,
                    openSlots: open_slots
                });

                // Get towns data
                const towns = this.uw.ITowns?.towns || {};
                for (const townId in towns) {
                    const town = towns[townId];
                    if (!town) continue;

                    data.HomeTroops.push({
                        playerName: playerName,
                        townName: town.name,
                        units: town.units?.() || {}
                    });

                    data.AwayTroops.push({
                        playerName: playerName,
                        townName: town.name,
                        units: town.unitsOuter?.() || {}
                    });

                    data.SupportInCity.push({
                        playerName: playerName,
                        townName: town.name,
                        units: town.unitsSupport?.() || {}
                    });

                    data.IDs.push({
                        town: town.name,
                        id: town.id
                    });

                    const townObj = this.uw.ITowns.getTown?.(town.id);
                    data.Wall.push({
                        player: playerName,
                        town: town.name,
                        wall: townObj?.getBuildings?.()?.attributes?.wall || 0,
                        phalanx: townObj?.getResearches?.()?.get?.("phalanx") || false,
                        tower: townObj?.getBuildings?.()?.get?.("tower") || false,
                        god: townObj?.god?.() || 'Unknown'
                    });
                }

                // Get all units
                const allUnits = this.uw.ITowns?.all_units?.fragments || {};
                for (const fragmentId in allUnits) {
                    const fragment = allUnits[fragmentId];
                    if (!fragment?.models) continue;

                    for (const modelId in fragment.models) {
                        const model = fragment.models[modelId];
                        const units = model?.attributes || {};

                        const filteredUnits = {};
                        for (const unit in units) {
                            if (typeof units[unit] === "number" && units[unit] > 0) {
                                filteredUnits[unit] = units[unit];
                            }
                        }

                        if (Object.keys(filteredUnits).length > 0) {
                            data.Troepen.push({
                                player: playerName,
                                units: filteredUnits
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching troop data:', error);
                throw error;
            }

            return data;
        }

        groupDataByPlayer(data) {
            const grouped = {};

            // Controleer of data.IDs bestaat en is een array
            const ids = data.IDs || [];
            const troops = data.Troepen || [];
            const walls = data.Wall || [];
            const homeTroops = data.HomeTroops || [];
            const awayTroops = data.AwayTroops || [];
            const supportTroops = data.SupportInCity || [];

            for (let i = 0; i < ids.length; i++) {
                const player = troops[i]?.player || 'Unknown';

                if (!grouped[player]) {
                    grouped[player] = [];
                }

                grouped[player].push({
                    wall: walls[i] || {},
                    home: homeTroops[i] || { units: {} },
                    away: awayTroops[i] || { units: {} },
                    support: supportTroops[i] || { units: {} }
                });
            }

            return grouped;
        }

        // Helper functions
        getPlayerName() {
            if (!this.uw.Game?.player_name) {
                throw new Error("Could not get player name");
            }
            return this.uw.Game.player_name.startsWith('.') ?
                this.uw.Game.player_name.substring(1) :
            this.uw.Game.player_name;
        }

        setupStyles() {
            // Wait for the DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.injectStyles());
            } else {
                this.injectStyles();
            }
        }

        injectStyles() {
            const styleElement = document.createElement('style');
            styleElement.textContent = `
            .tm-grid {
                display: grid;
                gap: 20px;
                padding: 15px;
            }

            .tm-troops-col {
                width: 520px;
                flex-shrink: 0;
            }

            .tm-player-card,
            .tm-city-section,
            .tm-troop-section {
                width: 520px;
                min-height: 110px;
                background: #1dcae0;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .tm-unit {
                font: 700 12px Verdana, Arial, Helvetica, sans-serif;
                user-select: none;
                vertical-align: middle;
                width: 39px;
                height: 40px;
                position: relative;
                display: inline-block;
                text-align: right;
                margin: 1px;
                text-shadow: 1px 1px 0 #000;
                cursor: pointer;
                box-shadow: inset 0 0 4px #000;
                background-image: url(${this.CONFIG.TROOP_ICONS_URL});
            }

            .tm-unit:hover {
                transform: scale(1.1);
                z-index: 100;
            }

            .tm-unit-count {
                position: absolute;
                bottom: 2px;
                right: 2px;
                padding: 2px 5px;
                border-radius: 3px;
                font-size: 11px;
                background-color: rgba(0,0,0,0.5);
                color: white;
            }

            .tm-units-row {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                padding: 5px 0;
            }

            .tm-filters {
                display: flex;
                gap: 10px;
                padding: 15px;
                background: #1dcae0;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .tm-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: bold;
                color: white;
            }

            .tm-btn:hover {
                opacity: 0.9;
            }

            .tm-download {
                background: #17d117;
            }

            .tm-export {
                background: #cf1717;
            }

            .tm-close {
                background: #db1a1a;
            }

            .tm-close-btn {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 24px;
                cursor: pointer;
                color: #ffd700;
            }

            .tm-close-btn:hover {
                color: #ff0000;
            }

            .tm-troop-category {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #fc6;
            }

            .tm-troop-category h4 {
                margin: 0 0 10px 0;
                color: #ffd700;
            }

            .tm-other-list {
                padding: 5px 0 0 10px;
            }

            .tm-other-line {
                font-family: Verdana, sans-serif;
                font-size: 13px;
                line-height: 1.5;
                color: #ffd700;
                margin-bottom: 5px;
            }

            .tm-no-units {
                font-style: italic;
                color: #aaa;
            }

            .tm-single-column {
                display: flex;
                flex-direction: column;
                gap: 20px;
                font-family: Verdana, sans-serif;
                font-size: 13px;
                color: #ffd700;
            }

            .tm-player-block {
                padding: 15px;
                background: #1dcae0;
                border-radius: 6px;
                border: 1px solid #fc6;
            }

            .tm-city-block {
                padding: 15px;
                background: #113344;
                border-radius: 6px;
                margin-bottom: 15px;
                border: 1px solid #fc6;
            }

            #troopManagerPopup,
            #troopDataPopup {
                color: #ffd700 !important;
                font-family: Verdana, sans-serif;
            }

            .grep-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border-radius: 4px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                font-family: Arial, sans-serif;
                animation: fadeIn 0.3s;
            }

            .grep-notification.error {
                background-color: #F44336;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
            if (document.head) {
                document.head.appendChild(styleElement);
            } else {
                console.error('Document head not found');
            }
        }
    }

    // ===============Einde TroopManager========================================================

    // Initialisatie
    new ForumManager();
    const manager = new ForumManager();
    window.forumManager = manager;

})();