/**
 * Seed script - Indigenous Knowledge Archive
 * Sources: TKDL (Traditional Knowledge Digital Library), Ministry of AYUSH
 * All content is based on publicly available traditional knowledge.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function seed() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'indigenous_archive',
    port: process.env.DB_PORT || 3306,
  });

  // Get admin user
  const [[admin]] = await pool.query('SELECT id, name FROM users WHERE email = ?', ['admin@archive.com']);
  if (!admin) {
    console.error('Admin user not found. Please create admin user first.');
    process.exit(1);
  }

  const aid = admin.id;
  const aname = admin.name;

  const entries = [
    {
      title: 'Turmeric (Haridra) - Ayurvedic Anti-Inflammatory Herb',
      category: 'medicine',
      description: 'Turmeric, known as Haridra in Ayurveda, is one of the most documented medicinal plants in the TKDL with over 100 formulations recorded.',
      content: 'Turmeric (Curcuma longa) has been used in Ayurveda for over 4000 years. Its active compound curcumin gives it powerful anti-inflammatory and antioxidant properties. Classical Ayurvedic texts prescribe Haridra for skin diseases, wounds, liver disorders, and digestive ailments. A common preparation is Haridra Khanda, used for allergic conditions and respiratory issues. Turmeric milk (Haldi Doodh) is a traditional remedy for colds, joint pain, and immunity. The TKDL documents turmeric formulations from Charaka Samhita and Sushruta Samhita that were used to challenge biopiracy patents at international patent offices.',
      tags: 'turmeric,haridra,ayurveda,anti-inflammatory,curcumin,TKDL'
    },
    {
      title: 'Ashwagandha - The Rasayana Rejuvenator',
      category: 'medicine',
      description: 'Ashwagandha is one of the most revered Rasayana herbs in Ayurveda, classified as a Medhya (intellect-promoting) and Balya (strength-giving) herb.',
      content: 'Ashwagandha (Withania somnifera), meaning horse smell in Sanskrit, is a foundational herb in Ayurvedic medicine documented extensively in the TKDL. It is classified as a Rasayana - a rejuvenating tonic that promotes longevity and vitality. Classical texts prescribe it for nervous exhaustion, sexual debility, emaciation, and as a nervine tonic. The root contains withanolides, alkaloids, and saponins that contribute to its adaptogenic properties. Ashwagandha Churna (powder) mixed with milk and honey is a traditional preparation for stress, insomnia, and cognitive decline.',
      tags: 'ashwagandha,rasayana,adaptogen,ayurveda,nervine,AYUSH'
    },
    {
      title: 'Neem - The Village Pharmacy',
      category: 'medicine',
      description: 'Neem is called the village pharmacy of India, with every part of the tree having documented medicinal uses in Ayurveda and Siddha systems.',
      content: 'Neem (Azadirachta indica) is documented in the TKDL as Nimba and has been used in Indian medicine for over 2000 years. Ayurvedic texts classify it as Tikta (bitter) and Katu (pungent) with Kapha and Pitta pacifying properties. Neem leaves are used for skin diseases, fever, and as a blood purifier. Neem oil is applied for fungal infections, scabies, and lice. Neem twigs have been used as natural toothbrushes for centuries, with proven antibacterial properties against oral pathogens. The TKDL successfully challenged a European patent on neem-based fungicide by proving prior art from ancient Indian texts.',
      tags: 'neem,nimba,ayurveda,antibacterial,skin,TKDL,biopiracy'
    },
    {
      title: 'Tulsi - The Sacred Healing Herb',
      category: 'medicine',
      description: 'Tulsi or Holy Basil is considered the queen of herbs in Ayurveda and is documented in the TKDL for its wide-ranging therapeutic applications.',
      content: 'Tulsi (Ocimum sanctum) is one of the most sacred plants in Indian tradition and a cornerstone of Ayurvedic medicine. It is classified as an adaptogen and Rasayana in classical texts. Ministry of AYUSH promotes Tulsi as an immunomodulator, particularly for respiratory ailments including cough, cold, bronchitis, and asthma. A decoction of Tulsi leaves with ginger and honey is a classical remedy for fever and sore throat. Tulsi contains eugenol, rosmarinic acid, and ursolic acid which contribute to its anti-inflammatory, antimicrobial, and antioxidant effects.',
      tags: 'tulsi,holy basil,ayurveda,respiratory,adaptogen,AYUSH,immunity'
    },
    {
      title: 'Triphala - The Three-Fruit Formulation',
      category: 'medicine',
      description: 'Triphala is one of the most important compound formulations in Ayurveda, combining three fruits to create a balanced tonic for digestion and detoxification.',
      content: 'Triphala (meaning three fruits) is a classical Ayurvedic formulation combining equal parts of Amalaki (Emblica officinalis), Bibhitaki (Terminalia bellirica), and Haritaki (Terminalia chebula). It is documented extensively in the TKDL and Charaka Samhita as a Tridoshic rasayana - balancing all three doshas (Vata, Pitta, Kapha). Triphala is prescribed for constipation, digestive disorders, eye diseases, and as a general detoxifier. It is rich in Vitamin C and tannins. Regular use is said to promote longevity, improve eyesight, and strengthen the immune system.',
      tags: 'triphala,amalaki,haritaki,bibhitaki,ayurveda,digestion,TKDL'
    },
    {
      title: 'Brahmi - The Memory Herb',
      category: 'medicine',
      description: 'Brahmi is a premier Medhya Rasayana in Ayurveda, traditionally used to enhance memory, intelligence, and treat neurological disorders.',
      content: 'Brahmi (Bacopa monnieri) is named after Brahma, the Hindu god of creation, reflecting its revered status as a brain tonic in Ayurveda. It is classified as a Medhya Rasayana - a herb that specifically promotes intellect and memory. Classical texts including Charaka Samhita document its use for epilepsy, mental illness, anxiety, and cognitive enhancement. The active compounds bacosides A and B are known to enhance synaptic transmission and protect neurons. Brahmi Ghrita (clarified butter preparation) is a traditional formulation for children with learning difficulties and adults with memory loss.',
      tags: 'brahmi,bacopa,medhya rasayana,memory,ayurveda,cognitive,AYUSH'
    },
    {
      title: 'Panchagavya - Sacred Organic Farming Input',
      category: 'agriculture',
      description: 'Panchagavya is a traditional organic farming preparation made from five products of the cow, used as a plant growth promoter and soil health enhancer.',
      content: 'Panchagavya (five cow products) is an ancient Indian organic farming input documented in texts like Vrikshayurveda (the Ayurveda of plants). It combines cow dung, cow urine, milk, curd, and ghee in specific proportions. When fermented for 15-30 days, it develops a rich microbial community that acts as a biostimulant for plant growth. Farmers in Kerala, Tamil Nadu, and Karnataka have used Panchagavya for centuries to improve soil fertility, enhance seed germination, and boost crop immunity. Research has shown it contains growth hormones, amino acids, and beneficial microorganisms.',
      tags: 'panchagavya,organic farming,cow products,biostimulant,traditional agriculture'
    },
    {
      title: 'Beej Amrit - Traditional Seed Treatment',
      category: 'agriculture',
      description: 'Beej Amrit is a traditional seed treatment method using cow-based inputs to protect seeds from soil-borne fungal diseases and enhance germination.',
      content: 'Beej Amrit is a traditional seed treatment documented in ancient Indian agricultural texts and practiced widely in Maharashtra and Karnataka. It is prepared by mixing cow dung, cow urine, lime, and a handful of soil from the farm in water. Seeds are soaked in this solution for 6-8 hours before sowing. The alkaline pH from lime and antimicrobial compounds in cow urine protect seeds from fungal pathogens. This practice is central to Zero Budget Natural Farming promoted by farmer Subhash Palekar, which draws from ancient Vedic agricultural knowledge.',
      tags: 'beej amrit,seed treatment,organic,cow urine,traditional farming,ZBNF'
    },
    {
      title: 'Navara Rice - Kerala Medicinal Rice Variety',
      category: 'agriculture',
      description: 'Navara is an ancient medicinal rice variety from Kerala, used in Ayurvedic treatments and documented as a therapeutic food in classical texts.',
      content: 'Navara (Oryza sativa var. navara) is a unique red-grained rice variety indigenous to Kerala, documented in Ayurvedic texts as a medicinal food. It is one of the few rice varieties used directly in Ayurvedic treatments, particularly in Navarakizhi - a special massage therapy using boluses of cooked Navara rice. Classical texts describe Navara as having Madhura (sweet) rasa, Sheeta (cooling) virya, and being beneficial for muscle wasting, neurological disorders, and skin diseases. It is rich in antioxidants, iron, and has a lower glycemic index than common rice varieties.',
      tags: 'navara rice,Kerala,medicinal rice,Ayurveda,Navarakizhi,traditional variety'
    },
    {
      title: 'Traditional Crop Rotation in Ancient India',
      category: 'agriculture',
      description: 'Ancient Indian agricultural texts describe sophisticated crop rotation and mixed cropping systems that maintained soil fertility without chemicals.',
      content: 'Ancient Indian texts including Krishi Parashara, Kashyapiyakrishisukti, and Arthashastra (by Chanakya, 4th century BCE) document detailed knowledge of crop rotation, mixed cropping, and seasonal farming. The Kharif-Rabi-Zaid seasonal cycle was well understood, with legumes rotated with cereals to restore soil nitrogen. Mixed cropping of cereals with pulses was practiced to maximize land use and reduce pest damage. The concept of Vrikshayurveda included knowledge of soil types, water management, and organic manuring. These practices are now being revived under organic and natural farming movements across India.',
      tags: 'crop rotation,mixed cropping,Krishi Parashara,Arthashastra,traditional farming'
    },
    {
      title: 'Ashtanga Yoga - The Eight Limbs of Patanjali',
      category: 'cultural',
      description: 'Patanjali codified the ancient practice of Yoga into eight limbs (Ashtanga) in the Yoga Sutras, a foundational text documented in the TKDL.',
      content: 'The Yoga Sutras of Patanjali (compiled around 400 CE) systematized the ancient practice of Yoga into 196 aphorisms organized into four chapters. The eight limbs (Ashtanga) are: Yama (ethical restraints), Niyama (personal observances), Asana (physical postures), Pranayama (breath control), Pratyahara (withdrawal of senses), Dharana (concentration), Dhyana (meditation), and Samadhi (absorption). The TKDL has documented 900 yoga postures from ancient texts to protect them from biopiracy. Ministry of AYUSH promotes Yoga as a complete system for physical, mental, and spiritual health.',
      tags: 'yoga,Patanjali,ashtanga,eight limbs,TKDL,AYUSH,meditation'
    },
    {
      title: 'Surya Namaskar - The Sun Salutation',
      category: 'cultural',
      description: 'Surya Namaskar is a sequence of 12 yoga postures performed as a salutation to the sun, combining physical exercise with spiritual practice.',
      content: 'Surya Namaskar (Sun Salutation) is one of the most complete yoga practices, combining 12 postures in a flowing sequence that exercises the entire body. Each posture is accompanied by a specific breath and a mantra dedicated to the sun. The practice has roots in ancient Vedic sun worship and is documented in texts like the Aditya Hridayam from the Ramayana. Physiologically, it improves flexibility, strengthens muscles, regulates the endocrine system, and improves cardiovascular health. Ministry of AYUSH recommends Surya Namaskar as a daily practice for overall wellness.',
      tags: 'surya namaskar,sun salutation,yoga,asana,AYUSH,Vedic,physical health'
    },
    {
      title: 'Pranayama - Ancient Breathing Techniques',
      category: 'cultural',
      description: 'Pranayama is the science of breath control in Yoga, with techniques documented in ancient texts for physical health, mental clarity, and spiritual development.',
      content: 'Pranayama (Prana = life force, Ayama = extension) is the fourth limb of Patanjali Yoga and a central practice in the AYUSH system. Classical texts describe numerous techniques: Nadi Shodhana (alternate nostril breathing) balances the nervous system; Kapalabhati (skull-shining breath) cleanses the respiratory system and energizes the mind; Bhramari (humming bee breath) reduces anxiety and promotes sleep; Ujjayi (victorious breath) generates internal heat and focuses the mind. Ministry of AYUSH promoted Pranayama extensively during COVID-19 for respiratory health.',
      tags: 'pranayama,breathing,nadi shodhana,kapalabhati,yoga,AYUSH,Hatha Yoga'
    },
    {
      title: 'Naturopathy - Panchamahabhuta Healing System',
      category: 'cultural',
      description: 'Naturopathy in India is based on the Panchamahabhuta (five elements) theory, using natural elements like water, earth, air, sunlight, and fasting for healing.',
      content: 'Indian Naturopathy (Prakritik Chikitsa) is rooted in the ancient Panchamahabhuta theory - the belief that the human body is composed of five elements: Prithvi (earth), Jal (water), Agni (fire), Vayu (air), and Akasha (space). Disease is seen as an imbalance of these elements, and healing involves restoring balance through natural means. Key therapies include Jal Chikitsa (hydrotherapy), Mitti Chikitsa (mud therapy), Surya Chikitsa (sunlight therapy), Vayu Chikitsa (air therapy), and Upavasa (therapeutic fasting). Ministry of AYUSH recognizes Naturopathy as one of the six official systems of medicine in India.',
      tags: 'naturopathy,panchamahabhuta,five elements,mud therapy,hydrotherapy,AYUSH,fasting'
    },
    {
      title: 'Charaka Samhita - Foundation of Ayurvedic Medicine',
      category: 'heritage',
      description: 'The Charaka Samhita is one of the two foundational texts of Ayurveda, compiled by Charaka around 300 BCE, documenting the eight branches of Ayurveda.',
      content: 'The Charaka Samhita is the primary text of Kaya Chikitsa (internal medicine) in Ayurveda, attributed to the physician Charaka and compiled around 300 BCE. It is organized into eight Sthanas (sections) containing 120 chapters and describes 341 plant-based, 177 animal-based, and 64 mineral-based medicines. The text defines the eight branches of Ayurveda: Kaya Chikitsa (internal medicine), Bala Chikitsa (pediatrics), Graha Chikitsa (psychiatry), Urdhvanga Chikitsa (ENT and ophthalmology), Shalya Tantra (surgery), Damstra Chikitsa (toxicology), Jara Chikitsa (geriatrics), and Vrisha Chikitsa (reproductive medicine). The TKDL has transcribed and digitized the Charaka Samhita as part of its 34 million pages of traditional knowledge documentation.',
      tags: 'Charaka Samhita,Ayurveda,ancient text,TKDL,eight branches,classical medicine'
    },
    {
      title: 'Sushruta Samhita - Ancient Surgical Knowledge',
      category: 'heritage',
      description: 'The Sushruta Samhita, compiled around 600 BCE, is the world oldest surgical text, documenting over 300 surgical procedures and 120 surgical instruments.',
      content: 'The Sushruta Samhita is attributed to the surgeon Sushruta of Varanasi and is considered the foundational text of Shalya Tantra (surgery) in Ayurveda. It describes over 300 surgical procedures, 120 surgical instruments, and 8 types of surgical incisions. Most remarkably, it documents rhinoplasty (reconstruction of the nose) - a procedure that became the basis of modern plastic surgery when European surgeons learned of it in the 18th century. It also describes cataract surgery, lithotomy (removal of bladder stones), and cesarean section. The TKDL has documented these surgical procedures to establish prior art and prevent biopiracy of ancient Indian surgical knowledge.',
      tags: 'Sushruta Samhita,surgery,rhinoplasty,ancient medicine,TKDL,Ayurveda,surgical instruments'
    },
    {
      title: 'Atharva Veda - Earliest Medicinal Plant Knowledge',
      category: 'heritage',
      description: 'The Atharva Veda (circa 1200-1000 BCE) contains the earliest systematic references to medicinal plants, healing practices, and disease concepts in Indian tradition.',
      content: 'The Atharva Veda is the fourth Veda and contains 731 hymns dedicated to healing, medicine, and the treatment of diseases. It is considered the precursor to Ayurveda and documents the earliest known Indian pharmacopoeia. The text mentions over 290 medicinal plants and their therapeutic uses, including Kushtha for fever, Apamarga for skin diseases, and Pippali (long pepper) for respiratory ailments. It also contains knowledge of anatomy, surgery, and the concept of Prana (life force). The Atharva Veda bridges the gap between magical-religious healing and rational medicine, showing the evolution of Indian medical thought.',
      tags: 'Atharva Veda,Vedic medicine,medicinal plants,ancient India,TKDL,Ayurveda origins'
    },
    {
      title: 'Siddha System - The 18 Siddhars and Tamil Medical Tradition',
      category: 'heritage',
      description: 'The Siddha system of medicine originated in Tamil Nadu, attributed to 18 enlightened masters (Siddhars), and represents one of the oldest medical traditions in the world.',
      content: 'Siddha medicine is believed to be over 10,000 years old and is the traditional medicine of the Tamil people. It is attributed to 18 Siddhars - enlightened masters who attained supernatural powers through yoga and meditation. Agastya Muni is considered the father of Siddha medicine, and Thirumoolar, Bogar, and Konganar are among the most celebrated Siddhars. The system uses three types of medicines: Thaavara Marunthu (plant-based), Thadhu Marunthu (mineral and metal-based), and Jeeva Marunthu (animal-based). Siddha alchemy involves purification and preparation of metals like mercury, gold, and sulfur into therapeutic preparations called Parpam and Chendooram.',
      tags: 'Siddha,18 Siddhars,Agastya,Tamil medicine,TKDL,alchemy,traditional medicine'
    },
    {
      title: 'Unani System - From Hippocrates to Avicenna to India',
      category: 'heritage',
      description: 'Unani medicine traces its origins to ancient Greece, was systematized by Ibn Sina (Avicenna), and flourished in India under the Mughal Empire.',
      content: 'Unani medicine (Tibb-e-Unani) originated with Hippocrates of Greece (460-370 BCE) and was systematized by the Persian physician Ibn Sina (Avicenna, 980-1037 CE) in his monumental work Al-Qanun fil-Tibb (Canon of Medicine). The system was brought to India by Arab and Persian physicians and flourished under the patronage of the Mughal emperors. Indian Unani physicians like Hakim Ajmal Khan enriched the system with indigenous herbs and created a distinct Indo-Unani tradition. The system is based on the four humors: Dam (blood), Balgham (phlegm), Safra (yellow bile), and Sauda (black bile). The TKDL has documented over 1,000,000 Unani formulations.',
      tags: 'Unani,Ibn Sina,Avicenna,Hippocrates,Mughal,TKDL,AYUSH,four humors'
    },
    {
      title: 'Ayurvedic Bhasma - Calcined Metal Preparations',
      category: 'crafts',
      description: 'Bhasma are unique Ayurvedic preparations made by purifying and incinerating metals and minerals through elaborate traditional processes.',
      content: 'Bhasma (meaning ash or calcined preparation) are a unique class of Ayurvedic medicines made from metals, minerals, and gems through a process of Shodhana (purification) and Marana (incineration). Common Bhasmas include Swarna Bhasma (gold), Rajata Bhasma (silver), Tamra Bhasma (copper), Lauha Bhasma (iron), and Abhrak Bhasma (mica). The preparation involves multiple cycles of impregnation with herbal juices and incineration in a Puta (earthen crucible fired with cow dung cakes). Modern research has shown that Bhasmas contain nano-sized particles with unique bioavailability. The TKDL documents Bhasma preparation methods from classical texts like Rasa Ratna Samucchaya.',
      tags: 'bhasma,Ayurveda,metal preparations,Rasashastra,nano medicine,TKDL,traditional pharmacy'
    },
    {
      title: 'Traditional Pottery and Earthen Vessel Wisdom',
      category: 'crafts',
      description: 'The tradition of using earthen vessels for water storage and cooking is documented in Ayurveda for its health benefits.',
      content: 'The use of earthen pots for water storage is an ancient Indian tradition with documented health benefits in Ayurvedic texts. Water stored in clay pots is naturally cooled through evaporation and is enriched with minerals from the clay. Ayurveda describes clay as having Sheeta (cooling), Grahi (absorbent), and Lekhana (scraping) properties. Mitti Chikitsa (clay therapy) is a recognized treatment in Indian Naturopathy, using clay packs for inflammation, headaches, skin diseases, and abdominal disorders. Traditional potters across India have preserved specific clay preparation techniques passed down through generations. Ministry of AYUSH recognizes Mitti Chikitsa as part of the Naturopathy system.',
      tags: 'pottery,clay therapy,mitti chikitsa,earthen vessels,naturopathy,AYUSH,traditional crafts'
    },
    {
      title: 'Natural Dye Traditions - Indigo, Turmeric, and Henna',
      category: 'crafts',
      description: 'India has a 5000-year-old tradition of natural dyeing using plants like Indigo, Turmeric, and Henna, documented in ancient texts.',
      content: 'Natural dyeing is one of India oldest craft traditions, with evidence of indigo-dyed textiles found at Mohenjo-daro (circa 2500 BCE). Neel (Indigofera tinctoria) was India most important export dye for centuries, used to produce the deep blue color prized in Europe and Asia. Turmeric produces a golden yellow dye and has been used in ceremonial textiles and as a natural preservative for fabrics. Henna (Lawsonia inermis) has been used for body art, hair coloring, and textile dyeing for over 5000 years across India, Pakistan, and the Middle East. The Arthashastra of Chanakya mentions state-regulated dye industries. Traditional dyers have preserved these techniques through oral tradition.',
      tags: 'natural dyes,indigo,turmeric,henna,mehndi,traditional crafts,textile,Arthashastra'
    }
  ];

  let count = 0;
  for (const e of entries) {
    const [existing] = await pool.query('SELECT id FROM archive_content WHERE title = ?', [e.title]);
    if (existing.length > 0) {
      console.log('Skip (exists):', e.title);
      continue;
    }
    await pool.query(
      'INSERT INTO archive_content (title, category, description, content, tags, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [e.title, e.category, e.description, e.content, e.tags, aid, aname]
    );
    console.log('Inserted:', e.title);
    count++;
  }

  console.log(`\nDone! Inserted ${count} entries.`);
  await pool.end();
}

seed().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
