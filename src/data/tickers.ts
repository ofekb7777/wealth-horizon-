/**
 * קטלוג סימולים ארוז — 1612 רשומות.
 *
 * **למה זה קיים:** Yahoo חוסם CORS, ולכן חיפוש סימולים לא יכול לעבוד
 * בדפדפן בכלל, וגם באנדרואיד הוא נופל כשאין רשת או כשמגיעים לחסימת קצב.
 * הקטלוג הזה עונה מיידית, תמיד, בלי בקשת רשת אחת. תוצאות Yahoo
 * ממוזגות מעליו כשיש רשת — ראה `searchTickers` ב-`services/marketData.ts`.
 *
 * ⚠️ **נוצר אוטומטית. אל תערוך ידנית.**
 * לרענון: `python3 scripts/generate-tickers.py`
 *
 * ההרכב: מדד S&P 500 המלא, כל מניה אמריקאית בשווי שוק מעל 5 מיליארד
 * דולר (1462 מניות בסך הכל), 80 ETF-ים נפוצים, 30 מטבעות
 * קריפטו ו-40 ניירות מהבורסה בתל אביב.
 *
 * הסימולים בפורמט של Yahoo (BRK-B ולא BRK.B) כי אותו סימול משמש
 * למשיכת המחיר בפועל.
 *
 * **למה מחרוזת אחת ולא מערך של אובייקטים:** מנוע JS מפרסר מחרוזת אחת
 * הרבה יותר מהר מ-1612 ליטרלים מקוננים, והבאנדל קטן משמעותית.
 * הפיצול קורה פעם אחת, בחיפוש הראשון.
 */

/** `symbol|name|exchange` בכל שורה. */
const RAW = `A|Agilent Technologies|NYSE
AA|Alcoa Corporation|NYSE
AAL|American Airlines Group Inc.|NASDAQ
AAOI|Applied Optoelectronics Inc.|NASDAQ
AAON|AAON Inc.|NASDAQ
AAPL|Apple Inc.|NASDAQ
ABBV|AbbVie|NYSE
ABCB|Ameris Bancorp|NYSE
ABEV|Ambev S.A.|NYSE
ABNB|Airbnb|NASDAQ
ABT|Abbott Laboratories|NYSE
ABVX|Abivax SA|NASDAQ
ACA|Arcosa Inc.|NYSE
ACGL|Arch Capital Group|NASDAQ
ACGLN|Arch Capital Group Ltd. Depositary Shares each Representing a 1/1000th Interest in a 4.550% Non-Cumulative Preferred Share Series G|NASDAQ
ACGLO|Arch Capital Group Ltd. Depositary Shares Each Representing 1/1000th Interest in a Share of 5.45% Non-Cumulative Preferred Shares Series F|NASDAQ
ACI|Albertsons Companies Inc. Class A|NYSE
ACIW|ACI Worldwide Inc.|NASDAQ
ACM|AECOM|NYSE
ACN|Accenture|NYSE
ACT|Enact Holdings Inc.|NASDAQ
ADA-USD|Cardano|Crypto
ADBE|Adobe Inc.|NASDAQ
ADC|Agree Realty Corporation|NYSE
ADI|Analog Devices|NASDAQ
ADM|Archer Daniels Midland|NYSE
ADP|Automatic Data Processing|NASDAQ
ADSK|Autodesk|NASDAQ
ADT|ADT Inc.|NYSE
AEE|Ameren|NYSE
AEG|Aegon Ltd. New York Registry Shares|NYSE
AEIS|Advanced Energy Industries Inc.|NASDAQ
AEM|Agnico Eagle Mines Limited|NYSE
AEP|American Electric Power|NASDAQ
AER|AerCap Holdings N.V.|NYSE
AES|AES Corporation|NYSE
AFG|American Financial Group Inc.|NYSE
AFL|Aflac|NYSE
AFRM|Affirm Holdings Inc. Class A|NASDAQ
AG|First Majestic Silver Corp. Ordinary Shares (Canada)|NYSE
AGCO|AGCO Corporation|NYSE
AGG|iShares Core US Aggregate Bond ETF|ETF
AGI|Alamos Gold Inc. Class A|NYSE
AGNC|AGNC Investment Corp.|NASDAQ
AGNCL|AGNC Investment Corp. Depositary Shares Each Representing a 1/1000th Interest in a Share of 7.75% Series G Fixed-Rate Reset Cumulative Redeemable Preferred Stock|NASDAQ
AGNCM|AGNC Investment Corp. Depositary Shares rep 6.875% Series D Fixed-to-Floating Cumulative Redeemable Preferred Stock|NASDAQ
AGNCN|AGNC Investment Corp. Depositary Shares Each Representing a 1/1000th Interest in a Share of 7.00% Series C Fixed-To-Floating Rate Cumulative Redeemable Preferred Stock|NASDAQ
AGNCO|AGNC Investment Corp. Depositary Shares|NASDAQ
AGNCP|AGNC Investment Corp. Depositary Shares Each Representing a 1/1000th Interest in a Share of 6.125% Series F Fixed-to-Floating Rate Cumulative Redeemable Preferred Stock|NASDAQ
AGNCZ|AGNC Investment Corp. Depositary Shares Each Representing a 1/1000th Interest in a Share of 8.75% Series H Fixed-Rate Cumulative Redeemable Preferred Stock|NASDAQ
AGX|Argan Inc.|NYSE
AHR|American Healthcare REIT Inc.|NYSE
AIG|American International Group|NYSE
AIR|AAR Corp.|NYSE
AIT|Applied Industrial Technologies Inc.|NYSE
AIZ|Assurant|NYSE
AJG|Arthur J. Gallagher & Co.|NYSE
AKAM|Akamai Technologies|NASDAQ
ALAB|Astera Labs Inc.|NASDAQ
ALB|Albemarle Corporation|NYSE
ALC|Alcon Inc.|NYSE
ALGM|Allegro MicroSystems Inc.|NASDAQ
ALGN|Align Technology|NASDAQ
ALGO-USD|Algorand|Crypto
ALHE.TA|Alony Hetz Properties|TASE
ALKS|Alkermes plc|NASDAQ
ALL|Allstate|NYSE
ALLE|Allegion|NYSE
ALLY|Ally Financial Inc.|NYSE
ALM|Almonty Industries Inc.|NASDAQ
ALNY|Alnylam Pharmaceuticals Inc.|NASDAQ
ALSN|Allison Transmission Holdings Inc.|NYSE
ALV|Autoliv Inc.|NYSE
AM|Antero Midstream Corporation|NYSE
AMAT|Applied Materials|NASDAQ
AMCR|Amcor|NYSE
AMD|Advanced Micro Devices|NASDAQ
AME|Ametek|NYSE
AMG|Affiliated Managers Group Inc.|NYSE
AMGN|Amgen|NASDAQ
AMH|American Homes 4 Rent Common Shares of Beneficial Interest|NYSE
AMKR|Amkor Technology Inc.|NASDAQ
AMOT.TA|Amot Investments|TASE
AMP|Ameriprise Financial|NYSE
AMRX|Amneal Pharmaceuticals Inc. Class A|NASDAQ
AMRZ|Amrize Ltd|NYSE
AMT|American Tower|NYSE
AMX|America Movil S.A.B. de C.V.|NYSE
AMZN|Amazon|NASDAQ
AN|AutoNation Inc.|NYSE
ANDG|Andersen Group Inc. Class A|NYSE
ANET|Arista Networks|NYSE
ANF|Abercrombie & Fitch Company|NYSE
AON|Aon plc|NYSE
AOS|A. O. Smith|NYSE
APA|APA Corporation|NASDAQ
APD|Air Products|NYSE
APG|APi Group Corporation|NYSE
APGE|Apogee Therapeutics Inc.|NASDAQ
APH|Amphenol|NYSE
APLD|Applied Digital Corporation|NASDAQ
APO|Apollo Global Management|NYSE
APOS|Apollo Global Management Inc. 7.625% Fixed-Rate Resettable Junior Subordinated Notes due 2053|NYSE
APP|AppLovin|NASDAQ
APPF|AppFolio Inc. Class A|NASDAQ
APT-USD|Aptos|Crypto
APTV|Aptiv|NYSE
AQNB|Algonquin Power & Utilities Corp. 6.20% Fixed-to-Floating Subordinated Notes Series 2019-A due July 1 2079|NYSE
AR|Antero Resources Corporation|NYSE
ARB-USD|Arbitrum|Crypto
ARCC|Ares Capital Corporation|NASDAQ
ARE|Alexandria Real Estate Equities|NYSE
ARES|Ares Management|NYSE
ARGX|argenx SE|NASDAQ
ARKK|ARK Innovation ETF|ETF
ARM|Arm Holdings plc|NASDAQ
ARMK|Aramark|NYSE
AROC|Archrock Inc.|NYSE
ARPT.TA|Airport City|TASE
ARW|Arrow Electronics Inc.|NYSE
ARWR|Arrowhead Pharmaceuticals Inc.|NASDAQ
ARXS|Arxis Inc. Class A|NASDAQ
AS|Amer Sports Inc.|NYSE
ASB|Associated Banc-Corp|NYSE
ASML|ASML Holding N.V. New York Registry Shares|NASDAQ
ASND|Ascendis Pharma A/S|NASDAQ
ASR|Grupo Aeroportuario del Sureste S.A. de C.V.|NYSE
ASTS|AST SpaceMobile Inc. Class A|NASDAQ
ASX|ASE Technology Holding Co. Ltd.|NYSE
ATHS|Athene Holding Ltd. 7.250% Fixed-Rate Reset Junior Subordinated Debentures due 2064|NYSE
ATI|ATI Inc.|NYSE
ATO|Atmos Energy|NYSE
ATOM-USD|Cosmos|Crypto
ATR|AptarGroup Inc.|NYSE
AU|AngloGold Ashanti PLC|NYSE
AUB|Atlantic Union Bankshares Corporation|NYSE
AUGO|Aura Minerals Inc.|NASDAQ
AUR|Aurora Innovation Inc. Class A|NASDAQ
AVAL|Grupo Aval Acciones y Valores S.A. ADR (Each|NYSE
AVAV|AeroVironment Inc.|NASDAQ
AVAX-USD|Avalanche|Crypto
AVGO|Broadcom|NASDAQ
AVT|Avnet Inc.|NASDAQ
AVTR|Avantor Inc.|NYSE
AVY|Avery Dennison|NYSE
AWI|Armstrong World Industries Inc|NYSE
AWK|American Water Works|NYSE
AX|Axos Financial Inc.|NYSE
AXON|Axon Enterprise|NASDAQ
AXP|American Express|NYSE
AXS|Axis Capital Holdings Limited|NYSE
AXSM|Axsome Therapeutics Inc.|NASDAQ
AXTA|Axalta Coating Systems Ltd.|NYSE
AYI|Acuity Inc.|NYSE
AZN|AstraZeneca PLC|NYSE
AZO|AutoZone|NYSE
AZRG.TA|Azrieli Group|TASE
B|Barrick Mining Corporation|NYSE
BA|Boeing|NYSE
BABA|Alibaba Group Holding Limited|NYSE
BAC|Bank of America|NYSE
BAH|Booz Allen Hamilton Holding Corporation|NYSE
BALL|Ball Corporation|NYSE
BAM|Brookfield Asset Management Inc Class A Limited Voting Shares|NYSE
BAP|Credicorp Ltd.|NYSE
BAX|Baxter International|NYSE
BBD|Banco Bradesco Sa|NYSE
BBDO|Banco Bradesco Sa|NYSE
BBIO|BridgeBio Pharma Inc.|NASDAQ
BBUC|Brookfield Business Corporation Class A Subordinate Voting Shares|NYSE
BBVA|Banco Bilbao Vizcaya Argentaria S.A.|NYSE
BBY|Best Buy|NYSE
BCE|BCE Inc.|NYSE
BCH|Banco De Chile ADS|NYSE
BCH-USD|Bitcoin Cash|Crypto
BCPC|Balchem Corporation|NASDAQ
BCS|Barclays PLC|NYSE
BDX|Becton Dickinson|NYSE
BE|Bloom Energy Corporation Class A|NYSE
BEKE|KE Holdings Inc|NYSE
BEN|Franklin Resources|NYSE
BEP|Brookfield Renewable Partners L.P. Limited Partnership Units|NYSE
BEPC|Brookfield Renewable Corporation Brookfield Renewable Corporation Class A Subordinate Voting Shares|NYSE
BEPJ|Brookfield BRP Holdings (Canada) Inc. 7.250% Perpetual Subordinated Notes|NYSE
BEZQ.TA|Bezeq|TASE
BF-B|Brown–Forman|NYSE
BG|Bunge Global|NYSE
BGC|BGC Group Inc. Class A|NASDAQ
BHP|BHP Group Limited|NYSE
BIDU|Baidu Inc. ADS|NASDAQ
BIG.TA|Big Shopping Centers|TASE
BIIB|Biogen|NASDAQ
BIL|SPDR Bloomberg 1-3 Month T-Bill ETF|ETF
BILI|Bilibili Inc.|NASDAQ
BIO|Bio-Rad Laboratories Inc. Class A|NYSE
BIP|Brookfield Infrastructure Partners LP Limited Partnership Units|NYSE
BIPH|Brookfield Infrastructure Corporation 5.000% Subordinated Notes due 2081|NYSE
BIPJ|Brookfield Infrastructure Corporation 7.250% Subordinated Notes due 2084|NYSE
BIRK|Birkenstock Holding plc|NYSE
BJ|BJ's Wholesale Club Holdings Inc.|NYSE
BKH|Black Hills Corporation|NYSE
BKNG|Booking Holdings|NASDAQ
BKR|Baker Hughes|NASDAQ
BLCO|Bausch + Lomb Corporation|NYSE
BLDR|Builders FirstSource|NYSE
BLK|BlackRock|NYSE
BLSH|Bullish|NYSE
BLTE|Belite Bio Inc|NASDAQ
BMA|Banco Macro S.A. ADR (representing Ten Class B Common Shares)|NYSE
BMNP|BitMine Immersion Technologies Inc. 9.5% Series A Perpetual Preferred Stock|NYSE
BMNR|BitMine Immersion Technologies Inc.|NYSE
BMO|Bank Of Montreal|NYSE
BMRN|BioMarin Pharmaceutical Inc.|NASDAQ
BMY|Bristol Myers Squibb|NYSE
BN|Brookfield Corporation Class A Limited Voting Shares|NYSE
BNB-USD|BNB|Crypto
BND|Vanguard Total Bond Market ETF|ETF
BNDX|Vanguard Total International Bond ETF|ETF
BNH|Brookfield Finance Inc. 4.625% Subordinated Notes due October 16 2080|NYSE
BNJ|Brookfield Finance Inc. 4.50% Perpetual Subordinated Notes|NYSE
BNS|Bank Nova Scotia Halifax Pfd 3|NYSE
BNT|Brookfield Wealth Solutions Ltd. Class A Exchangeable Limited Voting Shares|NYSE
BNTX|BioNTech SE|NASDAQ
BNY|BNY Mellon|NYSE
BOKF|BOK Financial Corporation|NASDAQ
BP|BP p.l.c.|NYSE
BPOP|Popular Inc.|NASDAQ
BPYPM|Brookfield Property Partners L.P. 6.25% Class A Cumulative Redeemable Preferred Units Series 1|NASDAQ
BPYPN|Brookfield Property Partners L.P. 5.750% Class A Cumulative Redeemable Perpetual Preferred Units Series 3|NASDAQ
BPYPO|Brookfield Property Partners L.P. 6.375% Class A Cumulative Redeemable Perpetual Preferred Units Series 2|NASDAQ
BPYPP|Brookfield Property Partners L.P. 6.50% Class A Cumulative Redeemable Perpetual Preferred Units|NASDAQ
BR|Broadridge Financial Solutions|NYSE
BRK-A|Berkshire Hathaway Inc.|NYSE
BRK-B|Berkshire Hathaway|NYSE
BRKR|Bruker Corporation|NASDAQ
BRKRP|Bruker Corporation 6.375% Mandatory Convertible Preferred Stock Series A|NASDAQ
BRO|Brown & Brown|NYSE
BROS|Dutch Bros Inc. Class A|NYSE
BRX|Brixmor Property Group Inc.|NYSE
BSAC|Banco Santander - Chile ADS|NYSE
BSBR|Banco Santander Brasil SA|NYSE
BSP|Bending Spoons S.p.A.|NASDAQ
BSX|Boston Scientific|NYSE
BSY|Bentley Systems Incorporated Class B|NASDAQ
BTC-USD|Bitcoin|Crypto
BTG|B2Gold Corp Common shares (Canada)|NYSE American
BTI|British American Tobacco Industries p.l.c. Common Stock ADR|NYSE
BTSG|BrightSpring Health Services Inc.|NASDAQ
BTSGU|BrightSpring Health Services Inc. Tangible Equity Unit|NASDAQ
BUD|Anheuser-Busch Inbev SA Sponsored ADR (Belgium)|NYSE
BULL|Webull Corporation Class A|NASDAQ
BURL|Burlington Stores Inc.|NYSE
BVN|Buenaventura Mining Company Inc.|NYSE
BWA|BorgWarner Inc.|NYSE
BWXT|BWX Technologies Inc.|NYSE
BX|Blackstone Inc.|NYSE
BXP|BXP, Inc.|NYSE
BYD|Boyd Gaming Corporation|NYSE
BZ|KANZHUN LIMITED American Depository Shares|NASDAQ
C|Citigroup|NYSE
CACC|Credit Acceptance Corporation|NASDAQ
CACI|CACI International Inc. Class A|NYSE
CAE|CAE Inc.|NASDAQ
CAG|ConAgra Brands Inc.|NYSE
CAH|Cardinal Health|NYSE
CAI|Caris Life Sciences Inc.|NASDAQ
CAKE|Cheesecake Factory Incorporated|NASDAQ
CAMT|Camtek Ltd.|NASDAQ
CAMT.TA|Camtek|TASE
CARR|Carrier Global|NYSE
CART|Maplebear Inc.|NASDAQ
CASY|Casey's|NASDAQ
CAT|Caterpillar Inc.|NYSE
CAVA|CAVA Group Inc.|NYSE
CB|Chubb Limited|NYSE
CBC|Central Bancompany Inc. Class A|NASDAQ
CBOE|Cboe Global Markets|NYSE
CBRE|CBRE Group|NYSE
CBRS|Cerebras Systems Inc. Class A|NASDAQ
CBSH|Commerce Bancshares Inc.|NASDAQ
CCEP|Coca-Cola Europacific Partners plc|NASDAQ
CCI|Crown Castle|NYSE
CCJ|Cameco Corporation|NYSE
CCK|Crown Holdings Inc.|NYSE
CCL|Carnival Corporation|NYSE
CCZ|Comcast Holdings ZONES|NYSE
CDE|Coeur Mining Inc.|NYSE
CDNS|Cadence Design Systems|NASDAQ
CDW|CDW Corporation|NASDAQ
CEG|Constellation Energy|NASDAQ
CELH|Celsius Holdings Inc.|NASDAQ
CET|Central Securities Corporation|NYSE American
CF|CF Industries|NYSE
CFG|Citizens Financial Group|NYSE
CFR|Cullen/Frost Bankers Inc.|NYSE
CG|The Carlyle Group Inc.|NASDAQ
CGABL|The Carlyle Group Inc. 4.625% Subordinated Notes due 2061|NASDAQ
CGNX|Cognex Corporation|NASDAQ
CGON|CG Oncology Inc. Common stock|NASDAQ
CHD|Church & Dwight|NYSE
CHDN|Churchill Downs Incorporated|NASDAQ
CHE|Chemed Corp|NYSE
CHKP|Check Point Software Technologies Ltd.|NASDAQ
CHRD|Chord Energy Corporation|NASDAQ
CHRW|C.H. Robinson|NASDAQ
CHT|Chunghwa Telecom Co. Ltd.|NYSE
CHTR|Charter Communications|NASDAQ
CHWY|Chewy Inc. Class A|NYSE
CHYM|Chime Financial Inc. Class A|NASDAQ
CI|Cigna|NYSE
CIB|Grupo Cibest S.A.|NYSE
CIEN|Ciena|NYSE
CIFR|Cipher Digital Inc.|NASDAQ
CIG|Comp En De Mn Cemig ADS|NYSE
CIGI|Colliers International Group Inc. Subordinate Voting Shares|NASDAQ
CINF|Cincinnati Financial|NASDAQ
CL|Colgate-Palmolive|NYSE
CLF|Cleveland-Cliffs Inc.|NYSE
CLH|Clean Harbors Inc.|NYSE
CLIS.TA|Clal Insurance|TASE
CLS|Celestica Inc.|NYSE
CLX|Clorox|NYSE
CM|Canadian Imperial Bank of Commerce|NYSE
CMBT|CMB.TECH NV|NYSE
CMC|Commercial Metals Company|NYSE
CMCSA|Comcast|NASDAQ
CME|CME Group|NASDAQ
CMG|Chipotle Mexican Grill|NYSE
CMI|Cummins|NYSE
CMS|CMS Energy|NYSE
CMSA|CMS Energy Corporation 5.625% Junior Subordinated Notes due 2078|NYSE
CMSC|CMS Energy Corporation 5.875% Junior Subordinated Notes due 2078|NYSE
CMSD|CMS Energy Corporation 5.875% Junior Subordinated Notes due 2079|NYSE
CNA|CNA Financial Corporation|NYSE
CNC|Centene Corporation|NYSE
CNH|CNH Industrial N.V.|NYSE
CNI|Canadian National Railway Company|NYSE
CNM|Core & Main Inc. Class A|NYSE
CNO|CNO Financial Group Inc.|NYSE
CNP|CenterPoint Energy|NYSE
CNQ|Canadian Natural Resources Limited|NYSE
CNX|CNX Resources Corporation|NYSE
COF|Capital One|NYSE
COGT|Cogent Biosciences Inc.|NASDAQ
COHR|Coherent Corp.|NYSE
COIN|Coinbase|NASDAQ
COKE|Coca-Cola Consolidated Inc.|NASDAQ
COLB|Columbia Banking System Inc.|NASDAQ
COMP|Compass Inc. Class A|NYSE
COO|Cooper Companies|NASDAQ
COP|ConocoPhillips|NYSE
COR|Cencora|NYSE
CORT|Corcept Therapeutics Incorporated|NASDAQ
CORZ|Core Scientific Inc.|NASDAQ
CORZZ|Core Scientific Inc. Tranche 2 Warrants|NASDAQ
COST|Costco|NASDAQ
CP|Canadian Pacific Kansas City Limited|NYSE
CPA|Copa Holdings S.A. Class A|NYSE
CPAY|Corpay|NYSE
CPB|The Campbell's Company|NASDAQ
CPNG|Coupang Inc. Class A|NYSE
CPRT|Copart|NASDAQ
CPT|Camden Property Trust|NYSE
CQP|Cheniere Energy Partners LP|NYSE
CR|Crane Company|NYSE
CRBG|Corebridge Financial Inc.|NYSE
CRCL|Circle Internet Group Inc. Class A|NYSE
CRDO|Credo Technology Group Holding Ltd|NASDAQ
CRH|CRH plc|NYSE
CRL|Charles River Laboratories|NYSE
CRM|Salesforce|NYSE
CROX|Crocs Inc.|NASDAQ
CRS|Carpenter Technology Corporation|NYSE
CRSP|CRISPR Therapeutics AG|NASDAQ
CRUS|Cirrus Logic Inc.|NASDAQ
CRWD|CrowdStrike|NASDAQ
CRWV|CoreWeave Inc. Class A|NASDAQ
CSCO|Cisco|NASDAQ
CSGP|CoStar Group|NASDAQ
CSL|Carlisle Companies Incorporated|NYSE
CSX|CSX Corporation|NASDAQ
CTAS|Cintas|NASDAQ
CTRE|CareTrust REIT Inc.|NYSE
CTSH|Cognizant|NASDAQ
CTVA|Corteva|NYSE
CUBE|CubeSmart|NYSE
CVE|Cenovus Energy Inc|NYSE
CVLT|Commvault Systems Inc.|NASDAQ
CVNA|Carvana|NYSE
CVS|CVS Health|NYSE
CVX|Chevron Corporation|NYSE
CW|Curtiss-Wright Corporation|NYSE
CWEN|Clearway Energy Inc. Class C|NYSE
CWST|Casella Waste Systems Inc. Class A|NASDAQ
CX|Cemex S.A.B. de C.V. Sponsored ADR|NYSE
CYTK|Cytokinetics Incorporated|NASDAQ
CZR|Caesars Entertainment Inc.|NASDAQ
D|Dominion Energy|NYSE
DAL|Delta Air Lines|NYSE
DAR|Darling Ingredients Inc.|NYSE
DASH|DoorDash|NASDAQ
DB|Deutsche Bank AG|NYSE
DBC|Invesco DB Commodity Index Fund|ETF
DBX|Dropbox Inc. Class A|NASDAQ
DCI|Donaldson Company Inc.|NYSE
DD|DuPont|NYSE
DDOG|Datadog|NASDAQ
DDS|Dillard's Inc.|NYSE
DE|Deere & Company|NYSE
DECK|Deckers Brands|NYSE
DELL|Dell Technologies|NYSE
DELT.TA|Delta Galil Industries|TASE
DEO|Diageo plc|NYSE
DFTX|Definium Therapeutics Inc.|NASDAQ
DG|Dollar General|NYSE
DGX|Quest Diagnostics|NYSE
DHI|D. R. Horton|NYSE
DHR|Danaher Corporation|NYSE
DIA|SPDR Dow Jones Industrial Average ETF|ETF
DINO|HF Sinclair Corporation|NYSE
DIS|Walt Disney Company|NYSE
DKNG|DraftKings Inc. Class A|NASDAQ
DKS|Dick's Sporting Goods Inc|NYSE
DLB|Dolby Laboratories|NYSE
DLR|Digital Realty|NYSE
DLTR|Dollar Tree|NASDAQ
DNTH|Dianthus Therapeutics Inc.|NASDAQ
DOC|Healthpeak Properties|NYSE
DOCN|DigitalOcean Holdings Inc.|NYSE
DOCU|DocuSign Inc.|NASDAQ
DOGE-USD|Dogecoin|Crypto
DOT-USD|Polkadot|Crypto
DOV|Dover Corporation|NYSE
DOW|Dow Inc.|NYSE
DOX|Amdocs Limited|NASDAQ
DPC|DPC Holdings PLC|NYSE
DPZ|Domino's|NASDAQ
DRI|Darden Restaurants|NYSE
DRS|Leonardo DRS Inc.|NASDAQ
DSCT.TA|Israel Discount Bank|TASE
DSGX|Descartes Systems Group Inc.|NASDAQ
DT|Dynatrace Inc.|NYSE
DTE|DTE Energy|NYSE
DTM|DT Midstream Inc.|NYSE
DUK|Duke Energy|NYSE
DUKB|Duke Energy Corporation 5.625% Junior Subordinated Debentures due 2078|NYSE
DUOL|Duolingo Inc. Class A|NASDAQ
DVA|DaVita|NYSE
DVN|Devon Energy|NYSE
DVY|iShares Select Dividend ETF|ETF
DXCM|Dexcom|NASDAQ
DY|Dycom Industries Inc.|NYSE
E|ENI S.p.A.|NYSE
EAI|Entergy Arkansas LLC First Mortgage Bonds 4.875% Series Due September 1 2066|NYSE
EAT|Brinker International Inc.|NYSE
EBAY|eBay Inc.|NASDAQ
EBC|Eastern Bankshares Inc.|NASDAQ
EC|Ecopetrol S.A.|NYSE
ECG|Everus Construction Group Inc.|NYSE
ECHO|EchoStar|NASDAQ
ECL|Ecolab|NYSE
ED|Consolidated Edison|NYSE
EDU|New Oriental Education & Technology Group Inc. Sponsored ADR|NYSE
EEM|iShares MSCI Emerging Markets ETF|ETF
EFA|iShares MSCI EAFE ETF|ETF
EFX|Equifax|NYSE
EG|Everest Group|NYSE
EHC|Encompass Health Corporation|NYSE
EIS|iShares MSCI Israel ETF|ETF
EIX|Edison International|NYSE
EL|Estée Lauder Companies|NYSE
ELAL.TA|El Al Israel Airlines|TASE
ELAN|Elanco Animal Health Incorporated|NYSE
ELF|e.l.f. Beauty Inc.|NYSE
ELPC|Companhia Paranaense de Energia (COPEL)|NYSE
ELS|Equity Lifestyle Properties Inc.|NYSE
ELTR.TA|Electra|TASE
ELV|Elevance Health|NYSE
EMA|Emera Incorporated|NYSE
EMBJ|Embraer S.A.|NYSE
EME|Emcor|NYSE
EMN|Eastman Chemical Company|NYSE
EMP|Entergy Mississippi LLC First Mortgage Bonds 4.90% Series Due October 1 2066|NYSE
EMR|Emerson Electric|NYSE
ENB|Enbridge Inc|NYSE
ENIC|Enel Chile S.A.|NYSE
ENJ|Entergy New Orleans LLC First Mortgage Bonds 5.0% Series due December 1 2052|NYSE
ENLT|Enlight Renewable Energy Ltd.|NASDAQ
ENLT.TA|Enlight Renewable Energy|TASE
ENOG.TA|Energean|TASE
ENS|EnerSys|NYSE
ENSG|The Ensign Group Inc.|NASDAQ
ENTG|Entegris Inc.|NASDAQ
ENVA|Enova International Inc.|NYSE
EOG|EOG Resources|NYSE
EPAM|EPAM Systems Inc.|NYSE
EPD|Enterprise Products Partners L.P.|NYSE
EPRT|Essential Properties Realty Trust Inc.|NYSE
EQH|Equitable Holdings Inc.|NYSE
EQIX|Equinix|NASDAQ
EQNR|Equinor ASA|NYSE
EQT|EQT Corporation|NYSE
EQX|Equinox Gold Corp.|NYSE American
ERAS|Erasca Inc.|NASDAQ
ERIC|Ericsson|NASDAQ
ERIE|Erie Indemnity|NASDAQ
ES|Eversource Energy|NYSE
ESE|ESCO Technologies Inc.|NYSE
ESI|Element Solutions Inc.|NYSE
ESLT|Elbit Systems Ltd.|NASDAQ
ESLT.TA|Elbit Systems|TASE
ESNT|Essent Group Ltd.|NYSE
ESS|Essex Property Trust|NYSE
ESTC|Elastic N.V.|NYSE
ET|Energy Transfer LP|NYSE
ETC-USD|Ethereum Classic|Crypto
ETH-USD|Ethereum|Crypto
ETHA|iShares Ethereum Trust|ETF
ETN|Eaton Corporation|NYSE
ETR|Entergy|NYSE
ETSY|Etsy Inc.|NYSE
EVR|Evercore Inc. Class A|NYSE
EVRG|Evergy|NASDAQ
EW|Edwards Lifesciences|NYSE
EWBC|East West Bancorp Inc.|NASDAQ
EWG|iShares MSCI Germany ETF|ETF
EWJ|iShares MSCI Japan ETF|ETF
EWU|iShares MSCI United Kingdom ETF|ETF
EXC|Exelon|NASDAQ
EXE|Expand Energy|NASDAQ
EXEL|Exelixis Inc.|NASDAQ
EXLS|ExlService Holdings Inc.|NASDAQ
EXP|Eagle Materials Inc|NYSE
EXPD|Expeditors International|NYSE
EXPE|Expedia Group|NASDAQ
EXR|Extra Space Storage|NYSE
F|Ford Motor Company|NYSE
FAF|First American Corporation (New)|NYSE
FANG|Diamondback Energy|NASDAQ
FAST|Fastenal|NASDAQ
FBIN|Fortune Brands Innovations Inc.|NYSE
FBTC|Fidelity Wise Origin Bitcoin Fund|ETF
FCFS|FirstCash Holdings Inc.|NASDAQ
FCNCA|First Citizens BancShares Inc. Class A|NASDAQ
FCX|Freeport-McMoRan|NYSE
FDS|FactSet|NYSE
FDX|FedEx|NYSE
FDXF|FedEx Freight|NYSE
FE|FirstEnergy|NYSE
FER|Ferrovial N.V.|NASDAQ
FERG|Ferguson Enterprises|NYSE
FFIV|F5, Inc.|NASDAQ
FHN|First Horizon Corporation|NYSE
FIBI.TA|First International Bank of Israel|TASE
FICO|Fair Isaac|NYSE
FIG|Figma Inc. Class A|NYSE
FIGR|Figure Technology Solutions Inc. Class A|NASDAQ
FIL-USD|Filecoin|Crypto
FIS|Fidelity National Information Services|NYSE
FISV|Fiserv|NASDAQ
FITB|Fifth Third Bancorp|NYSE
FIVE|Five Below Inc.|NASDAQ
FIX|Comfort Systems USA|NYSE
FLEX|Flex Ltd.|NASDAQ
FLG|Flagstar Bank N.A.|NYSE
FLR|Fluor Corporation|NYSE
FLS|Flowserve Corporation|NYSE
FLUT|Flutter Entertainment plc|NYSE
FMS|Fresenius Medical Care AG|NYSE
FMX|Fomento Economico Mexicano S.A.B. de C.V.|NYSE
FN|Fabrinet|NYSE
FNB|F.N.B. Corporation|NYSE
FND|Floor & Decor Holdings Inc.|NYSE
FNF|Fidelity National Financial Inc.|NYSE
FNV|Franco-Nevada Corporation|NYSE
FORM|FormFactor Inc. FormFactor Inc.|NASDAQ
FOX|Fox Corporation (Class B)|NASDAQ
FOXA|Fox Corporation (Class A)|NASDAQ
FPS|Forgent Power Solutions Inc. Class A|NYSE
FR|First Industrial Realty Trust Inc.|NYSE
FRHC|Freedom Holding Corp.|NASDAQ
FRO|Frontline Plc|NYSE
FROG|JFrog Ltd.|NASDAQ
FRT|Federal Realty Investment Trust|NYSE
FRVO|Fervo Energy Company Class A common stock|NASDAQ
FSLR|First Solar|NASDAQ
FSS|Federal Signal Corporation|NYSE
FSV|FirstService Corporation|NASDAQ
FTAI|FTAI Aviation Ltd.|NASDAQ
FTDR|Frontdoor Inc.|NASDAQ
FTI|TechnipFMC plc|NYSE
FTNT|Fortinet|NASDAQ
FTS|Fortis Inc.|NYSE
FTV|Fortive|NYSE
FUTU|Futu Holdings Limited|NASDAQ
FWONA|Liberty Media Corporation Series A Liberty Formula One|NASDAQ
FWONK|Liberty Media Corporation Series C Liberty Formula One|NASDAQ
G|Genpact Limited|NYSE
GAP|Gap Inc.|NYSE
GATX|GATX Corporation|NYSE
GBCI|Glacier Bancorp Inc.|NYSE
GD|General Dynamics|NYSE
GDDY|GoDaddy|NYSE
GDS|GDS Holdings Limited ADS|NASDAQ
GDX|VanEck Gold Miners ETF|ETF
GE|GE Aerospace|NYSE
GEHC|GE HealthCare|NASDAQ
GEN|Gen Digital|NASDAQ
GEV|GE Vernova|NYSE
GFI|Gold Fields Limited|NYSE
GFL|GFL Environmental Inc. Subordinate voting shares no par value|NYSE
GFS|GlobalFoundries Inc.|NASDAQ
GGAL|Grupo Financiero Galicia S.A.|NASDAQ
GGB|Gerdau S.A.|NYSE
GGG|Graco Inc.|NYSE
GH|Guardant Health Inc.|NASDAQ
GIB|CGI Inc.|NYSE
GIL|Gildan Activewear Inc. Class A Sub. Vot.|NYSE
GILD|Gilead Sciences|NASDAQ
GIS|General Mills|NYSE
GJS|Goldman Sachs Group Securities STRATS Trust for Goldman Sachs Group Securities Series 2006-2|NYSE
GKOS|Glaukos Corporation|NYSE
GL|Globe Life|NYSE
GLBE|Global-E Online Ltd.|NASDAQ
GLD|SPDR Gold Shares|ETF
GLNG|Golar Lng Ltd|NASDAQ
GLPI|Gaming and Leisure Properties Inc.|NASDAQ
GLW|Corning Inc.|NYSE
GLXY|Galaxy Digital Inc. Class A|NASDAQ
GM|General Motors|NYSE
GME|GameStop Corporation|NYSE
GMED|Globus Medical Inc. Class A|NYSE
GNRC|Generac|NYSE
GOLF|Acushnet Holdings Corp.|NYSE
GOOG|Alphabet Inc. (Class C)|NASDAQ
GOOGL|Alphabet Inc. (Class A)|NASDAQ
GOOGM|Alphabet Inc. Depositary Shares|NASDAQ
GOOGN|Alphabet Inc. Depositary Shares|NASDAQ
GPC|Genuine Parts Company|NYSE
GPN|Global Payments|NYSE
GRAB|Grab Holdings Limited Class A|NASDAQ
GRFS|Grifols S.A.|NASDAQ
GRMN|Garmin|NYSE
GS|Goldman Sachs|NYSE
GSAT|Globalstar Inc.|NASDAQ
GSK|GSK plc|NYSE
GTES|Gates Industrial Corporation Ltd.|NYSE
GTLB|GitLab Inc. Class A|NASDAQ
GTX|Garrett Motion Inc.|NASDAQ
GVA|Granite Construction Incorporated|NYSE
GWRE|Guidewire Software Inc.|NYSE
GWW|W. W. Grainger|NYSE
GXO|GXO Logistics Inc.|NYSE
H|Hyatt Hotels Corporation Class A|NYSE
HAL|Halliburton|NYSE
HALO|Halozyme Therapeutics Inc.|NASDAQ
HARL.TA|Harel Insurance Investments|TASE
HAS|Hasbro|NASDAQ
HASI|HA Sustainable Infrastructure Capital Inc.|NYSE
HBAN|Huntington Bancshares|NASDAQ
HBANL|Huntington Bancshares Incorporated Depositary Shares Each Representing a 1/40th Interest in a Share of 6.875% Series J Non-Cumulative Perpetual Preferred Stock|NASDAQ
HBANM|Huntington Bancshares Incorporated Depositary Shares|NASDAQ
HBANP|Huntington Bancshares Incorporated Depositary Shares 4.500% Series H Non-Cumulative Perpetual Preferred Stock|NASDAQ
HBANZ|Huntington Bancshares Incorporated Depositary Shares Each Representing a 1/1000th Interest in a Share of 5.50% Series L Non-Cumulative Perpetual Preferred Stock|NASDAQ
HBM|Hudbay Minerals Inc. Ordinary Shares (Canada)|NYSE
HCA|HCA Healthcare|NYSE
HCC|Warrior Met Coal Inc.|NYSE
HD|Home Depot|NYSE
HDB|HDFC Bank Limited|NYSE
HEI|Heico Corporation|NYSE
HESM|Hess Midstream LP Class A Representing Limited Partner Interests|NYSE
HIG|Hartford|NYSE
HII|Huntington Ingalls Industries|NYSE
HIMS|Hims & Hers Health Inc. Class A|NYSE
HL|Hecla Mining Company|NYSE
HLI|Houlihan Lokey Inc. Class A|NYSE
HLN|Haleon plc|NYSE
HLNE|Hamilton Lane Incorporated Class A|NASDAQ
HLT|Hilton Worldwide|NYSE
HMC|Honda Motor Company Ltd.|NYSE
HMY|Harmony Gold Mining Company Limited|NYSE
HNGE|Hinge Health Inc. Class A|NYSE
HOMB|Home BancShares Inc.|NYSE
HON|Honeywell Technologies|NASDAQ
HONA|Honeywell Aerospace|NASDAQ
HOOD|Robinhood Markets|NASDAQ
HPE|Hewlett Packard Enterprise|NYSE
HPQ|HP Inc.|NYSE
HQY|HealthEquity Inc.|NASDAQ
HR|Healthcare Realty Trust Incorporated|NYSE
HRB|H&R Block Inc.|NYSE
HRL|Hormel Foods|NYSE
HSBC|HSBC Holdings plc.|NYSE
HSIC|Henry Schein|NASDAQ
HST|Host Hotels & Resorts|NASDAQ
HSY|Hershey Company|NYSE
HTHT|H World Group Limited|NASDAQ
HUBB|Hubbell Incorporated|NYSE
HUBS|HubSpot Inc.|NYSE
HUM|Humana|NYSE
HUT|Hut 8 Corp.|NASDAQ
HWC|Hancock Whitney Corporation|NASDAQ
HWM|Howmet Aerospace|NYSE
HXL|Hexcel Corporation|NYSE
HYG|iShares High Yield Corporate Bond ETF|ETF
IAG|Iamgold Corporation|NYSE
IAU|iShares Gold Trust|ETF
IBIT|iShares Bitcoin Trust|ETF
IBKR|Interactive Brokers|NASDAQ
IBM|IBM|NYSE
IBN|ICICI Bank Limited|NYSE
IBP|Installed Building Products Inc.|NYSE
IBRX|ImmunityBio Inc.|NASDAQ
ICE|Intercontinental Exchange|NYSE
ICL|ICL Group Ltd.|NYSE
ICL.TA|ICL Group|TASE
ICLR|ICON plc|NASDAQ
IDA|IDACORP Inc.|NYSE
IDCC|InterDigital Inc.|NASDAQ
IDXX|Idexx Laboratories|NASDAQ
IEF|iShares 7-10 Year Treasury Bond ETF|ETF
IEFA|iShares Core MSCI EAFE ETF|ETF
IEMG|iShares Core MSCI Emerging Markets ETF|ETF
IESC|IES Holdings Inc.|NASDAQ
IEX|IDEX Corporation|NYSE
IFF|International Flavors & Fragrances|NYSE
IFS|Intercorp Financial Services Inc.|NYSE
IHG|Intercontinental Hotels Group|NYSE
ILMN|Illumina Inc.|NASDAQ
IMO|Imperial Oil Limited|NYSE American
IMVT|Immunovant Inc.|NASDAQ
INCY|Incyte|NASDAQ
INDA|iShares MSCI India ETF|ETF
INFY|Infosys Limited|NYSE
ING|ING Group N.V.|NYSE
INGM|Ingram Micro Holding Corporation|NYSE
INGR|Ingredion Incorporated|NYSE
INIO|INNIO N.V.|NASDAQ
INSM|Insmed Incorporated|NASDAQ
INSW|International Seaways Inc.|NYSE
INTC|Intel|NASDAQ
INTU|Intuit|NASDAQ
INVH|Invitation Homes|NYSE
IONQ|IonQ Inc.|NYSE
IONS|Ionis Pharmaceuticals Inc.|NASDAQ
IOT|Samsara Inc. Class A|NYSE
IP|International Paper|NYSE
IQV|IQVIA|NYSE
IR|Ingersoll Rand|NYSE
IREN|IREN Limited|NASDAQ
IRM|Iron Mountain|NYSE
ISCD.TA|Isracard|TASE
ISRG|Intuitive Surgical|NASDAQ
IT|Gartner|NYSE
ITOT|iShares Core S&P Total US Stock Market ETF|ETF
ITT|ITT Inc.|NYSE
ITUB|Itau Unibanco Banco Holding SA|NYSE
ITW|Illinois Tool Works|NYSE
IVV|iShares Core S&P 500 ETF|ETF
IVZ|Invesco|NYSE
IWB|iShares Russell 1000 ETF|ETF
IWM|iShares Russell 2000 ETF|ETF
IX|ORIX Corporation|NYSE
J|Jacobs Solutions|NYSE
JAN|Janus Living Inc. Class A-1|NYSE
JAZZ|Jazz Pharmaceuticals plc Common Stock (Ireland)|NASDAQ
JBHT|J.B. Hunt|NASDAQ
JBL|Jabil|NYSE
JBS|JBS N.V. Class A|NYSE
JBTM|JBT Marel Corporation|NYSE
JCI|Johnson Controls|NYSE
JD|JD.com Inc.|NASDAQ
JEF|Jefferies Financial Group Inc.|NYSE
JEPI|JPMorgan Equity Premium Income ETF|ETF
JEPQ|JPMorgan Nasdaq Equity Premium Income ETF|ETF
JHX|James Hardie Industries plc.|NYSE
JKHY|Jack Henry & Associates|NASDAQ
JLL|Jones Lang LaSalle Incorporated|NYSE
JMKE|Jersey Mike's Subs Inc. Class A|NYSE
JNJ|Johnson & Johnson|NYSE
JOBY|Joby Aviation Inc.|NYSE
JPM|JPMorgan Chase|NYSE
JXN|Jackson Financial Inc. Class A|NYSE
KB|KB Financial Group Inc|NYSE
KDP|Keurig Dr Pepper|NASDAQ
KEP|Korea Electric Power Corporation|NYSE
KEX|Kirby Corporation|NYSE
KEY|KeyCorp|NYSE
KEYS|Keysight Technologies|NYSE
KGC|Kinross Gold Corporation|NYSE
KGS|Kodiak Gas Services Inc.|NYSE
KHC|Kraft Heinz|NASDAQ
KIM|Kimco Realty|NYSE
KKR|KKR & Co.|NYSE
KKRS|KKR Group Finance Co. IX LLC 4.625% Subordinated Notes due 2061|NYSE
KLAC|KLA Corporation|NASDAQ
KLAR|Klarna Group plc|NYSE
KMB|Kimberly-Clark|NASDAQ
KMI|Kinder Morgan|NYSE
KMX|CarMax Inc|NYSE
KNSA|Kiniksa Pharmaceuticals International plc Class A|NASDAQ
KNSL|Kinsale Capital Group Inc.|NYSE
KNTK|Kinetik Holdings Inc. Class A|NYSE
KNX|Knight-Swift Transportation Holdings Inc.|NYSE
KO|Coca-Cola Company|NYSE
KOF|Coca Cola Femsa S.A.B. de C.V.|NYSE
KR|Kroger|NYSE
KRG|Kite Realty Group Trust|NYSE
KRMN|Karman Holdings Inc.|NYSE
KRYS|Krystal Biotech Inc.|NASDAQ
KSPI|Joint Stock Company Kaspi.kz American Depository Shares|NASDAQ
KT|KT Corporation|NYSE
KTOS|Kratos Defense & Security Solutions Inc.|NASDAQ
KVUE|Kenvue|NYSE
KVYO|Klaviyo Inc. Series A|NYSE
KYMR|Kymera Therapeutics Inc.|NASDAQ
L|Loews Corporation|NYSE
LAD|Lithia Motors Inc.|NYSE
LAMR|Lamar Advertising Company Class A|NASDAQ
LB|LandBridge Company LLC Class A Shares Representing Limited Liability Company Interests|NYSE
LDOS|Leidos|NYSE
LEA|Lear Corporation|NYSE
LECO|Lincoln Electric Holdings Inc.|NASDAQ
LEN|Lennar|NYSE
LEVI|Levi Strauss & Co Class A|NYSE
LFUS|Littelfuse Inc.|NASDAQ
LGN|Legence Corp. Class A Common stock|NASDAQ
LGND|Ligand Pharmaceuticals Incorporated|NASDAQ
LH|Labcorp|NYSE
LHX|L3Harris|NYSE
LI|Li Auto Inc.|NASDAQ
LII|Lennox International|NYSE
LIN|Linde plc|NASDAQ
LINE|Lineage Inc.|NASDAQ
LINK-USD|Chainlink|Crypto
LITE|Lumentum|NASDAQ
LKQ|LKQ Corporation|NASDAQ
LLY|Lilly (Eli)|NYSE
LLYVA|Liberty Live Holdings Inc. Series A Liberty Live Group|NASDAQ
LLYVK|Liberty Live Holdings Inc. Series C Liberty Live Group|NASDAQ
LMT|Lockheed Martin|NYSE
LNC|Lincoln National Corporation|NYSE
LNG|Cheniere Energy Inc.|NYSE
LNT|Alliant Energy|NASDAQ
LNTH|Lantheus Holdings Inc.|NASDAQ
LOAR|Loar Holdings Inc.|NYSE
LOGI|Logitech International S.A.|NASDAQ
LOW|Lowe's|NYSE
LPLA|LPL Financial Holdings Inc.|NASDAQ
LQD|iShares Investment Grade Corporate Bond ETF|ETF
LQDA|Liquidia Corporation|NASDAQ
LRCX|Lam Research|NASDAQ
LSCC|Lattice Semiconductor Corporation|NASDAQ
LSTR|Landstar System Inc.|NASDAQ
LTC-USD|Litecoin|Crypto
LTH|Life Time Group Holdings Inc.|NYSE
LTM|LATAM Airlines Group S.A.|NYSE
LULU|Lululemon Athletica|NASDAQ
LUMI.TA|Bank Leumi|TASE
LUMN|Lumen Technologies Inc.|NYSE
LUV|Southwest Airlines|NYSE
LVS|Las Vegas Sands|NYSE
LW|Lamb Weston Holdings Inc.|NYSE
LYB|LyondellBasell|NYSE
LYFT|Lyft Inc. Class A|NASDAQ
LYG|Lloyds Banking Group Plc|NYSE
LYV|Live Nation Entertainment|NYSE
M|Macy's Inc|NYSE
MA|Mastercard|NYSE
MAA|Mid-America Apartment Communities|NYSE
MAAS|Maase Inc. Class A|NASDAQ
MAC|Macerich Company|NYSE
MAIN|Main Street Capital Corporation|NYSE
MAIR|Madison Air Solutions Corporation Class A|NYSE
MANH|Manhattan Associates Inc.|NASDAQ
MAR|Marriott International|NASDAQ
MAS|Masco|NYSE
MATIC-USD|Polygon|Crypto
MATX|Matson Inc.|NYSE
MBGL|Mobility Global Inc.|NYSE
MBLY|Mobileye Global Inc. Class A|NASDAQ
MC|Moelis & Company Class A|NYSE
MCD|McDonald's|NYSE
MCHI|iShares MSCI China ETF|ETF
MCHP|Microchip Technology|NASDAQ
MCHPP|Microchip Technology Incorporated Depositary Shares Each Representing a 1/20th Interest in a Share of 7.50% Series A Mandatory Convertible Preferred Stock|NASDAQ
MCK|McKesson Corporation|NYSE
MCO|Moody's Corporation|NYSE
MCY|Mercury General Corporation|NYSE
MDB|MongoDB Inc. Class A|NASDAQ
MDGL|Madrigal Pharmaceuticals Inc.|NASDAQ
MDLN|Medline Inc. Class A|NASDAQ
MDLZ|Mondelez International|NASDAQ
MDT|Medtronic|NYSE
MDY|SPDR S&P MidCap 400 ETF|ETF
MEDP|Medpace Holdings Inc.|NASDAQ
MELI|MercadoLibre Inc.|NASDAQ
MET|MetLife|NYSE
META|Meta Platforms|NASDAQ
MFC|Manulife Financial Corporation|NYSE
MFG|Mizuho Financial Group Inc. Sponosred ADR (Japan)|NYSE
MGA|Magna International Inc.|NYSE
MGDL.TA|Migdal Insurance|TASE
MGM|MGM Resorts|NYSE
MGY|Magnolia Oil & Gas Corporation Class A|NYSE
MHK|Mohawk Industries Inc.|NYSE
MICC|The Magnum Ice Cream Company N.V.|NYSE
MIDD|Middleby Corporation|NASDAQ
MIRM|Mirum Pharmaceuticals Inc.|NASDAQ
MKC|McCormick & Company|NYSE
MKL|Markel Group Inc.|NYSE
MKSI|MKS Inc.|NASDAQ
MKTX|MarketAxess Holdings Inc.|NASDAQ
MLI|Mueller Industries Inc.|NYSE
MLM|Martin Marietta Materials|NYSE
MLSR.TA|Melisron|TASE
MMED|MiniMed Group Inc.|NASDAQ
MMHD.TA|Menora Mivtachim|TASE
MMM|3M|NYSE
MMSI|Merit Medical Systems Inc.|NASDAQ
MMYT|MakeMyTrip Limited|NASDAQ
MNST|Monster Beverage|NASDAQ
MO|Altria|NYSE
MOD|Modine Manufacturing Company|NYSE
MOH|Molina Healthcare Inc|NYSE
MORN|Morningstar Inc.|NASDAQ
MOS|Mosaic Company|NYSE
MP|MP Materials Corp.|NYSE
MPC|Marathon Petroleum|NYSE
MPLX|MPLX LP Common Units Representing Limited Partner Interests|NYSE
MPWR|Monolithic Power Systems|NASDAQ
MRCY|Mercury Systems Inc|NASDAQ
MRK|Merck & Co.|NYSE
MRNA|Moderna|NASDAQ
MRP|Millrose Properties Inc. Class A|NYSE
MRSH|Marsh McLennan|NYSE
MRVL|Marvell Technology|NASDAQ
MRX|Marex Group Limited|NASDAQ
MS|Morgan Stanley|NYSE
MSA|MSA Safety Incorporated|NYSE
MSCI|MSCI|NYSE
MSFT|Microsoft|NASDAQ
MSGS|Madison Square Garden Sports Corp. Class A Common Stock (New)|NYSE
MSI|Motorola Solutions|NYSE
MSM|MSC Industrial Direct Company Inc.|NYSE
MSTR|Strategy Inc|NASDAQ
MT|Arcelor Mittal NY Registry Shares NEW|NYSE
MTB|M&T Bank|NYSE
MTCH|Match Group Inc.|NASDAQ
MTD|Mettler Toledo|NYSE
MTDR|Matador Resources Company|NYSE
MTG|MGIC Investment Corporation|NYSE
MTRN|Materion Corporation|NYSE
MTSI|MACOM Technology Solutions Holdings Inc.|NASDAQ
MTZ|MasTec Inc.|NYSE
MU|Micron Technology|NASDAQ
MUB|iShares National Muni Bond ETF|ETF
MUFG|Mitsubishi UFJ Financial Group Inc.|NYSE
MUR|Murphy Oil Corporation|NYSE
MUSA|Murphy USA Inc.|NYSE
MVNE.TA|Mivne Real Estate|TASE
MXL|MaxLinear Inc.|NASDAQ
MZTF.TA|Mizrahi Tefahot Bank|TASE
NAVN|Navan Inc. Class A|NASDAQ
NBIS|Nebius Group N.V. Class A|NASDAQ
NBIX|Neurocrine Biosciences Inc.|NASDAQ
NCLH|Norwegian Cruise Line Holdings|NYSE
NDAQ|Nasdaq, Inc.|NASDAQ
NDSN|Nordson Corporation|NASDAQ
NE|Noble Corporation plc A|NYSE
NEAR-USD|NEAR Protocol|Crypto
NEE|NextEra Energy|NYSE
NEM|Newmont|NYSE
NET|Cloudflare Inc. Class A|NYSE
NEU|NewMarket Corp|NYSE
NFG|National Fuel Gas Company|NYSE
NFLX|Netflix|NASDAQ
NGG|National Grid Transco PLC National Grid PLC (NEW)|NYSE
NI|NiSource|NYSE
NICE|NICE Ltd|NASDAQ
NICE.TA|NICE|TASE
NIO|NIO Inc. American depositary shares each|NYSE
NIQ|NIQ Global Intelligence plc|NYSE
NJR|NewJersey Resources Corporation|NYSE
NKE|Nike, Inc.|NYSE
NLY|Annaly Capital Management Inc.|NYSE
NMR|Nomura Holdings Inc ADR|NYSE
NNN|NNN REIT Inc.|NYSE
NOC|Northrop Grumman|NYSE
NOK|Nokia Corporation Sponsored|NYSE
NOV|NOV Inc.|NYSE
NOVT|Novanta Inc.|NASDAQ
NOW|ServiceNow|NYSE
NPO|Enpro Inc.|NYSE
NRG|NRG Energy|NYSE
NSC|Norfolk Southern|NYSE
NTAP|NetApp|NASDAQ
NTES|NetEase Inc.|NASDAQ
NTNX|Nutanix Inc. Class A|NASDAQ
NTR|Nutrien Ltd.|NYSE
NTRA|Natera Inc.|NASDAQ
NTRS|Northern Trust|NASDAQ
NTSK|Netskope Inc. Class A|NASDAQ
NU|Nu Holdings Ltd. Class A|NYSE
NUE|Nucor|NYSE
NVDA|Nvidia|NASDAQ
NVMI|Nova Ltd.|NASDAQ
NVMI.TA|Nova|TASE
NVO|Novo Nordisk A/S|NYSE
NVR|NVR, Inc.|NYSE
NVS|Novartis AG|NYSE
NVT|nVent Electric plc|NYSE
NWG|NatWest Group plc|NYSE
NWMD.TA|NewMed Energy|TASE
NWS|News Corp (Class B)|NASDAQ
NWSA|News Corp (Class A)|NASDAQ
NXE|Nexgen Energy Ltd.|NYSE
NXPI|NXP Semiconductors|NASDAQ
NXST|Nexstar Media Group Inc.|NASDAQ
NXT|Nextpower Inc.|NASDAQ
NYT|New York Times Company|NYSE
O|Realty Income|NYSE
OBDC|Blue Owl Capital Corporation|NYSE
OC|Owens Corning Inc Common Stock New|NYSE
OCTV|Octave Intelligence plc Class B|NASDAQ
ODFL|Old Dominion|NASDAQ
OGC|OceanaGold Corporation|NYSE
OGE|OGE Energy Corp|NYSE
OGS|ONE Gas Inc.|NYSE
OHI|Omega Healthcare Investors Inc.|NYSE
OII|Oceaneering International Inc.|NYSE
OKE|Oneok|NYSE
OKLO|Oklo Inc. Class A common stock|NYSE
OKTA|Okta Inc. Class A|NASDAQ
OMC|Omnicom Group|NYSE
OMF|OneMain Holdings Inc.|NYSE
ON|ON Semiconductor|NASDAQ
ONB|Old National Bancorp|NASDAQ
ONBPO|Old National Bancorp Depositary Shares Each Representing a 1/40th Interest in a Share of Series C Preferred Stock|NASDAQ
ONBPP|Old National Bancorp Depositary Shares Each Representing a 1/40th Interest in a Share of Series A Preferred Stock|NASDAQ
ONC|BeOne Medicines Ltd.|NASDAQ
ONON|On Holding AG Class A|NYSE
ONTO|Onto Innovation Inc.|NYSE
OP-USD|Optimism|Crypto
OPCE.TA|OPC Energy|TASE
OR|OR Royalties Inc.|NYSE
ORA|Ormat Technologies Inc.|NYSE
ORA.TA|Ormat Technologies|TASE
ORCL|Oracle Corporation|NYSE
ORI|Old Republic International Corporation|NYSE
ORKA|Oruka Therapeutics Inc.|NASDAQ
ORLY|O'Reilly Automotive|NASDAQ
OSCR|Oscar Health Inc. Class A|NYSE
OSK|Oshkosh Corporation (Holding Company)Common Stock|NYSE
OTEX|Open Text Corporation|NASDAQ
OTF|Blue Owl Technology Finance Corp.|NYSE
OTIS|Otis Worldwide|NYSE
OUT|OUTFRONT Media Inc.|NYSE
OVV|Ovintiv Inc. (DE)|NYSE
OWL|Blue Owl Capital Inc. Class A|NYSE
OXY|Occidental Petroleum|NYSE
OZK|Bank OZK|NASDAQ
P|Everpure Inc. Class A common stock|NYSE
PAA|Plains All American Pipeline L.P. Common Units|NASDAQ
PAAS|Pan American Silver Corp.|NYSE
PAC|Grupo Aeroportuario Del Pacifico S.A. B. de C.V. Grupo Aeroportuario Del Pacifico S.A. de C.V. (each|NYSE
PACS|PACS Group Inc.|NYSE
PAG|Penske Automotive Group Inc.|NYSE
PAGP|Plains GP Holdings L.P. Class A Units|NASDAQ
PANW|Palo Alto Networks|NASDAQ
PATH|UiPath Inc. Class A|NYSE
PAYC|Paycom Software Inc.|NYSE
PAYP|PayPay Corporation American Depository Shares|NASDAQ
PAYX|Paychex|NASDAQ
PB|Prosperity Bancshares Inc.|NYSE
PBA|Pembina Pipeline Corp. Ordinary Shares (Canada)|NYSE
PBF|PBF Energy Inc. Class A|NYSE
PBR|Petroleo Brasileiro S.A. Petrobras ADS|NYSE
PCAR|Paccar|NASDAQ
PCG|PG&E Corporation|NYSE
PCOR|Procore Technologies Inc.|NYSE
PCTY|Paylocity Holding Corporation|NASDAQ
PCVX|Vaxcyte Inc.|NASDAQ
PDD|PDD Holdings Inc.|NASDAQ
PECO|Phillips Edison & Company Inc.|NASDAQ
PEG|Public Service Enterprise Group|NYSE
PEGA|Pegasystems Inc.|NASDAQ
PEN|Penumbra Inc.|NYSE
PEP|PepsiCo|NASDAQ
PFE|Pfizer|NYSE
PFG|Principal Financial Group|NASDAQ
PFGC|Performance Food Group Company|NYSE
PFH|Prudential Financial Inc. 4.125% Junior Subordinated Notes due 2060|NYSE
PG|Procter & Gamble|NYSE
PGR|Progressive Corporation|NYSE
PH|Parker Hannifin|NYSE
PHG|Koninklijke Philips N.V. NY Registry Shares|NYSE
PHM|PulteGroup|NYSE
PHOE.TA|Phoenix Financial|TASE
PI|Impinj Inc.|NASDAQ
PINS|Pinterest Inc. Class A|NYSE
PIPR|Piper Sandler Companies|NYSE
PJT|PJT Partners Inc. Class A|NYSE
PKG|Packaging Corporation of America|NYSE
PKX|POSCO HOLDINGS INC.|NYSE
PL|Planet Labs PBC Class A|NYSE
PLD|Prologis|NYSE
PLTF.TA|Plastro Gvat|TASE
PLTR|Palantir Technologies|NASDAQ
PLXS|Plexus Corp.|NASDAQ
PM|Philip Morris International|NYSE
PNC|PNC Financial Services|NYSE
PNFP|Pinnacle Financial Partners Inc. Common stock|NYSE
PNR|Pentair|NYSE
PNW|Pinnacle West Capital|NYSE
PODD|Insulet Corporation|NASDAQ
POLI.TA|Bank Hapoalim|TASE
POOL|Pool Corporation|NASDAQ
POR|Portland General Electric Co|NYSE
POWL|Powell Industries Inc.|NASDAQ
PPC|Pilgrim's Pride Corporation|NASDAQ
PPG|PPG Industries|NYSE
PPL|PPL Corporation|NYSE
PPLC|PPL Corporation Corporate Units|NYSE
PR|Permian Resources Corporation Class A|NYSE
PRAX|Praxis Precision Medicines Inc.|NASDAQ
PRH|Prudential Financial Inc. 5.950% Junior Subordinated Notes due 2062|NYSE
PRI|Primerica Inc.|NYSE
PRM|Perimeter Solutions SA|NYSE
PRMB|Primo Brands Corporation Class A|NYSE
PRS|Prudential Financial Inc. 5.625% Junior Subordinated Notes due 2058|NYSE
PRU|Prudential Financial|NYSE
PS|Pershing Square Inc.|NYSE
PSA|Public Storage|NYSE
PSKY|Paramount Skydance Corporation|NASDAQ
PSMT|PriceSmart Inc.|NASDAQ
PSO|Pearson Plc|NYSE
PSX|Phillips 66|NYSE
PTC|PTC Inc.|NASDAQ
PTCT|PTC Therapeutics Inc.|NASDAQ
PTGX|Protagonist Therapeutics Inc.|NASDAQ
PUK|Prudential Public Limited Company|NYSE
PWR|Quanta Services|NYSE
PYPL|PayPal|NASDAQ
Q|Qnity Electronics|NYSE
QBTS|D-Wave Quantum Inc.|NASDAQ
QCOM|Qualcomm|NASDAQ
QGEN|Qiagen N.V.|NYSE
QLYS|Qualys Inc.|NASDAQ
QNT|Quantinuum Inc. Class A|NASDAQ
QQQ|Invesco QQQ Trust|ETF
QQQM|Invesco NASDAQ 100 ETF|ETF
QRVO|Qorvo Inc.|NASDAQ
QSR|Restaurant Brands International Inc.|NYSE
QXO|QXO Inc.|NYSE
R|Ryder System Inc.|NYSE
RACE|Ferrari N.V.|NYSE
RAL|Ralliant Corporation|NYSE
RBA|RB Global Inc.|NYSE
RBC|RBC Bearings Incorporated|NYSE
RBLX|Roblox Corporation Class A|NYSE
RBRK|Rubrik Inc. Class A|NYSE
RCI|Rogers Communication Inc.|NYSE
RCL|Royal Caribbean Group|NYSE
RDDT|Reddit|NYSE
RDNT|RadNet Inc.|NASDAQ
RDY|Dr. Reddy's Laboratories Ltd|NYSE
REG|Regency Centers|NASDAQ
REGN|Regeneron Pharmaceuticals|NASDAQ
RELX|RELX PLC PLC|NYSE
RELY|Remitly Global Inc.|NASDAQ
REXR|Rexford Industrial Realty Inc.|NYSE
RF|Regions Financial Corporation|NYSE
RGA|Reinsurance Group of America Incorporated|NYSE
RGEN|Repligen Corporation|NASDAQ
RGLD|Royal Gold Inc.|NASDAQ
RGTI|Rigetti Computing Inc.|NASDAQ
RHP|Ryman Hospitality Properties Inc. (REIT)|NYSE
RIG|Transocean Ltd (Switzerland)|NYSE
RIO|Rio Tinto Plc|NYSE
RIOT|Riot Platforms Inc.|NASDAQ
RITM|Rithm Capital Corp.|NYSE
RIVN|Rivian Automotive Inc. Class A|NASDAQ
RJF|Raymond James Financial|NYSE
RKLB|Rocket Lab Corporation|NASDAQ
RKT|Rocket Companies Inc. Class A|NYSE
RL|Ralph Lauren Corporation|NYSE
RLI|RLI Corp. Common Stock (DE)|NYSE
RMBS|Rambus Inc.|NASDAQ
RMD|ResMed|NYSE
RMLI.TA|Rami Levy Chain Stores|TASE
RNG|RingCentral Inc. Class A|NYSE
RNR|RenaissanceRe Holdings Ltd.|NYSE
ROAD|Construction Partners Inc. Class A|NASDAQ
ROIV|Roivant Sciences Ltd.|NASDAQ
ROK|Rockwell Automation|NYSE
ROKU|Roku Inc. Class A|NASDAQ
ROL|Rollins, Inc.|NYSE
ROP|Roper Technologies|NASDAQ
ROST|Ross Stores|NASDAQ
RPM|RPM International Inc.|NYSE
RPRX|Royalty Pharma plc Class A|NASDAQ
RRC|Range Resources Corporation|NYSE
RRR|Red Rock Resorts Inc. Class A|NASDAQ
RRX|Regal Rexnord Corporation|NYSE
RS|Reliance Inc.|NYSE
RSG|Republic Services|NYSE
RSI|Rush Street Interactive Inc. Class A|NYSE
RSP|Invesco S&P 500 Equal Weight ETF|ETF
RTO|Rentokil Initial plc|NYSE
RTX|RTX Corporation|NYSE
RUSHA|Rush Enterprises Inc. Common Stock Cl A|NASDAQ
RUSHB|Rush Enterprises Inc. Class B|NASDAQ
RVMD|Revolution Medicines Inc.|NASDAQ
RVTY|Revvity|NYSE
RY|Royal Bank Of Canada|NYSE
RYAAY|Ryanair Holdings plc|NASDAQ
RYAN|Ryan Specialty Holdings Inc. Class A|NYSE
RYN|Rayonier Inc. REIT|NYSE
RYTM|Rhythm Pharmaceuticals Inc.|NASDAQ
S|SentinelOne Inc. Class A|NYSE
SAE.TA|Shufersal|TASE
SAIA|Saia Inc.|NASDAQ
SAIC|Science Applications International Corporation|NASDAQ
SAIL|SailPoint Inc.|NASDAQ
SAN|Banco Santander S.A. Sponsored ADR (Spain)|NYSE
SANM|Sanmina Corporation|NASDAQ
SAP|SAP SE ADS|NYSE
SARO|StandardAero Inc.|NYSE
SATA|Strive Inc. Variable Rate Series A Perpetual Preferred Stock|NASDAQ
SBAC|SBA Communications|NASDAQ
SBRA|Sabra Health Care REIT Inc.|NASDAQ
SBS|Companhia de saneamento Basico Do Estado De Sao Paulo - Sabesp|NYSE
SBSW|D/B/A Sibanye-Stillwater Limited ADS|NYSE
SBUX|Starbucks|NASDAQ
SCCO|Southern Copper Corporation|NYSE
SCHD|Schwab US Dividend Equity ETF|ETF
SCHW|Charles Schwab Corporation|NYSE
SCI|Service Corporation International|NYSE
SE|Sea Limited|NYSE
SEIC|SEI Investments Company|NASDAQ
SF|Stifel Financial Corporation|NYSE
SFD|Smithfield Foods Inc.|NASDAQ
SFM|Sprouts Farmers Market Inc.|NASDAQ
SGHC|Super Group (SGHC) Limited|NYSE
SGI|Somnigroup International Inc.|NYSE
SGOV|iShares 0-3 Month Treasury Bond ETF|ETF
SHC|Sotera Health Company|NASDAQ
SHEL|Shell PLC|NYSE
SHG|Shinhan Financial Group Co Ltd|NYSE
SHIB-USD|Shiba Inu|Crypto
SHOP|Shopify Inc. Class A Subordinate Voting Shares|NASDAQ
SHW|Sherwin-Williams|NYSE
SHY|iShares 1-3 Year Treasury Bond ETF|ETF
SIGI|Selective Insurance Group Inc.|NASDAQ
SIMO|Silicon Motion Technology Corporation|NASDAQ
SIRI|SiriusXM Holdings Inc.|NASDAQ
SITM|SiTime Corporation|NASDAQ
SJM|J.M. Smucker Company|NYSE
SKHY|SK hynix Inc.|NASDAQ
SKM|SK Telecom Co. Ltd.|NYSE
SLAB|Silicon Laboratories Inc.|NASDAQ
SLARL.TA|Shapir Engineering|TASE
SLB|Schlumberger|NYSE
SLF|Sun Life Financial Inc.|NYSE
SLMBP|SLM Corporation Floating Rate Non-Cumulative Preferred Stock Series B|NASDAQ
SLV|iShares Silver Trust|ETF
SM|SM Energy Company|NYSE
SMCI|Supermicro|NASDAQ
SMCIP|Super Micro Computer Inc. Depositary Shares|NASDAQ
SMFG|Sumitomo Mitsui Financial Group Inc Unsponsored|NYSE
SMH|VanEck Semiconductor ETF|ETF
SMMT|Summit Therapeutics Inc.|NASDAQ
SMTC|Semtech Corporation|NASDAQ
SN|SharkNinja Inc.|NYSE
SNA|Snap-on|NYSE
SNAP|Snap Inc. Class A|NYSE
SNDK|Sandisk|NASDAQ
SNDR|Schneider National Inc.|NYSE
SNEX|StoneX Group Inc.|NASDAQ
SNN|Smith & Nephew SNATS Inc.|NYSE
SNOW|Snowflake Inc.|NYSE
SNPS|Synopsys|NASDAQ
SNX|TD SYNNEX Corporation|NYSE
SNY|Sanofi ADS|NASDAQ
SO|Southern Company|NYSE
SOBO|South Bow Corporation|NYSE
SOFI|SoFi Technologies Inc.|NASDAQ
SOJC|Southern Company (The) Series 2017B 5.25% Junior Subordinated Notes due December 1 2077|NYSE
SOJD|Southern Company (The) Series 2020A 4.95% Junior Subordinated Notes due January 30 2080|NYSE
SOJE|Southern Company (The) Series 2020C 4.20% Junior Subordinated Notes due October 15 2060|NYSE
SOL-USD|Solana|Crypto
SOLS|Solstice Advanced Materials Inc.|NASDAQ
SOLV|Solventum|NYSE
SOMN|Southern Company (The) 2025 Series A Corporate Units|NYSE
SON|Sonoco Products Company|NYSE
SONY|Sony Group Corporation|NYSE
SOXX|iShares Semiconductor ETF|ETF
SPCX|Space Exploration Technologies Corp. Class A|NASDAQ
SPG|Simon Property Group|NYSE
SPGI|S&P Global|NYSE
SPHR|Sphere Entertainment Co. Class A|NYSE
SPLG|SPDR Portfolio S&P 500 ETF|ETF
SPNS.TA|Sapiens International|TASE
SPOT|Spotify Technology S.A.|NYSE
SPXC|SPX Technologies Inc.|NYSE
SPY|SPDR S&P 500 ETF|ETF
SQM|Sociedad Quimica y Minera S.A.|NYSE
SQQQ|ProShares UltraPro Short QQQ|ETF
SRE|Sempra|NYSE
SREA|DBA Sempra 5.750% Junior Subordinated Notes due 2079|NYSE
SRRK|Scholar Rock Holding Corporation|NASDAQ
SSB|SouthState Bank Corporation|NYSE
SSD|Simpson Manufacturing Company Inc.|NYSE
SSL|Sasol Ltd.|NYSE
SSNC|SS&C Technologies Holdings Inc.|NASDAQ
SSRM|SSR Mining Inc.|NASDAQ
ST|Sensata Technologies Holding plc|NYSE
STAG|Stag Industrial Inc.|NYSE
STE|Steris|NYSE
STEP|StepStone Group Inc. Class A|NASDAQ
STLA|Stellantis N.V.|NYSE
STLD|Steel Dynamics|NASDAQ
STM|STMicroelectronics N.V.|NYSE
STN|Stantec Inc|NYSE
STRC|Strategy Inc Variable Rate Series A Perpetual Stretch Preferred Stock|NASDAQ
STRD|Strategy Inc 10.00% Series A Perpetual Stride Preferred Stock|NASDAQ
STRF|Strategy Inc 10.00% Series A Perpetual Strife Preferred Stock|NASDAQ
STRK|Strategy Inc 8.00% Series A Perpetual Strike Preferred Stock|NASDAQ
STRL|Sterling Infrastructure Inc.|NASDAQ
STRS.TA|Strauss Group|TASE
STT|State Street Corporation|NYSE
STVN|Stevanato Group S.p.A.|NYSE
STWD|STARWOOD PROPERTY TRUST INC. Starwood Property Trust Inc.|NYSE
STX|Seagate Technology|NASDAQ
STZ|Constellation Brands|NYSE
SU|Suncor Energy Inc.|NYSE
SUI|Sun Communities Inc.|NYSE
SUI-USD|Sui|Crypto
SUN|Sunoco LP Common Units|NYSE
SUNB|Sunbelt Rentals Holdings Inc.|NYSE
SUZ|Suzano S.A.|NYSE
SW|Smurfit Westrock|NYSE
SWK|Stanley Black & Decker|NYSE
SWKS|Skyworks Solutions|NASDAQ
SWX|Southwest Gas Holdings Inc. Common Stock (DE)|NYSE
SXT|Sensient Technologies Corporation|NYSE
SYF|Synchrony Financial|NYSE
SYK|Stryker Corporation|NYSE
SYM|Symbotic Inc. Class A|NASDAQ
SYRE|Spyre Therapeutics Inc.|NASDAQ
SYY|Sysco|NYSE
T|AT&T|NYSE
TAK|Takeda Pharmaceutical Company Limited|NYSE
TAL|TAL Education Group|NYSE
TAP|Molson Coors Beverage Company|NYSE
TBB|AT&T Inc. 5.350% Global Notes due 2066|NYSE
TBBB|BBB Foods Inc. Class A|NYSE
TCOM|Trip.com Group Limited|NASDAQ
TD|Toronto Dominion Bank|NYSE
TDG|TransDigm Group|NYSE
TDY|Teledyne Technologies|NYSE
TEAM|Atlassian Corporation Class A|NASDAQ
TECH|Bio-Techne|NASDAQ
TECK|Teck Resources Ltd|NYSE
TEL|TE Connectivity|NYSE
TEM|Tempus AI Inc. Class A|NASDAQ
TEO|Telecom Argentina SA|NYSE
TER|Teradyne|NASDAQ
TEVA|Teva Pharmaceutical Industries Limited|NYSE
TEVA.TA|Teva Pharmaceutical Industries|TASE
TEX|Terex Corporation|NYSE
TFC|Truist Financial|NYSE
TFII|TFI International Inc.|NYSE
TFPM|Triple Flag Precious Metals Corp.|NYSE
TFX|Teleflex Incorporated|NYSE
TGT|Target Corporation|NYSE
TGTX|TG Therapeutics Inc.|NASDAQ
THC|Tenet Healthcare Corporation|NYSE
THG|Hanover Insurance Group Inc|NYSE
TIGO|Millicom International Cellular S.A.|NASDAQ
TIMB|TIM S.A.|NYSE
TIP|iShares TIPS Bond ETF|ETF
TJX|TJX Companies|NYSE
TKO|TKO Group Holdings|NYSE
TKR|Timken Company|NYSE
TLK|PT Telekomunikasi Indonesia Tbk|NYSE
TLN|Talen Energy Corporation|NASDAQ
TLT|iShares 20+ Year Treasury Bond ETF|ETF
TM|Toyota Motor Corporation|NYSE
TME|Tencent Music Entertainment Group|NYSE
TMO|Thermo Fisher Scientific|NYSE
TMUS|T-Mobile US|NASDAQ
TOL|Toll Brothers Inc.|NYSE
TON-USD|Toncoin|Crypto
TOST|Toast Inc. Class A|NYSE
TPG|TPG Inc. Class A|NASDAQ
TPGXL|TPG Operating Group II L.P. 6.950% Fixed-Rate Junior Subordinated Notes due 2064|NASDAQ
TPL|Texas Pacific Land Corporation|NYSE
TPR|Tapestry, Inc.|NYSE
TQQQ|ProShares UltraPro QQQ|ETF
TRGP|Targa Resources|NYSE
TRI|Thomson Reuters Corporation|NASDAQ
TRMB|Trimble Inc.|NASDAQ
TRNO|Terreno Realty Corporation|NYSE
TROW|T. Rowe Price|NASDAQ
TRP|TC Energy Corporation|NYSE
TRU|TransUnion|NYSE
TRV|Travelers Companies|NYSE
TRX-USD|TRON|Crypto
TS|Tenaris S.A.|NYSE
TSCO|Tractor Supply|NASDAQ
TSEM|Tower Semiconductor Ltd.|NASDAQ
TSEM.TA|Tower Semiconductor|TASE
TSLA|Tesla, Inc.|NASDAQ
TSM|Taiwan Semiconductor Manufacturing Company Ltd.|NYSE
TSN|Tyson Foods|NYSE
TT|Trane Technologies|NYSE
TTAN|ServiceTitan Inc. Class A|NASDAQ
TTC|Toro Company|NYSE
TTD|Trade Desk|NASDAQ
TTE|TotalEnergies SE|NYSE
TTEK|Tetra Tech Inc.|NASDAQ
TTMI|TTM Technologies Inc.|NASDAQ
TTWO|Take-Two Interactive|NASDAQ
TU|Telus Corporation|NYSE
TVTX|Travere Therapeutics Inc.|NASDAQ
TW|Tradeweb Markets Inc. Class A|NASDAQ
TWLO|Twilio Inc. Class A|NYSE
TWST|Twist Bioscience Corporation|NASDAQ
TX|Ternium S.A. Ternium S.A.|NYSE
TXG|10x Genomics Inc. Class A|NASDAQ
TXN|Texas Instruments|NASDAQ
TXNM|TXNM Energy Inc.|NYSE
TXRH|Texas Roadhouse Inc.|NASDAQ
TXT|Textron|NYSE
TYL|Tyler Technologies|NYSE
U|Unity Software Inc.|NYSE
UAL|United Airlines Holdings|NASDAQ
UBER|Uber|NYSE
UBS|UBS Group AG Registered|NYSE
UBSI|United Bankshares Inc.|NASDAQ
UDR|UDR, Inc.|NYSE
UEC|Uranium Energy Corp.|NYSE American
UGI|UGI Corporation|NYSE
UGP|Ultrapar Participacoes S.A. (New)|NYSE
UHAL|U-Haul Holding Company|NYSE
UHS|Universal Health Services|NYSE
UI|Ubiquiti Inc.|NYSE
UL|Unilever PLC|NYSE
ULS|UL Solutions Inc. Class A|NYSE
ULTA|Ulta Beauty|NASDAQ
UMBF|UMB Financial Corporation|NASDAQ
UMC|United Microelectronics Corporation (NEW)|NYSE
UNH|UnitedHealth Group|NYSE
UNI-USD|Uniswap|Crypto
UNM|Unum Group|NYSE
UNP|Union Pacific Corporation|NYSE
UPS|United Parcel Service|NYSE
URBN|Urban Outfitters Inc.|NASDAQ
URI|United Rentals|NYSE
USB|U.S. Bancorp|NYSE
USDC-USD|USD Coin|Crypto
USDT-USD|Tether|Crypto
USFD|US Foods Holding Corp.|NYSE
USO|United States Oil Fund|ETF
UTHR|United Therapeutics Corporation|NASDAQ
V|Visa Inc.|NYSE
VAL|Valaris Limited|NYSE
VALE|VALE S.A.|NYSE
VB|Vanguard Small-Cap ETF|ETF
VCTR|Victory Capital Holdings Inc. Class A|NASDAQ
VDE|Vanguard Energy ETF|ETF
VEA|Vanguard FTSE Developed Markets ETF|ETF
VEEV|Veeva Systems|NYSE
VFC|V.F. Corporation|NYSE
VFH|Vanguard Financials ETF|ETF
VFS|VinFast Auto Ltd.|NASDAQ
VG|Venture Global Inc. Class A common stock|NYSE
VGT|Vanguard Information Technology ETF|ETF
VHT|Vanguard Health Care ETF|ETF
VIAV|Viavi Solutions Inc.|NASDAQ
VICI|Vici Properties|NYSE
VICR|Vicor Corporation|NASDAQ
VIG|Vanguard Dividend Appreciation ETF|ETF
VIK|Viking Holdings Ltd|NYSE
VIPS|Vipshop Holdings Limited|NYSE
VIRT|Virtu Financial Inc. Class A|NYSE
VIST|Vista Energy S.A.B. de C.V.|NYSE
VIV|Telefonica Brasil S.A.|NYSE
VIXY|ProShares VIX Short-Term Futures ETF|ETF
VLO|Valero Energy|NYSE
VLTO|Veralto|NYSE
VLY|Valley National Bancorp|NASDAQ
VLYPN|Valley National Bancorp 8.250% Fixed-Rate Reset Non-Cumulative Perpetual Preferred Stock Series C|NASDAQ
VLYPO|Valley National Bancorp 5.50% Fixed-to-Floating Rate Non-Cumulative Perpetual Preferred Stock Series B|NASDAQ
VLYPP|Valley National Bancorp 6.25% Fixed-to-Floating Rate Non-Cumulative Perpetual Preferred Stock Series A|NASDAQ
VMC|Vulcan Materials Company|NYSE
VMI|Valmont Industries Inc.|NYSE
VMRK|Vivmark Residential|NYSE
VNO|Vornado Realty Trust|NYSE
VNOM|Viper Energy Inc. Class A|NASDAQ
VNQ|Vanguard Real Estate ETF|ETF
VO|Vanguard Mid-Cap ETF|ETF
VOD|Vodafone Group Plc|NASDAQ
VOO|Vanguard S&P 500 ETF|ETF
VOYA|Voya Financial Inc.|NYSE
VRNS|Varonis Systems Inc.|NASDAQ
VRSK|Verisk Analytics|NASDAQ
VRSN|Verisign|NASDAQ
VRT|Vertiv|NYSE
VRTX|Vertex Pharmaceuticals|NASDAQ
VSAT|ViaSat Inc.|NASDAQ
VSEC|VSE Corporation|NASDAQ
VSNT|Versant Media Group Inc. Class A|NASDAQ
VST|Vistra Corp.|NYSE
VSXY|Victorias Secret & Co.|NYSE
VT|Vanguard Total World Stock ETF|ETF
VTI|Vanguard Total Stock Market ETF|ETF
VTR|Ventas|NYSE
VTRS|Viatris|NASDAQ
VTV|Vanguard Value ETF|ETF
VUG|Vanguard Growth ETF|ETF
VWO|Vanguard FTSE Emerging Markets ETF|ETF
VXUS|Vanguard Total International Stock ETF|ETF
VYM|Vanguard High Dividend Yield ETF|ETF
VZ|Verizon|NYSE
W|Wayfair Inc. Class A|NYSE
WAB|Wabtec|NYSE
WAL|Western Alliance Bancorporation Common Stock (DE)|NYSE
WAT|Waters Corporation|NYSE
WAY|Waystar Holding Corp.|NASDAQ
WBD|Warner Bros. Discovery|NASDAQ
WCC|WESCO International Inc.|NYSE
WCN|Waste Connections Inc.|NYSE
WDAY|Workday, Inc.|NASDAQ
WDC|Western Digital|NASDAQ
WDS|Woodside Energy Group Limited|NYSE
WEC|WEC Energy Group|NYSE
WELL|Welltower|NYSE
WES|Western Midstream Partners LP Common Units Representing Limited Partner Interests|NYSE
WEX|WEX Inc. common stock|NYSE
WF|Woori Financial Group Inc.|NYSE
WFC|Wells Fargo|NYSE
WFG|West Fraser Timber Co. Ltd Common stock|NYSE
WFRD|Weatherford International plc|NASDAQ
WH|Wyndham Hotels & Resorts Inc.|NYSE
WHD|Cactus Inc. Class A|NYSE
WIT|Wipro Limited|NYSE
WLK|Westlake Corporation|NYSE
WM|Waste Management|NYSE
WMB|Williams Companies|NYSE
WMG|Warner Music Group Corp. Class A|NASDAQ
WMS|Advanced Drainage Systems Inc.|NYSE
WMT|Walmart|NASDAQ
WPC|W. P. Carey Inc. REIT|NYSE
WPM|Wheaton Precious Metals Corp Common Shares (Canada)|NYSE
WPP|WPP plc|NYSE
WRB|W. R. Berkley Corporation|NYSE
WSE|Wise Group plc Class A|NASDAQ
WSM|Williams-Sonoma, Inc.|NYSE
WSO|Watsco Inc.|NYSE
WST|West Pharmaceutical Services|NYSE
WTFC|Wintrust Financial Corporation|NASDAQ
WTM|White Mountains Insurance Group Ltd.|NYSE
WTRG|Essential Utilities Inc.|NYSE
WTS|Watts Water Technologies Inc. Class A|NYSE
WTW|Willis Towers Watson|NASDAQ
WULF|TeraWulf Inc.|NASDAQ
WWD|Woodward Inc.|NASDAQ
WY|Weyerhaeuser|NYSE
WYNN|Wynn Resorts|NASDAQ
XE|X-Energy Inc. Class A|NASDAQ
XEL|Xcel Energy|NASDAQ
XENE|Xenon Pharmaceuticals Inc.|NASDAQ
XLB|Materials Select Sector SPDR|ETF
XLC|Communication Services Select Sector SPDR|ETF
XLE|Energy Select Sector SPDR|ETF
XLF|Financial Select Sector SPDR|ETF
XLI|Industrial Select Sector SPDR|ETF
XLK|Technology Select Sector SPDR|ETF
XLM-USD|Stellar|Crypto
XLP|Consumer Staples Select Sector SPDR|ETF
XLRE|Real Estate Select Sector SPDR|ETF
XLU|Utilities Select Sector SPDR|ETF
XLV|Health Care Select Sector SPDR|ETF
XLY|Consumer Discretionary Select Sector SPDR|ETF
XMR-USD|Monero|Crypto
XMTR|Xometry Inc. Class A|NASDAQ
XOM|ExxonMobil|NYSE
XP|XP Inc. Class A|NASDAQ
XPEV|XPeng Inc. American depositary shares|NYSE
XPO|XPO Inc.|NYSE
XRP-USD|XRP|Crypto
XYL|Xylem Inc.|NYSE
XYZ|Block, Inc.|NYSE
YMM|Full Truck Alliance Co. Ltd.|NYSE
YOU|Clear Secure Inc. Class A|NYSE
YPF|YPF Sociedad Anonima|NYSE
YUM|Yum! Brands|NYSE
YUMC|Yum China Holdings Inc.|NYSE
Z|Zillow Group Inc. Class C|NASDAQ
ZBH|Zimmer Biomet|NYSE
ZBRA|Zebra Technologies|NASDAQ
ZETA|Zeta Global Holdings Corp. Class A|NYSE
ZG|Zillow Group Inc. Class A|NASDAQ
ZION|Zions Bancorporation N.A.|NASDAQ
ZM|Zoom Communications Inc. Class A|NASDAQ
ZS|Zscaler Inc.|NASDAQ
ZTO|ZTO Express (Cayman) Inc.|NYSE
ZTS|Zoetis|NYSE
ZWS|Zurn Elkay Water Solutions Corporation|NYSE`;

export interface TickerRow {
  symbol: string;
  name: string;
  exchange: string;
}

let parsed: TickerRow[] | null = null;

/** מפוענח בעצלתיים — פעם אחת, בחיפוש הראשון. */
export function tickerCatalog(): readonly TickerRow[] {
  if (!parsed) {
    parsed = RAW.split('\n').map(line => {
      const [symbol, name, exchange] = line.split('|');
      return { symbol, name, exchange };
    });
  }
  return parsed;
}
