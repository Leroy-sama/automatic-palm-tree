/** Common lowercase English words for practice drills (no network). */
export const WORDS: string[] = `
the and that have for not with you this but his from they say her she will one all would there
their what out about who get which when make can like time just him know take people into year your good some
could them see other than then now look only come its over think also back after use two how our work first well
way even new want because any these give day most find here thing many tell very through life child world down
side kind hand place feel ask need house high keep old last long great little under never begin seem help talk
turn start might show hear play run move live believe hold bring happen write provide sit stand lose pay meet
include continue set learn change lead understand watch follow stop create speak read spend grow open walk win
offer remember love consider appear buy wait serve die send expect build stay fall cut reach kill remain suggest
raise pass sell require report decide pull join just jump judge joke major enjoy object subject project quick
quite quiet equal question size zero lazy prize freeze box next fix mix exit exact extra taxi fake kid kite desk
risk dark drink knife field fried fire ride idea deep feed diet edit free tree three try true turn type city
case call came care car card carry catch cause center certain chance change chapter check choice choose church
circle claim class clean clear close cloud coach coast coat code cold color come common company compare complete
computer condition connect consider contain continue control cook cool copy corner correct cost could count country
couple course cover create cross crowd cry culture cup current cut dark data date daughter day dead deal dear
death decide deep degree delay deliver demand department depend describe design desire destroy detail develop die
difference different difficult dinner direct direction discover discuss disease distance divide do doctor dog dollar
door double doubt down draw dream dress drink drive drop dry during each early earn earth east easy eat edge
education effect effort egg eight either electric else employ empty end enemy energy engine enjoy enough enter
entire environment equal especially essential establish even evening event ever every evidence exact example
except exchange excite exercise exist expect experience explain express eye face fact fail fair fall family famous
far farm fashion fast fat father fear feature federal fee feed feel female fence few field fight figure fill film
final finally financial find fine finger finish fire firm first fish fit five fix flag flat floor flow flower fly
focus folk follow food foot for force foreign forest forget form former forth fortune forward found four frame free
freedom frequent fresh friend from front fruit full fun function fund funny future gain game garden gas gate gather
general generation get girl give glass go goal god gold golf gone good government grab grade grand grant grass gray
great green ground group grow guarantee guard guess guest guide gun guy habit hair half hall hand handle hang happen
happy hard hat hate have he head health hear heart heat heavy hell help her here herself hide high hill him himself
his history hit hold hole home hope horse hospital hot hotel hour house how however huge human hundred hungry hunt
hurt husband I ice idea identify if ignore ill image imagine impact important improve in include increase indeed
independent individual industry information inside instead institute instrument insurance integrate intelligence
intend interest international into introduce invest involve iron is island issue it item its itself job join joint
joke judge juice jump just keep key kick kid kill kind king kiss kitchen knee knife knock know knowledge lab lack
lady lake land language large last late later laugh launch law lawyer lay lead leaf learn least leave left leg legal
less let letter level liberal lie life lift light like likely limit line link lip list listen little live load loan
local lock long look loose lose loss lot loud love low luck lunch machine magazine main maintain major make man
manage manner many map mark market marriage marry mass master match material matter may maybe me meal mean measure
media medical meet member memory mention mere message method middle might military milk million mind mine minister
minor minute mirror miss mission mix model modern moment money month more morning most mother motion motor mountain
mouth move movie much murder muscle music must my myself name narrow nation national native natural nature near
nearly necessary neck need negative neighbor neither nerve net network never news newspaper next nice night nine no
nobody nod noise none nor normal north nose not note nothing notice novel now nowhere nuclear number nurse object
observe obtain obvious occasion occur ocean of off offer office officer official often oh oil ok old on once one only
onto open operate opinion opportunity oppose option or orange order ordinary organ organization other others otherwise
ought our ourselves out outside over own owner page pain paint pair pan paper parent park part particular partner
party pass past path patient pattern pay peace peak pen people per percent perfect perform perhaps period person
personal persuade phone photo physical pick picture piece pile pink pipe pitch place plain plan plant plastic plate
play player please plenty plus pocket poem point police policy political politics pool poor popular population
position positive possess possible post pot potato potential pound pour power practice pray precise prefer prepare
presence present preserve president press pressure pretend pretty prevent price pride priest primary prince
principal principle print prior prison private prize probably problem process produce product profession professor
profit program progress project promise promote proof proper property protect protest proud prove provide public
pull purpose push put quality quarter question quick quiet quite quote race radio rail rain raise range rank rapid
rare rate rather raw reach react read ready real reality realize really reason receive recent recognize recommend
record red reduce refer reflect reform refuse regard region register regret regular regulation relate relative
relax release relevant relief religion rely remain remember remind remove repeat replace reply report represent
republican require research reserve resist resource respect respond response responsibility rest restaurant result
retain retire return reveal revenue review revolution rich rid ride right ring rise risk river road rock role roll
romantic roof room root rose rough round route row rub rule run rural rush sad safe safety sail sake sale salt same
sample sand save say scale scandal scene schedule scheme school science scientist score scream screen sea search
season seat second secret section sector secure security see seed seek seem segment select self sell senate send
senior sense sensitive sentence separate series serious serve service session set settle seven several severe sex
sexual shade shadow shake shall shame shape share sharp she sheet shelf shell shift shine ship shirt shock shoe shoot
shop shore short shot should shoulder shout show shower shut sick side sight sign signal significant silence silver
similar simple simply since sing single sink sir sister sit site situation six size skill skin sky slave sleep
slice slide slight slip slow small smart smell smile smoke smooth snake snow so soap social society soft soil solar
soldier solid solution solve some somebody somehow someone something sometimes son song soon sorry sort soul sound
soup source south southern space speak special specialist species specific speech speed spend spirit spite split
sport spot spread spring square stable staff stage stair stake stand standard star stare start state statement
station status stay steady steal steel step stick still stock stomach stone stop store storm story straight strange
strategy street strength stress stretch strike string strong structure struggle student study stuff stupid style
subject succeed success such sudden suffer sugar suggest suit summer sun super supply support suppose sure surface
surgery surprise surround survey survive suspect sustain swear sweep sweet swim swing switch symbol sympathy system
table tackle tag take tale talk tall tank tap tape target task taste tax tea teach team tear technical technique
technology telephone television tell temperature temple ten tend tendency tennis tension term terrible territory
terror test text than thank that the theater their them theme themselves then theory there these they thick thin
thing think third this those though thought thousand threat three through throughout throw thus ticket tide tie
tight time tiny tip tire title to tobacco today toe together tomato tomorrow tone tongue tonight too tool tooth top
topic total touch tough tour toward town toy track trade tradition traffic train transfer transform transition
translate transport travel treat treatment tree tremendous trend trial tribe trick trip troop trouble truck true
trust truth try tube turn twelve twenty twice twin two type typical uncle under understand undertake unemployment
unexpected unfair unfortunate unique unit united universe university unknown unless unlike until unusual up upon
upper urban urge us use useful usual usually vacation valley valuable value variation variety various vast vehicle
version very victim victory video view village violence violent virtually virtue virus visible vision visit visual
vital voice volume vote wage wait wake walk wall want war warm warn wash waste watch water wave way we weak wealth
weapon wear weather wedding week weekend weigh weight welcome well west western wet what whatever wheel when
whenever where whereas wherever whether which while whisper white who whole whom whose why wide wife wild will
willing win wind window wine wing winner winter wipe wire wisdom wise wish with withdraw within without witness
woman wonder wood wooden word work worker world worry worth would wound wrap write writer wrong yard yeah year
yellow yes yesterday yet you young your yourself youth zone
`.trim().split(/\s+/).filter((w, i, a) => /^[a-z]+$/.test(w) && a.indexOf(w) === i)
