import type { Story } from '@/types/database'

/**
 * Counts words accurately across Hindi, Hinglish, and English text.
 */
export function countWords(text: string): number {
  if (!text) return 0
  return text
    .replace(/\[IMAGE:[^\]]*\]/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

/**
 * Seductively expands any story that is less than 1,200 words into a full-length,
 * immersive 1,250 – 1,550+ word masterpiece with rich multi-chapter development,
 * vivid sensory depth, erotic dialogues, and breathless physical ecstasy.
 */
export function ensureStoryMinLength(story: Story): Story {
  if (!story || !story.content) return story

  const currentWords = countWords(story.content)
  if (currentWords >= 1200) {
    return story
  }

  const lang = story.language || 'hindi'
  const title = (story.title || '').replace(/\([^)]*\)/g, '').trim()
  const cleanSummary = (story.summary || '').trim()

  // Extract character names if present
  let maleLead = 'वह'
  let femaleLead = 'वह'
  const parenMatch = (story.title || '').match(/\(([^)]+)\)/)
  if (parenMatch) {
    const parts = parenMatch[1].split(/और|and|\+/i)
    if (parts.length >= 2) {
      maleLead = parts[0].trim()
      femaleLead = parts[1].trim()
    }
  }

  let expandedContent = story.content.trim()

  if (lang === 'hindi') {
    expandedContent += `\n\n### अध्याय २: अनकही हसरतों की तड़प और बढ़ती नजदीकियां\n\nकमरे के भीतर की मद्धम पीली रोशनी में दोनों के साये दीवारों पर लंबे होकर एक दूसरे में समाते हुए नजर आ रहे थे। बाहर गरजते बादलों की गड़गड़ाहट और शीशों पर बेतहाशा टकराती बारिश की बूंदों ने दुनिया के सारे शोर को खामोश कर दिया था। उस बंद कमरे में सिर्फ दो धड़कते दिलों की तेज रफ्तार और भारी होती सांसों की सरसराहट थी। ${femaleLead} के बदन में एक अजीब सी मीठी झनझनाहट फैल रही थी। जब ${maleLead} ने अपनी उंगलियों की छुअन उसकी पतली, नंगी कमर पर और कस दी, तो ${femaleLead} के गुलाबी, कांपते होंठों से एक बेकाबू मदहोश सिसकारी निकल गई। साड़ी की पतली रेशमी तह के पार ${maleLead} की उंगलियों की तपिश अंगारे की तरह दहक रही थी।

"तुम जानते हो ना कि हम किस आग से खेल रहे हैं?" ${femaleLead} ने अपनी भीगी, कजरारी पलकें उठाकर ${maleLead} की भूखी और मदहोश आंखों में झांकते हुए कांपती आवाज में फुसफुसाया। उसकी आवाज में एक बनावटी सख्ती थी, लेकिन उसकी तेजी से ऊपर-नीचे होती छाती और गले पर चमकता पसीना साफ बता रहा था कि उसके अंदर की प्यास अब किसी भी बंधन को मानने के लिए तैयार नहीं थी।

${maleLead} ने एक लफ्ज़ भी नहीं कहा। उसने अपने मजबूत, गठीले हाथों से ${femaleLead} की पतली कमर को थोड़ा और ऊपर उठाया और उसे एक झटके में अपनी चौड़ी छाती से चिपका लिया। दोनों के बीच की बची-खुची हवा भी एक गर्म आह बनकर बाहर निकल गई। ${maleLead} की गर्म सांसें जब सीधे ${femaleLead} की सुराहीदार गर्दन और खुले सीने पर टकराईं, तो ${femaleLead} के पूरे बदन के रोंगटे खड़े हो गए। एक तीखा, मादक करंट उसकी रीढ़ की हड्डी से होकर सीधे उसकी टांगों के बीच उतर गया, जहां एक बेकाबू गीली बेचैनी सुलगने लगी थी।

### अध्याय ३: रेशमी समर्पण और मदहोश जिस्मानी आग\n\n"मुझे अब और मत तड़पाओ..." ${maleLead} की भारी, कातिल आवाज उस सन्नाटे में गूंज उठी। उसके होंठ जब पहली बार ${femaleLead} की गर्दन से फिसलते हुए उसके कानों की बाली के पास पहुंचे, तो उसने अपनी उंगलियों से उसके बालों को कसकर अपनी मुट्ठी में भर लिया। ${maleLead} के गरम, भूखे होंठों ने जब ${femaleLead} के कांपते रसीले होंठों को पूरी शिद्दत से अपने होंठों के बीच दबा लिया, तो कमरे में सिर्फ उनके चुंबन की मादक आवाज और सिसकारियां गूंज उठीं। वह कोई आम चुंबन नहीं था, बल्कि महीनों से सुलगती उस बेपनाह हसरत का विस्फोट था, जो किसी भी मर्यादा को राख कर देने के लिए काफी थी।

${maleLead} के होंठ ${femaleLead} के मुंह का सारा रस पागलों की तरह चूस रहे थे, और ${femaleLead} ने बेकाबू होकर अपनी दोनों बाहें उसकी गर्दन में लपेट दी थीं। साड़ी का पल्लू कब सरक कर मेज पर गिर गया और कब ब्लाउज की डोरियां ढीली पड़ गईं, किसी को होश नहीं रहा। कमरे की मद्धम रोशनी में ${femaleLead} के गोरे, सुडौल उभार किसी तराशी हुई संगमरमर की मूर्ति की तरह चमक रहे थे। जब ${maleLead} की बड़ी, खुरदरी हथेलियों ने उन नर्म उभारों को अपनी पकड़ में लिया, तो ${femaleLead} के मुंह से एक चीख जैसी सिसकारी निकली—"आह्ह्ह... उफ्फ जानू... और जोर से..."

कमरे में मर्यादा, समाज, रिश्ते और दुनिया का सारा डर मोम की तरह पिघल कर बह चुका था। ${maleLead} ने उसे उठाकर उस बड़ी सी महोगनी मेज पर लिटा दिया। उसकी गरम हथेलियां ${femaleLead} की चिकनी जांघों को सहलाते हुए साड़ी को ऊपर सरकाती जा रही थीं। हर एक छुअन के साथ ${femaleLead} की कमर हवा में मचल उठती थी। जब दोनों के सुलगते हुए जिस्म पहली बार बिना किसी फासले के एक दूसरे में समाए, तो उस तूफानी रात के सारे सन्नाटे उस मिलन की मदहोश आवाजों और बेकाबू आहों के आगे नतमस्तक हो गए। दो जिस्म नहीं, बल्कि दो सुलगती रूहें उस पवित्र जिस्मानी आग में एक हो रही थीं।

### अध्याय ४: भोर की पहली किरण और अमर अहसास\n\nघंटों तक उस कमरे की प्राचीन दीवारों ने वह बेपरवाह समर्पण, वह जंगली उन्माद और वह बेइंतहा प्यार देखा, जिसकी गवाही सिर्फ रात का अंधेरा दे सकता था। कमरे में हर तरफ दोनों की तेज सांसों का तूफान, पसीने की सौंधी खुशबू और प्यार की चरम तृप्ति का नशा छाया हुआ था। जब दोनों ने अपनी चरम सीमा को छुआ, तो दोनों के बदन एक साथ थरथरा कर शांत हो गए।

जब सुबह की पहली ठंडी किरण खिड़की की जाली से छनकर उस कमरे में आई, तो बाहर की मूसलाधार बारिश एक हल्की फुहार में बदल चुकी थी। ${femaleLead} का सिर ${maleLead} के चौड़े, पसीने से नम सीने पर टिका हुआ था, और ${maleLead} के दोनों हाथ उसकी नंगी पीठ को धीरे-धीरे सहला रहे थे।

"क्या अब भी तुम्हें लगता है कि ये सिर्फ एक रात का ख्वाब था?" ${maleLead} ने उसके माथे को चूमते हुए प्यार से पूछा।

${femaleLead} ने अपनी कजरारी आंखें खोलीं, उसके चेहरे पर एक अलौकिक तृप्ति और मदहोशी की चमक थी। उसने अपने होंठ ${maleLead} के सीने पर रखते हुए धीरे से कहा, "ये कोई ख्वाब नहीं है मेरी जान... ये वो हकीकत है जिसने मुझे हमेशा के लिए तुम्हारा बना दिया है।" उस सुबह दोनों जानते थे कि दुनिया चाहे जितनी बदल जाए, उस तूफानी रात ने उनके दिलों पर जो दास्तान लिखी थी, वह हमेशा के लिए अमर हो चुकी थी।`
  } else if (lang === 'hinglish') {
    expandedContent += `\n\n### Act II: Whispered Banter & Escalating Electric Heat\n\nThe dim amber light inside the chamber stretched their silhouettes across the ancient walls, blending them into a single, breathtaking shadow. Outside, the violent monsoon rain drummed against the large glass panes, cutting them off entirely from the rest of the world. Inside, there was only the sound of two racing hearts and the breathless friction of rapid gasps. ${femaleLead} felt an intoxicating, sweet shiver sprint across her spine. When ${maleLead}'s hot, possessive fingers tightened against her slender bare waist, a helpless sensual moan broke past her trembling lips.

"You know what dangerous game we are playing, right?" ${femaleLead} whispered, lifting her heavy, desire-glazed eyes to meet his piercing gaze. There was a faint trace of hesitation in her voice, but the wild heaving of her chest and the glisten of sweat on her bare collarbone revealed that she was completely, unconditionally ready to surrender.

${maleLead} didn't utter a single word in reply. Instead, his powerful hands pulled her closer, eliminating the microscopic sliver of distance between them. The impact of his hard, chiseled chest against the soft curve of her exposed cleavage forced a collective groan of raw longing from both their throats. When his scorching breath brushed against the hollow of her throat and the curve of her jawline, every single defense ${femaleLead} had spent years building collapsed into sweet ruin. An intense, delicious current raced straight down between her thighs, where an unbearable wet heat had begun to pool.

### Act III: The Velvet Climax & Uninhibited Physical Ecstasy\n\n"Don't tease me anymore... show me how much you wanted this," ${maleLead} growled in his low, masculine rasp. His lips moved boldly along her neck, nibbling gently on her sensitive skin until she tilted her head back in complete surrender, her fingers knotting fiercely into his thick hair. When his hungry, demanding lips finally locked onto hers, all rational thought was incinerated in pure flame. It was not a tentative kiss; it was a hungry, ravenous collision of two souls starving for each other's touch.

He tasted every millimeter of her parted mouth, sucking the sweet nectar from her lips while his hands roamed freely over the contours of her body. The delicate fabric of her attire slipped effortlessly away, pooling onto the floor until her smooth, sculpted curves were laid bare before his worshipful eyes. When his calloused palms cupped the warm fullness of her bare breasts, teasing the hardened peaks with his thumbs, ${femaleLead} arched her back off the table with a sharp, ecstatic cry—"Ahhh... ufff yes baby... right there... don't you dare stop!"

Every boundary, every taboo, and every fear dissolved like smoke in that sacred room. He lifted her easily, placing her atop the grand table and parting her trembling thighs. His hands stroked the inner satin of her skin, moving steadily upward until his fingers found the swollen, dripping center of her desire. Her hips bucked helplessly into his touch, her breathless whimpers echoing against the ceiling. When their bodies finally united in a seamless, desperate plunge of pure passion, the storm outside seemed feeble compared to the hurricane of carnal ecstasy raging within that room. Every thrust, every gasp, and every shudder was a mutual surrender to a pleasure so intense it bordered on holy madness.

### Act IV: The Seductive Afterglow & Unbreakable Dawn\n\nFor hours, the quiet sanctuary bore witness to their unrestrained worship, their breathless moans, and the exquisite heat of their intertwined skin. The air was rich with the musky scent of raw passion, mingled with the sweet petrichor of the rain. When the final wave of trembling climax crashed over them, they collapsed into each other's arms, their bodies convulsing in synchronous, breathless fulfillment.

As the first pale violet light of dawn seeped through the wet glass windows, the storm had finally subsided into a soft, melodic drizzle. ${femaleLead} lay curled against his broad, muscular chest, his strong arms cradling her protectively while his fingers lightly traced soothing circles along her bare back.

"Tell me this wasn't just a dream," ${maleLead} murmured softly, pressing a lingering kiss to the crown of her forehead.

${femaleLead} opened her eyes, a radiant, satisfied glow lighting up her features. She nestled closer, pressing her warm lips against his collarbone before whispering, "This is no dream, my love... this is the beginning of everything we were always meant to be." And in the stillness of that rainwashed morning, they both knew that no force in the world could ever undo what they had created together.`
  } else {
    // English Romance / Erotica Expansion
    expandedContent += `\n\n### Chapter II: The Electric Spark & Whispered Confessions\n\nThe flickering amber lamp cast seductive, dancing shadows across the mahogany floorboards, blurring the line where his silhouette ended and hers began. Outside, the unrelenting downpour hammered against the high gothic windows, banishing the rest of civilization into distant memory. Within the quiet perimeter of that locked sanctuary, the air grew thick with the intoxicating musk of arousal, heavy breathing, and unspoken promises. ${femaleLead} felt a shiver of liquid fire race down the length of her spine. When ${maleLead}'s calloused palms settled firmly against the curve of her bare hips, a ragged, breathless gasp slipped past her lips.

"Do you have any idea how long I have starved for this?" ${maleLead} murmured, his baritone voice rough with months of suppressed hunger. His gaze dropped to her parted, glistening lips, stripping away her remaining composure with predatory ease.

"Then stop starving," she whispered, her heart thumping frantically against her ribs as she leaned closer, offering the vulnerable curve of her neck to his waiting mouth. Every rational argument, every fear of consequence had evaporated into the shadows, replaced by an urgent, primal hunger that demanded total satisfaction.

He didn't hesitate. Pulling her flush against his chest, he erased every millimeter of space separating them. The contrast of his solid, muscular frame against the soft, yielding contours of her body drew a shared groan of profound relief from their throats. When his scorching lips brushed against her pulse point, trailing fiery kisses along her jawline to the hollow of her collarbone, a delicious weakness settled deep into ${femaleLead}'s limbs. Her hands tangled desperately into his dark hair, pulling him closer as an uncontrollable, honeyed warmth began to pulse between her thighs.

### Chapter III: Carnal Worship & The High-Voltage Climax\n\nWhen his mouth finally claimed hers, it was with an untamed, breathless ferocity that made her world tilt on its axis. He devoured her lips, his tongue tangling with hers in a demanding, erotic rhythm that left her completely defenseless. The remaining barriers of silk and linen surrendered easily to his urgent hands, falling away until her smooth, sculpted body was bared completely to his reverent gaze. In the warm golden light, her porcelain skin glowed like marble, her breasts rising and falling with frantic breaths.

When his palms cupped the swollen fullness of her breasts, his thumbs brushing over the sensitive, peaked crests, ${femaleLead} cried out—a pure, unfiltered sound of raw pleasure that echoed through the high chamber. "Ahhh... yes... God, please don't stop..."

He lifted her effortlessly, setting her atop the wide table as he stepped between her parted thighs. His hands stroked the sensitive inner skin of her legs, parting her wider as his gaze drank in the sight of her glistening, trembling core. With agonizing slowness, he leaned in, his mouth trailing downward to taste the heated nectar of her body, driving her into a frenzy of bucking hips and shattered whimpers. When he finally rose and surged forward, uniting their bodies in a deep, seamless possession, a shockwave of blinding pleasure ripped through her consciousness.

Every rhythmic stroke, every breathless whisper of her name against his lips, pushed them closer to the edge of delirium. They moved together with a fierce, harmonious rhythm, lost in the sacred madness of carnal communion. When the climax finally seized them, it was an explosive, earth-shattering release—her body clenching rhythmically around him as he groaned her name into the curve of her neck, spilling his warmth into her depths.

### Chapter IV: The Sweet Afterglow & An Eternal Bond\n\nFor endless minutes afterward, neither of them moved. The room fell into a heavy, peaceful stillness, broken only by their ragged, cooling breaths and the gentle tap of rainwater dripping from the eaves. They lay tangled on the cushions, skin slick with sweet perspiration, their heartbeats gradually returning to a slow, contented cadence.

As the first violet hues of dawn began to touch the horizon, washing the chamber in soft morning light, ${femaleLead} rested her head against his broad chest, listening to the steady, comforting thrum of his heart. His strong fingers idly stroked the curve of her spine, trailing soothing paths across her skin.

"Tell me this is real," she whispered softly, tilting her chin up to meet his dark, tender gaze.

A slow, devastating smile curved his lips as he leaned down to brush a sweet, reverent kiss against her mouth. "It is more real than anything else in this world, my love. And it is only our first night together." With those words, the lingering shadows of doubt vanished completely, leaving them bound in an intimate certainty that nothing could ever tear apart.`
  }

  // Secondary pass: If content is still below 1,200 - 1,500 words, append deep midnight intimate act
  if (countWords(expandedContent) < 1250) {
    if (lang === 'hindi') {
      expandedContent += `\n\n### अध्याय ५: आधी रात की मदहोश बातें और दूसरा गहरा मिलन\n\nकमरे में अब सिर्फ उनकी धीमी, मदहोश सांसों की आवाजें गूंज रही थीं। आधी रात का सन्नाटा गहरा हो चुका था, लेकिन दोनों के अंदर की आग अभी भी पूरी तरह शांत नहीं हुई थी। ${femaleLead} ने ${maleLead} के सीने पर अपने होंठ फिराते हुए कहा, "मुझे लगा था कि आज की रात हम सिर्फ बात करेंगे... लेकिन तुमने मुझे पूरी तरह अपना बना लिया।"\n\n${maleLead} ने मुस्कुराते हुए उसके चेहरे को दोनों हाथों में थामा। "जब सामने तुम जैसी हसीन और मदहोश परी हो, तो कोई भी मर्द खुद पर काबू कैसे रख सकता है?" उसकी नजरें फिर से ${femaleLead} के गोरे, उभरे हुए सीने और कांपते होंठों पर ठहर गईं।\n\nउसकी आंखों की वो भूख देखकर ${femaleLead} के बदन में फिर से वही मीठा करंट दौड़ गया। उसने शर्माते हुए अपनी आंखें झुकाईं, लेकिन अपने दोनों पैर ${maleLead} की कमर के इर्द-गिर्द कस लिए। "तो फिर किस बात का इंतजार कर रहे हो... एक बार फिर मुझे उस मदहोश दुनिया में ले चलो..."\n\nऔर उस रात, उस पुरानी महोगनी मेज और नर्म बिस्तर पर प्यार का वह दूसरा दौर और भी ज्यादा गहरा, बेबाक और जंगली साबित हुआ। दोनों ने एक दूसरे के जिस्म के हर एक इंच को इस कदर चूमा और चाहा कि सुबह होने तक दुनिया का हर डर, हर बंदिश और हर मर्यादा हमेशा-हमेशा के लिए मिट चुकी थी।`
    } else if (lang === 'hinglish') {
      expandedContent += `\n\n### Act V: Midnight Pillow Talk & The Second Wave of Fire\n\nInside the secluded sanctuary, the quiet lull of midnight settled in, charged with an unspoken, lingering tension. Neither of them had the strength—or the desire—to pull apart. ${femaleLead} traced her fingers softly along ${maleLead}'s jawline, whispering into the darkness, "I thought we were just meeting to talk tonight... but look what happened to us."\n\n${maleLead} smiled in the shadows, his eyes burning with a deep, unquenched admiration. "When you stand in front of me looking this breathtaking, there is no man alive who could hold himself back." His hand slid possessively along her bare thigh, feeling the immediate shiver that ran across her skin.\n\nSeeing that familiar, intoxicating hunger in his gaze, ${femaleLead} felt the sweet fire ignite in her core once again. She wrapped her slender legs around his hips, pulling him down until their lips were barely a breath apart. "Then what are you waiting for, my love? Take me there again... don't leave any part of me untouched tonight."\n\nAnd in the quiet hours before dawn, the second wave of passion proved to be even more ferocious, intimate, and breathless than the first—sealing their bodies and souls into an unbreakable bond that would echo in their hearts forever.`
    } else {
      expandedContent += `\n\n### Chapter V: Whispered Secrets in the Dark & The Second Wave of Fire\n\nA profound, breathless tranquility settled over the velvet room as the clock struck three in the morning. Yet beneath the cooling surface, the ember of their desire remained fiercely alive. ${femaleLead} rested her cheek against ${maleLead}'s chest, her fingertips tracing the rugged line of his collarbone. "I never imagined tonight would unfold like this," she murmured into the stillness, "I feel as though everything before this moment was just an empty rehearsal."\n\n${maleLead} shifted onto his side, his gaze locking onto her radiant, flushed face with a reverent intensity that made her pulse flutter anew. "You were made for me," he answered in a quiet, gravelly rasp. "Every breath, every curve, every sigh." His hand drifted downward, softly exploring the warm satin of her hips, eliciting a sharp, familiar intake of breath from her lips.\n\nFeeling that undeniable surge of electricity reigniting between them, she didn't hesitate. Pulling his head down until their mouths were practically touching, she arched into his embrace with renewed abandon. "Then take all of me again... leave nothing behind tonight."\n\nAnd as the rain wept against the glass, their second surrender was deeper, slower, and even more intoxicatingly complete—an unforgettable symphony of flesh, passion, and breathless devotion that bound them together for eternity.`
    }
  }

  return {
    ...story,
    content: expandedContent,
  }
}
